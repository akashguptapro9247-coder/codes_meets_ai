import React, { useState, useEffect } from 'react';
import { Terminal, ShieldCheck, Volume2, VolumeX, Cpu } from 'lucide-react';
import { soundEngine } from '../utils/SoundEngine';

export default function ArenaHeader({ participant }) {
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
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.8)'
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

      {/* LEFT: Single CODE MEETS AI Branding Identity */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 12px',
            background: 'rgba(0, 243, 255, 0.06)',
            border: '1px solid rgba(0, 243, 255, 0.25)',
            borderRadius: '2px',
            color: 'var(--cyan-glow)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8rem',
            letterSpacing: '0.12em',
            fontWeight: 700
          }}
        >
          <Terminal size={14} className="text-cyan-400" />
          <span>CODE MEETS AI</span>
        </div>
        <span className="status-beacon" />
      </div>

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
          textShadow: '0 0 12px var(--cyan-glow)'
        }}
      >
        <Cpu size={16} color="var(--cyan-glow)" />
        <span>EVENT ARENA</span>
      </div>

      {/* RIGHT: Participant Identity & SFX Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
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
            ROLL: {participant?.rollNumber || participant?.roll_number || 'N/A'}
          </span>
        </div>

        {/* Audio SFX Mute Toggle */}
        <button
          onClick={toggleSound}
          onMouseEnter={() => soundEngine.playHover()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(5, 10, 24, 0.8)',
            border: '1px solid rgba(0, 243, 255, 0.3)',
            color: muted ? '#6b7280' : 'var(--cyan-glow)',
            padding: '6px 12px',
            cursor: 'pointer',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            letterSpacing: '0.1em',
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
