-- ==========================================================================
-- CODE MEETS AI - ADD SESSION PRESENCE COLUMNS TO USERS TABLE
-- File: /database/schemas/add_session_presence_to_users.sql
-- Description: Adds active_session_id and last_seen_at columns to the users
--              table to enable heartbeat online/offline presence tracking and
--              prevent duplicate active logins while allowing stale session reclaim.
-- Execution: Run in Supabase SQL Editor (Dashboard → SQL Editor → New Query → Run)
-- ==========================================================================

-- 1. Add active_session_id and last_seen_at columns if they do not exist
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS active_session_id TEXT,
  ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ;

-- 2. Add performance indexes for presence lookups
CREATE INDEX IF NOT EXISTS idx_users_active_session_id ON public.users(active_session_id);
CREATE INDEX IF NOT EXISTS idx_users_last_seen_at ON public.users(last_seen_at);

-- 3. Optional RPC helper function for atomic session reclaim (race-condition protection)
CREATE OR REPLACE FUNCTION public.reclaim_user_session(
  p_user_id UUID,
  p_new_session_id TEXT,
  p_timeout_seconds INT DEFAULT 60
)
RETURNS TABLE (
  success BOOLEAN,
  message TEXT,
  user_data JSONB
) AS $$
DECLARE
  v_user public.users%ROWTYPE;
  v_is_stale BOOLEAN;
BEGIN
  -- Lock target user row for update
  SELECT * INTO v_user
  FROM public.users
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 'User record not found'::TEXT, NULL::JSONB;
    RETURN;
  END IF;

  -- Determine if current active session is stale/expired or owned by same browser
  v_is_stale := (v_user.last_seen_at IS NULL)
             OR (v_user.active_session_id IS NULL)
             OR (v_user.active_session_id = p_new_session_id)
             OR (v_user.last_seen_at < NOW() - (p_timeout_seconds || ' seconds')::INTERVAL);

  IF v_is_stale THEN
    UPDATE public.users
    SET active_session_id = p_new_session_id,
        last_seen_at = NOW(),
        updated_at = NOW()
    WHERE user_id = p_user_id;

    -- Fetch updated row
    SELECT * INTO v_user FROM public.users WHERE user_id = p_user_id;

    RETURN QUERY SELECT TRUE, 'Session successfully assigned'::TEXT, to_jsonb(v_user);
  ELSE
    RETURN QUERY SELECT FALSE, 'Participant is currently active on another session'::TEXT, NULL::JSONB;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execution permission to public/anon role
GRANT EXECUTE ON FUNCTION public.reclaim_user_session TO anon, authenticated, service_role;
