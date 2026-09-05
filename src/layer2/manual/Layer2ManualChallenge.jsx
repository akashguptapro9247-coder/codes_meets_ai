import React, { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from '../../shared/components/Toast';
import { motion, AnimatePresence } from 'framer-motion';
import LanguageSelection from './components/LanguageSelection';
import Layer2Timer from './components/Layer2Timer';
import QuestionRenderer from './components/QuestionRenderer';
import Layer2ManualResultsScreen from './components/Layer2ManualResultsScreen';
import { loadDataset, randomizeQuestions } from './data/DatasetLoader';
import { adminService } from '../../admin/services/adminService';
import { soundEngine } from '../../shared/utils/SoundEngine';
import { eventStateService } from '../../shared/services/eventStateService';
import { ArrowLeft, CheckCircle, AlertTriangle, Terminal, Shield } from 'lucide-react';

export default function Layer2ManualChallenge({ participant, onBack }) {
  const userId = participant?.userId || participant?.user_id;
  const rollNumber = participant?.rollNumber || participant?.roll_number;
  
  // Real-time lock listener — only act if admin CHANGES state from active → inactive
  const prevLockStateRef = useRef(null);
  useEffect(() => {
    const unsubscribe = eventStateService.subscribeToEventState((state) => {
      const prev = prevLockStateRef.current;
      prevLockStateRef.current = state;
      // Skip the very first call (initial cached state) — nothing to compare against
      if (!prev) return;
      const wasActive = prev.layer2?.active && prev.layer2?.activeTrack === 'manual';
      const isNowActive = state.layer2?.active && state.layer2?.activeTrack === 'manual';
      if (wasActive && !isNowActive) {
        console.error('[CMA DEBUG] Layer2ManualChallenge lock: onBack called. prev=', prev, 'cur=', state);
        if (onBack) onBack();
      }
    });
    return () => unsubscribe();
  }, [onBack]);

  const stateStorageKey = `cma_l2_manual_state_${userId || 'guest'}`;

  // State
  const [hasStarted, setHasStarted] = useState(false);
  const [language, setLanguage] = useState(null);
  const [batchYear, setBatchYear] = useState(() => (rollNumber && String(rollNumber).startsWith('25') ? '25' : '26'));
  const isFirstYear = batchYear === '26';
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [questionStates, setQuestionStates] = useState({});
  const [startTime, setStartTime] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [finalResult, setFinalResult] = useState(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initial Load from LocalStorage or Supabase
  useEffect(() => {
    const checkExistingAttempt = async () => {
      if (!userId) { setIsLoading(false); return; }
      
      try {
        // First check DB
        const { data } = await adminService.fetchLayer2ManualAttemptForUser(userId);
        if (data) {
          if (data.status === 'completed') {
            setIsCompleted(true);
            setFinalResult({ marks: data.final_marks });
            setIsLoading(false);
            return;
          } else {
            // Restore from DB if available and in_progress (fallback)
            // But we primarily rely on localStorage for high-frequency state
          }
        }
        
        // Check localStorage
        const saved = localStorage.getItem(stateStorageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.hasStarted) {
            setHasStarted(parsed.hasStarted);
            setLanguage(parsed.language);
            setQuestions(parsed.questions || []);
            setCurrentIndex(parsed.currentIndex || 0);
            setQuestionStates(parsed.questionStates || {});
            setStartTime(parsed.startTime);
          }
        }
      } catch (err) {
        console.warn('Error loading Layer 2 state:', err);
      } finally {
        setIsLoading(false);
      }
    };
    checkExistingAttempt();
  }, [userId, stateStorageKey]);

  // Persist State continuously
  useEffect(() => {
    if (isLoading || isCompleted || !hasStarted) return;
    
    try {
      const stateToSave = {
        hasStarted, language, batchYear, questions, currentIndex, questionStates, startTime
      };
      localStorage.setItem(stateStorageKey, JSON.stringify(stateToSave));
    } catch (e) {
      console.warn('Failed to save state:', e);
    }
  }, [hasStarted, language, batchYear, questions, currentIndex, questionStates, startTime, isLoading, isCompleted, stateStorageKey]);

  // Start initialization after language selection
  const handleStart = async (selectedLang) => {
    setIsLoading(true);
    setLanguage(selectedLang);
    
    try {
      const dataset = await loadDataset(selectedLang, batchYear);
      const selectedQuestions = randomizeQuestions(dataset);

      if (!selectedQuestions || selectedQuestions.length === 0) {
        toast.error(`Failed to load questions for ${selectedLang}. Please try again.`);
        setIsLoading(false);
        return;
      }
      
      const initStates = {};
      selectedQuestions.forEach(q => {
        initStates[q.id] = {
          attempts: 0,
          marks: 0,
          status: 'pending', // 'pending' | 'correct' | 'exhausted' | 'skipped'
          history: [] // array of { attempt, code, result, timestamp }
        };
      });

      setQuestions(selectedQuestions);
      setQuestionStates(initStates);
      setCurrentIndex(0);
      setStartTime(Date.now());
      setHasStarted(true);
      setIsLoading(false);

      // Create Initial DB record in background (non-blocking)
      adminService.submitLayer2ManualAttempt({
        userId,
        username: participant?.name || 'Participant',
        rollNumber,
        year: batchYear === '26' ? '1st Year' : '2nd Year',
        language: selectedLang,
        questionsPool: selectedQuestions,
        questionStates: initStates,
        automaticMarks: 0,
        status: 'in_progress'
      }).catch(err => console.warn('Background DB sync notice:', err));

    } catch (err) {
      console.error('Failed to initialize dataset:', err);
      toast.error('Failed to load the dataset. Please try again or contact an admin.');
      setIsLoading(false);
    }
  };

  const handleUpdateQuestionState = (questionId, newStatePatch) => {
    setQuestionStates(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        ...newStatePatch
      }
    }));
  };

  const calculateTotalMarks = (states) => {
    return Object.values(states).reduce((total, qs) => total + (qs.marks || 0), 0);
  };

  // Finalize Submission
  const handleFinalize = useCallback(async (forcedStates = null) => {
    if (isCompleted || isSubmitting) return;
    setIsSubmitting(true);
    
    const finalStates = forcedStates || questionStates;
    
    // Auto-skip any pending questions
    const processedStates = { ...finalStates };
    questions.forEach(q => {
      if (processedStates[q.id] && processedStates[q.id].status === 'pending') {
        processedStates[q.id].status = 'skipped';
        processedStates[q.id].marks = 1;
      }
    });
    
    setQuestionStates(processedStates);
    const totalScore = calculateTotalMarks(processedStates);

    try {
      await adminService.submitLayer2ManualAttempt({
        userId,
        username: participant?.name || 'Participant',
        rollNumber,
        year: batchYear === '26' ? '1st Year' : '2nd Year',
        language,
        questionsPool: questions,
        questionStates: processedStates,
        automaticMarks: totalScore,
        status: 'completed'
      });

      setFinalResult({ marks: totalScore });
      setIsCompleted(true);
      
      try {
        localStorage.removeItem(stateStorageKey);
      } catch (e) {}

      soundEngine.playBoot();
    } catch (err) {
      console.error('Failed to submit final Layer 2 state:', err);
      setIsSubmitting(false);
      toast.error('Failed to submit attempt. Please check connection and try again.');
    }
  }, [isCompleted, isSubmitting, questionStates, questions, userId, participant, rollNumber, batchYear, language, stateStorageKey]);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--cyan-glow)' }}>
        INITIALIZING DATASET...
      </div>
    );
  }

  if (!hasStarted && !isCompleted) {
    return <LanguageSelection onSelect={handleStart} onBack={onBack} participant={participant} batchYear={batchYear} />;
  }

  const currentQuestion = questions && questions.length > 0 ? questions[currentIndex] : null;
  const currentState = currentQuestion && questionStates ? questionStates[currentQuestion.id] : null;

  if (hasStarted && !isCompleted && (!currentQuestion || !currentState)) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#030712', color: 'var(--cyan-glow)' }}>
        <div style={{ fontFamily: 'var(--font-mono)', marginBottom: '16px' }}>INITIALIZING QUESTION WORKSPACE...</div>
        <button
          className="cyber-btn"
          style={{ padding: '8px 20px', fontSize: '0.85rem' }}
          onClick={() => {
            try { localStorage.removeItem(stateStorageKey); } catch (e) {}
            setHasStarted(false);
          }}
        >
          RESET & SELECT LANGUAGE
        </button>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed', inset: 0,
      width: '100vw', height: '100vh',
      zIndex: 80, backgroundColor: '#020612',
      overflow: 'hidden', display: 'flex',
      alignItems: 'center', justifyContent: 'center'
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -15 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="cyber-card"
        style={{
          position: 'relative',
          width: 'calc(100vw - 8vw)',
          height: 'calc(100vh - 4vh)',
          maxWidth: '1440px',
          background: 'rgba(4, 9, 24, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(0, 243, 255, 0.35)',
          boxShadow: '0 25px 75px rgba(0,0,0,0.95), 0 0 45px rgba(0,243,255,0.2), inset 0 0 25px rgba(0,243,255,0.06)',
          borderRadius: '4px',
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxSizing: 'border-box',
          zIndex: 20
        }}
      >
        {/* HUD Corner Brackets */}
        <div className="hud-corner hud-top-left"    style={{ width: '16px', height: '16px', zIndex: 25 }} />
        <div className="hud-corner hud-top-right"   style={{ width: '16px', height: '16px', zIndex: 25 }} />
        <div className="hud-corner hud-bottom-left" style={{ width: '16px', height: '16px', zIndex: 25 }} />
        <div className="hud-corner hud-bottom-right"style={{ width: '16px', height: '16px', zIndex: 25 }} />

        {/* HEADER */}
        <header style={{
          flexShrink: 0, height: '40px', padding: '0 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: '1px solid rgba(0, 243, 255, 0.25)',
          background: 'linear-gradient(90deg, rgba(2,6,20,0.95) 0%, rgba(5,14,38,0.95) 100%)',
          boxSizing: 'border-box', zIndex: 10
        }}>
          {/* Left: Icon + Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '30px', height: '30px', borderRadius: '4px',
              background: 'rgba(0,243,255,0.15)', border: '1px solid var(--cyan-glow)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--cyan-glow)'
            }}>
              <Terminal size={17} />
            </div>
            <span style={{
              fontFamily: 'var(--font-title)', fontSize: '0.92rem', fontWeight: 900,
              letterSpacing: '0.12em', color: '#ffffff'
            }}>
              LAYER 02 // MANUAL CODING CHALLENGE
            </span>
          </div>
          {/* Right: Year Badge + Operator Box */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className="cyber-badge" style={{
              fontSize: '0.64rem', padding: '2px 8px',
              background: isFirstYear ? 'rgba(0,243,255,0.15)' : 'rgba(224,38,255,0.15)',
              borderColor: isFirstYear ? 'var(--cyan-glow)' : 'var(--magenta-glow)',
              color: isFirstYear ? 'var(--cyan-glow)' : 'var(--magenta-glow)'
            }}>
              {isFirstYear ? '1ST YEAR ASSESSMENT' : '2ND YEAR ASSESSMENT'}
            </span>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '5px 10px',
              background: 'rgba(0,243,255,0.06)',
              border: '1px solid rgba(0,243,255,0.25)',
              borderRadius: '2px'
            }}>
              <Shield size={13} color="var(--lime-accent)" />
              <span style={{ fontSize: '0.74rem', color: '#9ca3af', fontFamily: 'var(--font-mono)' }}>OPERATOR:</span>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
                {(participant?.name || 'PARTICIPANT').toUpperCase()}
              </span>
              <span style={{ color: 'rgba(0,243,255,0.4)' }}>|</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--cyan-glow)', fontFamily: 'var(--font-mono)' }}>
                ROLL: {rollNumber || '23-XXX'}
              </span>
            </div>
          </div>
        </header>

        {isCompleted ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', boxSizing: 'border-box' }}>
            <Layer2ManualResultsScreen
              participant={participant}
              finalResult={finalResult}
              onBackToArena={onBack}
            />
          </div>
        ) : (
          <>
            {/* QUESTION PROGRESS BAR */}
            <div style={{
              flexShrink: 0, padding: '4px 24px',
              borderBottom: '1px solid rgba(0,243,255,0.1)',
              background: 'rgba(2,6,20,0.7)',
              display: 'flex', flexDirection: 'column', gap: '4px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <span style={{ fontFamily: 'var(--font-title)', fontSize: '0.8rem', color: 'var(--cyan-glow)', letterSpacing: '0.15em' }}>
                    QUESTION {String(currentIndex + 1).padStart(2, '0')} / {String(questions.length).padStart(2, '0')}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#4b5563', letterSpacing: '0.05em' }}>
                    {language?.toUpperCase()} TRACK
                  </span>
                </div>
                
                {/* Visual Progress Dots + Timer */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  {/* Visual Progress Dots */}
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    {questions.map((q, i) => {
                      const status = questionStates[q.id]?.status || 'pending';
                      const isCurrent = i === currentIndex;
                      let color = 'rgba(255, 255, 255, 0.15)'; // pending
                      if (status === 'correct') color = 'var(--lime-accent)'; // GREEN
                      else if (status === 'skipped') color = '#3b82f6'; // BLUE
                      else if (status === 'exhausted') color = '#ef4444'; // RED (failed)
                      else if (isCurrent) color = 'var(--cyan-glow)'; // ACTIVE

                      return (
                        <div
                          key={q.id}
                          style={{
                            width: isCurrent ? '12px' : '8px',
                            height: isCurrent ? '12px' : '8px',
                            borderRadius: '50%',
                            background: color,
                            boxShadow: isCurrent ? '0 0 10px var(--cyan-glow)' : 'none',
                            transition: 'all 0.25s ease'
                          }}
                          title={`Stage ${i + 1} - ${status.toUpperCase()}`}
                        />
                      );
                    })}
                  </div>
                  
                  <Layer2Timer startTime={startTime} onTimeUp={() => handleFinalize(questionStates)} />
                </div>
              </div>

              {/* Horizontal Progress Meter (Segmented for 5 stages) */}
              <div style={{ display: 'flex', gap: '4px', width: '100%', height: '3px', borderRadius: '2px', overflow: 'hidden' }}>
                {questions.map((q, i) => {
                  const status = questionStates[q.id]?.status || 'pending';
                  const isCurrent = i === currentIndex;
                  let bgColor = 'rgba(255, 255, 255, 0.08)'; // pending
                  if (status === 'correct') bgColor = 'var(--lime-accent)';
                  else if (status === 'skipped') bgColor = '#3b82f6';
                  else if (status === 'exhausted') bgColor = '#ef4444';
                  else if (isCurrent) bgColor = 'var(--cyan-glow)';
                  
                  return (
                    <div key={q.id} style={{ flex: 1, background: bgColor, transition: 'background 0.4s ease' }} />
                  );
                })}
              </div>
            </div>

            {/* MAIN WORKSPACE */}
            <div style={{ flex: 1, overflow: 'hidden', minHeight: 0, padding: '4px 16px', display: 'flex', flexDirection: 'column' }}>
              <QuestionRenderer
                question={currentQuestion}
                language={language}
                state={currentState}
                onUpdateState={(patch) => handleUpdateQuestionState(currentQuestion.id, patch)}
              />
            </div>

            {/* NAVIGATION FOOTER */}
            <div style={{
              flexShrink: 0, padding: '6px 24px',
              borderTop: '1px solid rgba(0,243,255,0.15)',
              background: 'rgba(2,6,20,0.85)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <button
                className="cyber-btn"
                disabled={currentIndex === 0}
                onClick={() => { soundEngine.playClick(); setCurrentIndex(c => c - 1); }}
                style={{ padding: '10px 20px', opacity: currentIndex === 0 ? 0.3 : 1, display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <ArrowLeft size={15} /> PREVIOUS
              </button>
              <div style={{ display: 'flex', gap: '16px' }}>
                {currentIndex < questions.length - 1 ? (
                  <button
                    className="cyber-btn"
                    onClick={() => { soundEngine.playClick(); setCurrentIndex(c => c + 1); }}
                    style={{ padding: '10px 30px', borderColor: 'var(--cyan-glow)', color: 'var(--cyan-glow)', background: 'rgba(0,243,255,0.05)' }}
                  >
                    NEXT QUESTION →
                  </button>
                ) : (
                  <button
                    className="cyber-btn"
                    onClick={() => handleFinalize(questionStates)}
                    disabled={isSubmitting}
                    style={{ padding: '10px 30px', background: 'rgba(57,255,20,0.15)', borderColor: 'var(--lime-accent)', color: 'var(--lime-accent)', fontWeight: 'bold' }}
                  >
                    {isSubmitting ? 'SUBMITTING...' : 'FINALIZE SUBMISSION'}
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
