-- Milon gym tracker — database schema
-- Run this once in the Supabase SQL editor (or via `supabase db push`).

create extension if not exists "pgcrypto";

-- ---------- profiles ----------
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);

-- ---------- workouts ----------
create table if not exists workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'Workout',
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  notes text
);

-- ---------- workout_exercises ----------
create table if not exists workout_exercises (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid not null references workouts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  exercise_name text not null,
  position int not null default 0
);

-- ---------- sets ----------
create table if not exists sets (
  id uuid primary key default gen_random_uuid(),
  workout_exercise_id uuid not null references workout_exercises(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  set_index int not null,
  weight_kg numeric,
  reps int,
  completed boolean not null default false
);

-- ---------- body_metrics ----------
create table if not exists body_metrics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  recorded_at date not null default current_date,
  weight_kg numeric not null
);

-- ---------- indexes ----------
create index if not exists idx_workouts_user on workouts(user_id, started_at desc);
create index if not exists idx_workout_exercises_workout on workout_exercises(workout_id);
create index if not exists idx_sets_workout_exercise on sets(workout_exercise_id);
create index if not exists idx_body_metrics_user on body_metrics(user_id, recorded_at desc);

-- ---------- row level security ----------
alter table profiles enable row level security;
alter table workouts enable row level security;
alter table workout_exercises enable row level security;
alter table sets enable row level security;
alter table body_metrics enable row level security;

create policy "profiles: owner read/write" on profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "workouts: owner read/write" on workouts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "workout_exercises: owner read/write" on workout_exercises
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "sets: owner read/write" on sets
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "body_metrics: owner read/write" on body_metrics
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------- auto-create profile on signup ----------
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, split_part(new.email, '@', 1));
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
