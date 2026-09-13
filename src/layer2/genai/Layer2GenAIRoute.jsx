import React, { useState, useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import GenAIIntro from './components/GenAIIntro';
import GenAIInstructions from './components/GenAIInstructions';
import Layer2GenAIChallenge from './Layer2GenAIChallenge';
import { genaiService } from './services/genaiService';
import { eventStateService } from '../../shared/services/eventStateService';

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

  // Synchronous local storage lock check for instant protection against flashes
  const initialLock = (() => {
    if (!activeUserId || typeof window === 'undefined') return { isExpired: false, isSubmitted: false };
    try {
      const isExpired = localStorage.getItem(`cma_l2_genai_expired_${activeUserId}`) === 'true';
      const isSubmitted = localStorage.getItem(`cma_l2_genai_submitted_${activeUserId}`) === 'true';
      return { isExpired, isSubmitted };
    } catch (e) {
      return { isExpired: false, isSubmitted: false };
    }
  })();

  const isPreLocked = Boolean(initialLock.isExpired || initialLock.isSubmitted);

  const [loading, setLoading] = useState(true); // Always start true until status is verified
  const [error, setError] = useState(null);
  const [assignment, setAssignment] = useState(() => {
    if (isPreLocked) {
      return {
        user_id: activeUserId,
        status: initialLock.isSubmitted ? 'completed' : 'time_expired',
        submitted: initialLock.isSubmitted
      };
    }
    return null;
  });
  const [stage, setStage] = useState(isPreLocked || skipIntro ? 'workspace' : 'checking');
  const [hasStarted, setHasStarted] = useState(isPreLocked || skipIntro);

  const handleBackToArena = () => {
    if (onBack) onBack();
  };

  // Real-time lock listener on landing screen
  const prevLockStateRef = useRef(null);
  useEffect(() => {
    const unsubscribe = eventStateService.subscribeToEventState((state) => {
      const prev = prevLockStateRef.current;
      prevLockStateRef.current = state;
      if (!prev) return;
      const wasActive = prev.layer2?.active;
      const isNowActive = state.layer2?.active;
      if (wasActive && !isNowActive) {
        handleBackToArena();
      }
    });
    return () => unsubscribe();
  }, [onBack]);

  // Authoritative Status Verification
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

      const localExpired = typeof window !== 'undefined' && localStorage.getItem(`cma_l2_genai_expired_${userId}`) === 'true';
      const localSubmitted = typeof window !== 'undefined' && localStorage.getItem(`cma_l2_genai_submitted_${userId}`) === 'true';
      
      // Fetch existing assignment from database (source of truth)
      const { data: existing, error: fetchErr } = await genaiService.fetchParticipantSubmission(userId);
      
      if (!isMounted) return;

      if (fetchErr) {
        console.warn('[Layer2GenAIRoute] Error fetching Layer 2 GenAI assignment:', fetchErr);
      }
      
      if (existing) {
        setAssignment(existing);
        const isFinalSubmitted = Boolean(existing.submitted || existing.status === 'completed' || localSubmitted);
        const isFinalExpired = Boolean(existing.status === 'time_expired' || localExpired);

        // If already submitted or expired, lock round and route directly to result screen
        if (isFinalSubmitted || isFinalExpired) {
          setHasStarted(true);
          setStage('workspace');
        } else if (skipIntro || hasStarted) {
          setHasStarted(true);
          setStage('workspace');
        } else {
          // In progress or not started
          setStage('intro');
        }
      } else if (localExpired || localSubmitted) {
        // Fallback local lock
        const fallback = {
          user_id: userId,
          status: localSubmitted ? 'completed' : 'time_expired',
          submitted: localSubmitted
        };
        setAssignment(fallback);
        setHasStarted(true);
        setStage('workspace');
      } else {
        // Fresh participant -> Start at intro
        setStage('intro');
      }
      
      setLoading(false);
    };
    
    verifyStatusAndInit();
    return () => {
      isMounted = false;
    };
  }, [participant, skipIntro]);

  const handleBeginChallenge = async () => {
    const userId = resolveActiveUserId(participant);

    // Guard: Never create or restart if already submitted or expired
    if (assignment?.submitted || assignment?.status === 'completed' || assignment?.status === 'time_expired') {
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
