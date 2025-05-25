-- 20250519_add_question_per_candidate_to_tests.sql
-- =======================================================
-- Up: add question_per_candidate column to public.tests
-- =======================================================

alter table public.tests
  add column if not exists question_per_candidate int not null default 1;

-- -------------------------------------------------------
-- Down: remove the column (rollback)
-- -------------------------------------------------------

-- To roll back this migration, run:
-- alter table public.tests drop column if exists question_per_candidate;
