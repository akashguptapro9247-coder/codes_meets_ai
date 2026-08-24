-- ==========================================================================
-- CODE MEETS AI COMPETITION DATABASE - SCHEMA STEP 2: LAYER 1 SCHEMA
-- File: /schema/layer1_schema.sql
-- Description: Creates the 'layer_1' table with marks, JSONB question pools,
--              average calculation triggers, and RLS policies.
-- Execution Order: Run AFTER user_schema.sql.
-- ==========================================================================

-- --------------------------------------------------------------------------
-- 1. TABLE CREATION: layer_1
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.layer_1 (
  -- Auto-incrementing primary key
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

  -- Foreign key relationship to users table via UUID
  user_id UUID NOT NULL UNIQUE REFERENCES public.users(user_id) ON DELETE CASCADE,

  -- Participant name (denormalized for convenient display)
  name TEXT,

  -- Layer 1 Score columns (editable only by authorized/admin logic)
  layer_1_gen_ai_marks NUMERIC DEFAULT 0.0 CHECK (layer_1_gen_ai_marks >= 0),
  layer_1_manual_marks NUMERIC DEFAULT 0.0 CHECK (layer_1_manual_marks >= 0),

  -- Calculated average: (gen_ai_marks + manual_marks) / 2
  -- Updated automatically by trigger, NOT by frontend
  average_marks NUMERIC DEFAULT 0.0 CHECK (average_marks >= 0),

  -- JSONB Question Pools for random selection by application
  -- Structure: [{ "id": "L1-E-001", "question": "...", "answer": "...", "marks": 10 }]
  easy_questions JSONB DEFAULT '[]'::jsonb,
  hard_questions JSONB DEFAULT '[]'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- --------------------------------------------------------------------------
-- 2. INDEXES
-- --------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_layer1_user_id ON public.layer_1(user_id);
CREATE INDEX IF NOT EXISTS idx_layer1_average_marks ON public.layer_1(average_marks DESC);

-- --------------------------------------------------------------------------
-- 3. TRIGGER: AUTO-UPDATE updated_at TIMESTAMP
-- Reuses the shared function created in user_schema.sql
-- --------------------------------------------------------------------------
DROP TRIGGER IF EXISTS trigger_layer1_updated_at ON public.layer_1;
CREATE TRIGGER trigger_layer1_updated_at
  BEFORE UPDATE ON public.layer_1
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- --------------------------------------------------------------------------
-- 4. TRIGGER FUNCTION: CALCULATE average_marks FROM GEN AI + MANUAL MARKS
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.calculate_layer1_average()
RETURNS TRIGGER AS $$
BEGIN
  NEW.average_marks = (
    COALESCE(NEW.layer_1_gen_ai_marks, 0.0) +
    COALESCE(NEW.layer_1_manual_marks, 0.0)
  ) / 2.0;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_layer1_calculate_average ON public.layer_1;
CREATE TRIGGER trigger_layer1_calculate_average
  BEFORE INSERT OR UPDATE OF layer_1_gen_ai_marks, layer_1_manual_marks ON public.layer_1
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_layer1_average();

-- --------------------------------------------------------------------------
-- 5. TRIGGER FUNCTION: SYNC average_marks BACK TO users.average_layer_1
-- This ensures the users table total_score stays consistent.
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.sync_layer1_average_to_users()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.users
  SET
    average_layer_1 = NEW.average_marks,
    updated_at = NOW()
  WHERE user_id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sync_layer1_to_users ON public.layer_1;
CREATE TRIGGER trigger_sync_layer1_to_users
  AFTER INSERT OR UPDATE OF average_marks ON public.layer_1
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_layer1_average_to_users();

-- --------------------------------------------------------------------------
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- --------------------------------------------------------------------------
ALTER TABLE public.layer_1 ENABLE ROW LEVEL SECURITY;

-- Policy 1: Public / Anon can view Layer 1 results (for leaderboard)
CREATE POLICY "Public Layer1 Read Access"
  ON public.layer_1
  FOR SELECT
  USING (true);

-- Policy 2: Admin can insert score records
CREATE POLICY "Public Layer1 Insert Access"
  ON public.layer_1
  FOR INSERT
  WITH CHECK (true);

-- Policy 3: Admin can update marks
CREATE POLICY "Public Layer1 Update Access"
  ON public.layer_1
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Policy 4: Admin can delete records
CREATE POLICY "Public Layer1 Delete Access"
  ON public.layer_1
  FOR DELETE
  USING (true);

-- --------------------------------------------------------------------------
-- 7. EXAMPLE QUERIES: RANDOM QUESTION SELECTION FROM JSONB ARRAY
-- (These are reference queries for the application, not part of schema DDL)
-- --------------------------------------------------------------------------

-- Example: Select 1 random easy question for a user
-- SELECT eq.*
-- FROM public.layer_1,
--      jsonb_array_elements(easy_questions) AS eq
-- WHERE user_id = '<target_user_id>'
-- ORDER BY RANDOM()
-- LIMIT 1;

-- Example: Select 2 random hard questions for a user
-- SELECT hq.*
-- FROM public.layer_1,
--      jsonb_array_elements(hard_questions) AS hq
-- WHERE user_id = '<target_user_id>'
-- ORDER BY RANDOM()
-- LIMIT 2;

-- Example: Get all easy questions across the pool for admin view
-- SELECT
--   user_id,
--   jsonb_array_length(easy_questions) AS total_easy_questions
-- FROM public.layer_1;

-- ==========================================================================
-- END OF layer1_schema.sql
-- ==========================================================================
