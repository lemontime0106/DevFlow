create extension if not exists pgcrypto with schema extensions;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  display_name text,
  timezone text not null default 'Asia/Seoul',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users (id) on delete cascade,
  name text not null,
  color text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint categories_color_hex_check check (color ~ '^#[0-9A-Fa-f]{6}$'),
  constraint categories_name_length_check check (char_length(trim(name)) between 1 and 40)
);

create unique index if not exists categories_user_name_unique_idx
  on public.categories (coalesce(user_id, '00000000-0000-0000-0000-000000000000'::uuid), lower(name));

create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  category_id uuid references public.categories (id) on delete set null,
  title text not null default '',
  memo text,
  started_at timestamptz not null,
  ended_at timestamptz,
  focus_minutes integer not null default 25,
  break_minutes integer not null default 5,
  planned_minutes integer not null default 25,
  actual_minutes integer,
  status text not null default 'active',
  difficulty text,
  self_rating integer,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint sessions_focus_minutes_check check (focus_minutes > 0),
  constraint sessions_break_minutes_check check (break_minutes >= 0),
  constraint sessions_planned_minutes_check check (planned_minutes > 0),
  constraint sessions_actual_minutes_check check (actual_minutes is null or actual_minutes >= 0),
  constraint sessions_status_check check (status in ('active', 'completed', 'cancelled', 'interrupted')),
  constraint sessions_difficulty_check check (difficulty is null or difficulty in ('easy', 'normal', 'hard')),
  constraint sessions_self_rating_check check (self_rating is null or self_rating between 1 and 5),
  constraint sessions_ended_after_started_check check (ended_at is null or ended_at >= started_at)
);

create index if not exists sessions_user_started_at_idx
  on public.sessions (user_id, started_at desc);

create index if not exists sessions_user_status_idx
  on public.sessions (user_id, status);

create table if not exists public.daily_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  goal_date date not null default current_date,
  target_focus_minutes integer not null default 120,
  target_sessions integer not null default 4,
  target_days_per_week integer not null default 5,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint daily_goals_target_focus_minutes_check check (target_focus_minutes > 0),
  constraint daily_goals_target_sessions_check check (target_sessions > 0),
  constraint daily_goals_target_days_per_week_check check (target_days_per_week between 1 and 7),
  constraint daily_goals_user_date_unique unique (user_id, goal_date)
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email)
  values (new.id, coalesce(new.email, ''))
  on conflict (id) do update
  set email = excluded.email,
      updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

drop trigger if exists set_users_updated_at on public.users;
create trigger set_users_updated_at
before update on public.users
for each row execute procedure public.set_updated_at();

drop trigger if exists set_categories_updated_at on public.categories;
create trigger set_categories_updated_at
before update on public.categories
for each row execute procedure public.set_updated_at();

drop trigger if exists set_sessions_updated_at on public.sessions;
create trigger set_sessions_updated_at
before update on public.sessions
for each row execute procedure public.set_updated_at();

drop trigger if exists set_daily_goals_updated_at on public.daily_goals;
create trigger set_daily_goals_updated_at
before update on public.daily_goals
for each row execute procedure public.set_updated_at();

alter table public.users enable row level security;
alter table public.categories enable row level security;
alter table public.sessions enable row level security;
alter table public.daily_goals enable row level security;

drop policy if exists "Users can view their own profile" on public.users;
create policy "Users can view their own profile"
on public.users
for select
to authenticated
using (auth.uid() is not null and auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.users;
create policy "Users can update their own profile"
on public.users
for update
to authenticated
using (auth.uid() is not null and auth.uid() = id)
with check (auth.uid() is not null and auth.uid() = id);

drop policy if exists "Users can read their categories and defaults" on public.categories;
create policy "Users can read their categories and defaults"
on public.categories
for select
to authenticated
using (
  auth.uid() is not null
  and (user_id is null or auth.uid() = user_id)
);

drop policy if exists "Users can create their own categories" on public.categories;
create policy "Users can create their own categories"
on public.categories
for insert
to authenticated
with check (
  auth.uid() is not null
  and user_id = auth.uid()
  and is_default = false
);

drop policy if exists "Users can update their own categories" on public.categories;
create policy "Users can update their own categories"
on public.categories
for update
to authenticated
using (auth.uid() is not null and user_id = auth.uid())
with check (auth.uid() is not null and user_id = auth.uid() and is_default = false);

drop policy if exists "Users can delete their own categories" on public.categories;
create policy "Users can delete their own categories"
on public.categories
for delete
to authenticated
using (auth.uid() is not null and user_id = auth.uid());

drop policy if exists "Users can manage their own sessions" on public.sessions;
create policy "Users can manage their own sessions"
on public.sessions
for all
to authenticated
using (auth.uid() is not null and auth.uid() = user_id)
with check (auth.uid() is not null and auth.uid() = user_id);

drop policy if exists "Users can manage their own daily goals" on public.daily_goals;
create policy "Users can manage their own daily goals"
on public.daily_goals
for all
to authenticated
using (auth.uid() is not null and auth.uid() = user_id)
with check (auth.uid() is not null and auth.uid() = user_id);

insert into public.categories (user_id, name, color, is_default)
values
  (null, 'Feature Development', '#2563EB', true),
  (null, 'Bug Fixing', '#DC2626', true),
  (null, 'Refactoring', '#7C3AED', true),
  (null, 'Meeting', '#0891B2', true),
  (null, 'Learning', '#D97706', true)
on conflict (coalesce(user_id, '00000000-0000-0000-0000-000000000000'::uuid), lower(name))
do update set
  color = excluded.color,
  is_default = true,
  updated_at = timezone('utc', now());
