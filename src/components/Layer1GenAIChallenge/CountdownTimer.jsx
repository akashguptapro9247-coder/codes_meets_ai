import React, { useState, useEffect, useRef } from 'react';
import { Clock, AlertTriangle, ShieldAlert } from 'lucide-react';

// TEMPORARY TESTING CONFIGURATION: 30 seconds timer duration (Restore to 15 * 60 when requested)
const TOTAL_DURATION = 30;

export default function CountdownTimer({
  participantId = 'default',
  onTimeUp
}) {
  const timerKey = `cma_l1_genai_timer_start_${participantId}`;

  // Initialize or retrieve start timestamp from storage
  const [secondsRemaining, setSecondsRemaining] = useState(() => {
    if (typeof window === 'undefined') return TOTAL_DURATION;

    const storedStart = localStorage.getItem(timerKey);
    const now = Date.now();

    if (storedStart) {
      const startTime = parseInt(storedStart, 10);
      const elapsedSeconds = Math.floor((now - startTime) / 1000);
      const left = Math.max(0, TOTAL_DURATION - elapsedSeconds);
      return left;
    } else {
      localStorage.setItem(timerKey, now.toString());
      return TOTAL_DURATION;
    }
  });

  const onTimeUpRef = useRef(onTimeUp);
  onTimeUpRef.current = onTimeUp;

  useEffect(() => {
    if (secondsRemaining <= 0) {
      if (onTimeUpRef.current) onTimeUpRef.current();
      return;
    }

    const interval = setInterval(() => {
      const storedStart = localStorage.getItem(timerKey);
      const now = Date.now();
      const startTime = storedStart ? parseInt(storedStart, 10) : now;
      const elapsed = Math.floor((now - startTime) / 1000);
      const remaining = Math.max(0, TOTAL_DURATION - elapsed);

      setSecondsRemaining(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        if (onTimeUpRef.current) onTimeUpRef.current();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [timerKey, secondsRemaining]);

  // Format MM:SS
  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Progress fraction (1 -> 0)
  const progress = Math.max(0, Math.min(1, secondsRemaining / TOTAL_DURATION));

  // Determine alert level
  const isExpired = secondsRemaining === 0;
  const isUrgent = secondsRemaining > 0 && secondsRemaining <= 2 * 60; // <= 2 mins
  const isWarning = secondsRemaining > 2 * 60 && secondsRemaining <= 5 * 60; // <= 5 mins

  const themeColor = isExpired
    ? '#ef4444'
    : isUrgent
    ? '#ef4444'
    : isWarning
    ? '#f59e0b'
    : 'var(--cyan-glow)';

  // SVG Circular Meter calculations
  const size = 52;
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '8px 14px',
        background: isUrgent ? 'rgba(30, 4, 8, 0.95)' : 'rgba(2, 6, 18, 0.9)',
        border: `1px solid ${isUrgent ? 'rgba(239, 68, 68, 0.6)' : isWarning ? 'rgba(245, 158, 11, 0.5)' : 'rgba(0, 243, 255, 0.3)'}`,
        borderRadius: '3px',
        boxShadow: isUrgent
          ? '0 0 20px rgba(239, 68, 68, 0.35)'
          : isWarning
          ? '0 0 15px rgba(245, 158, 11, 0.25)'
          : '0 0 15px rgba(0, 243, 255, 0.15)',
        boxSizing: 'border-box'
      }}
    >
      {/* Circular SVG Gauge */}
      <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          {/* Background circle track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Active progress arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={themeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            style={{
              transition: 'stroke-dashoffset 1s linear, stroke 0.4s ease'
            }}
          />
        </svg>

        {/* Center Clock / Alert Icon */}
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
          {isExpired ? <ShieldAlert size={18} /> : <Clock size={16} />}
        </div>
      </div>

      {/* Numerical Time Display & Status */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.62rem',
            color: isExpired ? '#ef4444' : isUrgent ? '#f87171' : isWarning ? '#fbbf24' : 'rgba(0, 243, 255, 0.7)',
            letterSpacing: '0.15em',
            textTransform: 'uppercase'
          }}
        >
          {isExpired ? 'TIME EXPIRED' : isUrgent ? 'URGENT // TIME LEFT' : isWarning ? 'WARNING // TIME LEFT' : 'CHALLENGE TIMER'}
        </div>

        <div
          style={{
            fontFamily: 'var(--font-title)',
            fontSize: '1.4rem',
            lineHeight: 1.1,
            color: themeColor,
            letterSpacing: '0.08em',
            textShadow: `0 0 12px ${themeColor}`,
            animation: isUrgent && !isExpired ? 'pulse 1s infinite' : 'none'
          }}
        >
          {formattedTime}
        </div>
      </div>
    </div>
  );
}
