import React, { useState, useEffect, useRef } from 'react';
import { Clock, AlertTriangle, ShieldAlert } from 'lucide-react';

const TOTAL_DURATION = 15 * 60; // 15 minutes in seconds

export default function CountdownTimer({
  participantId = 'default',
  onTimeUp,
  disabled = false
}) {
  const getTimerKey = (id) => `cma_l1_genai_timer_start_${id || 'player'}`;
  const getExpiredKey = (id) => `cma_l1_genai_timer_expired_${id || 'player'}`;
  const timerKey = getTimerKey(participantId);
  const expiredKey = getExpiredKey(participantId);

  // Initialize or retrieve start timestamp from storage
  const [secondsRemaining, setSecondsRemaining] = useState(() => {
    if (typeof window === 'undefined') return TOTAL_DURATION;

    if (disabled || localStorage.getItem(expiredKey) === 'true' || sessionStorage.getItem(expiredKey) === 'true') {
      return 0;
    }

    const storedStart = localStorage.getItem(timerKey) || sessionStorage.getItem(timerKey);
    const now = Date.now();

    if (storedStart) {
      const startTime = parseInt(storedStart, 10);
      const elapsedSeconds = Math.floor((now - startTime) / 1000);
      return Math.max(0, TOTAL_DURATION - elapsedSeconds);
    } else {
      const nowStr = now.toString();
      try {
        localStorage.setItem(timerKey, nowStr);
        sessionStorage.setItem(timerKey, nowStr);
      } catch (e) {}
      return TOTAL_DURATION;
    }
  });

  const onTimeUpRef = useRef(onTimeUp);
  onTimeUpRef.current = onTimeUp;

  // Recalculate if participantId becomes available after initial mount
  useEffect(() => {
    if (!participantId || participantId === 'default' || participantId === 'player') return;
    const currentKey = getTimerKey(participantId);
    const stored = localStorage.getItem(currentKey) || sessionStorage.getItem(currentKey);
    const now = Date.now();
    if (stored) {
      const startTime = parseInt(stored, 10);
      const elapsed = Math.floor((now - startTime) / 1000);
      setSecondsRemaining(Math.max(0, TOTAL_DURATION - elapsed));
    } else {
      const nowStr = now.toString();
      try {
        localStorage.setItem(currentKey, nowStr);
        sessionStorage.setItem(currentKey, nowStr);
      } catch (e) {}
    }
  }, [participantId]);

  useEffect(() => {
    if (disabled || secondsRemaining <= 0 || localStorage.getItem(expiredKey) === 'true') {
      if (secondsRemaining <= 0 && onTimeUpRef.current) {
        onTimeUpRef.current();
      }
      return;
    }

    const interval = setInterval(() => {
      const currentKey = getTimerKey(participantId);
      const storedStart = localStorage.getItem(currentKey) || sessionStorage.getItem(currentKey);
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
  }, [participantId, timerKey, secondsRemaining, disabled, expiredKey]);

  // Format MM:SS
  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Progress percentage (100% at start, 0% at timeout)
  const progressPercent = (secondsRemaining / TOTAL_DURATION) * 100;
  const strokeDashoffset = 283 - (283 * progressPercent) / 100;

  const isUrgent = secondsRemaining <= 60 && secondsRemaining > 0;
  const isExpired = secondsRemaining <= 0;

  return (
    <div
      style={{
        width: '100%',
        background: isExpired
          ? 'rgba(239, 68, 68, 0.08)'
          : isUrgent
          ? 'rgba(245, 158, 11, 0.08)'
          : 'rgba(2, 6, 18, 0.95)',
        border: isExpired
          ? '1px solid rgba(239, 68, 68, 0.4)'
          : isUrgent
          ? '1px solid rgba(245, 158, 11, 0.4)'
          : '1px solid rgba(0, 243, 255, 0.25)',
        borderRadius: '4px',
        padding: '12px 16px',
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* SVG Circular Gauge */}
        <div style={{ position: 'relative', width: '44px', height: '44px' }}>
          <svg width="44" height="44" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="8"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke={isExpired ? '#ef4444' : isUrgent ? '#f59e0b' : 'var(--cyan-glow)'}
              strokeWidth="8"
              strokeDasharray="283"
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          </svg>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {isExpired ? (
              <ShieldAlert size={18} color="#ef4444" />
            ) : isUrgent ? (
              <AlertTriangle size={18} color="#f59e0b" />
            ) : (
              <Clock size={18} color="var(--cyan-glow)" />
            )}
          </div>
        </div>

        <div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.66rem',
              color: isExpired ? '#ef4444' : isUrgent ? '#f59e0b' : '#9ca3af',
              letterSpacing: '0.12em',
              fontWeight: 700
            }}
          >
            {isExpired ? 'CHALLENGE TIME EXPIRED' : isUrgent ? 'FINAL COUNTDOWN' : 'CHALLENGE TIMER'}
          </div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '1.3rem',
              fontWeight: 800,
              color: isExpired ? '#ef4444' : isUrgent ? '#f59e0b' : '#ffffff',
              letterSpacing: '0.08em',
              lineHeight: 1.1
            }}
          >
            {formattedTime}
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'right' }}>
        <span
          className="cyber-badge"
          style={{
            fontSize: '0.65rem',
            borderColor: isExpired ? '#ef4444' : isUrgent ? '#f59e0b' : 'var(--cyan-glow)',
            color: isExpired ? '#ef4444' : isUrgent ? '#f59e0b' : 'var(--cyan-glow)'
          }}
        >
          {isExpired ? 'LOCKED' : isUrgent ? 'URGENT' : 'ACTIVE'}
        </span>
      </div>
    </div>
  );
}
