-- Auth + profile schema for Guess The Language

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.player_stats (
  user_id uuid primary key references auth.users(id) on delete cascade,
  games_played int not null default 0,
  wins int not null default 0,
  losses int not null default 0,
  current_streak int not null default 0,
  best_streak int not null default 0,
  hints_used_total int not null default 0,
  avg_hints_used numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.game_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  language_name text not null,
  won boolean not null,
  hints_used int not null,
  tries int not null,
  guessed_at timestamptz not null default now()
);

create index if not exists idx_game_results_user_id_guessed_at
  on public.game_results (user_id, guessed_at desc);

create index if not exists idx_player_stats_user_id
  on public.player_stats (user_id);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
before update on public.profiles
for each row execute function public.touch_updated_at();

drop trigger if exists player_stats_touch_updated_at on public.player_stats;
create trigger player_stats_touch_updated_at
before update on public.player_stats
for each row execute function public.touch_updated_at();

create or replace function public.record_game_result(
  p_language_name text,
  p_won boolean,
  p_hints_used int,
  p_tries int,
  p_guessed_at timestamptz default now()
)
returns public.player_stats
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_stats public.player_stats;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  insert into public.game_results (
    user_id,
    language_name,
    won,
    hints_used,
    tries,
    guessed_at
  ) values (
    v_user_id,
    p_language_name,
    p_won,
    p_hints_used,
    p_tries,
    coalesce(p_guessed_at, now())
  );

  insert into public.player_stats (
    user_id,
    games_played,
    wins,
    losses,
    current_streak,
    best_streak,
    hints_used_total,
    avg_hints_used
  ) values (
    v_user_id,
    1,
    case when p_won then 1 else 0 end,
    case when p_won then 0 else 1 end,
    case when p_won then 1 else 0 end,
    case when p_won then 1 else 0 end,
    p_hints_used,
    p_hints_used::numeric
  )
  on conflict (user_id)
  do update
  set
    games_played = player_stats.games_played + 1,
    wins = player_stats.wins + case when p_won then 1 else 0 end,
    losses = player_stats.losses + case when p_won then 0 else 1 end,
    current_streak = case
      when p_won then player_stats.current_streak + 1
      else 0
    end,
    best_streak = greatest(
      player_stats.best_streak,
      case
        when p_won then player_stats.current_streak + 1
        else player_stats.best_streak
      end
    ),
    hints_used_total = player_stats.hints_used_total + p_hints_used,
    avg_hints_used =
      (player_stats.hints_used_total + p_hints_used)::numeric /
      (player_stats.games_played + 1),
    updated_at = now()
  returning * into v_stats;

  return v_stats;
end;
$$;

grant execute on function public.record_game_result(text, boolean, int, int, timestamptz) to authenticated;

alter table public.profiles enable row level security;
alter table public.player_stats enable row level security;
alter table public.game_results enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles
  for select
  to authenticated
  using (id = auth.uid());

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles
  for insert
  to authenticated
  with check (id = auth.uid());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles
  for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

drop policy if exists "player_stats_select_own" on public.player_stats;
create policy "player_stats_select_own"
  on public.player_stats
  for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "player_stats_insert_own" on public.player_stats;
create policy "player_stats_insert_own"
  on public.player_stats
  for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "player_stats_update_own" on public.player_stats;
create policy "player_stats_update_own"
  on public.player_stats
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "game_results_select_own" on public.game_results;
create policy "game_results_select_own"
  on public.game_results
  for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "game_results_insert_own" on public.game_results;
create policy "game_results_insert_own"
  on public.game_results
  for insert
  to authenticated
  with check (user_id = auth.uid());
