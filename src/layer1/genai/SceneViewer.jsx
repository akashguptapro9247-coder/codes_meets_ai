import React from 'react';
import { Brain, Sparkles, ShieldAlert } from 'lucide-react';

export default function SceneViewer({
  isTimeUp = false,
  submissionSuccess = false,
  existingSubmission = null
}) {
  const isSubmitted = Boolean(submissionSuccess || existingSubmission);
  const sessionColor = isTimeUp ? '#ef4444' : 'var(--lime-accent)';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        background: 'rgba(3, 7, 20, 0.85)',
        border: '1px solid rgba(0, 243, 255, 0.25)',
        borderRadius: '4px',
        padding: '16px',
        boxSizing: 'border-box',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {/* HUD Corner Brackets */}
      <div className="hud-corner hud-top-left" style={{ width: '12px', height: '12px' }} />
      <div className="hud-corner hud-top-right" style={{ width: '12px', height: '12px' }} />
      <div className="hud-corner hud-bottom-left" style={{ width: '12px', height: '12px' }} />
      <div className="hud-corner hud-bottom-right" style={{ width: '12px', height: '12px' }} />

      {/* A. PANEL HEADER */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '14px',
          paddingBottom: '10px',
          borderBottom: '1px solid rgba(0, 243, 255, 0.18)',
          flexShrink: 0
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={16} color="var(--cyan-glow)" />
          <span
            style={{
              fontFamily: 'var(--font-title)',
              fontSize: '0.78rem',
              color: 'var(--cyan-glow)',
              letterSpacing: '0.12em',
              fontWeight: 800
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
            border: '1px solid rgba(57, 255, 20, 0.3)',
            padding: '3px 9px',
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
              backgroundColor: sessionColor,
              boxShadow: `0 0 8px ${sessionColor}`,
              display: 'inline-block'
            }}
          />
          <span>PROJECTOR ACTIVE</span>
        </div>
      </div>

      {/* SCROLLABLE MAIN CONTENT CONTAINER */}
      <div
        style={{
          flex: 1,
          width: '100%',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          paddingRight: '4px',
          boxSizing: 'border-box'
        }}
      >
        {/* B. LARGE REFERENCE / MISSION DISPLAY SCREEN */}
        <div
          style={{
            position: 'relative',
            background: 'linear-gradient(135deg, rgba(2, 6, 22, 0.98) 0%, rgba(12, 22, 54, 0.95) 100%)',
            border: '1px solid rgba(0, 243, 255, 0.35)',
            boxShadow: '0 0 25px rgba(0, 243, 255, 0.12), inset 0 0 15px rgba(0, 243, 255, 0.05)',
            borderRadius: '4px',
            padding: '24px 16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            boxSizing: 'border-box',
            overflow: 'hidden',
            flexShrink: 0
          }}
        >
          {/* Cyber Screen Grid FX Overlay */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage:
                'linear-gradient(rgba(0, 243, 255, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 243, 255, 0.04) 1px, transparent 1px)',
              backgroundSize: '20px 20px',
              pointerEvents: 'none',
              zIndex: 1
            }}
          />

          <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* Glowing Icon Hub */}
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'rgba(0, 243, 255, 0.1)',
                border: '1px solid var(--cyan-glow)',
                boxShadow: '0 0 20px rgba(0, 243, 255, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '14px'
              }}
            >
              <Brain size={30} color="var(--cyan-glow)" />
            </div>

            {/* Main Challenge Phrase */}
            <h2
              style={{
                fontFamily: 'var(--font-title)',
                fontSize: '1.25rem',
                fontWeight: 900,
                color: '#ffffff',
                margin: '0 0 8px 0',
                letterSpacing: '0.12em',
                lineHeight: 1.25,
                textTransform: 'uppercase',
                textShadow: '0 0 15px rgba(0, 243, 255, 0.5)'
              }}
            >
              "YOUR MEMORY IS YOUR POWER"
            </h2>

            {/* Supporting Line */}
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.72rem',
                color: 'var(--cyan-glow)',
                letterSpacing: '0.18em',
                fontWeight: 700,
                background: 'rgba(0, 243, 255, 0.08)',
                border: '1px solid rgba(0, 243, 255, 0.25)',
                padding: '4px 12px',
                borderRadius: '2px'
              }}
            >
              RECALL // FORMULATE // RECONSTRUCT
            </div>
          </div>
        </div>

        {/* C. CHALLENGE ACTIVE STATE */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 14px',
            background: 'rgba(2, 6, 20, 0.9)',
            border: '1px solid rgba(0, 243, 255, 0.25)',
            borderRadius: '3px',
            flexShrink: 0
          }}
        >
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: '#9ca3af', letterSpacing: '0.1em' }}>
            STATUS READOUT:
          </span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.74rem',
              fontWeight: 800,
              color: isSubmitted ? 'var(--lime-accent)' : isTimeUp ? '#ef4444' : 'var(--cyan-glow)',
              letterSpacing: '0.12em'
            }}
          >
            {isSubmitted ? 'SUBMISSION RECORDED' : isTimeUp ? 'TIME EXPIRED' : 'CHALLENGE ACTIVE'}
          </span>
        </div>

        {/* D. MISSION DIRECTIVES SECTION */}
        <div
          style={{
            background: 'rgba(3, 8, 24, 0.9)',
            border: '1px solid rgba(0, 243, 255, 0.2)',
            borderRadius: '4px',
            padding: '14px',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-title)',
              fontSize: '0.78rem',
              fontWeight: 800,
              color: 'var(--cyan-glow)',
              letterSpacing: '0.12em',
              marginBottom: '2px'
            }}
          >
            MISSION DIRECTIVES
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.78rem', color: '#d1d5db', lineHeight: 1.4, fontFamily: 'var(--font-sub)' }}>
              <span style={{ color: 'var(--cyan-glow)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>•</span>
              <span>Observe the visual scene displayed on the lab projector screen.</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.78rem', color: '#d1d5db', lineHeight: 1.4, fontFamily: 'var(--font-sub)' }}>
              <span style={{ color: 'var(--cyan-glow)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>•</span>
              <span>Recall composition, lighting, camera angles, color palettes & cyberpunk motifs.</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.78rem', color: '#d1d5db', lineHeight: 1.4, fontFamily: 'var(--font-sub)' }}>
              <span style={{ color: 'var(--cyan-glow)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>•</span>
              <span>Formulate your reconstruction prompt and upload your output image assets.</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.78rem', color: '#d1d5db', lineHeight: 1.4, fontFamily: 'var(--font-sub)' }}>
              <span style={{ color: 'var(--cyan-glow)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>•</span>
              <span>Once submitted, your response is locked and sent for manual admin scoring.</span>
            </div>
          </div>
        </div>

        {/* E. ONE ATTEMPT ONLY FOOTER BADGE */}
        <div
          style={{
            marginTop: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '8px 12px',
            background: 'rgba(224, 38, 255, 0.08)',
            border: '1px solid rgba(224, 38, 255, 0.3)',
            borderRadius: '3px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.7rem',
            color: 'var(--magenta-glow)',
            letterSpacing: '0.14em',
            fontWeight: 800,
            textTransform: 'uppercase'
          }}
        >
          <ShieldAlert size={14} color="var(--magenta-glow)" />
          <span>ONE ATTEMPT ONLY // FINAL SUBMISSION LOCK</span>
        </div>
      </div>
    </div>
  );
}
