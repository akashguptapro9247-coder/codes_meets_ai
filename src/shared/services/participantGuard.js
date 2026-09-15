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
    this.l2GenaiTimerInterval = null;
    this.l2ManualTimerInterval = null;
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
      // 4. Listen for DELETE on layer_2_genai_submissions (if Admin deletes GenAI submission)
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'layer_2_genai_submissions'
        },
        (payload) => {
          if (payload.old && payload.old.user_id === this.currentUserId) {
            try {
              localStorage.removeItem(`cma_l2_genai_submitted_${this.currentUserId}`);
              sessionStorage.removeItem(`cma_l2_genai_submitted_${this.currentUserId}`);
              localStorage.removeItem(`cma_l2_genai_expired_${this.currentUserId}`);
              sessionStorage.removeItem(`cma_l2_genai_expired_${this.currentUserId}`);
              localStorage.removeItem(`cma_l2_genai_prompt_${this.currentUserId}`);
              sessionStorage.removeItem(`cma_l2_genai_prompt_${this.currentUserId}`);
              localStorage.removeItem(`cma_l2_genai_folder_${this.currentUserId}`);
              sessionStorage.removeItem(`cma_l2_genai_folder_${this.currentUserId}`);
              localStorage.removeItem(`cma_l2_genai_assigned_at_${this.currentUserId}`);
              sessionStorage.removeItem(`cma_l2_genai_assigned_at_${this.currentUserId}`);
            } catch (e) {}
            this.notifyListeners({
              type: 'L2_GENAI_SUBMISSION_DELETED',
              userId: this.currentUserId
            });
          }
        }
      )
      .subscribe();

    // Background watcher for Layer 2 GenAI timer expiry (e.g. while on Arena or in Manual)
    if (typeof window !== 'undefined') {
      if (this.l2GenaiTimerInterval) clearInterval(this.l2GenaiTimerInterval);
      this.l2GenaiTimerInterval = setInterval(async () => {
        try {
          const assignedAtRaw = localStorage.getItem(`cma_l2_genai_assigned_at_${userId}`);
          const isSubmitted = localStorage.getItem(`cma_l2_genai_submitted_${userId}`) === 'true';
          const isExpired = localStorage.getItem(`cma_l2_genai_expired_${userId}`) === 'true';

          if (assignedAtRaw && !isSubmitted && !isExpired) {
            const assignedTime = new Date(assignedAtRaw).getTime();
            const ROUND_DURATION_MS = 30 * 60 * 1000; // 30 minutes
            if (!isNaN(assignedTime) && (Date.now() - assignedTime >= ROUND_DURATION_MS)) {
              localStorage.setItem(`cma_l2_genai_expired_${userId}`, 'true');
              const draft = localStorage.getItem(`cma_l2_genai_prompt_${userId}`) || '';
              const { genaiService } = await import('../../layer2/genai/services/genaiService');
              await genaiService.recordTimeout(userId, draft);
            }
          }
        } catch (e) {}
      }, 5000);

      // Background watcher for Layer 2 Manual timer expiry (e.g. while participant is on Arena or in GenAI)
      if (this.l2ManualTimerInterval) clearInterval(this.l2ManualTimerInterval);
      this.l2ManualTimerInterval = setInterval(async () => {
        try {
          const submittedKey = `cma_l2_manual_submitted_${userId}`;
          const isSubmitted = localStorage.getItem(submittedKey) === 'true';
          if (isSubmitted) return;

          const savedRaw = localStorage.getItem(`cma_l2_manual_state_${userId}`);
          if (!savedRaw) return;

          const savedState = JSON.parse(savedRaw);
          if (!savedState || !savedState.hasStarted || !savedState.startTime) return;

          const startTimeMs = Number(savedState.startTime);
          const ROUND_DURATION_MS = 30 * 60 * 1000; // 30 minutes
          if (!isNaN(startTimeMs) && (Date.now() - startTimeMs >= ROUND_DURATION_MS)) {
            localStorage.setItem(submittedKey, 'true');
            const { adminService } = await import('../../admin/services/adminService');

            const savedQs = savedState.questions || [];
            const savedQStates = savedState.questionStates || {};
            const processedStates = {};

            savedQs.forEach(q => {
              const qs = savedQStates[q.id] || { attempts: 0, marks: 0, status: 'pending', history: [] };
              if (qs.status === 'pending') {
                processedStates[q.id] = { ...qs, status: 'auto_expired', marks: 0 };
              } else {
                processedStates[q.id] = { ...qs };
              }
            });

            const totalScore = Object.values(processedStates).reduce((sum, s) => sum + (s.marks || 0), 0);

            await adminService.submitLayer2ManualAttempt({
              userId,
              username: savedState.username || 'Participant',
              rollNumber: savedState.rollNumber || '',
              year: savedState.batchYear === '26' ? '1st Year' : '2nd Year',
              language: savedState.language || '',
              questionsPool: savedQs,
              questionStates: processedStates,
              automaticMarks: totalScore,
              status: 'completed'
            });

            localStorage.removeItem(`cma_l2_manual_state_${userId}`);
          }
        } catch (e) {}
      }, 5000);
    }
  }

  stopWatching() {
    if (this.l2GenaiTimerInterval) {
      clearInterval(this.l2GenaiTimerInterval);
      this.l2GenaiTimerInterval = null;
    }
    if (this.l2ManualTimerInterval) {
      clearInterval(this.l2ManualTimerInterval);
      this.l2ManualTimerInterval = null;
    }
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
        .select('user_id, name, roll_number, is_removed, promoted_to_layer2, promoted_to_layer3')
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
            name: data.name || stored.name,
            rollNumber: data.roll_number || stored.rollNumber,
            roll_number: data.roll_number || stored.roll_number,
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
