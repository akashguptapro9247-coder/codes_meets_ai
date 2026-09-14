import React, { useState, useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import GenAIIntro from './components/GenAIIntro';
import GenAIInstructions from './components/GenAIInstructions';
import Layer2GenAIChallenge from './Layer2GenAIChallenge';
import { genaiService } from './services/genaiService';
import { eventStateService } from '../../shared/services/eventStateService';
import { supabase, isSupabaseConfigured } from '../../shared/services/supabaseClient';

const resolveActiveUserId = (participant) => {
  if (participant?.userId || participant?.user_id) {
    return participant.userId || participant.user_id;
  }
  if (typeof window !== 'undefined') {
    try {
      const storedSession =
        sessionStorage.getItem('cma_participant_session') ||
        localStorage.getItem('cma_participant_session');
      if (storedSession) {
        const parsed = JSON.parse(storedSession);
        return parsed.userId || parsed.user_id || parsed.id;
      }
    } catch (e) {}
  }
  return null;
};

export default function Layer2GenAIRoute({ participant, onBack, skipIntro = false }) {
  const activeUserId = resolveActiveUserId(participant);

  const [loading, setLoading] = useState(true); // Always verify against DB first
  const [error, setError] = useState(null);
  const [assignment, setAssignment] = useState(null);
  const [stage, setStage] = useState('checking');
  const [hasStarted, setHasStarted] = useState(false);

  const handleBackToArena = () => {
    if (onBack) onBack();
  };

  // Real-time lock and track listener: only kick if admin CHANGES state from active -> inactive during live session
  const prevLockStateRef = useRef(null);
  useEffect(() => {
    const unsubscribe = eventStateService.subscribeToEventState((state) => {
      const prev = prevLockStateRef.current;
      prevLockStateRef.current = state;
      if (!prev) return; // Skip initial default/cached state call on mount
      const wasActive = prev.layer2?.active && prev.layer2?.activeTrack === 'gen-ai';
      const isNowActive = state.layer2?.active && state.layer2?.activeTrack === 'gen-ai';
      if (wasActive && !isNowActive) {
        handleBackToArena();
      }
    });
    return () => unsubscribe();
  }, [onBack]);

  // Clean up all local cache for a user when deleted
  const clearLocalGenAiCache = (userId) => {
    if (!userId || typeof window === 'undefined') return;
    try {
      localStorage.removeItem(`cma_l2_genai_submitted_${userId}`);
      sessionStorage.removeItem(`cma_l2_genai_submitted_${userId}`);
      localStorage.removeItem(`cma_l2_genai_expired_${userId}`);
      sessionStorage.removeItem(`cma_l2_genai_expired_${userId}`);
      localStorage.removeItem(`cma_l2_genai_prompt_${userId}`);
      sessionStorage.removeItem(`cma_l2_genai_prompt_${userId}`);
      localStorage.removeItem(`cma_l2_genai_folder_${userId}`);
      sessionStorage.removeItem(`cma_l2_genai_folder_${userId}`);
      localStorage.removeItem(`cma_l2_genai_assigned_at_${userId}`);
      sessionStorage.removeItem(`cma_l2_genai_assigned_at_${userId}`);
    } catch (e) {}
  };

  // Authoritative Status Verification against Database
  useEffect(() => {
    const userId = resolveActiveUserId(participant);
    if (!userId) {
      setLoading(false);
      setStage('intro');
      return;
    }
    
    let isMounted = true;
    const verifyStatusAndInit = async () => {
      setLoading(true);

      // Fetch existing assignment directly from database (sole authoritative source of truth)
      const { data: existing, error: fetchErr } = await genaiService.fetchParticipantSubmission(userId);
      
      if (!isMounted) return;

      if (fetchErr) {
        console.warn('[Layer2GenAIRoute] Error fetching Layer 2 GenAI assignment:', fetchErr);
      }
      
      if (existing) {
        // Authoritative checks from database record
        const isSubmittedInDb = Boolean(existing.submitted || existing.status === 'completed' || existing.status === 'reviewed');
        const isExpiredInDb = Boolean(existing.status === 'time_expired');

        // Check authoritative 30-minute deadline
        const ROUND_DURATION_MS = 30 * 60 * 1000; // 30 minutes
        const assignedTime = existing.assigned_at ? new Date(existing.assigned_at).getTime() : NaN;
        const isPastDeadline = !isNaN(assignedTime) && (Date.now() - assignedTime >= ROUND_DURATION_MS);

        let isFinalSubmitted = isSubmittedInDb;
        let isFinalExpired = isExpiredInDb;

        // If time expired while participant was outside GenAI: auto-finalize with saved draft prompt
        if (isPastDeadline && !isFinalSubmitted && !isFinalExpired) {
          const draftKey = `cma_l2_genai_prompt_${userId}`;
          const draftPrompt = typeof window !== 'undefined' ? localStorage.getItem(draftKey) : '';
          await genaiService.recordTimeout(userId, draftPrompt);
          existing.status = draftPrompt ? 'completed' : 'time_expired';
          existing.submitted = Boolean(draftPrompt);
          existing.explanation = draftPrompt || existing.explanation;
          isFinalSubmitted = Boolean(draftPrompt);
          isFinalExpired = !draftPrompt;
        }

        setAssignment(existing);

        // If already submitted or expired, lock round and route directly to result screen
        if (isFinalSubmitted || isFinalExpired) {
          if (isFinalSubmitted) {
            try {
              localStorage.setItem(`cma_l2_genai_submitted_${userId}`, 'true');
              localStorage.removeItem(`cma_l2_genai_expired_${userId}`);
            } catch (e) {}
          } else {
            try {
              localStorage.setItem(`cma_l2_genai_expired_${userId}`, 'true');
              localStorage.removeItem(`cma_l2_genai_submitted_${userId}`);
            } catch (e) {}
          }
          setHasStarted(true);
          setStage('workspace');
        } else if (skipIntro || hasStarted || existing.status === 'in_progress') {
          // Ongoing attempt (resuming after refresh or mode switch) -> jump straight to active workspace
          setHasStarted(true);
          setStage('workspace');
        } else {
          // Fresh participant -> Start at intro
          setStage('intro');
        }
      } else {
        // DATABASE HAS NO ACTIVE SUBMISSION (First-time OR Admin deleted the submission)
        // Completely invalidate and purge any stale client-side cache
        clearLocalGenAiCache(userId);

        setAssignment(null);
        setHasStarted(false);
        setStage('intro');
      }
      
      setLoading(false);
    };
    
    verifyStatusAndInit();
    return () => {
      isMounted = false;
    };
  }, [participant, skipIntro]);

  // Real-time listener: if Admin deletes submission, immediately reset to fresh intro/workspace
  useEffect(() => {
    const userId = resolveActiveUserId(participant);
    if (!userId || !isSupabaseConfigured() || !supabase) return;

    const handleDeleted = () => {
      clearLocalGenAiCache(userId);
      setAssignment(null);
      setHasStarted(false);
      setStage('intro');
    };

    const channelName = `l2_genai_route_sub_${userId}_${Date.now()}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'layer_2_genai_submissions',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            handleDeleted();
          } else if (payload.new) {
            setAssignment(prev => ({
              ...prev,
              ...payload.new
            }));
          }
        }
      )
      .subscribe();

    // 2-second polling fallback to catch Admin deletion across any connection drops
    const pollInterval = setInterval(async () => {
      try {
        const { data } = await supabase
          .from('layer_2_genai_submissions')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();

        if (!data) {
          setAssignment(prev => {
            if (prev) {
              handleDeleted();
              return null;
            }
            return prev;
          });
        }
      } catch (e) {}
    }, 2000);

    return () => {
      try {
        supabase.removeChannel(channel);
      } catch (e) {}
      clearInterval(pollInterval);
    };
  }, [participant]);

  const handleBeginChallenge = async () => {
    const userId = resolveActiveUserId(participant);

    // Guard: Never create or restart if already submitted or expired
    if (assignment?.submitted || assignment?.status === 'completed' || assignment?.status === 'reviewed' || assignment?.status === 'time_expired') {
      setHasStarted(true);
      setStage('workspace');
      return;
    }

    if (assignment) {
      setHasStarted(true);
      setStage('workspace');
      return;
    }
    
    setLoading(true);
    const { data, error: assignErr } = await genaiService.assignRandomQuestion(participant);
    
    if (assignErr) {
      console.warn('Error assigning random question, using default fallback:', assignErr);
      const allQs = genaiService.getAllQuestions();
      const fallback = {
        question_id: allQs[0]?.id || 'l2_genai_1',
        status: 'in_progress',
        assigned_at: new Date().toISOString()
      };
      setAssignment(fallback);
    } else {
      setAssignment(data);
    }
    
    setHasStarted(true);
    setStage('workspace');
    setLoading(false);
  };

  const handleSubmissionComplete = (updatedAssignment) => {
    if (!updatedAssignment) {
      const userId = resolveActiveUserId(participant);
      clearLocalGenAiCache(userId);
      setAssignment(null);
      setHasStarted(false);
      setStage('intro');
      return;
    }
    setAssignment(updatedAssignment);
  };

  // 1. Loading State (Prevents UI/Video flash before status is known)
  if (loading) {
    return (
      <div style={{ position: 'absolute', inset: 0, zIndex: 100, backgroundColor: '#030712', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', color: 'var(--cyan-glow)' }}>
        <Loader2 size={48} className="animate-spin" />
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', letterSpacing: '0.14em' }}>VERIFYING LAYER 02 STATUS...</div>
      </div>
    );
  }

  // 2. Error State
  if (error) {
    return (
      <div style={{ position: 'absolute', inset: 0, zIndex: 100, backgroundColor: '#030712', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#ef4444', padding: '20px', textAlign: 'center' }}>
        <h2>Initialization Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  // 3. FINALIZED / ACTIVE WORKSPACE (Page 3 Challenge or Result Screen)
  if (stage === 'workspace' || hasStarted || assignment?.submitted || assignment?.status === 'completed' || assignment?.status === 'time_expired') {
    return (
      <Layer2GenAIChallenge 
        participant={participant} 
        assignment={assignment} 
        onSubmissionComplete={handleSubmissionComplete}
        onBack={handleBackToArena}
      />
    );
  }

  // 4. INSTRUCTIONS / BRIEFING STAGE (Page 2 Thor Briefing)
  if (stage === 'instructions') {
    return (
      <div style={{ position: 'absolute', inset: 0, zIndex: 100, backgroundColor: '#030712', overflowY: 'auto' }}>
        <GenAIInstructions 
          participant={participant}
          onBack={handleBackToArena}
          onBegin={handleBeginChallenge} 
        />
      </div>
    );
  }

  // 5. INTRO STAGE (Page 1)
  return (
    <GenAIIntro 
      participant={participant} 
      onBack={handleBackToArena} 
      onBegin={() => setStage('instructions')} 
    />
  );
}
