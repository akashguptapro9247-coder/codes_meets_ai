-- ============================================================================
-- CODE MEETS AI - LAYER 1 MANUAL CODING ATTEMPTS SCHEMA
-- ============================================================================
-- Stores participant randomized question sets, selected answers, and scores
-- Enforces: 1 attempt per user, cascades on user deletion, Realtime enabled
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.layer_1_manual_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  username TEXT,
  roll_number TEXT,
  year TEXT,
  batch TEXT,
  questions_pool JSONB NOT NULL DEFAULT '[]'::jsonb,
  selected_answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  score NUMERIC NOT NULL DEFAULT 0.0 CHECK (score >= 0.0 AND score <= 100.0),
  total_questions INT NOT NULL DEFAULT 10,
  correct_count INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('in_progress', 'completed')),
  started_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT unique_user_layer1_manual UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS idx_layer1_manual_user_id ON public.layer_1_manual_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_layer1_manual_status ON public.layer_1_manual_attempts(status);
CREATE INDEX IF NOT EXISTS idx_layer1_manual_score ON public.layer_1_manual_attempts(score DESC);

ALTER TABLE public.layer_1_manual_attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Layer1 Manual" ON public.layer_1_manual_attempts;
DROP POLICY IF EXISTS "Public Insert Layer1 Manual" ON public.layer_1_manual_attempts;
DROP POLICY IF EXISTS "Public Update Layer1 Manual" ON public.layer_1_manual_attempts;
DROP POLICY IF EXISTS "Public Delete Layer1 Manual" ON public.layer_1_manual_attempts;

CREATE POLICY "Public Read Layer1 Manual" ON public.layer_1_manual_attempts FOR SELECT USING (true);
CREATE POLICY "Public Insert Layer1 Manual" ON public.layer_1_manual_attempts FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Layer1 Manual" ON public.layer_1_manual_attempts FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public Delete Layer1 Manual" ON public.layer_1_manual_attempts FOR DELETE USING (true);

DO $$
BEGIN
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.layer_1_manual_attempts; EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;
