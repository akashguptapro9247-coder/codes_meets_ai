import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

// Layer 2 Manual has a strict 30 minute global timer
const LAYER2_DURATION_MS = 30 * 60 * 1000;

export default function Layer2Timer({ startTime, onTimeUp }) {
  const [timeLeft, setTimeLeft] = useState(LAYER2_DURATION_MS);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!startTime) return;

    // Calculate initial time left based on absolute start time
    const calcTimeLeft = () => {
      const elapsed = Date.now() - startTime;
      return Math.max(0, LAYER2_DURATION_MS - elapsed);
    };

    let remaining = calcTimeLeft();
    setTimeLeft(remaining);

    if (remaining <= 0) {
      if (!isExpired) {
        setIsExpired(true);
        onTimeUp();
      }
      return;
    }

    const interval = setInterval(() => {
      const currentRemaining = calcTimeLeft();
      setTimeLeft(currentRemaining);

      if (currentRemaining <= 0) {
        clearInterval(interval);
        if (!isExpired) {
          setIsExpired(true);
          onTimeUp();
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, onTimeUp, isExpired]);

  const totalSeconds    = LAYER2_DURATION_MS / 1000;
  const secondsLeft     = Math.floor(timeLeft / 1000);
  const minutes         = Math.floor(secondsLeft / 60);
  const seconds         = secondsLeft % 60;
  const formattedTime   = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Three-state theming — matches Layer 1 ManualTimer thresholds
  const isUrgent  = timeLeft < 120000;  // < 2 min  → red
  const isWarning = timeLeft < 300000 && !isUrgent; // < 5 min → amber

  const themeColor = isUrgent
    ? '#ef4444'
    : isWarning
    ? '#f59e0b'
    : 'var(--cyan-glow)';

  // Circular SVG progress ring — same geometry as Layer 1
  const progress         = secondsLeft / totalSeconds;
  const radius           = 24;
  const circumference    = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progress * circumference;

  const labelText = isUrgent ? 'TIME CRITICAL' : isWarning ? 'TIME WARNING' : 'TIME REMAINING';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 16px',
        background: 'rgba(2, 6, 20, 0.9)',
        border: `1px solid ${
          isUrgent
            ? 'rgba(239, 68, 68, 0.5)'
            : isWarning
            ? 'rgba(245, 158, 11, 0.4)'
            : 'rgba(0, 243, 255, 0.25)'
        }`,
        borderRadius: '4px',
        boxShadow: isUrgent ? '0 0 15px rgba(239, 68, 68, 0.2)' : 'none',
        transition: 'border-color 0.3s ease'
      }}
    >
      {/* Circular Progress Ring */}
      <div style={{ position: 'relative', width: '56px', height: '56px', flexShrink: 0 }}>
        <svg width="56" height="56" style={{ transform: 'rotate(-90deg)' }}>
          {/* Background track */}
          <circle
            cx="28"
            cy="28"
            r={radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth="3"
          />
          {/* Animated progress arc */}
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

        {/* Center icon */}
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

      {/* Time display */}
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
          {labelText}
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
