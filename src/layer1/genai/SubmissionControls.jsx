import React from 'react';
import { Send, CheckCircle2, AlertOctagon, Loader2, Sparkles, Lock } from 'lucide-react';
import { soundEngine } from '../../shared/utils/SoundEngine';

export default function SubmissionControls({
  onSubmit,
  isSubmitting = false,
  submissionSuccess = false,
  disabled = false,
  validationError = null
}) {
  const isLocked = submissionSuccess || disabled;

  const handleClick = () => {
    if (isLocked || isSubmitting) return;
    soundEngine.playClick();
    onSubmit();
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        width: '100%'
      }}
    >
      {/* Validation / Alert Notice */}
      {validationError && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid #ef4444',
            borderRadius: '2px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.72rem',
            color: '#fca5a5'
          }}
        >
          <AlertOctagon size={15} color="#ef4444" style={{ flexShrink: 0 }} />
          <span>{validationError}</span>
        </div>
      )}

      {/* Already Submitted Notice */}
      {submissionSuccess && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 14px',
            background: 'rgba(57, 255, 20, 0.1)',
            border: '1px solid var(--lime-accent)',
            borderRadius: '3px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.74rem',
            color: 'var(--lime-accent)'
          }}
        >
          <CheckCircle2 size={16} color="var(--lime-accent)" style={{ flexShrink: 0 }} />
          <div>
            <strong style={{ letterSpacing: '0.08em' }}>SUBMISSION COMPLETED</strong> — You have already submitted your Layer 1 GenAI challenge. Responses are locked for evaluation.
          </div>
        </div>
      )}

      {/* Primary Cyber Submit Button */}
      <button
        type="button"
        onClick={handleClick}
        disabled={isLocked || isSubmitting}
        onMouseEnter={() => !isLocked && !isSubmitting && soundEngine.playHover()}
        className="cyber-btn"
        style={{
          width: '100%',
          padding: '12px 24px',
          fontSize: '0.85rem',
          letterSpacing: '0.15em',
          fontWeight: 800,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          cursor: isLocked || isSubmitting ? 'not-allowed' : 'pointer',
          background: submissionSuccess
            ? 'rgba(57, 255, 20, 0.08)'
            : disabled
            ? 'rgba(107, 114, 128, 0.1)'
            : 'rgba(0, 243, 255, 0.15)',
          borderColor: submissionSuccess
            ? 'var(--lime-accent)'
            : disabled
            ? '#6b7280'
            : 'var(--cyan-glow)',
          color: submissionSuccess
            ? 'var(--lime-accent)'
            : disabled
            ? '#9ca3af'
            : '#ffffff',
          boxShadow: submissionSuccess
            ? '0 0 20px rgba(57, 255, 20, 0.2)'
            : disabled
            ? 'none'
            : '0 0 25px rgba(0, 243, 255, 0.25)',
          transition: 'all 0.3s ease'
        }}
      >
        {isSubmitting ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            <span>SUBMITTING YOUR RESPONSE...</span>
          </>
        ) : submissionSuccess ? (
          <>
            <Lock size={16} />
            <span>SUBMISSION LOCKED & RECORDED</span>
          </>
        ) : disabled ? (
          <>
            <AlertOctagon size={16} />
            <span>CHALLENGE EXPIRED (INPUT LOCKED)</span>
          </>
        ) : (
          <>
            <Sparkles size={16} color="var(--cyan-glow)" />
            <span>SUBMIT RESPONSE</span>
            <Send size={14} />
          </>
        )}
      </button>
    </div>
  );
}
