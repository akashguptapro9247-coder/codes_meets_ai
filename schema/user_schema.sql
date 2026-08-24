-- ==========================================================================
-- CODE MEETS AI COMPETITION DATABASE - SCHEMA STEP 1: USER SCHEMA
-- File: /schema/user_schema.sql
-- Description: Creates the primary 'users' table, sequence, triggers, indexes,
--              score synchronization logic, and RLS policies for Supabase.
-- Execution Order: Run THIS file FIRST.
-- ==========================================================================

-- Enable pgcrypto extension for gen_random_uuid() if not enabled by default
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- --------------------------------------------------------------------------
-- 1. TABLE CREATION: users
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
  -- Auto-incrementing registration serial number
  serial_number BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

  -- Primary UUID identifier for relationships with layer_1 and layer_2
  user_id UUID DEFAULT gen_random_uuid() NOT NULL UNIQUE,

  -- Participant registration details
  name TEXT NOT NULL,
  roll_number TEXT NOT NULL UNIQUE,
  branch TEXT NOT NULL,
  year INTEGER NOT NULL CHECK (year >= 1 AND year <= 4),
  section TEXT NOT NULL,

  -- Score aggregations (Synchronized automatically via triggers from layer_1 and layer_2)
  average_layer_1 NUMERIC DEFAULT 0.0 CHECK (average_layer_1 >= 0),
  average_layer_2 NUMERIC DEFAULT 0.0 CHECK (average_layer_2 >= 0),
  total_score NUMERIC DEFAULT 0.0 CHECK (total_score >= 0),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- --------------------------------------------------------------------------
-- 2. INDEXES FOR HIGH-PERFORMANCE LOOKUPS AND LEADERBOARDS
-- --------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_users_user_id ON public.users(user_id);
CREATE INDEX IF NOT EXISTS idx_users_roll_number ON public.users(roll_number);
CREATE INDEX IF NOT EXISTS idx_users_total_score ON public.users(total_score DESC);

-- --------------------------------------------------------------------------
-- 3. TRIGGER FUNCTION: AUTO-UPDATE updated_at TIMESTAMP
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to users table
DROP TRIGGER IF EXISTS trigger_users_updated_at ON public.users;
CREATE TRIGGER trigger_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- --------------------------------------------------------------------------
-- 4. TRIGGER FUNCTION: SCORE SYNCHRONIZATION FOR TOTAL_SCORE
-- --------------------------------------------------------------------------
-- Recalculates total_score whenever average_layer_1 or average_layer_2 updates
CREATE OR REPLACE FUNCTION public.recalculate_user_total_score()
RETURNS TRIGGER AS $$
BEGIN
  NEW.total_score = COALESCE(NEW.average_layer_1, 0.0) + COALESCE(NEW.average_layer_2, 0.0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_recalculate_user_total_score ON public.users;
CREATE TRIGGER trigger_recalculate_user_total_score
  BEFORE INSERT OR UPDATE OF average_layer_1, average_layer_2 ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.recalculate_user_total_score();

-- --------------------------------------------------------------------------
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- --------------------------------------------------------------------------
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy 1: Public / Anon can view the leaderboard and participant profiles
CREATE POLICY "Public Users Read Access"
  ON public.users
  FOR SELECT
  USING (true);

-- Policy 2: Anonymous or Authenticated users can register (Insert user record)
CREATE POLICY "Public Users Insert Access"
  ON public.users
  FOR INSERT
  WITH CHECK (true);

-- Policy 3: Users / Admin can update participant information
CREATE POLICY "Public Users Update Access"
  ON public.users
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Policy 4: Admin can delete participant records
CREATE POLICY "Public Users Delete Access"
  ON public.users
  FOR DELETE
  USING (true);

-- ==========================================================================
-- END OF user_schema.sql
-- ==========================================================================
