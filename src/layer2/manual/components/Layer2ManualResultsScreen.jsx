import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, ArrowLeft } from 'lucide-react';
import { soundEngine } from '../../../shared/utils/SoundEngine';

export default function Layer2ManualResultsScreen({
  participant,
  finalResult,
  onBackToArena
}) {
  const marks = finalResult?.marks ?? 0;
  const maxMarks = 25; // As per the original hardcoded "25" in Layer2ManualChallenge
  const scorePercent = Math.round((marks / maxMarks) * 100);

  // Dynamic Badge determination for Layer 2
  const getScoreBadge = (score) => {
    if (score >= 90) {
      return {
        label: '🏆 LAYER 2 MASTER',
        color: 'var(--lime-accent)',
        border: 'var(--lime-accent)',
        bg: 'rgba(57, 255, 20, 0.15)',
        glow: 'rgba(57, 255, 20, 0.45)',
        desc: 'Exceptional mastery of complex algorithms and logic.'
      };
    }
    if (score >= 70) {
      return {
        label: '⚡ HIGH PROFICIENCY',
        color: 'var(--cyan-glow)',
        border: 'var(--cyan-glow)',
        bg: 'rgba(0, 243, 255, 0.15)',
        glow: 'rgba(0, 243, 255, 0.45)',
        desc: 'Strong algorithmic understanding and problem-solving.'
      };
    }
    if (score >= 50) {
      return {
        label: '🛡️ QUALIFIED OPERATOR',
        color: '#f59e0b',
        border: '#f59e0b',
        bg: 'rgba(245, 158, 11, 0.15)',
        glow: 'rgba(245, 158, 11, 0.45)',
        desc: 'Satisfactory foundation in core coding logic.'
      };
    }
    return {
      label: '🎯 APPRENTICE',
      color: '#cbd5e1',
      border: 'rgba(255, 255, 255, 0.3)',
      bg: 'rgba(255, 255, 255, 0.08)',
      glow: 'rgba(255, 255, 255, 0.2)',
      desc: 'Completed Layer 2 coding assessment.'
    };
  };

  const badge = getScoreBadge(scorePercent);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      style={{
        width: '100%',
        maxWidth: '620px',
        margin: 'auto',
        padding: '36px 32px',
        background: 'rgba(3, 8, 26, 0.96)',
        border: `1px solid ${badge.border}`,
        borderRadius: '6px',
        boxShadow: `0 0 50px ${badge.glow}, inset 0 0 25px rgba(0, 0, 0, 0.5)`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: '22px'
      }}
    >
      {/* Trophy / Badge Icon */}
      <div
        style={{
          width: '74px',
          height: '74px',
          borderRadius: '50%',
          background: badge.bg,
          border: `2px solid ${badge.color}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: badge.color,
          boxShadow: `0 0 35px ${badge.glow}`
        }}
      >
        <Trophy size={40} />
      </div>

      {/* Header Titles */}
      <div>
        <h2
          style={{
            fontFamily: 'var(--font-title)',
            fontSize: '1.7rem',
            fontWeight: 900,
            letterSpacing: '0.14em',
            color: '#ffffff',
            margin: '0 0 6px 0',
            textShadow: '0 0 20px rgba(255, 255, 255, 0.4)'
          }}
        >
          LAYER 2 COMPLETED
        </h2>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.82rem',
            color: '#9ca3af',
            letterSpacing: '0.06em'
          }}
        >
          MANUAL CODING CHALLENGE COMPLETED
        </div>
      </div>

      {/* Accuracy Badge Display */}
      <div
        style={{
          padding: '12px 24px',
          background: badge.bg,
          border: `1px solid ${badge.border}`,
          borderRadius: '4px',
          boxShadow: `0 0 20px ${badge.glow}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px'
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '1.15rem',
            fontWeight: 900,
            color: badge.color,
            letterSpacing: '0.08em'
          }}
        >
          {badge.label}
        </span>
        <span style={{ fontSize: '0.74rem', color: '#d1d5db', fontFamily: 'var(--font-mono)' }}>
          {badge.desc}
        </span>
      </div>

      {/* Metrics Row (Score & Percentage) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px',
          width: '100%'
        }}
      >
        {/* Total Score Box */}
        <div
          style={{
            padding: '18px 20px',
            background: 'rgba(0, 243, 255, 0.06)',
            border: '1px solid rgba(0, 243, 255, 0.3)',
            borderRadius: '4px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <span style={{ fontSize: '0.72rem', color: '#9ca3af', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}>
            TOTAL SCORE
          </span>
          <span
            style={{
              fontSize: '2rem',
              fontWeight: 900,
              color: 'var(--cyan-glow)',
              fontFamily: 'var(--font-mono)',
              textShadow: '0 0 15px rgba(0, 243, 255, 0.5)'
            }}
          >
            {marks} <span style={{ fontSize: '1.1rem', color: '#6b7280' }}>/ {maxMarks}</span>
          </span>
        </div>

        {/* Percentage Box */}
        <div
          style={{
            padding: '18px 20px',
            background: 'rgba(57, 255, 20, 0.06)',
            border: '1px solid rgba(57, 255, 20, 0.3)',
            borderRadius: '4px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <span style={{ fontSize: '0.72rem', color: '#9ca3af', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}>
            PERFORMANCE
          </span>
          <span
            style={{
              fontSize: '2rem',
              fontWeight: 900,
              color: 'var(--lime-accent)',
              fontFamily: 'var(--font-mono)',
              textShadow: '0 0 15px rgba(57, 255, 20, 0.5)'
            }}
          >
            {scorePercent}%
          </span>
        </div>
      </div>

      {/* Participant Identity Summary */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          padding: '8px 16px',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '3px',
          width: '100%',
          boxSizing: 'border-box'
        }}
      >
        <span style={{ fontSize: '0.74rem', color: '#9ca3af', fontFamily: 'var(--font-mono)' }}>
          PARTICIPANT: <strong style={{ color: '#ffffff' }}>{participant?.name || 'PARTICIPANT'}</strong>
        </span>
        <span style={{ color: 'rgba(255, 255, 255, 0.2)' }}>|</span>
        <span style={{ fontSize: '0.74rem', color: 'var(--cyan-glow)', fontFamily: 'var(--font-mono)' }}>
          ROLL: {participant?.rollNumber || participant?.roll_number || 'N/A'}
        </span>
      </div>

      {/* Return to Arena Button */}
      <button
        onClick={() => {
          soundEngine.playClick();
          if (onBackToArena) onBackToArena();
        }}
        className="cyber-btn"
        style={{
          padding: '12px 36px',
          fontSize: '0.92rem',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: 'linear-gradient(135deg, rgba(0, 243, 255, 0.25) 0%, rgba(2, 12, 34, 0.95) 100%)',
          borderColor: 'var(--cyan-glow)',
          color: '#ffffff',
          boxShadow: '0 0 25px rgba(0, 243, 255, 0.3)',
          marginTop: '6px'
        }}
      >
        <ArrowLeft size={16} />
        <span>RETURN</span>
      </button>
    </motion.div>
  );
}
