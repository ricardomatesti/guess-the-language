create table if not exists public.player_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  total_xp int not null default 0,
  level int not null default 1,
  updated_at timestamptz not null default now()
);

create table if not exists public.badge_definitions (
  id text primary key,
  title text not null,
  description text not null,
  category text not null,
  rarity text not null default 'common',
  icon_key text not null default 'badge',
  rule_key text not null,
  rule_config jsonb not null default '{}'::jsonb,
  active boolean not null default true
);

create table if not exists public.user_badges (
  user_id uuid not null references auth.users(id) on delete cascade,
  badge_id text not null references public.badge_definitions(id) on delete cascade,
  unlocked_at timestamptz not null default now(),
  primary key (user_id, badge_id)
);

create table if not exists public.daily_quest_definitions (
  id text primary key,
  title text not null,
  rule_key text not null,
  target int not null,
  active boolean not null default true
);

create table if not exists public.user_daily_quests (
  user_id uuid not null references auth.users(id) on delete cascade,
  quest_date date not null,
  quest_id text not null references public.daily_quest_definitions(id) on delete cascade,
  progress int not null default 0,
  target int not null,
  completed_at timestamptz,
  primary key (user_id, quest_date, quest_id)
);

create table if not exists public.progress_events (
  user_id uuid not null references auth.users(id) on delete cascade,
  event_token text not null,
  summary jsonb not null,
  created_at timestamptz not null default now(),
  primary key (user_id, event_token)
);

create index if not exists idx_user_daily_quests_user_date
  on public.user_daily_quests (user_id, quest_date);

insert into public.badge_definitions (id, title, description, category, rarity, icon_key, rule_key, rule_config, active)
values
  ('streak_3', 'Spark Streak', 'Reach a streak of 3.', 'streak', 'common', 'spark', 'streak_reach', '{"threshold":3}'::jsonb, true),
  ('streak_7', 'Weekly Flame', 'Reach a streak of 7.', 'streak', 'rare', 'flame', 'streak_reach', '{"threshold":7}'::jsonb, true),
  ('games_25', 'Committed Explorer', 'Play 25 games.', 'consistency', 'common', 'map', 'games_played', '{"threshold":25}'::jsonb, true),
  ('efficiency_10', 'Sharp Ear', 'Win 10 games using 2 hints or less.', 'efficiency', 'rare', 'bolt', 'wins_with_max_hints', '{"threshold":10,"max_hints":2}'::jsonb, true),
  ('first_try_5', 'One Shot', 'Win 5 games on first try.', 'efficiency', 'epic', 'target', 'first_try_wins', '{"threshold":5}'::jsonb, true),
  ('explorer_15', 'Polyglot Scout', 'Win in 15 unique languages.', 'exploration', 'epic', 'compass', 'unique_languages_won', '{"threshold":15}'::jsonb, true),
  ('accuracy_70', 'Precision Mind', 'Maintain 70% win rate after 20 games.', 'accuracy', 'legendary', 'crown', 'win_rate', '{"threshold":70,"min_games":20}'::jsonb, true)
on conflict (id) do update
set
  title = excluded.title,
  description = excluded.description,
  category = excluded.category,
  rarity = excluded.rarity,
  icon_key = excluded.icon_key,
  rule_key = excluded.rule_key,
  rule_config = excluded.rule_config,
  active = excluded.active;

insert into public.daily_quest_definitions (id, title, rule_key, target, active)
values
  ('play_3', 'Play 3 games', 'play_games', 3, true),
  ('win_2', 'Win 2 games', 'win_games', 2, true),
  ('win_hints_3', 'Win with 3 hints or less', 'win_with_max_hints', 1, true),
  ('streak_3_today', 'Reach a streak of 3 today', 'streak_today', 3, true)
on conflict (id) do update
set
  title = excluded.title,
  rule_key = excluded.rule_key,
  target = excluded.target,
  active = excluded.active;

create or replace function public.ensure_daily_quests_for_today()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_today date := timezone('UTC', now())::date;
begin
  if v_user_id is null then
    return;
  end if;

  insert into public.user_daily_quests (user_id, quest_date, quest_id, progress, target)
  select v_user_id, v_today, q.id, 0, q.target
  from public.daily_quest_definitions q
  where q.active = true
  order by q.id
  limit 3
  on conflict (user_id, quest_date, quest_id) do nothing;
end;
$$;

