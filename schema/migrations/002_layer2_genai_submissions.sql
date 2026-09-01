-- ==========================================================================
-- CODE MEETS AI - LAYER 2 GEN AI SUBMISSIONS SCHEMA
-- File: /schema/migrations/002_layer2_genai_submissions.sql
-- ==========================================================================

CREATE TABLE IF NOT EXISTS public.layer_2_genai_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  username TEXT,
  roll_number TEXT,
  question_id TEXT NOT NULL,
  explanation TEXT,
  assigned_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  submitted BOOLEAN DEFAULT false,
  submitted_at TIMESTAMPTZ,
  admin_marks NUMERIC DEFAULT NULL CHECK (admin_marks IS NULL OR admin_marks >= 0),
  admin_remarks TEXT,
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'reviewed')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT unique_user_layer2_genai UNIQUE (user_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_layer2_genai_user_id ON public.layer_2_genai_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_layer2_genai_status ON public.layer_2_genai_submissions(status);
CREATE INDEX IF NOT EXISTS idx_layer2_genai_submitted_at ON public.layer_2_genai_submissions(submitted_at DESC);

-- Enable RLS
ALTER TABLE public.layer_2_genai_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Layer2 GenAI" ON public.layer_2_genai_submissions;
DROP POLICY IF EXISTS "Public Insert Layer2 GenAI" ON public.layer_2_genai_submissions;
DROP POLICY IF EXISTS "Public Update Layer2 GenAI" ON public.layer_2_genai_submissions;
DROP POLICY IF EXISTS "Public Delete Layer2 GenAI" ON public.layer_2_genai_submissions;

CREATE POLICY "Public Read Layer2 GenAI"
  ON public.layer_2_genai_submissions FOR SELECT USING (true);

CREATE POLICY "Public Insert Layer2 GenAI"
  ON public.layer_2_genai_submissions FOR INSERT WITH CHECK (true);

CREATE POLICY "Public Update Layer2 GenAI"
  ON public.layer_2_genai_submissions FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Public Delete Layer2 GenAI"
  ON public.layer_2_genai_submissions FOR DELETE USING (true);

-- Enable Realtime
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.layer_2_genai_submissions;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;
