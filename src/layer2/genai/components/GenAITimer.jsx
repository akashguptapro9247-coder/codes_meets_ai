import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, AlertTriangle, ShieldAlert } from 'lucide-react';
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

  const isWarning = timeLeft <= 300000 && timeLeft > 60000; // 5 to 1 min warning
  const isCritical = timeLeft <= 60000 && timeLeft > 0; // <= 1 min critical

  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const themeColor = isExpired
    ? '#ef4444'
    : isCritical
    ? '#ef4444'
    : isWarning
    ? '#f59e0b'
    : 'var(--cyan-glow)';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{
        opacity: 1,
        scale: 1,
        boxShadow: isExpired
          ? '0 0 18px rgba(239, 68, 68, 0.4)'
          : isCritical
          ? ['0 0 12px rgba(239, 68, 68, 0.4)', '0 0 28px rgba(239, 68, 68, 0.8)', '0 0 12px rgba(239, 68, 68, 0.4)']
          : isWarning
          ? ['0 0 10px rgba(245, 158, 11, 0.3)', '0 0 20px rgba(245, 158, 11, 0.6)', '0 0 10px rgba(245, 158, 11, 0.3)']
          : '0 0 16px rgba(0, 243, 255, 0.2)'
      }}
      transition={
        isWarning || isCritical
          ? { repeat: Infinity, duration: isCritical ? 1 : 2 }
          : { duration: 0.3 }
      }
      onMouseEnter={() => soundEngine.playHover()}
      className="cyber-card"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '6px 16px',
        background: isExpired
          ? 'rgba(239, 68, 68, 0.12)'
          : isCritical
          ? 'rgba(239, 68, 68, 0.12)'
          : isWarning
          ? 'rgba(245, 158, 11, 0.12)'
          : 'rgba(2, 6, 20, 0.95)',
        borderColor: themeColor,
        borderRadius: '3px',
        boxSizing: 'border-box',
        borderWidth: '1px',
        borderStyle: 'solid'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {isExpired ? (
          <ShieldAlert size={20} color="#ef4444" style={{ filter: 'drop-shadow(0 0 6px #ef4444)' }} />
        ) : isCritical ? (
          <AlertTriangle size={20} color="#ef4444" style={{ filter: 'drop-shadow(0 0 8px #ef4444)' }} />
        ) : isWarning ? (
          <AlertTriangle size={20} color="#f59e0b" style={{ filter: 'drop-shadow(0 0 6px #f59e0b)' }} />
        ) : (
          <Clock size={20} color="var(--cyan-glow)" style={{ filter: 'drop-shadow(0 0 6px var(--cyan-glow))' }} />
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.62rem',
            color: isExpired ? '#ef4444' : isCritical ? '#ef4444' : isWarning ? '#f59e0b' : 'rgba(0, 243, 255, 0.75)',
            letterSpacing: '0.14em',
            fontWeight: 700,
            lineHeight: 1
          }}
        >
          {isExpired ? 'TIME EXPIRED' : isCritical ? 'FINAL MINUTE' : isWarning ? 'WARNING' : 'TIME REMAINING'}
        </span>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '1.35rem',
            fontWeight: 900,
            color: themeColor,
            letterSpacing: '0.08em',
            lineHeight: 1.1,
            textShadow: `0 0 10px ${themeColor}`
          }}
        >
          {isExpired ? '00:00' : formattedTime}
        </div>
      </div>
    </motion.div>
  );
}
