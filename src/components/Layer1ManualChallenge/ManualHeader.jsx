import React, { useState, useEffect } from 'react';
import { Terminal, Shield, Volume2, VolumeX } from 'lucide-react';
import { soundEngine } from '../../utils/SoundEngine';

export default function ManualHeader({ participant, batchInfo, currentQuestion, totalQuestions }) {
  const isFirstYear = batchInfo?.batch === '26';
  const [muted, setMuted] = useState(soundEngine.isMuted());

  useEffect(() => {
    setMuted(soundEngine.isMuted());
    const unsubscribe = soundEngine.subscribe((newMutedState) => {
      setMuted(newMutedState);
    });
    return unsubscribe;
  }, []);

  const toggleSound = () => {
    const isNowMuted = soundEngine.toggleMute();
    if (!isNowMuted) soundEngine.playHover();
  };

  return (
    <header
      style={{
        flexShrink: 0,
        height: '60px',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(0, 243, 255, 0.25)',
        background: 'linear-gradient(90deg, rgba(2, 6, 20, 0.95) 0%, rgba(5, 14, 38, 0.95) 100%)',
        boxSizing: 'border-box',
        zIndex: 10
      }}
    >
      {/* Left: Mission Title & Track Badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            width: '30px',
            height: '30px',
            borderRadius: '4px',
            background: 'rgba(0, 243, 255, 0.15)',
            border: '1px solid var(--cyan-glow)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--cyan-glow)'
          }}
        >
          <Terminal size={17} />
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{
                fontFamily: 'var(--font-title)',
                fontSize: '0.92rem',
                fontWeight: 900,
                letterSpacing: '0.12em',
                color: '#ffffff'
              }}
            >
              LAYER 01 // TECHNICAL CODING ASSESSMENT
            </span>
            <span
              className="cyber-badge"
              style={{
                fontSize: '0.64rem',
                padding: '2px 8px',
                background: isFirstYear ? 'rgba(0, 243, 255, 0.15)' : 'rgba(224, 38, 255, 0.15)',
                borderColor: isFirstYear ? 'var(--cyan-glow)' : 'var(--magenta-glow)',
                color: isFirstYear ? 'var(--cyan-glow)' : 'var(--magenta-glow)'
              }}
            >
              {isFirstYear ? '1ST YEAR ASSESSMENT' : '2ND YEAR ASSESSMENT'}
            </span>
          </div>
        </div>
      </div>

      {/* Right: Operator Identity & SFX Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '5px 10px',
            background: 'rgba(0, 243, 255, 0.06)',
            border: '1px solid rgba(0, 243, 255, 0.25)',
            borderRadius: '2px'
          }}
        >
          <Shield size={13} color="var(--lime-accent)" />
          <span style={{ fontSize: '0.74rem', color: '#9ca3af', fontFamily: 'var(--font-mono)' }}>
            OPERATOR:
          </span>
          <span
            style={{
              fontSize: '0.78rem',
              fontWeight: 700,
              color: '#ffffff',
              fontFamily: 'var(--font-mono)'
            }}
          >
            {(participant?.name || 'PARTICIPANT').toUpperCase()}
          </span>
          <span style={{ color: 'rgba(0, 243, 255, 0.4)' }}>|</span>
          <span
            style={{
              fontSize: '0.72rem',
              color: 'var(--cyan-glow)',
              fontFamily: 'var(--font-mono)'
            }}
          >
            ROLL: {participant?.rollNumber || participant?.roll_number || 'N/A'}
          </span>
        </div>

        {/* Audio Mute Toggle */}
        <button
          onClick={toggleSound}
          onMouseEnter={() => soundEngine.playHover()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(5, 10, 24, 0.8)',
            border: '1px solid rgba(0, 243, 255, 0.3)',
            color: muted ? '#6b7280' : 'var(--cyan-glow)',
            padding: '6px 12px',
            cursor: 'pointer',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.72rem',
            letterSpacing: '0.08em',
            borderRadius: '2px',
            transition: 'all 0.2s ease'
          }}
          title="Toggle SFX"
        >
          {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          <span>{muted ? 'SFX: OFF' : 'SFX: ON'}</span>
        </button>
      </div>
    </header>
  );
}
