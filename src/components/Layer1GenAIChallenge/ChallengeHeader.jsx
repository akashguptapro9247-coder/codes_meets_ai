import React from 'react';
import { Sparkles, Terminal, Activity, ArrowLeft, Shield } from 'lucide-react';
import { soundEngine } from '../../utils/SoundEngine';

export default function ChallengeHeader({ participant, onBack }) {
  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 20px',
        borderBottom: '1px solid rgba(0, 243, 255, 0.25)',
        background: 'rgba(2, 6, 18, 0.85)',
        boxSizing: 'border-box',
        zIndex: 10
      }}
    >
      {/* Left: Branding & Layer Badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <button
          onClick={() => {
            soundEngine.playClick();
            if (onBack) onBack();
          }}
          onMouseEnter={() => soundEngine.playHover()}
          className="cyber-btn"
          style={{
            padding: '6px 12px',
            fontSize: '0.72rem',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            borderColor: 'rgba(0, 243, 255, 0.4)',
            color: 'var(--cyan-glow)'
          }}
          title="Return to Arena Dashboard"
        >
          <ArrowLeft size={13} />
          <span>ARENA</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={18} color="var(--cyan-glow)" style={{ filter: 'drop-shadow(0 0 6px var(--cyan-glow))' }} />
          <div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.62rem',
                color: 'rgba(0, 243, 255, 0.7)',
                letterSpacing: '0.2em',
                lineHeight: 1
              }}
            >
              CODE MEETS AI // STAGE 01
            </div>
            <h1
              style={{
                fontFamily: 'var(--font-title)',
                fontSize: '1.05rem',
                margin: 0,
                color: '#ffffff',
                letterSpacing: '0.12em',
                lineHeight: 1.2,
                textShadow: '0 0 12px rgba(0, 243, 255, 0.6)'
              }}
            >
              LAYER 01 / GENAI CHALLENGE
            </h1>
          </div>
        </div>
      </div>

      {/* Center: Live Status Indicator */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '4px 12px',
          background: 'rgba(57, 255, 20, 0.08)',
          border: '1px solid rgba(57, 255, 20, 0.3)',
          borderRadius: '2px',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.7rem',
          letterSpacing: '0.12em',
          color: 'var(--lime-accent)'
        }}
      >
        <span
          style={{
            display: 'inline-block',
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            backgroundColor: 'var(--lime-accent)',
            boxShadow: '0 0 8px var(--lime-accent)',
            animation: 'pulse 2s infinite'
          }}
        />
        <span>CHALLENGE ACTIVE // RECONSTRUCTION TRACK</span>
      </div>

      {/* Right: Operator Identity Badge */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.72rem'
        }}
      >
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: '#ffffff', fontWeight: 700, letterSpacing: '0.08em' }}>
            {participant?.name || 'PARTICIPANT'}
          </div>
          <div style={{ color: 'var(--cyan-glow)', fontSize: '0.65rem' }}>
            ROLL: {participant?.rollNumber || participant?.roll_number || '23-XXX'}
          </div>
        </div>
        <div
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '3px',
            background: 'rgba(0, 243, 255, 0.1)',
            border: '1px solid rgba(0, 243, 255, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--cyan-glow)'
          }}
        >
          <Shield size={14} />
        </div>
      </div>
    </header>
  );
}
