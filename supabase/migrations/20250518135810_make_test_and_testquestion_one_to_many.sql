-- 1. remove the one-to-one UNIQUE constraint
alter table public.test_questions
  drop constraint test_questions_test_id_key;

-- 2. (optional) keep a plain index for speed
create index if not exists idx_test_questions_test_id
    on public.test_questions(test_id);
