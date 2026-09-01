import React, { useState, useEffect } from 'react';

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

  const minutes = Math.floor(timeLeft / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);

  const formatTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  const isDanger = timeLeft < 300000; // less than 5 minutes

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 16px',
        background: isDanger ? 'rgba(239, 68, 68, 0.1)' : 'rgba(0, 243, 255, 0.05)',
        border: `1px solid ${isDanger ? '#ef4444' : 'rgba(0, 243, 255, 0.2)'}`,
        borderRadius: '4px',
        color: isDanger ? '#fca5a5' : 'var(--cyan-glow)',
        fontFamily: 'var(--font-mono)',
        fontSize: '1rem',
        fontWeight: 'bold',
        textShadow: isDanger ? '0 0 10px rgba(239, 68, 68, 0.5)' : '0 0 10px rgba(0, 243, 255, 0.3)',
        transition: 'all 0.3s ease'
      }}
    >
      TIME LEFT: {formatTime}
    </div>
  );
}
