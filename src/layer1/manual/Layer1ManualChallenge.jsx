import React, { useState, useEffect, useRef, useCallback } from 'react';
import { flushSync } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ManualHeader from './ManualHeader';
import QuestionCard from './QuestionCard';
import ManualTimer from './ManualTimer';
import ManualControls from './ManualControls';
import OptionSelector from './OptionSelector';
import ManualResultsScreen from './ManualResultsScreen';
import InvalidRollNumberScreen from './InvalidRollNumberScreen';
import DigitalParticles from '../../shared/components/DigitalParticles';
import ScanOverlay from '../../shared/components/ScanOverlay';
import { SpiderManAnimation } from '../../animation/SpiderMan/SpiderManAnimation';
import { WebShot } from '../../animation/SpiderMan/WebShot';
import {
  validateRollNumber,
  generateRandomQuestionSet,
  evaluateManualAnswers
} from '../questions/layer1ManualQuestions';
import { adminService } from '../../admin/services/adminService';
import { eventStateService } from '../../shared/services/eventStateService';
import { soundEngine } from '../../shared/utils/SoundEngine';

// feedbackState machine:
// 'idle'       → student can select an option
// 'processing' → NEXT clicked, 2s delay (locked, no reveal yet)
// 'revealed'   → 2s feedback shown (correct=green, wrong=red + correct=green)
// auto-advance after revealed completes

