import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { soundEngine } from '../../shared/utils/SoundEngine';

export default function ManualControls({
  currentIndex,
  totalQuestions,
  hasSelectedAnswer,
  onNext,
  isSubmitting = false,
  feedbackState = 'idle', // 'idle' | 'processing' | 'revealed'
  disabled = false
}) {
  const isLastQuestion = currentIndex === totalQuestions - 1;
  const isProcessing = feedbackState === 'processing';
  const isRevealed = feedbackState === 'revealed';
  const isBusy = isProcessing || isRevealed || isSubmitting || disabled;
  const canClick = hasSelectedAnswer && !isBusy;

  return (
    <div
      style={{
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 24px',
        borderTop: '1px solid rgba(0, 243, 255, 0.2)',
        background: 'rgba(2, 6, 20, 0.95)',
        boxSizing: 'border-box'
      }}
    >
      {/* Left Info / Lock Notice */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <AlertCircle size={15} color={hasSelectedAnswer ? 'var(--cyan-glow)' : '#f59e0b'} />
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.72rem',
            color: hasSelectedAnswer ? '#9ca3af' : '#f59e0b',
            letterSpacing: '0.04em'
          }}
        >
          {isProcessing
            ? 'CONFIRMING SELECTION // Locking answer in place...'
            : isRevealed
            ? 'VERIFICATION COMPLETE // Advancing to next question...'
            : hasSelectedAnswer
            ? '⚠ PROCEED WITH CAUTION // Answers are final and cannot be revisited.'
            : 'ACTION REQUIRED // Please select an option [A - D] to proceed.'}
        </span>
      </div>

      {/* Right: Next / Submit Button */}
      <motion.button
        type="button"
        whileHover={canClick ? { scale: 1.03 } : {}}
        whileTap={canClick ? { scale: 0.97 } : {}}
        disabled={!canClick}
        onClick={() => {
          if (!canClick) return;
          soundEngine.playClick();
          onNext();
        }}
        className="cyber-btn"
        style={{
          padding: '10px 24px',
          fontSize: '0.84rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: isLastQuestion
            ? 'linear-gradient(135deg, rgba(57, 255, 20, 0.25) 0%, rgba(2, 20, 8, 0.95) 100%)'
            : 'linear-gradient(135deg, rgba(0, 243, 255, 0.25) 0%, rgba(2, 10, 30, 0.95) 100%)',
          borderColor: isLastQuestion ? 'var(--lime-accent)' : 'var(--cyan-glow)',
          color: isLastQuestion ? 'var(--lime-accent)' : '#ffffff',
          boxShadow: canClick
            ? `0 0 20px ${isLastQuestion ? 'rgba(57, 255, 20, 0.3)' : 'rgba(0, 243, 255, 0.3)'}`
            : 'none',
          opacity: canClick ? 1 : 0.55,
          cursor: canClick ? 'pointer' : 'not-allowed'
        }}
      >
        {isProcessing ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            <span>CONFIRMING ANSWER...</span>
          </>
        ) : isRevealed ? (
          <>
            <span>ADVANCING...</span>
            <ChevronRight size={16} />
          </>
        ) : isSubmitting ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            <span>FINALIZING ATTEMPT...</span>
          </>
        ) : isLastQuestion ? (
          <>
            <span>CONFIRM & FINALIZE</span>
            <CheckCircle size={16} />
          </>
        ) : (
          <>
            <span>NEXT QUESTION</span>
            <ChevronRight size={16} />
          </>
        )}
      </motion.button>
    </div>
  );
}
