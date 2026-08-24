-- ==========================================================================
-- CODE MEETS AI COMPETITION DATABASE - SCHEMA STEP 5: EVENT SETTINGS
-- File: /schema/event_settings_schema.sql
-- Description:
--   Creates the 'event_settings' table for centralized realtime management of:
--   - Layer 1 & 2 locks
--   - GenAI & Manual Coding track activation states
--   - Active competition layer & stage
--   - Realtime broadcast to participant dashboards
--
-- Execution Order: Run AFTER user_schema.sql, layer1_schema.sql, layer2_schema.sql, duo_schema.sql.
-- ==========================================================================

CREATE TABLE IF NOT EXISTS public.event_settings (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1), -- Single-row configuration pattern
  
  -- Layer Lock States (true = locked, false = unlocked)
  layer_1_locked BOOLEAN DEFAULT true NOT NULL,
  layer_2_locked BOOLEAN DEFAULT true NOT NULL,
  layer_3_locked BOOLEAN DEFAULT true NOT NULL,
  layer_4_locked BOOLEAN DEFAULT true NOT NULL,

  -- Track Activation States (for Layer 1 & 2)
  layer_1_genai_active BOOLEAN DEFAULT false NOT NULL,
  layer_1_manual_active BOOLEAN DEFAULT false NOT NULL,
  layer_2_genai_active BOOLEAN DEFAULT false NOT NULL,
  layer_2_manual_active BOOLEAN DEFAULT false NOT NULL,

  -- Currently Broadcast Active Layer ('layer1', 'layer2', 'layer3', 'layer4', or 'standby')
  active_layer TEXT DEFAULT 'standby' NOT NULL,

  -- Active Track Override ('gen-ai', 'manual', or null)
  layer_1_active_track TEXT,
  layer_2_active_track TEXT,

  -- Telemetry & Timestamps
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Ensure default initial row exists
INSERT INTO public.event_settings (
  id,
  layer_1_locked,
  layer_2_locked,
  layer_3_locked,
  layer_4_locked,
  layer_1_genai_active,
  layer_1_manual_active,
  layer_2_genai_active,
  layer_2_manual_active,
  active_layer,
  layer_1_active_track,
  layer_2_active_track
) VALUES (
  1,
  true,
  true,
  true,
  true,
  false,
  false,
  false,
  false,
  'standby',
  NULL,
  NULL
) ON CONFLICT (id) DO NOTHING;

-- --------------------------------------------------------------------------
-- TRIGGER: AUTO-UPDATE updated_at
-- --------------------------------------------------------------------------
DROP TRIGGER IF EXISTS trigger_event_settings_updated_at ON public.event_settings;
CREATE TRIGGER trigger_event_settings_updated_at
  BEFORE UPDATE ON public.event_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- --------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS)
-- --------------------------------------------------------------------------
ALTER TABLE public.event_settings ENABLE ROW LEVEL SECURITY;

-- Policy 1: Public / Anon can view event settings (to dynamically lock/unlock client screens)
CREATE POLICY "Public Read Event Settings"
  ON public.event_settings
  FOR SELECT
  USING (true);

-- Policy 2: Admin / Service Role can update event settings
CREATE POLICY "Admin Update Event Settings"
  ON public.event_settings
  FOR UPDATE
  USING (true) -- In production, restrict to service_role or admin auth
  WITH CHECK (true);

-- --------------------------------------------------------------------------
-- SUPABASE REALTIME CONFIGURATION
-- Enable replication on event_settings, duos, users, layer_1, layer_2
-- --------------------------------------------------------------------------
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.event_settings;
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.layer_1;
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.layer_2;
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.duos;

-- ==========================================================================
-- END OF event_settings_schema.sql
-- ==========================================================================
