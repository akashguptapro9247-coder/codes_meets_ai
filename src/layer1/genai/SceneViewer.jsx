import React from 'react';
import { Brain } from 'lucide-react';

export default function SceneViewer({
  isTimeUp = false,
  submissionSuccess = false,
  existingSubmission = null
}) {
  const isSubmitted = Boolean(submissionSuccess || existingSubmission);
  const sessionStatusText = isSubmitted ? 'SUBMITTED & LOCKED' : isTimeUp ? 'TIME EXPIRED' : 'CHALLENGE ACTIVE';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        background: 'rgba(4, 9, 24, 0.95)',
        border: '1px solid rgba(0, 243, 255, 0.3)',
        borderRadius: '2px',
        padding: '16px',
        boxSizing: 'border-box',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {/* Four HUD Corner Brackets */}
      <div className="hud-corner hud-top-left" style={{ width: '10px', height: '10px' }} />
      <div className="hud-corner hud-top-right" style={{ width: '10px', height: '10px' }} />
      <div className="hud-corner hud-bottom-left" style={{ width: '10px', height: '10px' }} />
      <div className="hud-corner hud-bottom-right" style={{ width: '10px', height: '10px' }} />

      {/* 1. PANEL HEADER */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px',
          flexShrink: 0
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Brain size={17} color="var(--cyan-glow)" />
          <span
            style={{
              fontFamily: 'var(--font-title)',
              fontSize: '0.82rem',
              fontWeight: 900,
              color: 'var(--cyan-glow)',
              letterSpacing: '0.12em'
            }}
          >
            GENAI CHALLENGE // MEMORY RECONSTRUCTION
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(57, 255, 20, 0.08)',
            border: '1px solid rgba(57, 255, 20, 0.4)',
            padding: '2px 8px',
            borderRadius: '2px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.62rem',
            color: 'var(--lime-accent)',
            letterSpacing: '0.1em'
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: 'var(--lime-accent)',
              boxShadow: '0 0 8px var(--lime-accent)',
              display: 'inline-block'
            }}
          />
          <span>PROJECTOR ACTIVE</span>
        </div>
      </div>

      {/* 2. LARGE CENTRAL REFERENCE / MISSION DISPLAY SCREEN CONTAINER */}
      <div
        style={{
          flex: 1,
          width: '100%',
          position: 'relative',
          background: 'linear-gradient(180deg, rgba(2, 6, 20, 0.98) 0%, rgba(5, 12, 32, 0.98) 100%)',
          border: '1px solid rgba(0, 243, 255, 0.25)',
          borderRadius: '2px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          boxSizing: 'border-box',
          overflow: 'hidden',
          marginBottom: '14px'
        }}
      >
        {/* Responsive Image Display Container */}
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            width: '100%',
            height: 'calc(100% - 32px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0',
            boxSizing: 'border-box',
            overflow: 'hidden',
            background: '#000000'
          }}
        >
          <img
            src="/assets/layer1_genai_reference.jpg"
            alt="GENAI MEMORY RECONSTRUCTION REFERENCE"
            style={{
              width: '100%',
              height: '100%',
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
              objectPosition: 'center',
              userSelect: 'none',
              pointerEvents: 'none',
              display: 'block'
            }}
          />
        </div>

        {/* Bottom Full-Width Challenge Status Bar inside Grid Screen */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '32px',
            background: 'rgba(2, 6, 18, 0.95)',
            borderTop: '1px solid rgba(0, 243, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 3
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.68rem',
              color: 'var(--cyan-glow)',
              letterSpacing: '0.15em',
              fontWeight: 800
            }}
          >
            {sessionStatusText}
          </span>
        </div>
      </div>

      {/* 3. MISSION DIRECTIVES SECTION AT BOTTOM */}
      <div style={{ flexShrink: 0 }}>
        {/* Directives Header & One Attempt Only Badge */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span
            style={{
              fontFamily: 'var(--font-title)',
              fontSize: '0.74rem',
              fontWeight: 900,
              color: 'var(--cyan-glow)',
              letterSpacing: '0.12em'
            }}
          >
            MISSION DIRECTIVES:
          </span>

          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.64rem',
              color: 'var(--lime-accent)',
              letterSpacing: '0.1em',
              fontWeight: 700
            }}
          >
            ONE ATTEMPT ONLY
          </span>
        </div>

        {/* Bulleted List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.74rem', color: '#9ca3af', lineHeight: 1.35, fontFamily: 'var(--font-mono)' }}>
            <span style={{ color: 'var(--cyan-glow)' }}>•</span>
            <span>Observe the visual scene displayed on the lab projector screen.</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.74rem', color: '#9ca3af', lineHeight: 1.35, fontFamily: 'var(--font-mono)' }}>
            <span style={{ color: 'var(--cyan-glow)' }}>•</span>
            <span>Recall composition, lighting, camera angles, color palettes & cyberpunk motifs.</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.74rem', color: '#9ca3af', lineHeight: 1.35, fontFamily: 'var(--font-mono)' }}>
            <span style={{ color: 'var(--cyan-glow)' }}>•</span>
            <span>Formulate your reconstruction prompt and upload your output image assets.</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.74rem', color: '#9ca3af', lineHeight: 1.35, fontFamily: 'var(--font-mono)' }}>
            <span style={{ color: 'var(--cyan-glow)' }}>•</span>
            <span>Once submitted, your response is locked and sent for manual admin scoring.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
