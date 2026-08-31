// Mirror of src/layer1/manual/Layer1ManualChallenge.jsx
// (Used by src/components/RoundPlaceholder.jsx via relative import)
// Import paths adjusted for src/components/Layer1ManualChallenge/ location.
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import ManualHeader from './ManualHeader';
import QuestionCard from './QuestionCard';
import ManualTimer from './ManualTimer';
import ManualControls from './ManualControls';
import ManualResultsScreen from './ManualResultsScreen';
import InvalidRollNumberScreen from './InvalidRollNumberScreen';
import DigitalParticles from '../../shared/components/DigitalParticles';
import ScanOverlay from '../../shared/components/ScanOverlay';
import { validateRollNumber } from '../../layer1/questions/layer1ManualQuestions';
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
// ============================================================================

export default function Layer1ManualChallenge({
  participant,
  onBack
}) {
  const userId     = participant?.userId || participant?.user_id;
  const rollNumber = participant?.rollNumber || participant?.roll_number;

  // ── Real-time lock listener ──
  useEffect(() => {
    const unsubscribe = eventStateService.subscribeToEventState((state) => {
      if (!state.layer1?.active || state.layer1?.activeTrack !== 'manual') {
        if (onBack) onBack();
      }
    });
    return () => unsubscribe();
  }, [onBack]);

  const validation = validateRollNumber(rollNumber);

  const [sessionLoading,    setSessionLoading]    = useState(true);
  const [sessionError,      setSessionError]      = useState(null);
  const [attemptId,         setAttemptId]         = useState(null);
  const [expiresAt,         setExpiresAt]         = useState(null);
  const [remainingSeconds,  setRemainingSeconds]  = useState(900);
  const [questions,         setQuestions]         = useState([]);
  const [currentIndex,      setCurrentIndex]      = useState(0);
  const [selectedAnswers,       setSelectedAnswers]       = useState({});
  const [currentSelectedOption, setCurrentSelectedOption] = useState(null);
  const [lastRevealData,        setLastRevealData]        = useState(null);
  const [isCompleted,      setIsCompleted]      = useState(false);
  const [isSubmitting,     setIsSubmitting]     = useState(false);
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [feedbackState,    setFeedbackState]    = useState('idle');
  const feedbackTimers = useRef([]);

  useEffect(() => {
    return () => feedbackTimers.current.forEach(clearTimeout);
  }, []);

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
      if (data.already_completed) {
        setIsCompleted(true);
        setEvaluationResult({ score: data.score, correctCount: data.correct_count, totalQuestions: 15 });
        setSessionLoading(false);
        return;
      }
      setAttemptId(data.attempt_id);
      setExpiresAt(data.expires_at);
      setRemainingSeconds(data.remaining_seconds ?? 900);
      setQuestions(data.questions ?? []);
      setCurrentIndex(0);
      setSelectedAnswers({});
      setCurrentSelectedOption(null);
      setSessionLoading(false);
    };
    initSession();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, rollNumber, validation.valid]);

  useEffect(() => {
    const currentQ = questions[currentIndex];
    if (currentQ && selectedAnswers[currentQ.id]) {
      setCurrentSelectedOption(selectedAnswers[currentQ.id]);
    } else {
      setCurrentSelectedOption(null);
    }
    setLastRevealData(null);
  }, [currentIndex, questions, selectedAnswers]);

  const handleFinalizeAttempt = async () => {
    if (isSubmitting || isCompleted) return;
    setIsSubmitting(true);
    try {
      const { data, error } = await adminService.completeLayer1ManualSession(attemptId, userId);
      if (data && !error) {
        setEvaluationResult({
          score: data.score ?? 0,
          correctCount: data.correct_count ?? 0,
          totalQuestions: data.total_questions ?? 15,
          accuracy: data.accuracy ?? 0
        });
        setIsCompleted(true);
        soundEngine.playBoot();
      } else {
        console.error('[completeLayer1ManualSession] error:', error);
        setIsCompleted(true);
        setEvaluationResult({ score: 0, correctCount: 0, totalQuestions: 15 });
      }
    } catch (err) {
      console.error('[handleFinalizeAttempt] exception:', err);
      setIsCompleted(true);
      setEvaluationResult({ score: 0, correctCount: 0, totalQuestions: 15 });
    } finally {
      setIsSubmitting(false);
    }
  };

  const advanceQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setCurrentSelectedOption(null);
      setFeedbackState('idle');
      setLastRevealData(null);
    } else {
      setFeedbackState('idle');
      handleFinalizeAttempt();
    }
  };

  const handleNextQuestion = async () => {
    const currentQ = questions[currentIndex];
    if (!currentQ || !currentSelectedOption || feedbackState !== 'idle') return;
    if (!attemptId) return;
    const updatedAnswers = { ...selectedAnswers, [currentQ.id]: currentSelectedOption };
    setSelectedAnswers(updatedAnswers);
    setFeedbackState('processing');
    feedbackTimers.current.forEach(clearTimeout);
    const { data: answerData, error: answerError } = await adminService.submitLayer1ManualAnswer(
      attemptId, userId, currentQ.id, currentSelectedOption
    );
    if (answerError) console.warn('[submitLayer1ManualAnswer] error:', answerError);
    const t1 = setTimeout(() => {
      setLastRevealData(answerData ?? null);
      setFeedbackState('revealed');
      const t2 = setTimeout(() => { advanceQuestion(); }, 2000);
      feedbackTimers.current = [t2];
    }, 2000);
    feedbackTimers.current = [t1];
  };

  const handleTimeUp = () => {
    if (isCompleted) return;
    feedbackTimers.current.forEach(clearTimeout);
    setFeedbackState('idle');
    soundEngine.playClick();
    handleFinalizeAttempt();
  };

  if (!validation.valid) {
    return (
      <div style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', zIndex: 80, backgroundColor: '#020612', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <DigitalParticles />
        <ScanOverlay currentStage={1} />
        <InvalidRollNumberScreen rollNumber={rollNumber} errorMessage={validation.error} onBack={onBack} />
      </div>
    );
  }

  if (sessionLoading || (!questions.length && !isCompleted)) {
    return (
      <div style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', zIndex: 80, backgroundColor: '#020612', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
        <DigitalParticles />
        <ScanOverlay currentStage={1} />
        {sessionError ? (
          <div style={{ zIndex: 30, textAlign: 'center', padding: '32px', background: 'rgba(4, 9, 24, 0.95)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '4px', maxWidth: '480px' }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: '#ef4444', marginBottom: '16px' }}>⚠ SESSION ERROR</p>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#9ca3af', marginBottom: '20px' }}>{sessionError}</p>
            <button onClick={onBack} style={{ padding: '8px 20px', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--cyan-glow)', background: 'transparent', border: '1px solid rgba(0, 243, 255, 0.4)', borderRadius: '3px', cursor: 'pointer' }}>← BACK TO ARENA</button>
          </div>
        ) : (
          <div style={{ zIndex: 30, fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--cyan-glow)', letterSpacing: '0.12em' }}>INITIALIZING SESSION...</div>
        )}
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', zIndex: 80, backgroundColor: '#020612', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', userSelect: 'none' }}>
      <DigitalParticles />
      <ScanOverlay currentStage={1} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -15 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="cyber-card"
        style={{ position: 'relative', width: 'calc(100vw - 8vw)', height: 'calc(100vh - 6vh)', maxWidth: '1440px', maxHeight: '880px', background: 'rgba(4, 9, 24, 0.95)', backdropFilter: 'blur(20px)', border: '1px solid rgba(0, 243, 255, 0.35)', boxShadow: '0 25px 75px rgba(0, 0, 0, 0.95), 0 0 45px rgba(0, 243, 255, 0.2), inset 0 0 25px rgba(0, 243, 255, 0.06)', borderRadius: '4px', padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', boxSizing: 'border-box', zIndex: 20 }}
      >
        <div className="hud-corner hud-top-left"    style={{ width: '16px', height: '16px', zIndex: 25 }} />
        <div className="hud-corner hud-top-right"   style={{ width: '16px', height: '16px', zIndex: 25 }} />
        <div className="hud-corner hud-bottom-left" style={{ width: '16px', height: '16px', zIndex: 25 }} />
        <div className="hud-corner hud-bottom-right"style={{ width: '16px', height: '16px', zIndex: 25 }} />

        <ManualHeader participant={participant} batchInfo={validation} currentQuestion={currentIndex + 1} totalQuestions={questions.length} />

        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '18px 24px 12px 24px', boxSizing: 'border-box', overflow: 'hidden' }}>
          {isCompleted ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ManualResultsScreen participant={participant} batchInfo={validation} result={evaluationResult} onBackToArena={onBack} />
            </div>
          ) : (
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 260px', gap: '20px', height: '100%', overflow: 'hidden' }}>
              <div style={{ height: '100%', overflow: 'hidden' }}>
                <QuestionCard
                  question={currentQuestion}
                  currentIndex={currentIndex}
                  totalQuestions={questions.length}
                  selectedOption={currentSelectedOption}
                  onSelectOption={setCurrentSelectedOption}
                  answeredQuestionsMap={selectedAnswers}
                  disabled={isSubmitting}
                  feedbackState={feedbackState}
                  revealData={lastRevealData}
                />
              </div>
              <aside style={{ display: 'flex', flexDirection: 'column', gap: '14px', height: '100%', justifyContent: 'flex-start' }}>
                <ManualTimer expiresAt={expiresAt} initialRemainingSeconds={remainingSeconds} onTimeUp={handleTimeUp} />
                <div style={{ padding: '14px', background: 'rgba(2, 6, 20, 0.9)', border: '1px solid rgba(0, 243, 255, 0.2)', borderRadius: '4px', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#9ca3af', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ color: 'var(--cyan-glow)', fontWeight: 800, letterSpacing: '0.06em' }}>// SESSION STATUS</div>
                  <div>• PROGRESS: <span style={{ color: '#ffffff', fontWeight: 700 }}>{currentIndex + 1} / {questions.length}</span></div>
                  <div>• ANSWERED: <span style={{ color: 'var(--lime-accent)', fontWeight: 700 }}>{Object.keys(selectedAnswers).length}</span></div>
                  <div>• REMAINING: <span style={{ color: 'var(--cyan-glow)', fontWeight: 700 }}>{questions.length - Object.keys(selectedAnswers).length}</span></div>
                  {feedbackState === 'processing' && (<div style={{ marginTop: '4px', padding: '6px 10px', background: 'rgba(0, 243, 255, 0.08)', border: '1px solid rgba(0, 243, 255, 0.3)', borderRadius: '3px', color: 'var(--cyan-glow)', fontSize: '0.68rem', letterSpacing: '0.04em' }}>⟳ CONFIRMING ANSWER...</div>)}
                  {feedbackState === 'revealed' && (<div style={{ marginTop: '4px', padding: '6px 10px', background: 'rgba(57, 255, 20, 0.08)', border: '1px solid rgba(57, 255, 20, 0.3)', borderRadius: '3px', color: 'var(--lime-accent)', fontSize: '0.68rem', letterSpacing: '0.04em' }}>✓ ADVANCING...</div>)}
                  <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '6px', color: '#6b7280', fontSize: '0.65rem' }}>Answers are final. Select carefully before proceeding.</div>
                </div>
              </aside>
            </div>
          )}
        </main>

        {!isCompleted && (
          <ManualControls currentIndex={currentIndex} totalQuestions={questions.length} hasSelectedAnswer={!!currentSelectedOption} onNext={handleNextQuestion} isSubmitting={isSubmitting} feedbackState={feedbackState} disabled={isCompleted} />
        )}
      </motion.div>
    </div>
  );
}
