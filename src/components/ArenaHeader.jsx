import React, { useState, useEffect } from 'react';
import { Terminal, ShieldCheck, Volume2, VolumeX, Settings, Cpu } from 'lucide-react';
import { soundEngine } from '../utils/SoundEngine';

export default function ArenaHeader({ participant, onOpenAdmin }) {
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

      {/* RIGHT: Participant Identity, SFX Toggle & Admin Panel Button */}
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
            ROLL: {formatRoll(participant?.rollNumber)}
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
