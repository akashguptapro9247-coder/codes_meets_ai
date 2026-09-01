-- ==========================================================================
-- CODE MEETS AI - LAYER 2 MANUAL SCHEMA
-- File: /schema/layer2_manual_schema.sql
-- ==========================================================================

CREATE TABLE IF NOT EXISTS public.layer_2_manual_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  username TEXT,
  roll_number TEXT,
  year TEXT,
  language TEXT NOT NULL,
  
  -- The fixed pool of 5 questions randomly selected for this participant
  questions_pool JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Detailed state mapping question ID to attempts, answers, skips, and marks
  question_states JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Score tracking
  automatic_marks NUMERIC NOT NULL DEFAULT 0.0 CHECK (automatic_marks >= 0.0 AND automatic_marks <= 25.0),
  admin_override_marks NUMERIC CHECK (admin_override_marks >= 0.0 AND admin_override_marks <= 25.0),
  final_marks NUMERIC NOT NULL DEFAULT 0.0 CHECK (final_marks >= 0.0 AND final_marks <= 25.0),
  
  -- Session tracking
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('in_progress', 'completed')),
  started_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  CONSTRAINT unique_user_layer2_manual UNIQUE (user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_l2man_user_id ON public.layer_2_manual_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_l2man_final_marks ON public.layer_2_manual_attempts(final_marks DESC);

-- Trigger: auto-update updated_at
DROP TRIGGER IF EXISTS trigger_l2man_updated_at ON public.layer_2_manual_attempts;
CREATE TRIGGER trigger_l2man_updated_at
  BEFORE UPDATE ON public.layer_2_manual_attempts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger Function: Determine final_marks and sync to layer_2
CREATE OR REPLACE FUNCTION public.sync_l2man_final_marks()
RETURNS TRIGGER AS $$
BEGIN
  -- Determine final_marks
  IF NEW.admin_override_marks IS NOT NULL THEN
    NEW.final_marks := NEW.admin_override_marks;
  ELSE
    NEW.final_marks := NEW.automatic_marks;
  END IF;

  -- Upsert into layer_2 table
  INSERT INTO public.layer_2 (user_id, layer_2_manual_marks)
  VALUES (NEW.user_id, NEW.final_marks)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    layer_2_manual_marks = EXCLUDED.layer_2_manual_marks,
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sync_l2man_marks ON public.layer_2_manual_attempts;
CREATE TRIGGER trigger_sync_l2man_marks
  BEFORE INSERT OR UPDATE OF automatic_marks, admin_override_marks ON public.layer_2_manual_attempts
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_l2man_final_marks();

-- RLS Policies
ALTER TABLE public.layer_2_manual_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can view their own layer2 manual attempt"
  ON public.layer_2_manual_attempts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Participants can insert their own layer2 manual attempt"
  ON public.layer_2_manual_attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Participants can update their own layer2 manual attempt"
  ON public.layer_2_manual_attempts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admins can view and update everything
CREATE POLICY "Admins full access on layer2 manual attempts"
  ON public.layer_2_manual_attempts FOR ALL
  USING (true)
  WITH CHECK (true);
