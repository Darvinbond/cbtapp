-- 20250520_ctq_use_jsonb_question.sql
-- ===============================================
-- Up-migration
-- ===============================================

-- 1. Add the new column, NOT NULL right away (safe because of default)
alter table public.candidate_test_questions
  add column if not exists question jsonb not null default '{}'::jsonb;

-- 2. Back-fill real question data from test_questions
update public.candidate_test_questions ctq
set    question = tq.question
from   public.test_questions tq
where  ctq.test_question_id = tq.id
  and  (ctq.question = '{}'::jsonb OR ctq.question IS NULL);

-- 3. Drop the FK column (constraint goes away automatically)
alter table public.candidate_test_questions
  drop column if exists test_question_id cascade;

-- 4. Remove the default so callers must supply a value
alter table public.candidate_test_questions
  alter column question drop default;

-- 5. Let PostgREST (Supabase API) reload the schema cache
NOTIFY pgrst, 'reload schema';
-- ===============================================
-- Down-migration
-- ===============================================
-- (Re-creates the old FK column but does NOT try to
--  repopulate it—add your own logic if you ever need that)

alter table public.candidate_test_questions
  add column if not exists test_question_id uuid
    references public.test_questions (id) on delete cascade;

alter table public.candidate_test_questions
  drop column if exists question;
