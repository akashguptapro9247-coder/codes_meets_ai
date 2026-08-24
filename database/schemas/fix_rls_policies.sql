-- ==========================================================================
-- CODE MEETS AI - SUPABASE RLS POLICIES FIX & REALTIME ENABLEMENT (IDEMPOTENT)
-- File: /schema/fix_rls_policies.sql
-- Description:
--   Updates Row Level Security (RLS) policies on all tables so that the
--   Code Meets AI Admin Panel and participant screens can successfully
--   perform full CRUD operations (Users, Layer 1, Layer 2, Duos, Event Settings,
--   and Layer 1 GenAI Submissions), and installs score calculation triggers.
--
-- Execution: Run this in the Supabase SQL Editor. It can be run multiple times safely.
-- ==========================================================================

-- --------------------------------------------------------------------------
-- 1. USERS TABLE RLS POLICIES
-- --------------------------------------------------------------------------
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Users Read Access" ON public.users;
DROP POLICY IF EXISTS "Allow User Registration" ON public.users;
DROP POLICY IF EXISTS "Users Self Update Access" ON public.users;
DROP POLICY IF EXISTS "Admin Full Access Users" ON public.users;
DROP POLICY IF EXISTS "Public Users Insert Access" ON public.users;
DROP POLICY IF EXISTS "Public Users Update Access" ON public.users;
DROP POLICY IF EXISTS "Public Users Delete Access" ON public.users;

CREATE POLICY "Public Users Read Access" ON public.users FOR SELECT USING (true);
CREATE POLICY "Public Users Insert Access" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Users Update Access" ON public.users FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public Users Delete Access" ON public.users FOR DELETE USING (true);


-- --------------------------------------------------------------------------
-- 2. LAYER 1 TABLE RLS POLICIES
-- --------------------------------------------------------------------------
ALTER TABLE public.layer_1 ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Layer1 Read Access" ON public.layer_1;
DROP POLICY IF EXISTS "Admin Insert Layer1" ON public.layer_1;
DROP POLICY IF EXISTS "Admin Update Layer1 Marks" ON public.layer_1;
DROP POLICY IF EXISTS "Admin Delete Layer1" ON public.layer_1;
DROP POLICY IF EXISTS "Public Layer1 Insert Access" ON public.layer_1;
DROP POLICY IF EXISTS "Public Layer1 Update Access" ON public.layer_1;
DROP POLICY IF EXISTS "Public Layer1 Delete Access" ON public.layer_1;

CREATE POLICY "Public Layer1 Read Access" ON public.layer_1 FOR SELECT USING (true);
CREATE POLICY "Public Layer1 Insert Access" ON public.layer_1 FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Layer1 Update Access" ON public.layer_1 FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public Layer1 Delete Access" ON public.layer_1 FOR DELETE USING (true);


-- --------------------------------------------------------------------------
-- 3. LAYER 2 TABLE RLS POLICIES
-- --------------------------------------------------------------------------
ALTER TABLE public.layer_2 ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Layer2 Read Access" ON public.layer_2;
DROP POLICY IF EXISTS "Admin Insert Layer2" ON public.layer_2;
DROP POLICY IF EXISTS "Admin Update Layer2 Marks" ON public.layer_2;
DROP POLICY IF EXISTS "Admin Delete Layer2" ON public.layer_2;
DROP POLICY IF EXISTS "Public Layer2 Insert Access" ON public.layer_2;
DROP POLICY IF EXISTS "Public Layer2 Update Access" ON public.layer_2;
DROP POLICY IF EXISTS "Public Layer2 Delete Access" ON public.layer_2;

CREATE POLICY "Public Layer2 Read Access" ON public.layer_2 FOR SELECT USING (true);
CREATE POLICY "Public Layer2 Insert Access" ON public.layer_2 FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Layer2 Update Access" ON public.layer_2 FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public Layer2 Delete Access" ON public.layer_2 FOR DELETE USING (true);


-- --------------------------------------------------------------------------
-- 4. DUOS TABLE RLS POLICIES & CONSTRAINT UPDATE
-- --------------------------------------------------------------------------
ALTER TABLE public.duos ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.duos DROP CONSTRAINT IF EXISTS duos_combined_layer_1_average_check;
ALTER TABLE public.duos DROP CONSTRAINT IF EXISTS duos_total_marks_check;
ALTER TABLE public.duos ADD CONSTRAINT duos_combined_layer_1_average_check CHECK (combined_layer_1_average >= 0.0);
ALTER TABLE public.duos ADD CONSTRAINT duos_total_marks_check CHECK (total_marks >= 0.0);

