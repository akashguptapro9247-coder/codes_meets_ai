-- ============================================================
-- MIGRATION: Update layer_1_manual_attempts score constraint
-- to allow max score of 150 (15 questions × 10 marks each)
-- ============================================================
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ============================================================

-- Step 1: Drop the old constraint that limited score to 100
ALTER TABLE public.layer_1_manual_attempts
  DROP CONSTRAINT IF EXISTS layer_1_manual_attempts_score_check;

-- Step 2: Add the updated constraint that allows score up to 150
ALTER TABLE public.layer_1_manual_attempts
  ADD CONSTRAINT layer_1_manual_attempts_score_check
  CHECK (score >= 0.0 AND score <= 150.0);

-- Step 3: Update total_questions to 15 for any existing completed rows
-- that were inserted before this migration (optional cleanup)
UPDATE public.layer_1_manual_attempts
  SET total_questions = 15
  WHERE status = 'completed'
    AND total_questions = 10;

-- Step 4: Verify the constraint was applied correctly
SELECT
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conrelid = 'public.layer_1_manual_attempts'::regclass
  AND conname = 'layer_1_manual_attempts_score_check';

-- Expected output:
-- constraint_name                        | definition
-- layer_1_manual_attempts_score_check    | CHECK ((score >= 0.0) AND (score <= 150.0))
