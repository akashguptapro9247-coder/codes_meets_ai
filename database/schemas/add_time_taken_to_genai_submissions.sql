-- ==========================================================================
-- CODE MEETS AI - ADD TIMING COLUMNS TO LAYER 1 GENAI SUBMISSIONS
-- ==========================================================================
-- Adds started_at, submitted_at, time_taken, and time_taken_seconds
-- to accurately record challenge duration from challenge start to submission.
-- Run in Supabase SQL Editor: Dashboard → SQL Editor → New Query
-- ==========================================================================

ALTER TABLE public.layer_1_genai_submissions
  ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS time_taken TEXT DEFAULT '00:00',
  ADD COLUMN IF NOT EXISTS time_taken_seconds INTEGER DEFAULT 0;

-- Optional: Add index on timing columns
CREATE INDEX IF NOT EXISTS idx_layer1_genai_time_taken ON public.layer_1_genai_submissions(time_taken);
CREATE INDEX IF NOT EXISTS idx_layer1_genai_started_at ON public.layer_1_genai_submissions(started_at);
CREATE INDEX IF NOT EXISTS idx_layer1_genai_submitted_at ON public.layer_1_genai_submissions(submitted_at);
