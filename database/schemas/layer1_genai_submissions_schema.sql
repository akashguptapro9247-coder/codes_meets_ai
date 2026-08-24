-- ==========================================================================
-- CODE MEETS AI - LAYER 1 GENAI SUBMISSIONS SCHEMA
-- File: /schema/layer1_genai_submissions_schema.sql
-- Description:
--   Creates the 'layer_1_genai_submissions' table for storing prompt text,
--   ImageKit image metadata (URLs, file IDs, paths), manual admin marks,
--   and evaluation statuses.
-- ==========================================================================

CREATE TABLE IF NOT EXISTS public.layer_1_genai_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  username TEXT,
  roll_number TEXT,
  prompt TEXT NOT NULL,
  image_urls JSONB DEFAULT '[]'::jsonb,
  image_file_ids JSONB DEFAULT '[]'::jsonb,
  image_paths JSONB DEFAULT '[]'::jsonb,
  marks NUMERIC DEFAULT NULL CHECK (marks IS NULL OR marks >= 0),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed')),
  submitted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  marked_at TIMESTAMPTZ,
  marked_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT unique_user_layer1_genai UNIQUE (user_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_layer1_genai_user_id ON public.layer_1_genai_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_layer1_genai_status ON public.layer_1_genai_submissions(status);
CREATE INDEX IF NOT EXISTS idx_layer1_genai_submitted_at ON public.layer_1_genai_submissions(submitted_at DESC);

-- Enable RLS
ALTER TABLE public.layer_1_genai_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Layer1 Submissions" ON public.layer_1_genai_submissions;
DROP POLICY IF EXISTS "Public Insert Layer1 Submissions" ON public.layer_1_genai_submissions;
DROP POLICY IF EXISTS "Public Update Layer1 Submissions" ON public.layer_1_genai_submissions;
DROP POLICY IF EXISTS "Public Delete Layer1 Submissions" ON public.layer_1_genai_submissions;

CREATE POLICY "Public Read Layer1 Submissions"
  ON public.layer_1_genai_submissions FOR SELECT USING (true);

CREATE POLICY "Public Insert Layer1 Submissions"
  ON public.layer_1_genai_submissions FOR INSERT WITH CHECK (true);

CREATE POLICY "Public Update Layer1 Submissions"
  ON public.layer_1_genai_submissions FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Public Delete Layer1 Submissions"
  ON public.layer_1_genai_submissions FOR DELETE USING (true);

-- Enable Realtime
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.layer_1_genai_submissions;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;
