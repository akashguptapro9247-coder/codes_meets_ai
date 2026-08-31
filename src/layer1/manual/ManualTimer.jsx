import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, AlertTriangle } from 'lucide-react';
import { soundEngine } from '../../shared/utils/SoundEngine';

export default function ManualTimer({ participantId = 'guest', onTimeUp, durationSeconds = 900 }) {
  const timerStorageKey = `cma_l1_manual_timer_start_${participantId}`;

  const [timeLeft, setTimeLeft] = useState(() => {
    try {
      const savedStart = localStorage.getItem(timerStorageKey);
      if (savedStart) {
        const startTime = parseInt(savedStart, 10);
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const remaining = durationSeconds - elapsed;
        return Math.max(0, remaining);
      } else {
        const now = Date.now();
        localStorage.setItem(timerStorageKey, now.toString());
        return durationSeconds;
      }
    } catch (e) {
      return durationSeconds;
    }
  });

  const onTimeUpRef = React.useRef(onTimeUp);
  useEffect(() => {
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

        // Low time sound cues
        if (prev === 300) soundEngine.playClick();
        if (prev === 60) soundEngine.playClick();

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const progress = timeLeft / durationSeconds;
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progress * circumference;

  // Dynamic theme colors based on remaining time
  const isUrgent = timeLeft <= 120; // <= 2 mins
  const isWarning = timeLeft <= 300 && !isUrgent; // <= 5 mins

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
            cx="28"
            cy="28"
            r={radius}
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="3"
            fill="transparent"
          />
          <circle
            cx="28"
            cy="28"
            r={radius}
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
