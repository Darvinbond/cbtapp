-- 20250519_ctq_replace_test_question_id_with_question.sql
-- =======================================================
-- Up-migration
-- =======================================================

-- 1.  Add the new column (nullable for the moment).
alter table public.candidate_test_questions
  add column if not exists question jsonb;

-- 2.  Back-fill it from the referenced test_questions row.
update public.candidate_test_questions ctq
set    question = tq.question
from   public.test_questions tq
where  ctq.test_question_id = tq.id
  and  ctq.question is null;

-- 3.  Lock it down.
alter table public.candidate_test_questions
  alter column question set not null;

-- 4.  Drop the FK constraint *and* the column in one go.
--     (Dropping the column automatically drops the constraint.)
alter table public.candidate_test_questions
  drop column if exists test_question_id cascade;

-- =======================================================
-- Down-migration (rollback)
-- =======================================================
-- WARNING: this loses the denormalised data unless you write
--          extra SQL to reconstruct the FK mapping.

-- 1.  Re-create the FK column (nullable).
alter table public.candidate_test_questions
  add column if not exists test_question_id uuid
    references public.test_questions (id) on delete cascade;

-- 2.  (Optional) Repopulate test_question_id here if you
--     have a deterministic way to match rows.

-- 3.  Make it NOT NULL if you succeed in step 2.
-- alter table public.candidate_test_questions
--   alter column test_question_id set not null;

-- 4.  Remove the denormalised copy.
alter table public.candidate_test_questions
  drop column if exists question;
