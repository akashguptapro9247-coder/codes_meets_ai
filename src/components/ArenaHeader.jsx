import React from 'react';
import { ShieldCheck, Settings, Cpu } from 'lucide-react';
import { soundEngine } from '../utils/SoundEngine';

export default function ArenaHeader({ participant, onOpenAdmin }) {
  // Mask roll number slightly to keep it clean (e.g. 23XXXXX)
  const formatRoll = (roll) => {
    if (!roll) return '23XXX';
    return roll.length > 5 ? `${roll.substring(0, 3)}XXX` : roll;
  };

  return (
    <header
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '64px',
        padding: '0 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 40,
        background: 'rgba(3, 7, 18, 0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(0, 243, 255, 0.25)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.8)',
        pointerEvents: 'none'
      }}
    >
      {/* Animated Glowing Bottom Border Line */}
      <div
        style={{
          position: 'absolute',
          bottom: -1,
          left: 0,
          right: 0,
          height: '1px',
          background: 'linear-gradient(90deg, transparent, var(--cyan-glow), transparent)',
          boxShadow: '0 0 10px var(--cyan-glow)'
        }}
      />

      {/* LEFT: Spacer to allow primary ScanOverlay CODE MEETS AI branding to display */}
      <div style={{ width: '180px' }} />

      {/* CENTER: Event Arena Title */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontFamily: 'var(--font-title)',
          fontSize: '0.95rem',
          color: '#ffffff',
          letterSpacing: '0.2em',
          textShadow: '0 0 12px var(--cyan-glow)',
          pointerEvents: 'auto'
        }}
      >
        <Cpu size={16} color="var(--cyan-glow)" />
        <span>EVENT ARENA</span>
      </div>

      {/* RIGHT: Participant Identity & Admin Control */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', pointerEvents: 'auto' }}>
        {/* Participant Info Tag */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '5px 12px',
            background: 'rgba(5, 12, 28, 0.9)',
            border: '1px solid rgba(0, 243, 255, 0.2)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            color: '#d1d5db'
          }}
        >
          <ShieldCheck size={14} color="var(--lime-accent)" />
          <span>
            OPERATOR: <strong style={{ color: '#ffffff' }}>{participant?.name?.toUpperCase() || 'AKASH'}</strong>
          </span>
          <span style={{ color: 'rgba(0, 243, 255, 0.5)' }}>|</span>
          <span style={{ color: 'var(--cyan-glow)' }}>
            ROLL: {formatRoll(participant?.rollNumber)}
          </span>
        </div>

        {/* Secret Admin Control Modal Trigger for Live Testing */}
        <button
          onClick={() => {
            soundEngine.playClick();
            if (window.history.pushState) {
              window.history.pushState({}, '', '/admin-panel');
              window.dispatchEvent(new Event('popstate'));
            } else {
              window.location.hash = '#admin-panel';
            }
            if (onOpenAdmin) onOpenAdmin();
          }}
          onMouseEnter={() => soundEngine.playHover()}
          style={{
            background: 'rgba(224, 38, 255, 0.12)',
            border: '1px solid var(--magenta-glow)',
            color: 'var(--magenta-glow)',
            padding: '6px 12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.72rem',
            letterSpacing: '0.08em',
            boxShadow: '0 0 10px rgba(224, 38, 255, 0.2)'
          }}
          title="Open Admin Control Panel (/admin-panel)"
        >
          <Settings size={14} />
          <span className="hidden md:inline">ADMIN PANEL</span>
        </button>
      </div>
    </header>
  );
}
