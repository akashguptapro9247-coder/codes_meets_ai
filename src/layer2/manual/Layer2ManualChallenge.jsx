import React, { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from '../../shared/components/Toast';
import { motion, AnimatePresence } from 'framer-motion';
import LanguageSelection from './components/LanguageSelection';
import Layer2Timer from './components/Layer2Timer';
import QuestionRenderer from './components/QuestionRenderer';
import { loadDataset, randomizeQuestions } from './data/DatasetLoader';
import { adminService } from '../../admin/services/adminService';
import { soundEngine } from '../../shared/utils/SoundEngine';
import { eventStateService } from '../../shared/services/eventStateService';
import { ArrowLeft, CheckCircle, AlertTriangle } from 'lucide-react';

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

  if (isCompleted) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#030712' }}>
        <CheckCircle size={64} color="var(--lime-accent)" style={{ marginBottom: '20px' }} />
        <h2 style={{ fontFamily: 'var(--font-title)', color: '#ffffff', fontSize: '2rem' }}>LAYER 2 COMPLETED</h2>
        <div style={{ fontSize: '1.2rem', color: 'var(--cyan-glow)', margin: '20px 0', fontFamily: 'var(--font-mono)' }}>
          TOTAL SCORE: {finalResult?.marks} / 25
        </div>
        <button className="cyber-btn" onClick={onBack} style={{ padding: '12px 24px' }}>
          RETURN TO ARENA
        </button>
      </div>
    );
  }

  if (!hasStarted) {
    return <LanguageSelection onSelect={handleStart} onBack={onBack} />;
  }

  const currentQuestion = questions && questions.length > 0 ? questions[currentIndex] : null;
  const currentState = currentQuestion && questionStates ? questionStates[currentQuestion.id] : null;

  if (hasStarted && (!currentQuestion || !currentState)) {
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
    <div style={{ width: '100%', height: '100vh', overflowY: 'auto', background: '#030712', display: 'flex', flexDirection: 'column', padding: '20px', boxSizing: 'border-box' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', background: 'rgba(2, 6, 18, 0.9)', padding: '12px 20px', border: '1px solid rgba(0, 243, 255, 0.2)', borderRadius: '6px' }}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div style={{ color: 'var(--cyan-glow)', fontFamily: 'var(--font-title)', fontSize: '1.2rem' }}>
            {language.toUpperCase()} | Q{currentIndex + 1}/5
          </div>
          <div style={{ color: '#9ca3af', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
            {participant?.name} • {rollNumber}
          </div>
        </div>
        <Layer2Timer startTime={startTime} onTimeUp={() => handleFinalize(questionStates)} />
      </div>

      {/* Main Workspace */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <QuestionRenderer
          question={currentQuestion}
          language={language}
          state={currentState}
          onUpdateState={(patch) => handleUpdateQuestionState(currentQuestion.id, patch)}
        />
      </div>

      {/* Bottom Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '20px' }}>
        <button
          className="cyber-btn"
          disabled={currentIndex === 0}
          onClick={() => { soundEngine.playClick(); setCurrentIndex(c => c - 1); }}
          style={{ padding: '10px 20px', opacity: currentIndex === 0 ? 0.3 : 1 }}
        >
          <ArrowLeft size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> PREVIOUS
        </button>

        <div style={{ display: 'flex', gap: '16px' }}>
          {currentIndex < questions.length - 1 ? (
            <button
              className="cyber-btn"
              onClick={() => { soundEngine.playClick(); setCurrentIndex(c => c + 1); }}
              style={{ padding: '10px 30px', borderColor: 'var(--cyan-glow)', color: 'var(--cyan-glow)' }}
            >
              NEXT QUESTION
            </button>
          ) : (
            <button
              className="cyber-btn"
              onClick={() => handleFinalize(questionStates)}
              disabled={isSubmitting}
              style={{ padding: '10px 30px', background: 'rgba(57, 255, 20, 0.15)', borderColor: 'var(--lime-accent)', color: 'var(--lime-accent)', fontWeight: 'bold' }}
            >
              {isSubmitting ? 'SUBMITTING...' : 'FINALIZE SUBMISSION'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
