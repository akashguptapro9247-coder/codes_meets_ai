import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

const ROUND_DURATION_MS = 30 * 60 * 1000; // 30 minutes

export default function GenAITimer({ assignedAt, onExpire }) {
  const [timeLeft, setTimeLeft] = useState(ROUND_DURATION_MS);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!assignedAt) return;

    const calculateTimeLeft = () => {
      const startTime = new Date(assignedAt).getTime();
      const now = new Date().getTime();
      const elapsed = now - startTime;
      const remaining = Math.max(0, ROUND_DURATION_MS - elapsed);
      return remaining;
    };

    const remaining = calculateTimeLeft();
    setTimeLeft(remaining);

    if (remaining === 0 && !isExpired) {
      setIsExpired(true);
      if (onExpire) onExpire();
      return;
    }

    const interval = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
      
      if (remaining === 0) {
        clearInterval(interval);
        if (!isExpired) {
          setIsExpired(true);
          if (onExpire) onExpire();
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [assignedAt, isExpired, onExpire]);

  const minutes = Math.floor(timeLeft / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);
  
  const isWarning = timeLeft <= 300000; // 5 minutes warning

  return (
    <div 
      className="cyber-card" 
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '12px', 
        padding: '12px 24px', 
        background: isExpired ? 'rgba(239, 68, 68, 0.1)' : isWarning ? 'rgba(245, 158, 11, 0.1)' : 'rgba(0, 0, 0, 0.5)',
        borderColor: isExpired ? '#ef4444' : isWarning ? '#f59e0b' : 'var(--cyan-glow)'
      }}
    >
      <Clock size={24} color={isExpired ? '#ef4444' : isWarning ? '#f59e0b' : 'var(--cyan-glow)'} />
      <div style={{ 
        fontFamily: 'var(--font-mono)', 
        fontSize: '1.5rem', 
        fontWeight: 'bold',
        color: isExpired ? '#ef4444' : isWarning ? '#f59e0b' : '#fff'
      }}>
        {isExpired ? '00:00' : `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`}
      </div>
    </div>
  );
}