grant execute on function public.ensure_daily_quests_for_today() to authenticated;

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
  v_xp_bonus int := 0;
  v_xp_gained int := 0;
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

  v_total_xp_before := v_progress.total_xp;
  v_level_before := v_progress.level;

  if p_won then
    v_xp_bonus := v_xp_bonus + 30;
  end if;

  if p_hints_used <= 2 then
    v_xp_bonus := v_xp_bonus + 20;
  elsif p_hints_used <= 3 then
    v_xp_bonus := v_xp_bonus + 10;
  end if;

  if p_won and p_tries = 1 then
    v_xp_bonus := v_xp_bonus + 15;
  end if;

  if p_won and v_stats.current_streak in (3, 7, 15, 30) then
    v_xp_bonus := v_xp_bonus + 25;
  end if;

  v_xp_gained := v_xp_base + v_xp_bonus;

  update public.player_progress
  set
    total_xp = total_xp + v_xp_gained,
    level = greatest(1, floor((total_xp + v_xp_gained)::numeric / 120)::int + 1),
    updated_at = now()
  where user_id = v_user_id
  returning * into v_progress;

  v_total_xp_after := v_progress.total_xp;
  v_level_after := v_progress.level;

  update public.user_daily_quests uq
  set
    progress = least(
      uq.target,
      uq.progress +
      case
        when q.rule_key = 'play_games' then 1
        when q.rule_key = 'win_games' and p_won then 1
        when q.rule_key = 'win_with_max_hints' and p_won and p_hints_used <= 3 then 1
        when q.rule_key = 'streak_today' and p_won and v_stats.current_streak >= 3 then uq.target
        else 0
      end
    ),
    completed_at = case
      when uq.completed_at is null and least(
        uq.target,
        uq.progress +
        case
          when q.rule_key = 'play_games' then 1
          when q.rule_key = 'win_games' and p_won then 1
          when q.rule_key = 'win_with_max_hints' and p_won and p_hints_used <= 3 then 1
          when q.rule_key = 'streak_today' and p_won and v_stats.current_streak >= 3 then uq.target
          else 0
        end
      ) >= uq.target then now()
      else uq.completed_at
    end
  from public.daily_quest_definitions q
  where uq.user_id = v_user_id
    and uq.quest_date = v_today
    and uq.quest_id = q.id;

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
      (v_badge.rule_key = 'streak_reach' and v_stats.current_streak >= coalesce((v_badge.rule_config->>'threshold')::int, 0))
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

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', uq.quest_id,
        'title', q.title,
        'progress', uq.progress,
        'target', uq.target,
        'completed', uq.completed_at is not null,
        'completedAt', uq.completed_at
      )
      order by q.id
    ),
    '[]'::jsonb
  )
  into v_quest_updates
  from public.user_daily_quests uq
  join public.daily_quest_definitions q on q.id = uq.quest_id
  where uq.user_id = v_user_id and uq.quest_date = v_today;

  v_summary := jsonb_build_object(
    'xpGained', v_xp_gained,
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

grant execute on function public.process_game_progress(boolean, int, int, text, text) to authenticated;

alter table public.player_progress enable row level security;
alter table public.badge_definitions enable row level security;
alter table public.user_badges enable row level security;
alter table public.daily_quest_definitions enable row level security;
alter table public.user_daily_quests enable row level security;
alter table public.progress_events enable row level security;

drop policy if exists "player_progress_select_own" on public.player_progress;
create policy "player_progress_select_own"
  on public.player_progress
  for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "player_progress_insert_own" on public.player_progress;
create policy "player_progress_insert_own"
  on public.player_progress
  for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "player_progress_update_own" on public.player_progress;
create policy "player_progress_update_own"
  on public.player_progress
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "user_badges_select_own" on public.user_badges;
create policy "user_badges_select_own"
  on public.user_badges
  for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "user_badges_insert_own" on public.user_badges;
create policy "user_badges_insert_own"
  on public.user_badges
  for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "user_daily_quests_select_own" on public.user_daily_quests;
create policy "user_daily_quests_select_own"
  on public.user_daily_quests
  for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "user_daily_quests_insert_own" on public.user_daily_quests;
create policy "user_daily_quests_insert_own"
  on public.user_daily_quests
  for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "user_daily_quests_update_own" on public.user_daily_quests;
create policy "user_daily_quests_update_own"
  on public.user_daily_quests
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "progress_events_select_own" on public.progress_events;
create policy "progress_events_select_own"
  on public.progress_events
  for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "progress_events_insert_own" on public.progress_events;
create policy "progress_events_insert_own"
  on public.progress_events
  for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "badge_definitions_select" on public.badge_definitions;
create policy "badge_definitions_select"
  on public.badge_definitions
  for select
  to authenticated
  using (true);

drop policy if exists "daily_quest_definitions_select" on public.daily_quest_definitions;
create policy "daily_quest_definitions_select"
  on public.daily_quest_definitions
  for select
  to authenticated
  using (true);