export default function Layer1ManualChallenge({
  participant,
  onBack
}) {
  const userId = participant?.userId || participant?.user_id;
  const rollNumber = participant?.rollNumber || participant?.roll_number;

  // Real-time lock listener: if admin locks Layer 1 or deactivates Manual track, exit immediately to Play Page
  useEffect(() => {
    const unsubscribe = eventStateService.subscribeToEventState((state) => {
      if (!state.layer1?.active || state.layer1?.activeTrack !== 'manual') {
        if (onBack) onBack();
      }
    });
    return () => unsubscribe();
  }, [onBack]);

  // 1. Validate Roll Number and detect 1st / 2nd Year Batch
  const validation = validateRollNumber(rollNumber);

  // Storage key for state persistence across browser reload
  const stateStorageKey = `cma_l1_manual_state_${userId || 'guest'}`;

  // 2. Initialize or restore attempt state
  const [questions, setQuestions] = useState(() => {
    if (!validation.valid) return [];
    try {
      const saved = localStorage.getItem(stateStorageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.questions && parsed.questions.length === 15) {
          return parsed.questions;
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved questions state:', e);
    }
    return generateRandomQuestionSet(validation.batch);
  });

  const [currentIndex, setCurrentIndex] = useState(() => {
    try {
      const saved = localStorage.getItem(stateStorageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        return typeof parsed.currentIndex === 'number' ? parsed.currentIndex : 0;
      }
    } catch (e) {}
    return 0;
  });

  const [selectedAnswers, setSelectedAnswers] = useState(() => {
    try {
      const saved = localStorage.getItem(stateStorageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.selectedAnswers || {};
      }
    } catch (e) {}
    return {};
  });

  const [currentSelectedOption, setCurrentSelectedOption] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [isCheckingSupabase, setIsCheckingSupabase] = useState(true);

  // Feedback phase state machine
  // 'idle' | 'processing' | 'revealed'
  const [feedbackState, setFeedbackState] = useState('idle');
  const feedbackTimers = useRef([]);

  // ==========================================
  // SPIDER-MAN TEMPORARY INTEGRATION STATE
  // ==========================================
  const [spiderState, setSpiderState] = useState('IDLE');
  const [spiderTarget, setSpiderTarget] = useState(null);
  const handPosRef = useRef(null);
  const [webStartPoint, setWebStartPoint] = useState(null);
  const spiderTimerRef = useRef(null);
  // Ref to the Spider-Man container div — allows imperative opacity reveal
  // without triggering a React re-render during the warm-up transition.
  const spiderContainerRef = useRef(null);

  // Warm-up phase: keep Spider-Man hidden (opacity: 0) for 500ms to allow
  // WebGL shader and shadow-map compilation to complete on invisible frames.
  // After 500ms, imperatively reveal the container then start ENTRANCE so
  // the user only ever sees Spider-Man starting from above the viewport.
  useEffect(() => {
    if (!validation.valid || isCompleted) return;

    let raf1, raf2;

    const warmup = setTimeout(() => {
      flushSync(() => {
        setSpiderState('ENTRANCE');
      });

      raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => {
          if (spiderContainerRef.current) {
            spiderContainerRef.current.style.opacity = '1';
          }
        });
      });
    }, 500);

    const toIdle = setTimeout(() => setSpiderState('IDLE'), 500 + 1600);

    return () => {
      clearTimeout(warmup);
      clearTimeout(toIdle);
      if (raf1) cancelAnimationFrame(raf1);
      if (raf2) cancelAnimationFrame(raf2);
    };
  }, [validation.valid, isCompleted]);

  // Clean up Spider-Man timers
  useEffect(() => {
    return () => {
      if (spiderTimerRef.current) clearTimeout(spiderTimerRef.current);
    };
  }, []);

  // Handle option selection with targeting coordinates
  const handleOptionSelect = (key, rect) => {
    setCurrentSelectedOption(key);
    
    // Trigger Spider-Man shooting animation
    if (rect) {
      // Target the center of the clicked option
      setSpiderTarget({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      });
      setWebStartPoint(handPosRef.current);
      setSpiderState('SHOOTING');
      
      if (spiderTimerRef.current) clearTimeout(spiderTimerRef.current);
      
      // Exact timing from finalized demo: 400ms shoot -> IMPACT -> 600ms -> IDLE
      spiderTimerRef.current = setTimeout(() => {
        setSpiderState('IMPACT');
        spiderTimerRef.current = setTimeout(() => {
          setSpiderState('IDLE');
        }, 600);
      }, 400);
    }
  };

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      feedbackTimers.current.forEach(clearTimeout);
    };
  }, []);

  // Check if Supabase already has a completed attempt on mount
  useEffect(() => {
    if (!userId || !validation.valid) {
      setIsCheckingSupabase(false);
      return;
    }

    adminService.fetchLayer1ManualAttemptForUser(userId).then(({ data }) => {
      if (data && data.status === 'completed') {
        setIsCompleted(true);
        setEvaluationResult({
          score: data.score,
          correctCount: data.correct_count,
          totalQuestions: data.total_questions || 15
        });
      }
      setIsCheckingSupabase(false);
    });
  }, [userId, validation.valid]);

  // Persist ongoing state to localStorage on changes
  useEffect(() => {
    if (!validation.valid || isCompleted || questions.length === 0) return;

    try {
      const stateToSave = {
        questions,
        currentIndex,
        selectedAnswers,
        isCompleted: false,
        batch: validation.batch
      };
      localStorage.setItem(stateStorageKey, JSON.stringify(stateToSave));
    } catch (e) {
      console.warn('Failed to persist manual attempt state:', e);
    }
  }, [questions, currentIndex, selectedAnswers, validation.valid, isCompleted]);

  // Load option for current question if previously selected
  useEffect(() => {
    const currentQ = questions[currentIndex];
    if (currentQ && selectedAnswers[currentQ.id]) {
      setCurrentSelectedOption(selectedAnswers[currentQ.id]);
    } else {
      setCurrentSelectedOption(null);
    }
  }, [currentIndex, questions, selectedAnswers]);

  // Handle final submission to Supabase and calculation
  const handleFinalizeAttempt = async (finalAnswersMap) => {
    setIsSubmitting(true);
    const answersToEvaluate = finalAnswersMap || selectedAnswers;

    const evaluation = evaluateManualAnswers(questions, answersToEvaluate);
    setEvaluationResult(evaluation);

    try {
      await adminService.submitLayer1ManualAttempt({
        userId,
        username: participant?.name || 'Participant',
        rollNumber: rollNumber || '',
        year: validation.yearName,
        batch: validation.batch,
        questionsPool: questions,
        selectedAnswers: answersToEvaluate,
        score: evaluation.score,
        correctCount: evaluation.correctCount
      });

      setIsCompleted(true);
      soundEngine.playBoot();

      // Clear localStorage cache for clean slate
      try {
        localStorage.removeItem(stateStorageKey);
        localStorage.removeItem(`cma_l1_manual_timer_start_${userId}`);
      } catch (e) {}
    } catch (err) {
      console.error('Failed to submit manual attempt to Supabase:', err);
      // Still show completed results on screen
      setIsCompleted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Advance to next question (or finalize on last question)
  const advanceQuestion = (updatedAnswers) => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setCurrentSelectedOption(null);
      setFeedbackState('idle');
    } else {
      // Last question — finalize
      setFeedbackState('idle');
      handleFinalizeAttempt(updatedAnswers);
    }
  };

  // NEXT button handler — triggers the 2s wait → 2s reveal → auto-advance flow
  const handleNextQuestion = () => {
    const currentQ = questions[currentIndex];
    if (!currentQ || !currentSelectedOption || feedbackState !== 'idle') return;

    // Lock the answer immediately
    const updatedAnswers = {
      ...selectedAnswers,
      [currentQ.id]: currentSelectedOption
    };
    setSelectedAnswers(updatedAnswers);

    // Phase 1: processing — lock all inputs, no feedback yet (2 seconds)
    setFeedbackState('processing');

    // Clear any stale timers
    feedbackTimers.current.forEach(clearTimeout);

    const t1 = setTimeout(() => {
      // Phase 2: revealed — show correct/wrong feedback (2 seconds)
      setFeedbackState('revealed');

      const t2 = setTimeout(() => {
        // Phase 3: auto-advance to next question
        advanceQuestion(updatedAnswers);
      }, 2000);

      feedbackTimers.current = [t2];
    }, 2000);

    feedbackTimers.current = [t1];
  };

  // Timer expired callback: immediately locks and submits current state
  const handleTimeUp = useCallback(() => {
    if (isCompleted) return;

    // Cancel any pending feedback timers
    feedbackTimers.current.forEach(clearTimeout);
    setFeedbackState('idle');

    soundEngine.playClick();
    const currentQ = questions[currentIndex];
    const updatedAnswers = { ...selectedAnswers };
    if (currentQ && currentSelectedOption) {
      updatedAnswers[currentQ.id] = currentSelectedOption;
    }

    handleFinalizeAttempt(updatedAnswers);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCompleted, questions, currentIndex, selectedAnswers, currentSelectedOption]);

  // If roll number is invalid, render the validation error screen
  if (!validation.valid) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 80,
          backgroundColor: '#020612',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <DigitalParticles />
        <ScanOverlay currentStage={1} />
        <InvalidRollNumberScreen
          rollNumber={rollNumber}
          errorMessage={validation.error}
          onBack={onBack}
        />
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 80,
        backgroundColor: '#020612',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none'
      }}
    >
      {/* 2D Digital Particles Ambient Background */}
      <DigitalParticles />

      {/* CRT Scanline & HUD Telemetry Overlay */}
      <ScanOverlay currentStage={1} />

      {/* ==========================================
          SPIDER-MAN TEMPORARY INTEGRATION 
          Mounted exactly between ScanOverlay and cyber-card.
          Initially opacity: 0 — revealed imperatively after warm-up.
          ========================================== */}
      {!isCompleted && validation.valid && (
        <div
          ref={spiderContainerRef}
          style={{ position: 'absolute', inset: 0, zIndex: 30, pointerEvents: 'none', opacity: 0 }}
        >
          <SpiderManAnimation 
            state={spiderState} 
            targetPoint={spiderTarget}
            onHandPosChange={(pos) => {
              handPosRef.current = pos;
            }}
          />
          <WebShot 
            startPoint={webStartPoint} 
            endPoint={spiderTarget} 
            animState={spiderState} 
          />
        </div>
      )}

      {/* FLOATING MAIN MANUAL CHALLENGE PANEL */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -15 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="cyber-card"
        style={{
          position: 'relative',
          width: 'calc(100vw - 8vw)',
          height: 'calc(100vh - 6vh)',
          maxWidth: '1440px',
          maxHeight: '880px',
          background: 'rgba(4, 9, 24, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(0, 243, 255, 0.35)',
          boxShadow: '0 25px 75px rgba(0, 0, 0, 0.95), 0 0 45px rgba(0, 243, 255, 0.2), inset 0 0 25px rgba(0, 243, 255, 0.06)',
          borderRadius: '4px',
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxSizing: 'border-box',
          zIndex: 20
        }}
      >
        {/* Four Sci-Fi HUD Corner Brackets */}
        <div className="hud-corner hud-top-left" style={{ width: '16px', height: '16px', zIndex: 25 }} />
        <div className="hud-corner hud-top-right" style={{ width: '16px', height: '16px', zIndex: 25 }} />
        <div className="hud-corner hud-bottom-left" style={{ width: '16px', height: '16px', zIndex: 25 }} />
        <div className="hud-corner hud-bottom-right" style={{ width: '16px', height: '16px', zIndex: 25 }} />

        {/* 1. TOP HEADER */}
        <ManualHeader
          participant={participant}
          batchInfo={validation}
          currentQuestion={currentIndex + 1}
          totalQuestions={questions.length}
        />

        {/* 2. MAIN BODY AREA */}
        <main
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '18px 24px 12px 24px',
            boxSizing: 'border-box',
            overflow: 'hidden'
          }}
        >
          {isCompleted ? (
            /* RESULTS SCREEN */
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ManualResultsScreen
                participant={participant}
                batchInfo={validation}
                result={evaluationResult}
                onBackToArena={onBack}
              />
            </div>
          ) : (
            /* ACTIVE QUESTION VIEW */
            <div
              style={{
                flex: 1,
                display: 'grid',
                gridTemplateColumns: '1fr 260px',
                gridTemplateRows: '1fr auto',
                gap: '20px',
                height: '100%',
                overflow: 'hidden'
              }}
            >
              {/* Left Main Column: Active Question (options moved to full-width row below) */}
              <div style={{ height: '100%', overflow: 'hidden' }}>
                <QuestionCard
                  question={currentQuestion}
                  currentIndex={currentIndex}
                  totalQuestions={questions.length}
                  selectedOption={currentSelectedOption}
                  answeredQuestionsMap={selectedAnswers}
                  feedbackState={feedbackState}
                />
              </div>

              {/* Right Telemetry Column: 15-min Timer only (no internal HUD) */}
              <aside
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  height: '100%',
                  justifyContent: 'flex-start'
                }}
              >
                {/* 15-Minute Countdown Timer */}
                <ManualTimer
                  participantId={userId || 'guest'}
                  onTimeUp={handleTimeUp}
                  durationSeconds={900}
                />

                {/* Clean Question Progress Tracker */}
                <div
                  style={{
                    padding: '14px',
                    background: 'rgba(2, 6, 20, 0.9)',
                    border: '1px solid rgba(0, 243, 255, 0.2)',
                    borderRadius: '4px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.72rem',
                    color: '#9ca3af',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}
                >
                  <div style={{ color: 'var(--cyan-glow)', fontWeight: 800, letterSpacing: '0.06em' }}>
                    // SESSION STATUS
                  </div>
                  <div>
                    • PROGRESS:{' '}
                    <span style={{ color: '#ffffff', fontWeight: 700 }}>
                      {currentIndex + 1} / {questions.length}
                    </span>
                  </div>
                  <div>
                    • ANSWERED:{' '}
                    <span style={{ color: 'var(--lime-accent)', fontWeight: 700 }}>
                      {Object.keys(selectedAnswers).length}
                    </span>
                  </div>
                  <div>
                    • REMAINING:{' '}
                    <span style={{ color: 'var(--cyan-glow)', fontWeight: 700 }}>
                      {questions.length - Object.keys(selectedAnswers).length}
                    </span>
                  </div>

                  {/* Feedback state visual indicator */}
                  {feedbackState === 'processing' && (
                    <div
                      style={{
                        marginTop: '4px',
                        padding: '6px 10px',
                        background: 'rgba(0, 243, 255, 0.08)',
                        border: '1px solid rgba(0, 243, 255, 0.3)',
                        borderRadius: '3px',
                        color: 'var(--cyan-glow)',
                        fontSize: '0.68rem',
                        letterSpacing: '0.04em'
                      }}
                    >
                      ⟳ CONFIRMING ANSWER...
                    </div>
                  )}
                  {feedbackState === 'revealed' && (
                    <div
                      style={{
                        marginTop: '4px',
                        padding: '6px 10px',
                        background: 'rgba(57, 255, 20, 0.08)',
                        border: '1px solid rgba(57, 255, 20, 0.3)',
                        borderRadius: '3px',
                        color: 'var(--lime-accent)',
                        fontSize: '0.68rem',
                        letterSpacing: '0.04em'
                      }}
                    >
                      ✓ ADVANCING...
                    </div>
                  )}

                  <div
                    style={{
                      borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                      paddingTop: '6px',
                      color: '#6b7280',
                      fontSize: '0.65rem'
                    }}
                  >
                    Answers are final. Select carefully before proceeding.
                  </div>
                </div>
              </aside>

              {/* Full-width Options Row — grid-column: 1/-1 spans both columns */}
              {currentQuestion && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <OptionSelector
                    options={currentQuestion.options}
                    selectedOption={currentSelectedOption}
                    onSelectOption={handleOptionSelect}
                    disabled={isSubmitting || feedbackState === 'processing' || feedbackState === 'revealed'}
                    feedbackState={feedbackState}
                    correctAnswer={currentQuestion.correct_answer}
                    spiderState={spiderState}
                  />
                </div>
              )}
            </div>
          )}
        </main>

        {/* 3. BOTTOM CONTROL BAR (Only when test is in progress) */}
        {!isCompleted && (
          <ManualControls
            currentIndex={currentIndex}
            totalQuestions={questions.length}
            hasSelectedAnswer={!!currentSelectedOption}
            onNext={handleNextQuestion}
            isSubmitting={isSubmitting}
            feedbackState={feedbackState}
            disabled={isCompleted}
          />
        )}
      </motion.div>
    </div>
  );
}