DROP POLICY IF EXISTS "Public Duos Read Access" ON public.duos;
DROP POLICY IF EXISTS "Admin Insert Duos" ON public.duos;
DROP POLICY IF EXISTS "Admin Update Duos" ON public.duos;
DROP POLICY IF EXISTS "Admin Delete Duos" ON public.duos;
DROP POLICY IF EXISTS "Public Duos Insert Access" ON public.duos;
DROP POLICY IF EXISTS "Public Duos Update Access" ON public.duos;
DROP POLICY IF EXISTS "Public Duos Delete Access" ON public.duos;

CREATE POLICY "Public Duos Read Access" ON public.duos FOR SELECT USING (true);
CREATE POLICY "Public Duos Insert Access" ON public.duos FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Duos Update Access" ON public.duos FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public Duos Delete Access" ON public.duos FOR DELETE USING (true);


-- --------------------------------------------------------------------------
-- 5. EVENT SETTINGS TABLE RLS POLICIES
-- --------------------------------------------------------------------------
ALTER TABLE public.event_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Event Settings" ON public.event_settings;
DROP POLICY IF EXISTS "Admin Update Event Settings" ON public.event_settings;
DROP POLICY IF EXISTS "Public Update Event Settings" ON public.event_settings;
DROP POLICY IF EXISTS "Public Insert Event Settings" ON public.event_settings;
DROP POLICY IF EXISTS "Public Delete Event Settings" ON public.event_settings;

CREATE POLICY "Public Read Event Settings" ON public.event_settings FOR SELECT USING (true);
CREATE POLICY "Public Update Event Settings" ON public.event_settings FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public Insert Event Settings" ON public.event_settings FOR INSERT WITH CHECK (true);


-- --------------------------------------------------------------------------
-- 6. LAYER 1 GENAI SUBMISSIONS TABLE
-- --------------------------------------------------------------------------
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

CREATE INDEX IF NOT EXISTS idx_layer1_genai_user_id ON public.layer_1_genai_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_layer1_genai_status ON public.layer_1_genai_submissions(status);
CREATE INDEX IF NOT EXISTS idx_layer1_genai_submitted_at ON public.layer_1_genai_submissions(submitted_at DESC);

ALTER TABLE public.layer_1_genai_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Layer1 Submissions" ON public.layer_1_genai_submissions;
DROP POLICY IF EXISTS "Public Insert Layer1 Submissions" ON public.layer_1_genai_submissions;
DROP POLICY IF EXISTS "Public Update Layer1 Submissions" ON public.layer_1_genai_submissions;
DROP POLICY IF EXISTS "Public Delete Layer1 Submissions" ON public.layer_1_genai_submissions;

CREATE POLICY "Public Read Layer1 Submissions" ON public.layer_1_genai_submissions FOR SELECT USING (true);
CREATE POLICY "Public Insert Layer1 Submissions" ON public.layer_1_genai_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Layer1 Submissions" ON public.layer_1_genai_submissions FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public Delete Layer1 Submissions" ON public.layer_1_genai_submissions FOR DELETE USING (true);


-- --------------------------------------------------------------------------
-- 7. ENABLE SUPABASE REALTIME REPLICATION
-- --------------------------------------------------------------------------
DO $$
BEGIN
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.users; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.layer_1; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.layer_2; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.duos; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.event_settings; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.layer_1_genai_submissions; EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;


-- --------------------------------------------------------------------------
-- 8. EXACT LAYER 3 COMBINED MARKS CALCULATION TRIGGER
-- Formula: Layer3Combined = ((Player1_L1_Avg + Player1_L2_Avg) + (Player2_L1_Avg + Player2_L2_Avg)) / 2
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.calculate_duo_combined_average()
RETURNS TRIGGER AS $$
DECLARE
  v_p1_l1 NUMERIC;
  v_p1_l2 NUMERIC;
  v_p2_l1 NUMERIC;
  v_p2_l2 NUMERIC;
  v_p1_combined NUMERIC;
  v_p2_combined NUMERIC;
  v_layer3_combined NUMERIC;
