// ==========================================================================
// CODE MEETS AI - PARTICIPANT FORCE EXIT & REALTIME SECURITY GUARD
// ==========================================================================
// Actively monitors participant's database status via Supabase Realtime
// and periodic route guards. If admin deletes a participant, forces immediate
// exit, clears client storage, and redirects to registration.
// ==========================================================================

import { supabase, isSupabaseConfigured } from './supabaseClient';

class ParticipantGuard {
  constructor() {
    this.currentUserId = null;
    this.realtimeChannel = null;
    this.listeners = new Set();
    this.isTerminated = false;
  }

  /**
   * Initializes real-time listener for the active participant.
   * Listens for DELETE operations on 'users' and 'duos' tables in Supabase.
   */
  startWatching(userId) {
    if (!userId) return;
    if (this.currentUserId === userId && this.realtimeChannel) return;

    this.stopWatching();
    this.currentUserId = userId;
    this.isTerminated = false;

    if (!isSupabaseConfigured() || !supabase) return;

    const channelName = `guard_user_${userId}_${Date.now()}`;
    
    this.realtimeChannel = supabase
      .channel(channelName)
      // 1. Listen for DELETE event on users table
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'users'
        },
        (payload) => {
          if (!payload.old || payload.old.user_id === this.currentUserId) {
            this.triggerForceExit('ADMIN_DELETED', 'Your session has been terminated by the event admin.');
          }
        }
      )
      // 2. Listen for UPDATE on users table (elimination or promotion)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users'
        },
        (payload) => {
          if (payload.new && payload.new.user_id === this.currentUserId) {
            if (payload.new.is_removed) {
              this.triggerForceExit('PARTICIPANT_REMOVED', 'Your participation in this event has concluded.');
              return;
            }

            // Sync promotion status to local session
            try {
              const raw = sessionStorage.getItem('cma_participant_session') || localStorage.getItem('cma_participant_session');
              if (raw) {
                const stored = JSON.parse(raw);
                const updated = {
                  ...stored,
                  promoted_to_layer2: Boolean(payload.new.promoted_to_layer2),
                  promoted_to_layer3: Boolean(payload.new.promoted_to_layer3),
                  is_removed: Boolean(payload.new.is_removed)
                };
                sessionStorage.setItem('cma_participant_session', JSON.stringify(updated));
                localStorage.setItem('cma_participant_session', JSON.stringify(updated));
              }
            } catch (e) {
              console.warn('Error updating session storage on user change:', e);
            }

            this.notifyListeners({
              type: 'PROMOTION_UPDATED',
              promoted_to_layer2: Boolean(payload.new.promoted_to_layer2),
              promoted_to_layer3: Boolean(payload.new.promoted_to_layer3)
            });
          }
        }
      )
      // 3. Listen for DELETE on duos table (if duo partner or team deleted)
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'duos'
        },
        (payload) => {
          if (payload.old && (payload.old.player_1_id === this.currentUserId || payload.old.player_2_id === this.currentUserId)) {
            this.notifyListeners({
              type: 'DUO_DISBANDED',
              message: 'Your Duo team has been disbanded by the event admin.'
            });
          }
        }
      )
      .subscribe();
  }

  stopWatching() {
    if (this.realtimeChannel && supabase) {
      try {
        supabase.removeChannel(this.realtimeChannel);
      } catch (e) {
        // Channel removal
      }
      this.realtimeChannel = null;
    }
  }

  /**
   * Subscribes UI components to termination / guard events.
   */
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyListeners(eventData) {
    this.listeners.forEach((cb) => {
      try {
        cb(eventData);
      } catch (err) {
        console.error('ParticipantGuard listener error:', err);
      }
    });
  }

  /**
   * Asynchronously validates that the participant record still exists in Supabase
   * and has not been eliminated.
   */
  async validateParticipantExists(userId) {
    if (!userId) return false;
    if (!isSupabaseConfigured() || !supabase) return true;

    try {
      const { data, error } = await supabase
        .from('users')
        .select('user_id, is_removed, promoted_to_layer2, promoted_to_layer3')
        .eq('user_id', userId)
        .maybeSingle();

      if (error || !data) {
        this.triggerForceExit('DATABASE_INVALIDATED', 'Your participant record no longer exists in the event database.');
        return false;
      }

      if (data.is_removed) {
        this.triggerForceExit('PARTICIPANT_REMOVED', 'Your participation in this event has concluded.');
        return false;
      }

      // Keep local session storage in sync with database source of truth
      try {
        const raw = sessionStorage.getItem('cma_participant_session') || localStorage.getItem('cma_participant_session');
        if (raw) {
          const stored = JSON.parse(raw);
          const updated = {
            ...stored,
            promoted_to_layer2: Boolean(data.promoted_to_layer2),
            promoted_to_layer3: Boolean(data.promoted_to_layer3),
            is_removed: Boolean(data.is_removed)
          };
          sessionStorage.setItem('cma_participant_session', JSON.stringify(updated));
          localStorage.setItem('cma_participant_session', JSON.stringify(updated));
        }
      } catch (e) {}

      return true;
    } catch (err) {
      console.warn('[ParticipantGuard] Validation query warning:', err);
      return true;
    }
  }

  /**
   * Central trigger for forced exit.
   * Atomically clears participant session storage, triggers notification, and redirects.
   */
  triggerForceExit(reason = 'ADMIN_DELETED', message = 'Your session has been terminated by the event admin.') {
    if (this.isTerminated) return;
    this.isTerminated = true;

    this.clearParticipantSession();

    this.notifyListeners({
      type: 'FORCE_EXIT',
      reason,
      message
    });
  }

  /**
   * Clears all participant-specific client storage while preserving admin auth.
   */
  clearParticipantSession() {
    if (typeof window === 'undefined') return;

    try {
      sessionStorage.removeItem('cma_participant_session');
      sessionStorage.removeItem('cma_event_state');
      localStorage.removeItem('cma_participant_session');
      localStorage.removeItem('cma_event_state');
    } catch (e) {
      console.warn('Error clearing participant storage:', e);
    }
  }
}

export const participantGuard = new ParticipantGuard();
