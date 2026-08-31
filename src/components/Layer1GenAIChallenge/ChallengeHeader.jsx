import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowLeft, Shield, Volume2, VolumeX, Settings } from 'lucide-react';
import { soundEngine } from '../../utils/SoundEngine';

export default function ChallengeHeader({ participant, onBack, onOpenAdmin }) {
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

      {/* Right: Operator Identity, SFX Toggle & Admin Panel Button */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.72rem'
        }}
      >
        {/* Operator Info Tag */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '5px 10px',
            background: 'rgba(5, 12, 28, 0.9)',
            border: '1px solid rgba(0, 243, 255, 0.2)',
            borderRadius: '2px',
            color: '#d1d5db'
          }}
        >
          <Shield size={13} color="var(--lime-accent)" />
          <span>
            OPERATOR: <strong style={{ color: '#ffffff' }}>{(participant?.name || 'PARTICIPANT').toUpperCase()}</strong>
          </span>
          <span style={{ color: 'rgba(0, 243, 255, 0.4)' }}>|</span>
          <span style={{ color: 'var(--cyan-glow)' }}>
            ROLL: {participant?.rollNumber || participant?.roll_number || '23-XXX'}
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

        {/* Admin Panel Trigger Button */}
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
            borderRadius: '2px',
            boxShadow: '0 0 10px rgba(224, 38, 255, 0.2)'
          }}
          title="Open Admin Control Panel (/admin-panel)"
        >
          <Settings size={14} />
          <span>ADMIN PANEL</span>
        </button>
      </div>
    </header>
  );
}
