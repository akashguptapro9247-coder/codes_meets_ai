import React, { useState, useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import GenAIIntro from './components/GenAIIntro';
import GenAIInstructions from './components/GenAIInstructions';
import Layer2GenAIChallenge from './Layer2GenAIChallenge';
import { genaiService } from './services/genaiService';
import { eventStateService } from '../../shared/services/eventStateService';

export default function Layer2GenAIRoute({ participant, onBack, skipIntro = false }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [assignment, setAssignment] = useState(null);
  const [stage, setStage] = useState(skipIntro ? 'workspace' : 'intro'); // 'intro' | 'instructions' | 'workspace'
  const [hasStarted, setHasStarted] = useState(skipIntro);

  const handleBackToArena = () => {
    setStage('intro');
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

  useEffect(() => {
    const activeUserId = participant?.userId || participant?.user_id;
    if (!activeUserId) {
      setLoading(false);
      return;
    }
    
    let isMounted = true;
    const initializeAssignment = async () => {
      setLoading(true);
      
      // Fetch existing assignment if present
      const { data: existing, error: fetchErr } = await genaiService.fetchParticipantSubmission(activeUserId);
      
      if (!isMounted) return;

      if (fetchErr) {
        console.warn('Error fetching Layer 2 GenAI assignment:', fetchErr);
      }
      
      if (existing) {
        setAssignment(existing);
        // If already submitted or expired, jump directly to workspace
        if (existing.submitted || existing.status === 'time_expired') {
          setHasStarted(true);
          setStage('workspace');
        }
      }
      
      setLoading(false);
    };
    
    initializeAssignment();
    return () => {
      isMounted = false;
    };
  }, [participant]);

  const handleBeginChallenge = async () => {
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

  // 1. Loading State
  if (loading) {
    return (
      <div style={{ position: 'absolute', inset: 0, zIndex: 100, backgroundColor: '#030712', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', color: 'var(--cyan-glow)' }}>
        <Loader2 size={48} className="animate-spin" />
        <div style={{ fontFamily: 'var(--font-mono)' }}>INITIALIZING GEN AI PROTOCOL...</div>
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

  // 3. STAGE 4: Actual Workspace Page / Result Page
  if (stage === 'workspace' || hasStarted || assignment?.submitted || assignment?.status === 'time_expired') {
    return (
      <Layer2GenAIChallenge 
        participant={participant} 
        assignment={assignment} 
        onSubmissionComplete={handleSubmissionComplete}
        onBack={handleBackToArena}
      />
    );
  }

  // 4. STAGE 3: Detailed Instructions / Briefing Page
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

  // 5. STAGE 2: Compact Intro Page (Default)
  return (
    <GenAIIntro 
      participant={participant} 
      onBack={handleBackToArena} 
      onBegin={() => setStage('instructions')} 
    />
  );
}
