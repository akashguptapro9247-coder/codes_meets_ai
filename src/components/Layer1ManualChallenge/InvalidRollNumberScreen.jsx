import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { soundEngine } from '../../shared/utils/SoundEngine';

export default function InvalidRollNumberScreen({ rollNumber, errorMessage, onBack }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{
        width: '100%',
        maxWidth: '560px',
        margin: 'auto',
        padding: '36px 30px',
        background: 'rgba(28, 4, 10, 0.95)',
        border: '1px solid #ef4444',
        borderRadius: '6px',
        boxShadow: '0 0 50px rgba(239, 68, 68, 0.35)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: '18px'
      }}
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'rgba(239, 68, 68, 0.15)',
          border: '2px solid #ef4444',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ef4444'
        }}
      >
        <ShieldAlert size={34} />
      </div>

      <div>
        <h2
          style={{
            fontFamily: 'var(--font-title)',
            fontSize: '1.35rem',
            fontWeight: 900,
            letterSpacing: '0.1em',
            color: '#ffffff',
            margin: '0 0 8px 0'
          }}
        >
          ROLL NUMBER VALIDATION FAILED
        </h2>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: '#fca5a5' }}>
          TECHNICAL CODING ASSESSMENT ACCESS DENIED
        </div>
      </div>

      <div
        style={{
          padding: '14px 18px',
          background: 'rgba(0, 0, 0, 0.6)',
          borderLeft: '4px solid #ef4444',
          borderRadius: '2px',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.8rem',
          lineHeight: 1.5,
          color: '#ffffff',
          textAlign: 'left',
          width: '100%',
          boxSizing: 'border-box'
        }}
      >
        <div style={{ marginBottom: '6px', color: '#ef4444', fontWeight: 800 }}>
          VALIDATION NOTICE:
        </div>
        <div>{errorMessage || 'Roll number must be exactly 10 characters starting with 25 or 26.'}</div>
        <div style={{ marginTop: '8px', color: '#9ca3af', fontSize: '0.72rem' }}>
          Provided roll number: <span style={{ color: 'var(--cyan-glow)' }}>{rollNumber || '[EMPTY]'}</span>
        </div>
      </div>

      <div
        style={{
          padding: '10px 14px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '4px',
          fontSize: '0.72rem',
          color: '#d1d5db',
          fontFamily: 'var(--font-mono)',
          textAlign: 'left',
          width: '100%',
          boxSizing: 'border-box'
        }}
      >
        <strong>SUPPORTED FORMATS:</strong>
        <ul style={{ margin: '6px 0 0 16px', padding: 0 }}>
          <li><span style={{ color: 'var(--cyan-glow)' }}>26XXXXXXXX</span> (10 Characters) → 1st Year Student</li>
          <li><span style={{ color: 'var(--magenta-glow)' }}>25XXXXXXXX</span> (10 Characters) → 2nd Year Student</li>
        </ul>
      </div>

      <button
        onClick={() => {
          soundEngine.playClick();
          if (onBack) onBack();
        }}
        className="cyber-btn"
        style={{
          padding: '10px 24px',
          fontSize: '0.8rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginTop: '6px'
        }}
      >
        <ArrowLeft size={14} />
        <span>RETURN TO ARENA</span>
      </button>
    </motion.div>
  );
}
