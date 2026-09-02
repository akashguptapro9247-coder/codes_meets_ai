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
import { validateRollNumber } from '../questions/layer1ManualQuestions';
import { adminService } from '../../admin/services/adminService';
import { eventStateService } from '../../shared/services/eventStateService';
import { soundEngine } from '../../shared/utils/SoundEngine';

// ============================================================================
// SECURITY HARDENING — SECURE RPC FLOW
// ============================================================================
// feedbackState machine:
// 'idle'       → student can select an option
// 'processing' → NEXT clicked, server called, 2s wait (locked, no reveal yet)
// 'revealed'   → 2s feedback shown (correct=green, wrong=red + correct=green)
// auto-advance after revealed completes
//
// What changed vs old version:
//   OLD: Questions (with correct_answer) lived in layer1ManualQuestions.js (bundled JS)
//        Score computed client-side, timer trusted from localStorage
//   NEW: Questions come from rpc_start_layer1_manual_session (NO correct_answer in payload)
//        Each answer checked by rpc_submit_layer1_manual_answer (server returns is_correct + correct_answer for UI only)
//        Final score computed by rpc_complete_layer1_manual_session (server authoritative)
//        Timer is server-authoritative expires_at (not localStorage)
// ============================================================================

export default function Layer1ManualChallenge({
  participant,
  onBack
}) {
  const userId     = participant?.userId || participant?.user_id;
  const rollNumber = participant?.rollNumber || participant?.roll_number;

  // ── Real-time lock listener: if admin locks Layer 1 or deactivates Manual track ──
  useEffect(() => {
    const unsubscribe = eventStateService.subscribeToEventState((state) => {
      if (!state.layer1?.active || state.layer1?.activeTrack !== 'manual') {
        if (onBack) onBack();
      }
    });
    return () => unsubscribe();
  }, [onBack]);

  // ── Roll number validation (client-side only for routing; batch/year from server) ──
  const validation = validateRollNumber(rollNumber);

  // ── Secure session state ──
  const [sessionLoading, setSessionLoading]   = useState(true);   // waiting for server session
  const [sessionError,   setSessionError]     = useState(null);   // startup error message
  const [attemptId,      setAttemptId]        = useState(null);   // server attempt UUID
  const [expiresAt,      setExpiresAt]        = useState(null);   // ISO string from server
  const [remainingSeconds, setRemainingSeconds] = useState(900);  // server-provided initial

  // ── Questions from server (NO correct_answer field) ──
  const [questions,    setQuestions]    = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // ── Answer state ──
  const [selectedAnswers,       setSelectedAnswers]       = useState({});   // { questionId: 'A'|'B'|'C'|'D' }
  const [currentSelectedOption, setCurrentSelectedOption] = useState(null); // current UI pick
  const [lastRevealData,        setLastRevealData]        = useState(null); // { is_correct, correct_answer }

  // ── Completion state ──
  const [isCompleted,      setIsCompleted]      = useState(false);
  const [isSubmitting,     setIsSubmitting]     = useState(false);
  const [evaluationResult, setEvaluationResult] = useState(null);

  // ── Feedback phase state machine: 'idle' | 'processing' | 'revealed' ──
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
    return () => feedbackTimers.current.forEach(clearTimeout);
  }, []);

  // ── STEP 1: Start or resume secure session on mount ──
  useEffect(() => {
    if (!userId || !validation.valid) {
      setSessionLoading(false);
      return;
    }

    const initSession = async () => {
      setSessionLoading(true);
      setSessionError(null);

      const { data, error } = await adminService.startLayer1ManualSession(userId, rollNumber);

      if (error) {
        setSessionError(error.message || 'Failed to start session. Please refresh.');
        setSessionLoading(false);
        return;
      }

      // Already completed — show results screen
      if (data.already_completed) {
        setIsCompleted(true);
        setEvaluationResult({
          score:          data.score,
          correctCount:   data.correct_count,
          totalQuestions: 15
        });
        setSessionLoading(false);
        return;
      }

      // Fresh or resumed session
      setAttemptId(data.attempt_id);
      setExpiresAt(data.expires_at);
      setRemainingSeconds(data.remaining_seconds ?? 900);
      setQuestions(data.questions ?? []);

      // If resuming, restore answered questions count (questions already answered are in server log)
      // For UX consistency: start from question 0 again (student sees fresh questions, server tracks answers)
      setCurrentIndex(0);
      setSelectedAnswers({});
      setCurrentSelectedOption(null);
      setSessionLoading(false);
    };

    initSession();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, rollNumber, validation.valid]);

  // Load previously selected option for current question
  useEffect(() => {
    const currentQ = questions[currentIndex];
    if (currentQ && selectedAnswers[currentQ.id]) {
      setCurrentSelectedOption(selectedAnswers[currentQ.id]);
    } else {
      setCurrentSelectedOption(null);
    }
    setLastRevealData(null);
  }, [currentIndex, questions, selectedAnswers]);

  // ── STEP 3: Finalize the attempt (timer expired or last question answered) ──
  const handleFinalizeAttempt = async () => {
    if (isSubmitting || isCompleted) return;
    setIsSubmitting(true);

    try {
      const { data, error } = await adminService.completeLayer1ManualSession(attemptId, userId);

      if (data && !error) {
        setEvaluationResult({
          score:          data.score          ?? 0,
          correctCount:   data.correct_count  ?? 0,
          totalQuestions: data.total_questions ?? 15,
          accuracy:       data.accuracy       ?? 0
        });
        setIsCompleted(true);
        soundEngine.playBoot();
      } else {
        // Fallback: show completion even if RPC fails (graceful UX)
        console.error('[completeLayer1ManualSession] error:', error);
        setIsCompleted(true);
        setEvaluationResult({
          score:          0,
          correctCount:   0,
          totalQuestions: 15
        });
      }
    } catch (err) {
      console.error('[handleFinalizeAttempt] exception:', err);
      setIsCompleted(true);
      setEvaluationResult({ score: 0, correctCount: 0, totalQuestions: 15 });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Advance to next question after feedback
  const advanceQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setCurrentSelectedOption(null);
      setFeedbackState('idle');
      setLastRevealData(null);
    } else {
      // Last question — finalize
      setFeedbackState('idle');
      handleFinalizeAttempt();
    }
  };

  // ── STEP 2: NEXT button — sends answer to server, gets back is_correct + correct_answer for UI feedback ──
  const handleNextQuestion = async () => {
    const currentQ = questions[currentIndex];
    if (!currentQ || !currentSelectedOption || feedbackState !== 'idle') return;
    if (!attemptId) return;

    // Lock answer in local state immediately
    const updatedAnswers = {
      ...selectedAnswers,
      [currentQ.id]: currentSelectedOption
    };
    setSelectedAnswers(updatedAnswers);

    // Phase 1: processing — lock all inputs, show spinner (2 seconds)
    setFeedbackState('processing');
    feedbackTimers.current.forEach(clearTimeout);

    // Call server to record answer and get feedback
    const { data: answerData, error: answerError } = await adminService.submitLayer1ManualAnswer(
      attemptId,
      userId,
      currentQ.id,
      currentSelectedOption
    );

    if (answerError) {
      console.warn('[submitLayer1ManualAnswer] error:', answerError);
    }

    // Phase 2: revealed — show correct/wrong feedback for 2 seconds
    const t1 = setTimeout(() => {
      setLastRevealData(answerData ?? null);
      setFeedbackState('revealed');

      const t2 = setTimeout(() => {
        advanceQuestion();
      }, 2000);
      feedbackTimers.current = [t2];
    }, 2000);

    feedbackTimers.current = [t1];
  };

  // Timer expired callback: immediately locks and finalizes
  const handleTimeUp = useCallback(() => {
    if (isCompleted) return;
    feedbackTimers.current.forEach(clearTimeout);
    setFeedbackState('idle');
    soundEngine.playClick();
    handleFinalizeAttempt();
  }, [isCompleted, handleFinalizeAttempt]);

  // ── Invalid roll number screen ──
  if (!validation.valid) {
    return (
      <div
        style={{
          position: 'fixed', inset: 0,
          width: '100vw', height: '100vh',
          zIndex: 80, backgroundColor: '#020612',
          overflow: 'hidden', display: 'flex',
          alignItems: 'center', justifyContent: 'center'
        }}
      >
        <DigitalParticles />
        <ScanOverlay currentStage={1} hideHeader={true} />
        <InvalidRollNumberScreen
          rollNumber={rollNumber}
          errorMessage={validation.error}
          onBack={onBack}
        />
      </div>
    );
  }

  // ── Session loading / error screen ──
  if (sessionLoading || (!questions.length && !isCompleted)) {
    return (
      <div
        style={{
          position: 'fixed', inset: 0,
          width: '100vw', height: '100vh',
          zIndex: 80, backgroundColor: '#020612',
          overflow: 'hidden', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column', gap: '16px'
        }}
      >
        <DigitalParticles />
        <ScanOverlay currentStage={1} />
        {sessionError ? (
          <div style={{
            zIndex: 30, textAlign: 'center', padding: '32px',
            background: 'rgba(4, 9, 24, 0.95)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            borderRadius: '4px', maxWidth: '480px'
          }}>
            <p style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.85rem',
              color: '#ef4444', marginBottom: '16px'
            }}>
              ⚠ SESSION ERROR
            </p>
            <p style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.75rem',
              color: '#9ca3af', marginBottom: '20px'
            }}>
              {sessionError}
            </p>
            <button
              onClick={onBack}
              style={{
                padding: '8px 20px', fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem', color: 'var(--cyan-glow)',
                background: 'transparent',
                border: '1px solid rgba(0, 243, 255, 0.4)',
                borderRadius: '3px', cursor: 'pointer'
              }}
            >
              ← BACK TO ARENA
            </button>
          </div>
        ) : (
          <div style={{
            zIndex: 30,
            fontFamily: 'var(--font-mono)', fontSize: '0.85rem',
            color: 'var(--cyan-glow)', letterSpacing: '0.12em'
          }}>
            INITIALIZING SESSION...
          </div>
        )}
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        width: '100vw', height: '100vh',
        zIndex: 80, backgroundColor: '#020612',
        overflow: 'hidden', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        userSelect: 'none'
      }}
    >
      {/* 2D Digital Particles Ambient Background */}
      <DigitalParticles />

      {/* CRT Scanline & HUD Telemetry Overlay */}
      <ScanOverlay currentStage={1} hideHeader={true} />

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
        <div className="hud-corner hud-top-left"    style={{ width: '16px', height: '16px', zIndex: 25 }} />
        <div className="hud-corner hud-top-right"   style={{ width: '16px', height: '16px', zIndex: 25 }} />
        <div className="hud-corner hud-bottom-left" style={{ width: '16px', height: '16px', zIndex: 25 }} />
        <div className="hud-corner hud-bottom-right"style={{ width: '16px', height: '16px', zIndex: 25 }} />

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
                  revealData={lastRevealData}
                />
              </div>

              {/* Right Telemetry Column: Server-authoritative Timer + Progress */}
              <aside
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  height: '100%',
                  justifyContent: 'flex-start'
                }}
              >
                {/* 15-Minute Countdown Timer (server-authoritative expires_at) */}
                <ManualTimer
                  expiresAt={expiresAt}
                  initialRemainingSeconds={remainingSeconds}
                  onTimeUp={handleTimeUp}
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
