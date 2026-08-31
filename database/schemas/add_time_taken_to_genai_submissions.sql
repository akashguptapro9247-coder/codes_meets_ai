-- ==========================================================================
-- CODE MEETS AI - ADD TIME_TAKEN TO LAYER 1 GENAI SUBMISSIONS
-- ==========================================================================
-- Adds the 'time_taken' column to track how long each participant took
-- to formulate their prompt and submit their GenAI challenge.
-- Run in Supabase SQL Editor: Dashboard → SQL Editor → New Query
-- ==========================================================================

ALTER TABLE public.layer_1_genai_submissions
  ADD COLUMN IF NOT EXISTS time_taken TEXT DEFAULT '00:00';

-- Optional: Add index on time_taken
CREATE INDEX IF NOT EXISTS idx_layer1_genai_time_taken ON public.layer_1_genai_submissions(time_taken);
