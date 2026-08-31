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
  useEffect(() => { onTimeUpRef.current = onTimeUp; }, [onTimeUp]);

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

  const onTimeUpRef = React.useRef(onTimeUp);
  useEffect(() => {
<<<<<<< Updated upstream
    onTimeUpRef.current = onTimeUp;
  }, [onTimeUp]);

  useEffect(() => {
    setTimeLeft((prev) => {
      if (prev <= 0) {
        if (onTimeUpRef.current) onTimeUpRef.current();
      }
      return prev;
    });

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (onTimeUpRef.current) onTimeUpRef.current();
          return 0;
        }
=======
    if (timeLeft <= 0) {
      if (onTimeUpRef.current) onTimeUpRef.current();
      return;
    }

    const interval = setInterval(() => {
      // Always re-derive from server expiresAt for drift correction
      const remaining = expiresAt
        ? Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000)
        : timeLeft - 1;
>>>>>>> Stashed changes

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
<<<<<<< Updated upstream
  }, []);
=======
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expiresAt, timeLeft > 0]);
>>>>>>> Stashed changes

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
        padding: '8px 16px',
        background: 'rgba(2, 6, 20, 0.95)',
        border: `1px solid ${isUrgent ? '#ef4444' : isWarning ? '#f59e0b' : 'rgba(0, 243, 255, 0.3)'}`,
        boxShadow: isUrgent ? '0 0 15px rgba(239, 68, 68, 0.4)' : 'none',
        borderRadius: '4px'
      }}
    >
      {/* SVG Circular Meter */}
      <div style={{ position: 'relative', width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="56" height="56" style={{ transform: 'rotate(-90deg)' }}>
          <circle
            cx="28" cy="28" r={radius}
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="3" fill="transparent"
          />
          <circle
            cx="28" cy="28" r={radius}
            stroke={themeColor}
            strokeWidth="3.5"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s ease' }}
          />
        </svg>
        <div style={{ position: 'absolute', color: themeColor }}>
          {isUrgent ? <AlertTriangle size={18} /> : <Clock size={18} />}
        </div>
      </div>

      {/* Numerical Time Readout */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '1.25rem',
              fontWeight: 900,
              color: themeColor,
              letterSpacing: '0.08em',
              textShadow: `0 0 10px ${themeColor}`
            }}
          >
            {formattedTime}
          </span>
        </div>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.62rem',
            color: isUrgent ? '#ef4444' : isWarning ? '#f59e0b' : '#9ca3af',
            fontWeight: 700,
            letterSpacing: '0.06em'
          }}
        >
          {isUrgent ? 'CRITICAL TIME' : isWarning ? 'TIME WARNING' : 'CHALLENGE TIMER'}
        </span>
      </div>
    </div>
  );
}
