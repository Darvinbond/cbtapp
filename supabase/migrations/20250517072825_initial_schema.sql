-- =======================================================
-- 0 · prerequisites
-- =======================================================

create extension if not exists "pgcrypto";        -- for gen_random_uuid()
-- create extension if not exists "uuid-ossp";       -- optional, if you like uuid_generate_v4()

---------------------------------------------------------------------------
-- 1 · helper tables & types
---------------------------------------------------------------------------

-- 1-A  question type enum
do $$
begin
  if not exists (select 1 from pg_type where typname = 'question_type_enum') then
    create type question_type_enum as enum ('one', 'many', 'short');
  end if;
end $$;

-- 1-B  profile (optional convenience wrapper around auth.users)
create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  full_name  text,
  created_at timestamptz not null default now()
);

---------------------------------------------------------------------------
-- 2 · core entities (root tables carry owner_id)
---------------------------------------------------------------------------

create table public.question_bank (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid not null references auth.users (id) on delete cascade,
  text          text not null,
  question_type question_type_enum not null,
  options       text[],
  answer        text[] not null,
  metadata      jsonb,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table public.tests (
  id                 uuid primary key default gen_random_uuid(),
  owner_id           uuid not null references auth.users (id) on delete cascade,
  name               text not null,
  description        text,
  max_score          int not null,
  pass_score         int not null,
  time_limit_minutes int,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create table public.test_groups (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid not null references auth.users (id) on delete cascade,
  test_id    uuid not null references public.tests (id) on delete cascade,
  name       text not null,
  start_at   timestamptz,
  end_at     timestamptz
);

create table public.candidates (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid not null references auth.users (id) on delete cascade,
  full_name     text not null,
  test_group_id uuid references public.test_groups (id) on delete set null,
  created_at    timestamptz not null default now()
);

---------------------------------------------------------------------------
-- 3 · child tables (inherit tenant context via joins)
---------------------------------------------------------------------------

create table public.test_questions (
  id                uuid primary key default gen_random_uuid(),
  test_id           uuid not null references public.tests (id) on delete cascade,
  question          jsonb not null,   -- denormalised copy
  points            int  not null default 1,
  unique (test_id)
);

create table public.candidate_tests (
  id            uuid primary key default gen_random_uuid(),
  candidate_id  uuid not null references public.candidates (id) on delete cascade,
  test_id       uuid not null references public.tests (id) on delete cascade,
  access_code   char(8) not null check (access_code ~* '^[A-Z0-9]{8}$'),
  created_at    timestamptz not null default now(),
  unique (candidate_id, test_id)
);

create table public.candidate_test_questions (
  id               uuid primary key default gen_random_uuid(),
  candidate_id     uuid not null references public.candidates (id) on delete cascade,
  test_question_id uuid not null references public.test_questions (id) on delete cascade,
  selected_options text[],
  awarded_points   int,
  created_at       timestamptz not null default now()
);

-- optional retake log
create table public.attempts (
  id          uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.candidates (id) on delete cascade,
  test_id      uuid not null references public.tests (id) on delete cascade,
  started_at   timestamptz not null,
  finished_at  timestamptz,
  score        int,
  passed       boolean,
  unique (candidate_id, test_id, started_at)
);

---------------------------------------------------------------------------
-- 4 · automatic owner stamping
---------------------------------------------------------------------------

create or replace function public.set_owner_id()
returns trigger
language plpgsql security definer
as $$
begin
  new.owner_id := auth.uid();
  return new;
end;
$$;

-- attach to every root table
create trigger trg_set_owner_question_bank
before insert on public.question_bank
for each row execute procedure public.set_owner_id();

create trigger trg_set_owner_tests
before insert on public.tests
for each row execute procedure public.set_owner_id();

create trigger trg_set_owner_test_groups
before insert on public.test_groups
for each row execute procedure public.set_owner_id();

create trigger trg_set_owner_candidates
before insert on public.candidates
for each row execute procedure public.set_owner_id();

---------------------------------------------------------------------------
-- 5 · row-level security
---------------------------------------------------------------------------

-- helper macro-like function to cut repetition
create or replace function public.enable_owner_rls(tbl regclass)
returns void language plpgsql as $$
declare
  t text := tbl::text;
begin
  execute format('alter table %s enable row level security', t);

  /* SELECT */
  execute format($f$
      create policy "%s_owner_select"
      on %s for select
      using (owner_id = auth.uid());
  $f$, t, t);

  /* INSERT */
  execute format($f$
      create policy "%s_owner_insert"
      on %s for insert
      with check (owner_id = auth.uid());
  $f$, t, t);

  /* UPDATE */
  execute format($f$
      create policy "%s_owner_update"
      on %s for update
      using (owner_id = auth.uid());
  $f$, t, t);

  /* DELETE */
  execute format($f$
      create policy "%s_owner_delete"
      on %s for delete
      using (owner_id = auth.uid());
  $f$, t, t);
end $$;

-- apply to the four root tables
select public.enable_owner_rls('public.question_bank');
select public.enable_owner_rls('public.tests');
select public.enable_owner_rls('public.test_groups');
select public.enable_owner_rls('public.candidates');

-- --------------------------------------------------
-- child tables: authorisation *via* the parent join
-- --------------------------------------------------

alter table public.test_questions              enable row level security;
alter table public.candidate_tests             enable row level security;
alter table public.candidate_test_questions    enable row level security;
alter table public.attempts                    enable row level security;

-- TEST_QUESTIONS (parent = tests)
create policy test_questions_owner
on public.test_questions
for all
using (
  exists (
    select 1
    from public.tests t
    where t.id = test_questions.test_id
      and t.owner_id = auth.uid()
  )
);

-- CANDIDATE_TESTS (parent = candidates)
create policy candidate_tests_owner
on public.candidate_tests
for all
using (
  exists (
    select 1
    from public.candidates c
    where c.id = candidate_tests.candidate_id
      and c.owner_id = auth.uid()
  )
);

-- CANDIDATE_TEST_QUESTIONS (parent = candidates)
create policy ctq_owner
on public.candidate_test_questions
for all
using (
  exists (
    select 1
    from public.candidates c
    where c.id = candidate_test_questions.candidate_id
      and c.owner_id = auth.uid()
  )
);

-- ATTEMPTS (parent = candidates)
create policy attempts_owner
on public.attempts
for all
using (
  exists (
    select 1
    from public.candidates c
    where c.id = attempts.candidate_id
      and c.owner_id = auth.uid()
  )
);

---------------------------------------------------------------------------
-- 6 · performance indexes for RLS predicates
---------------------------------------------------------------------------

create index if not exists idx_question_bank_owner   on public.question_bank (owner_id);
create index if not exists idx_tests_owner           on public.tests (owner_id);
create index if not exists idx_test_groups_owner     on public.test_groups (owner_id);
create index if not exists idx_candidates_owner      on public.candidates (owner_id);

-- ----------------------------------------------------------------------
-- Done!  Each authenticated user now sees / writes only their own rows.
-- ----------------------------------------------------------------------
