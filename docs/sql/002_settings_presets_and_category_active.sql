alter table public.categories
add column if not exists is_active boolean not null default true;

create index if not exists categories_user_active_idx
  on public.categories (user_id, is_active);

update public.categories
set is_active = true
where is_default = true and is_active = false;

create table if not exists public.user_settings (
  user_id uuid primary key references public.users (id) on delete cascade,
  default_focus_minutes integer not null default 25,
  default_break_minutes integer not null default 5,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint user_settings_default_focus_minutes_check
    check (default_focus_minutes between 1 and 180),
  constraint user_settings_default_break_minutes_check
    check (default_break_minutes between 0 and 60)
);

insert into public.user_settings (user_id)
select id
from public.users
on conflict (user_id) do nothing;

drop trigger if exists set_user_settings_updated_at on public.user_settings;
create trigger set_user_settings_updated_at
before update on public.user_settings
for each row execute procedure public.set_updated_at();

alter table public.user_settings enable row level security;

drop policy if exists "Users can manage their own settings" on public.user_settings;
create policy "Users can manage their own settings"
on public.user_settings
for all
to authenticated
using (auth.uid() is not null and auth.uid() = user_id)
with check (auth.uid() is not null and auth.uid() = user_id);

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

  insert into public.user_settings (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;
