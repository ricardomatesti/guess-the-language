create or replace function public.process_game_progress(
  p_won boolean,
  p_hints_used int,
  p_tries int,
  p_language_name text,
  p_game_token text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_today date := timezone('UTC', now())::date;
  v_stats public.player_stats;
  v_progress public.player_progress;
  v_xp_base int := 20;
  v_xp_performance_bonus int := 0;
  v_xp_non_quest int := 0;
  v_xp_quest_bonus int := 0;
  v_xp_total int := 0;
  v_level_before int := 1;
  v_level_after int := 1;
  v_total_xp_before int := 0;
  v_total_xp_after int := 0;
  v_summary jsonb;
  v_badge record;
  v_unlocked_badges jsonb := '[]'::jsonb;
  v_quest_updates jsonb := '[]'::jsonb;
  v_win_rate numeric := 0;
  v_wins_with_hints int := 0;
  v_first_try_wins int := 0;
  v_unique_languages_won int := 0;
  v_today_streak_max int := 0;
  v_inserted int := 0;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  if p_game_token is not null then
    select summary into v_summary
    from public.progress_events
    where user_id = v_user_id and event_token = p_game_token;

    if v_summary is not null then
      return v_summary;
    end if;
  end if;

  perform public.ensure_daily_quests_for_today();

  select * into v_stats
  from public.player_stats
  where user_id = v_user_id;

  if not found then
    raise exception 'player_stats row not found for user %', v_user_id;
  end if;

  select * into v_progress
  from public.player_progress
  where user_id = v_user_id;

  if not found then
    insert into public.player_progress (user_id, total_xp, level)
    values (v_user_id, 0, 1)
    returning * into v_progress;
  end if;

  with todays as (
    select
      won,
      guessed_at,
      row_number() over (order by guessed_at) as rn
    from public.game_results
    where user_id = v_user_id
      and timezone('UTC', guessed_at)::date = v_today
  ),
  grouped as (
    select
      won,
      rn - row_number() over (partition by won order by rn) as grp
    from todays
  ),
  streaks as (
    select count(*) as streak
    from grouped
    where won = true
    group by grp
  )
  select coalesce(max(streak), 0)
  into v_today_streak_max
  from streaks;

  v_total_xp_before := v_progress.total_xp;
  v_level_before := v_progress.level;

  if p_won then
    v_xp_performance_bonus := v_xp_performance_bonus + 30;
  end if;

  if p_hints_used <= 2 then
    v_xp_performance_bonus := v_xp_performance_bonus + 20;
  elsif p_hints_used <= 3 then
    v_xp_performance_bonus := v_xp_performance_bonus + 10;
  end if;

  if p_won and p_tries = 1 then
    v_xp_performance_bonus := v_xp_performance_bonus + 15;
  end if;

  if p_won and v_stats.current_streak in (3, 7, 15, 30) then
    v_xp_performance_bonus := v_xp_performance_bonus + 25;
  end if;

  v_xp_non_quest := v_xp_base + v_xp_performance_bonus;

  with quest_deltas as (
    select
      uq.user_id,
      uq.quest_date,
      uq.quest_id,
      q.title,
      uq.progress as progress_before,
      least(
        uq.target,
        uq.progress +
        case
          when q.rule_key = 'play_games' then 1
          when q.rule_key = 'win_games' and p_won then 1
          when q.rule_key = 'win_with_max_hints' and p_won and p_hints_used <= 3 then 1
          when q.rule_key = 'streak_today' and v_today_streak_max >= 3 then uq.target
          else 0
        end
      ) as progress_after,
      uq.target,
      uq.completed_at as completed_before_at,
      case
        when uq.quest_id = 'play_3' then 20
        when uq.quest_id = 'win_2' then 25
        when uq.quest_id = 'win_hints_3' then 20
        when uq.quest_id = 'streak_3_today' then 30
        else 0
      end as xp_reward
    from public.user_daily_quests uq
    join public.daily_quest_definitions q on q.id = uq.quest_id
    where uq.user_id = v_user_id
      and uq.quest_date = v_today
  ),
  applied as (
    update public.user_daily_quests uq
    set
      progress = qd.progress_after,
      completed_at = case
        when qd.completed_before_at is not null then qd.completed_before_at
        when qd.progress_after >= qd.target then now()
        else null
      end
    from quest_deltas qd
    where uq.user_id = qd.user_id
      and uq.quest_date = qd.quest_date
      and uq.quest_id = qd.quest_id
    returning
      qd.quest_id,
      qd.title,
      qd.progress_before,
      qd.progress_after,
      qd.target,
      uq.completed_at,
      qd.completed_before_at,
      qd.xp_reward
  )
  select
    coalesce(sum(
      case
        when completed_before_at is null and completed_at is not null then xp_reward
        else 0
      end
    ), 0),
    coalesce(
      jsonb_agg(
        jsonb_build_object(
          'id', quest_id,
          'title', title,
          'progressBefore', progress_before,
          'progressAfter', progress_after,
          'progress', progress_after,
          'target', target,
          'completed', completed_at is not null,
          'completedAt', completed_at,
          'completedNow', completed_before_at is null and completed_at is not null,
          'xpReward', case
            when completed_before_at is null and completed_at is not null then xp_reward
            else 0
          end
        )
        order by quest_id
      ),
      '[]'::jsonb
    )
  into v_xp_quest_bonus, v_quest_updates
  from applied;

  v_xp_total := v_xp_non_quest + v_xp_quest_bonus;

  update public.player_progress
  set
    total_xp = total_xp + v_xp_total,
    level = greatest(1, floor((total_xp + v_xp_total)::numeric / 120)::int + 1),
    updated_at = now()
  where user_id = v_user_id
  returning * into v_progress;

  v_total_xp_after := v_progress.total_xp;
  v_level_after := v_progress.level;

  v_win_rate := case
    when v_stats.games_played > 0 then (v_stats.wins::numeric / v_stats.games_played::numeric) * 100
    else 0
  end;

  select count(*) into v_wins_with_hints
  from public.game_results
  where user_id = v_user_id and won = true and hints_used <= 2;

  select count(*) into v_first_try_wins
  from public.game_results
  where user_id = v_user_id and won = true and tries = 1;

  select count(distinct language_name) into v_unique_languages_won
  from public.game_results
  where user_id = v_user_id and won = true;

  for v_badge in
    select b.*
    from public.badge_definitions b
    left join public.user_badges ub
      on ub.badge_id = b.id and ub.user_id = v_user_id
    where b.active = true and ub.badge_id is null
  loop
    if (
      (v_badge.rule_key = 'streak_reach' and v_stats.best_streak >= coalesce((v_badge.rule_config->>'threshold')::int, 0))
      or (v_badge.rule_key = 'games_played' and v_stats.games_played >= coalesce((v_badge.rule_config->>'threshold')::int, 0))
      or (v_badge.rule_key = 'win_rate'
          and v_win_rate >= coalesce((v_badge.rule_config->>'threshold')::numeric, 0)
          and v_stats.games_played >= coalesce((v_badge.rule_config->>'min_games')::int, 0))
      or (v_badge.rule_key = 'wins_with_max_hints'
          and v_wins_with_hints >= coalesce((v_badge.rule_config->>'threshold')::int, 0))
      or (v_badge.rule_key = 'first_try_wins'
          and v_first_try_wins >= coalesce((v_badge.rule_config->>'threshold')::int, 0))
      or (v_badge.rule_key = 'unique_languages_won'
          and v_unique_languages_won >= coalesce((v_badge.rule_config->>'threshold')::int, 0))
    ) then
      insert into public.user_badges (user_id, badge_id)
      values (v_user_id, v_badge.id)
      on conflict do nothing;

      get diagnostics v_inserted = row_count;
      if v_inserted > 0 then
        v_unlocked_badges := v_unlocked_badges || jsonb_build_array(
          jsonb_build_object(
            'id', v_badge.id,
            'title', v_badge.title,
            'description', v_badge.description,
            'category', v_badge.category,
            'rarity', v_badge.rarity,
            'iconKey', v_badge.icon_key,
            'unlockedAt', now()
          )
        );
      end if;
    end if;
  end loop;

  v_summary := jsonb_build_object(
    'xpBase', v_xp_non_quest,
    'xpQuestBonus', v_xp_quest_bonus,
    'xpTotal', v_xp_total,
    'xpGained', v_xp_total,
    'levelBefore', v_level_before,
    'levelAfter', v_level_after,
    'totalXpBefore', v_total_xp_before,
    'totalXpAfter', v_total_xp_after,
    'unlockedBadges', v_unlocked_badges,
    'questUpdates', v_quest_updates
  );

  if p_game_token is not null then
    insert into public.progress_events (user_id, event_token, summary)
    values (v_user_id, p_game_token, v_summary)
    on conflict (user_id, event_token) do update
    set summary = excluded.summary;
  end if;

  return v_summary;
end;
$$;
