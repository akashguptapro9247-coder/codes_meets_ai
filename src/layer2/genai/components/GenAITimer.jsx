import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, AlertTriangle } from 'lucide-react';
import { soundEngine } from '../../../shared/utils/SoundEngine';

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
      const rem = calculateTimeLeft();
      setTimeLeft(rem);
      
      if (rem === 0) {
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
  
  const isWarning = timeLeft <= 300000 && timeLeft > 0; // 5 minutes warning
  const isCritical = timeLeft <= 60000 && timeLeft > 0; // 1 minute critical

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        boxShadow: isExpired 
          ? '0 0 15px rgba(239, 68, 68, 0.3)' 
          : isCritical 
          ? ['0 0 12px rgba(239, 68, 68, 0.4)', '0 0 24px rgba(239, 68, 68, 0.7)', '0 0 12px rgba(239, 68, 68, 0.4)']
          : isWarning 
          ? ['0 0 8px rgba(245, 158, 11, 0.3)', '0 0 16px rgba(245, 158, 11, 0.5)', '0 0 8px rgba(245, 158, 11, 0.3)']
          : '0 0 12px rgba(0, 243, 255, 0.15)'
      }}
      transition={isWarning || isCritical ? { repeat: Infinity, duration: isCritical ? 1 : 2 } : { duration: 0.3 }}
      onMouseEnter={() => soundEngine.playHover()}
      className="cyber-card" 
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px', 
        padding: '5px 14px', 
        background: isExpired 
          ? 'rgba(239, 68, 68, 0.12)' 
          : isCritical 
          ? 'rgba(239, 68, 68, 0.1)' 
          : isWarning 
          ? 'rgba(245, 158, 11, 0.1)' 
          : 'rgba(2, 6, 20, 0.85)',
        borderColor: isExpired 
          ? '#ef4444' 
          : isCritical 
          ? '#ef4444' 
          : isWarning 
          ? '#f59e0b' 
          : 'var(--cyan-glow)',
        borderRadius: '3px',
        boxSizing: 'border-box'
      }}
    >
      {isCritical || isExpired ? (
        <AlertTriangle size={16} color="#ef4444" />
      ) : (
        <Clock size={16} color={isWarning ? '#f59e0b' : 'var(--cyan-glow)'} />
      )}
      <div style={{ 
        fontFamily: 'var(--font-mono)', 
        fontSize: '1.1rem', 
        fontWeight: 800,
        color: isExpired 
          ? '#ef4444' 
          : isCritical 
          ? '#ef4444' 
          : isWarning 
          ? '#f59e0b' 
          : 'var(--cyan-glow)',
        letterSpacing: '0.08em',
        lineHeight: 1
      }}>
        {isExpired ? '00:00' : `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`}
      </div>
    </motion.div>
  );
}