BEGIN
  SELECT COALESCE(average_layer_1, 0.0), COALESCE(average_layer_2, 0.0)
    INTO v_p1_l1, v_p1_l2
    FROM public.users WHERE user_id = NEW.player_1_id;

  SELECT COALESCE(average_layer_1, 0.0), COALESCE(average_layer_2, 0.0)
    INTO v_p2_l1, v_p2_l2
    FROM public.users WHERE user_id = NEW.player_2_id;

  v_p1_combined := v_p1_l1 + v_p1_l2;
  v_p2_combined := v_p2_l1 + v_p2_l2;
  v_layer3_combined := (v_p1_combined + v_p2_combined) / 2.0;

  NEW.combined_layer_1_average := ROUND(v_layer3_combined, 2);
  NEW.total_marks := ROUND(
    v_layer3_combined
    + COALESCE(NEW.layer_3_marks, 0.0)
    + COALESCE(NEW.layer_4_marks, 0.0),
    2
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_calculate_duo_combined_average ON public.duos;
CREATE TRIGGER trigger_calculate_duo_combined_average
  BEFORE INSERT OR UPDATE OF player_1_id, player_2_id ON public.duos
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_duo_combined_average();

-- Trigger: Recalculate duo total whenever layer 3 or 4 marks change
CREATE OR REPLACE FUNCTION public.recalculate_duo_total_marks()
RETURNS TRIGGER AS $$
BEGIN
  NEW.total_marks := ROUND(
    COALESCE(NEW.combined_layer_1_average, 0.0)
    + COALESCE(NEW.layer_3_marks, 0.0)
    + COALESCE(NEW.layer_4_marks, 0.0),
    2
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_recalculate_duo_total_marks ON public.duos;
CREATE TRIGGER trigger_recalculate_duo_total_marks
  BEFORE INSERT OR UPDATE OF layer_3_marks, layer_4_marks, combined_layer_1_average ON public.duos
  FOR EACH ROW
  EXECUTE FUNCTION public.recalculate_duo_total_marks();

-- Trigger: Propagate user score changes to duos automatically
CREATE OR REPLACE FUNCTION public.propagate_user_score_to_duos()
RETURNS TRIGGER AS $$
DECLARE
  duo_row RECORD;
  v_p1_l1 NUMERIC;
  v_p1_l2 NUMERIC;
  v_p2_l1 NUMERIC;
  v_p2_l2 NUMERIC;
  v_p1_combined NUMERIC;
  v_p2_combined NUMERIC;
  v_layer3_combined NUMERIC;
BEGIN
  FOR duo_row IN
    SELECT duo_id, player_1_id, player_2_id, layer_3_marks, layer_4_marks
      FROM public.duos
     WHERE player_1_id = NEW.user_id OR player_2_id = NEW.user_id
  LOOP
    SELECT COALESCE(average_layer_1, 0.0), COALESCE(average_layer_2, 0.0)
      INTO v_p1_l1, v_p1_l2
      FROM public.users WHERE user_id = duo_row.player_1_id;

    SELECT COALESCE(average_layer_1, 0.0), COALESCE(average_layer_2, 0.0)
      INTO v_p2_l1, v_p2_l2
      FROM public.users WHERE user_id = duo_row.player_2_id;

    v_p1_combined := v_p1_l1 + v_p1_l2;
    v_p2_combined := v_p2_l1 + v_p2_l2;
    v_layer3_combined := (v_p1_combined + v_p2_combined) / 2.0;

    UPDATE public.duos
       SET combined_layer_1_average = ROUND(v_layer3_combined, 2),
           total_marks = ROUND(
             v_layer3_combined
             + COALESCE(duo_row.layer_3_marks, 0.0)
             + COALESCE(duo_row.layer_4_marks, 0.0),
             2
           ),
           updated_at = NOW()
     WHERE duo_id = duo_row.duo_id;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_propagate_user_score_to_duos ON public.users;
CREATE TRIGGER trigger_propagate_user_score_to_duos
  AFTER UPDATE OF average_layer_1, average_layer_2, total_score ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.propagate_user_score_to_duos();

-- ============================================================================
-- 9. LAYER 1 MANUAL ATTEMPTS TABLE (MCQ PROGRESS & MARKS)
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

