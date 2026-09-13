import React, { useState, useRef, useEffect } from 'react';
import { Brain } from 'lucide-react';

const VIDEO_1_SRC = '/vedios/ironman_genai_1.0.mp4';
const VIDEO_2_SRC = '/vedios/ironman_genai_2.0.mp4';

export default function SceneViewer({
  isTimeUp = false,
  submissionSuccess = false,
  existingSubmission = null
}) {
  const isSubmitted = Boolean(submissionSuccess || existingSubmission);
  const sessionStatusText = isSubmitted ? 'SUBMITTED & LOCKED' : isTimeUp ? 'TIME EXPIRED' : 'CHALLENGE ACTIVE';

  // Track if we have transitioned to Video 2
  const [isVideo2Active, setIsVideo2Active] = useState(false);
  const video1Ref = useRef(null);
  const video2Ref = useRef(null);

  // Transition to Video 2 seamlessly when Video 1 finishes
  const handleVideo1Ended = () => {
    if (video2Ref.current) {
      video2Ref.current.play().catch((err) => {
        console.warn('[SceneViewer] Video 2 play error:', err);
      });
    }
    setIsVideo2Active(true);
  };

  // Initial mount: start Video 1 playback
  useEffect(() => {
    if (video1Ref.current) {
      video1Ref.current.play().catch((err) => {
        console.warn('[SceneViewer] Video 1 autoplay catch:', err);
      });
    }
  }, []);

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
        {/* Responsive Media Display Container */}
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
          {/* VIDEO 1: Plays once, preloaded, visible initially */}
          <video
            ref={video1Ref}
            src={VIDEO_1_SRC}
            autoPlay
            muted
            playsInline
            preload="auto"
            loop={false}
            onEnded={handleVideo1Ended}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
              userSelect: 'none',
              pointerEvents: 'none',
              display: isVideo2Active ? 'none' : 'block',
              zIndex: isVideo2Active ? 1 : 2
            }}
          />

          {/* VIDEO 2: Preloaded in background, loops continuously once started */}
          <video
            ref={video2Ref}
            src={VIDEO_2_SRC}
            muted
            playsInline
            preload="auto"
            loop={true}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
              userSelect: 'none',
              pointerEvents: 'none',
              display: 'block',
              zIndex: isVideo2Active ? 2 : 1
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
