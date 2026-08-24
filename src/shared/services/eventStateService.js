// ==========================================================================
// CODE MEETS AI - REALTIME EVENT STATE SERVICE (CONNECTED TO SUPABASE)
// ==========================================================================

import { adminService } from '../../admin/services/adminService';
import { isSupabaseConfigured } from './supabaseClient';

const INITIAL_EVENT_STATE = {
  layer1: {
    active: false,
    activeTrack: null // 'gen-ai' | 'manual' | null
  },
  layer2: {
    active: false,
    activeTrack: null // 'gen-ai' | 'manual' | null
  }
};

class EventStateService {
  constructor() {
    this.state = { ...INITIAL_EVENT_STATE };
    this.listeners = new Set();
    this.realtimeUnsubscribe = null;

    // Load local cache if available
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('cma_event_state');
      if (saved) {
        try {
          this.state = JSON.parse(saved);
        } catch (e) {
          console.warn('Failed to parse saved event state:', e);
        }
      }
    }

    // Initialize Supabase Sync if configured
    this.initSupabaseSync();
  }

  async initSupabaseSync() {
    if (!isSupabaseConfigured()) return;

    try {
      const { data } = await adminService.fetchEventSettings();
      if (data) {
        this.applySettingsToState(data);
      }

      // Subscribe to live Postgres changes on event_settings
      this.realtimeUnsubscribe = adminService.subscribeToChanges('event_settings', (payload) => {
        if (payload.new) {
          this.applySettingsToState(payload.new);
        }
      });
    } catch (err) {
      console.warn('Supabase event_settings sync initialization failed:', err);
    }
  }

  applySettingsToState(settings) {
    const layer1Active = !settings.layer_1_locked;
    const layer2Active = !settings.layer_2_locked;

    let layer1Track = settings.layer_1_active_track;
    if (layer1Active && !layer1Track) {
      if (settings.layer_1_genai_active) layer1Track = 'gen-ai';
      else if (settings.layer_1_manual_active) layer1Track = 'manual';
    }

    let layer2Track = settings.layer_2_active_track;
    if (layer2Active && !layer2Track) {
      if (settings.layer_2_genai_active) layer2Track = 'gen-ai';
      else if (settings.layer_2_manual_active) layer2Track = 'manual';
    }

    this.state = {
      layer1: {
        active: layer1Active,
        activeTrack: layer1Active ? layer1Track : null
      },
      layer2: {
        active: layer2Active,
        activeTrack: layer2Active ? layer2Track : null
      }
    };

    this.notifyListeners();
  }

  getEventState() {
    return { ...this.state };
  }

  subscribeToEventState(callback) {
    this.listeners.add(callback);
    // Immediately emit current state
    callback({ ...this.state });

    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }

  notifyListeners() {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('cma_event_state', JSON.stringify(this.state));
    }
    this.listeners.forEach((listener) => listener({ ...this.state }));
  }

  // Admin mutation method: writes to Supabase if configured, and updates local state
  async setLayerState(layerKey, active, activeTrack = null) {
    if (!this.state[layerKey]) return;

    this.state = {
      ...this.state,
      [layerKey]: {
        active: Boolean(active),
        activeTrack: active ? activeTrack : null
      }
    };

    this.notifyListeners();

    // Persist to Supabase event_settings table
    if (isSupabaseConfigured()) {
      try {
        const updatePayload = {};
        if (layerKey === 'layer1') {
          updatePayload.layer_1_locked = !active;
          updatePayload.layer_1_active_track = active ? activeTrack : null;
          if (activeTrack === 'gen-ai') {
            updatePayload.layer_1_genai_active = true;
            updatePayload.layer_1_manual_active = false;
          } else if (activeTrack === 'manual') {
            updatePayload.layer_1_genai_active = false;
            updatePayload.layer_1_manual_active = true;
          }
        } else if (layerKey === 'layer2') {
          updatePayload.layer_2_locked = !active;
          updatePayload.layer_2_active_track = active ? activeTrack : null;
          if (activeTrack === 'gen-ai') {
            updatePayload.layer_2_genai_active = true;
            updatePayload.layer_2_manual_active = false;
          } else if (activeTrack === 'manual') {
            updatePayload.layer_2_genai_active = false;
            updatePayload.layer_2_manual_active = true;
          }
        }

        await adminService.updateEventSettings(updatePayload);
      } catch (err) {
        console.warn('Failed to persist layer state to Supabase:', err);
      }
    }
  }

  async resetAll() {
    this.state = {
      layer1: { active: false, activeTrack: null },
      layer2: { active: false, activeTrack: null }
    };
    this.notifyListeners();

    if (isSupabaseConfigured()) {
      try {
        await adminService.updateEventSettings({
          layer_1_locked: true,
          layer_2_locked: true,
          layer_3_locked: true,
          layer_4_locked: true,
          layer_1_genai_active: false,
          layer_1_manual_active: false,
          layer_2_genai_active: false,
          layer_2_manual_active: false,
          layer_1_active_track: null,
          layer_2_active_track: null,
          active_layer: 'standby'
        });
      } catch (err) {
        console.warn('Failed to reset event settings in Supabase:', err);
      }
    }
  }
}

export const eventStateService = new EventStateService();
