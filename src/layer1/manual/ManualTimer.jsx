import React, { useState, useEffect, useRef } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { soundEngine } from '../../shared/utils/SoundEngine';

/**
 * ManualTimer — Server-authoritative countdown timer.
 *
 * Props:
 *   expiresAt              {string} ISO timestamp from server (authoritative deadline)
 *   initialRemainingSeconds {number} Server-provided remaining seconds at mount (used as fallback)
 *   onTimeUp               {function} Callback when timer reaches 0
 *
 * Security: Timer is driven by (expiresAt - Date.now()), so tampering with
 * localStorage has zero effect. The server independently enforces expires_at
 * in rpc_submit_layer1_manual_answer and rejects late submissions.
 */
export default function ManualTimer({
  expiresAt,
  initialRemainingSeconds = 900,
  onTimeUp
}) {
  const onTimeUpRef = useRef(onTimeUp);
  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
  }, [onTimeUp]);

  // Compute initial remaining from server expiresAt, or fall back to prop
  const computeRemaining = () => {
    if (expiresAt) {
      const diff = Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000);
      return Math.max(0, diff);
    }
    return Math.max(0, initialRemainingSeconds);
  };

  const [timeLeft, setTimeLeft] = useState(computeRemaining);

  useEffect(() => {
    // Recalculate when expiresAt becomes available
    setTimeLeft(computeRemaining());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expiresAt]);

  useEffect(() => {
    if (timeLeft <= 0) {
      if (onTimeUpRef.current) onTimeUpRef.current();
      return;
    }

    const interval = setInterval(() => {
      // Always re-derive from server expiresAt for drift correction
      const remaining = expiresAt
        ? Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000)
        : timeLeft - 1;

      const clamped = Math.max(0, remaining);

      // Low time sound cues
      if (clamped === 300) soundEngine.playClick();
      if (clamped === 60)  soundEngine.playClick();

      setTimeLeft(clamped);

      if (clamped <= 0) {
        clearInterval(interval);
        if (onTimeUpRef.current) onTimeUpRef.current();
      }
    }, 1000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expiresAt, timeLeft > 0]);

  const minutes  = Math.floor(timeLeft / 60);
  const seconds  = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const totalDuration = initialRemainingSeconds || 900;
  const progress      = timeLeft / totalDuration;
  const radius        = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progress * circumference;

  const isUrgent  = timeLeft <= 120;
  const isWarning = timeLeft <= 300 && !isUrgent;

  const themeColor = isUrgent
    ? '#ef4444'
    : isWarning
    ? '#f59e0b'
    : 'var(--cyan-glow)';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 16px',
        background: 'rgba(2, 6, 20, 0.9)',
        border: `1px solid ${isUrgent ? 'rgba(239, 68, 68, 0.5)' : isWarning ? 'rgba(245, 158, 11, 0.4)' : 'rgba(0, 243, 255, 0.25)'}`,
        borderRadius: '4px',
        boxShadow: isUrgent ? '0 0 15px rgba(239, 68, 68, 0.2)' : 'none',
        transition: 'border-color 0.3s ease'
      }}
    >
      {/* Circular Progress Ring */}
      <div style={{ position: 'relative', width: '56px', height: '56px', flexShrink: 0 }}>
        <svg width="56" height="56" style={{ transform: 'rotate(-90deg)' }}>
          {/* Background circle */}
          <circle
            cx="28"
            cy="28"
            r={radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth="3"
          />
          {/* Animated progress circle */}
          <circle
            cx="28"
            cy="28"
            r={radius}
            fill="none"
            stroke={themeColor}
            strokeWidth="3"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.9s linear, stroke 0.3s ease' }}
          />
        </svg>

        {/* Center Icon */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: themeColor
          }}
        >
          {isUrgent ? (
            <AlertTriangle size={18} className="animate-pulse" />
          ) : (
            <Clock size={18} />
          )}
        </div>
      </div>

      {/* Time Display */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.65rem',
            color: '#9ca3af',
            letterSpacing: '0.08em',
            textTransform: 'uppercase'
          }}
        >
          {isUrgent ? 'TIME CRITICAL' : isWarning ? 'TIME WARNING' : 'TIME REMAINING'}
        </div>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '1.45rem',
            fontWeight: 900,
            color: themeColor,
            letterSpacing: '0.05em',
            lineHeight: 1,
            textShadow: isUrgent
              ? '0 0 10px rgba(239, 68, 68, 0.5)'
              : isWarning
              ? '0 0 10px rgba(245, 158, 11, 0.4)'
              : '0 0 10px rgba(0, 243, 255, 0.3)'
          }}
        >
          {formattedTime}
        </div>
      </div>
    </div>
  );
}
