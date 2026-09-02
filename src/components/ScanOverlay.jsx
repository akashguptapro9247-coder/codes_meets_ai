import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Terminal } from 'lucide-react';
import { soundEngine } from '../utils/SoundEngine';

export default function ScanOverlay({ currentStage, isLandingPage = false, showVignette = false, hideHeader = false }) {
  const [muted, setMuted] = useState(soundEngine.isMuted());
  const shouldRenderVignette = !isLandingPage && showVignette;

  useEffect(() => {
    setMuted(soundEngine.isMuted());
    const unsubscribe = soundEngine.subscribe((newMutedState) => {
      setMuted(newMutedState);
    });
    return unsubscribe;
  }, []);

  const toggleSound = () => {
    const isNowMuted = soundEngine.toggleMute();
    if (!isNowMuted) {
      soundEngine.playHover();
    }
  };

  return (
    <>
      {/* CRT Scanline & Vignette Effects */}
      <div className="crt-scanlines" />
      {shouldRenderVignette && <div className="cyber-vignette" />}

      {/* Cyber Corner HUD Brackets */}
      <div className="hud-corner hud-top-left" />
      <div className="hud-corner hud-top-right" />
      <div className="hud-corner hud-bottom-left" />
      <div className="hud-corner hud-bottom-right" />

      {/* TOP HEADER BAR */}
      {!hideHeader && (
        <header
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          padding: '24px 36px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 50,
          fontFamily: 'var(--font-mono)',
          fontSize: '0.8rem',
          pointerEvents: 'none'
        }}
      >
        {/* Top Left Branding */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', pointerEvents: 'auto' }}>
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
              letterSpacing: '0.12em',
              fontWeight: 700
            }}
          >
            <Terminal size={14} className="text-cyan-400" />
            <span>CODE MEETS AI</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#9ca3af' }}>
            <span className="status-beacon" />
          </div>
        </div>

        {/* Top Right: Audio Control */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', pointerEvents: 'auto' }}>
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
          >
            {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
            <span>{muted ? 'SFX: OFF' : 'SFX: ON'}</span>
          </button>
        </div>
      </header>
      )}

      {/* BOTTOM EVENT FOOTER */}
      <footer
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '36px',
          right: '36px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 30,
          fontFamily: 'var(--font-mono)',
          fontSize: '0.7rem',
          color: 'rgba(156, 163, 175, 0.45)',
          letterSpacing: '0.12em',
          pointerEvents: 'none'
        }}
      >
        <div style={{ textAlign: 'center' }}>
          CODE MEETS AI — TECHNICAL COMPETITION ARENA
        </div>
      </footer>
    </>
  );
}
