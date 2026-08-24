import React from 'react';
import { motion } from 'framer-motion';
import { User, Shield, Zap, Terminal } from 'lucide-react';

export default function PlayerProfileCard({ formData }) {
  const name = formData?.name?.trim() || '';
  const roll = formData?.rollNumber?.trim() || '';
  const branch = formData?.branch || 'UNASSIGNED';
  const year = formData?.year || '1ST YEAR';

  const isStarted = Boolean(name || roll || branch !== 'UNASSIGNED');

  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="hidden lg:flex"
      style={{
        position: 'absolute',
        left: '40px',
        top: '50%',
        transform: 'translateY(-50%)',
        width: '240px',
        background: 'rgba(4, 9, 22, 0.75)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(0, 243, 255, 0.25)',
        borderRadius: '4px',
        padding: '20px',
        boxSizing: 'border-box',
        zIndex: 25,
        flexDirection: 'column',
        gap: '14px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.8), inset 0 0 15px rgba(0, 243, 255, 0.1)',
        pointerEvents: 'none'
      }}
    >
      {/* Corner Brackets */}
      <div className="hud-corner hud-top-left" style={{ width: '10px', height: '10px' }} />
      <div className="hud-corner hud-top-right" style={{ width: '10px', height: '10px' }} />
      <div className="hud-corner hud-bottom-left" style={{ width: '10px', height: '10px' }} />
      <div className="hud-corner hud-bottom-right" style={{ width: '10px', height: '10px' }} />

      {/* Card Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(0, 243, 255, 0.15)',
          paddingBottom: '8px'
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-title)',
            fontSize: '0.75rem',
            color: 'var(--cyan-glow)',
            letterSpacing: '0.15em'
          }}
        >
          PLAYER ID CARD
        </span>
        <span
          className="cyber-badge"
          style={{
            fontSize: '0.6rem',
            borderColor: isStarted ? 'var(--lime-accent)' : 'var(--cyan-dim)',
            color: isStarted ? 'var(--lime-accent)' : 'var(--cyan-glow)'
          }}
        >
          {isStarted ? 'SYNCED' : 'STANDBY'}
        </span>
      </div>

      {/* Avatar Graphic Placeholder */}
      <div
        style={{
          width: '100%',
          height: '110px',
          background: 'rgba(2, 6, 18, 0.9)',
          border: '1px solid rgba(0, 243, 255, 0.2)',
          borderRadius: '2px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Subtle Cyber Rim Glow */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at center, rgba(0, 243, 255, 0.15) 0%, transparent 70%)',
            pointerEvents: 'none'
          }}
        />

        <User size={48} color={isStarted ? 'var(--cyan-glow)' : '#4b5563'} style={{ filter: isStarted ? 'drop-shadow(0 0 10px var(--cyan-glow))' : 'none' }} />

        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.62rem',
            color: isStarted ? 'var(--cyan-glow)' : '#6b7280',
            letterSpacing: '0.1em',
            marginTop: '6px'
          }}
        >
          {name ? name.toUpperCase() : 'OPERATOR UNKNOWN'}
        </span>
      </div>

      {/* Player Meta Info */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontFamily: 'var(--font-mono)', fontSize: '0.72rem' }}>
        <div>
          <span style={{ color: '#9ca3af', fontSize: '0.65rem' }}>CODENAME:</span>
          <div style={{ color: '#ffffff', fontWeight: 700, marginTop: '1px' }}>
            {name || 'INITIALIZING...'}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
          <div>
            <span style={{ color: '#9ca3af', fontSize: '0.65rem' }}>CLASS:</span>
            <div style={{ color: 'var(--cyan-glow)', marginTop: '1px' }}>{branch}</div>
          </div>
          <div>
            <span style={{ color: '#9ca3af', fontSize: '0.65rem' }}>LEVEL:</span>
            <div style={{ color: 'var(--magenta-glow)', marginTop: '1px' }}>01</div>
          </div>
        </div>

        <div>
          <span style={{ color: '#9ca3af', fontSize: '0.65rem' }}>ROLL NO:</span>
          <div style={{ color: '#d1d5db', marginTop: '1px' }}>{roll || 'PENDING...'}</div>
        </div>
      </div>
    </motion.div>
  );
}
