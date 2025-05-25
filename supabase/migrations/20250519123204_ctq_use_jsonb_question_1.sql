
alter table public.candidate_test_questions
  add column if not exists question jsonb not null default '{}'::jsonb;