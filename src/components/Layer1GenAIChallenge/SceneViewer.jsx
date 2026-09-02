import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Activity, ShieldCheck, Wifi, HardDrive, CheckCircle2, AlertCircle } from 'lucide-react';

export default function SceneViewer({
  prompt = '',
  images = [],
  submissionSuccess = false,
  existingSubmission = null,
  isSubmitting = false,
  isTimeUp = false
}) {
  const promptLength = typeof prompt === 'string' ? prompt.length : 0;
  const isImageReady = Array.isArray(images) && images.length > 0;
  const isSubmitted = Boolean(submissionSuccess || existingSubmission);
  
  let submissionLabel = 'PENDING';
  let submissionColor = '#f59e0b'; // Amber
  if (isSubmitting) {
    submissionLabel = 'UPLOADING';
    submissionColor = 'var(--cyan-glow)';
  } else if (isSubmitted) {
    submissionLabel = 'SUBMITTED';
    submissionColor = 'var(--lime-accent)';
  }

  const sessionLabel = isTimeUp ? 'EXPIRED' : 'ACTIVE';
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
        borderRadius: '3px',
        padding: '14px',
        boxSizing: 'border-box',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {/* Corner Brackets */}
      <div className="hud-corner hud-top-left" style={{ width: '10px', height: '10px' }} />
      <div className="hud-corner hud-top-right" style={{ width: '10px', height: '10px' }} />
      <div className="hud-corner hud-bottom-left" style={{ width: '10px', height: '10px' }} />
      <div className="hud-corner hud-bottom-right" style={{ width: '10px', height: '10px' }} />

      {/* Section Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px',
          paddingBottom: '8px',
          borderBottom: '1px solid rgba(0, 243, 255, 0.15)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Brain size={16} color="var(--cyan-glow)" />
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.74rem',
              color: 'var(--cyan-glow)',
              letterSpacing: '0.15em',
              fontWeight: 800
            }}
          >
            GENAI CHALLENGE // LIVE TELEMETRY
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(57, 255, 20, 0.08)',
            border: '1px solid rgba(57, 255, 20, 0.3)',
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
              backgroundColor: sessionColor,
              boxShadow: `0 0 8px ${sessionColor}`,
              display: 'inline-block'
            }}
          />
          <span>PROJECTOR ACTIVE</span>
        </div>
      </div>

      {/* Main Cohesive Telemetry HUD Container */}
      <div
        style={{
          position: 'relative',
          flex: 1,
          width: '100%',
          background: 'linear-gradient(135deg, rgba(2, 6, 20, 0.98) 0%, rgba(10, 18, 45, 0.95) 100%)',
          border: '1px solid rgba(0, 243, 255, 0.3)',
          borderRadius: '4px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          padding: '16px',
          boxSizing: 'border-box'
        }}
      >
        {/* Subtle Cyber Grid Background Overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(rgba(0, 243, 255, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 243, 255, 0.04) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
            pointerEvents: 'none',
            zIndex: 1
          }}
        />

        {/* Ambient Radial Halos */}
        <div
          style={{
            position: 'absolute',
            top: '10%',
            left: '20%',
            width: '200px',
            height: '200px',
            background: 'radial-gradient(circle, rgba(0, 243, 255, 0.1) 0%, transparent 70%)',
            pointerEvents: 'none',
            zIndex: 1
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '10%',
            right: '15%',
            width: '220px',
            height: '220px',
            background: 'radial-gradient(circle, rgba(224, 38, 255, 0.1) 0%, transparent 70%)',
            pointerEvents: 'none',
            zIndex: 1
          }}
        />

        {/* Animated HUD Scanline */}
        <motion.div
          animate={{ y: ['0%', '400%', '0%'] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            height: '2px',
            background: 'linear-gradient(90deg, transparent, rgba(0, 243, 255, 0.7), transparent)',
            boxShadow: '0 0 10px rgba(0, 243, 255, 0.8)',
            pointerEvents: 'none',
            zIndex: 2
          }}
        />

        {/* Content Stack */}
        <div style={{ position: 'relative', zIndex: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
          
          {/* SLOGAN SECTION */}
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <h2
              style={{
                fontFamily: 'var(--font-title)',
                fontSize: '1.2rem',
                letterSpacing: '0.14em',
                margin: 0,
                color: '#ffffff',
                textShadow: '0 0 16px rgba(0, 243, 255, 0.5), 0 0 30px rgba(224, 38, 255, 0.3)',
                lineHeight: 1.3
              }}
            >
              "YOUR MEMORY IS YOUR POWER"
            </h2>

            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.68rem',
                color: '#9ca3af',
                letterSpacing: '0.14em',
                marginTop: '4px'
              }}
            >
              RECALL // FORMULATE // RECONSTRUCT
            </div>
          </div>

          {/* HUD DIVIDER WITH PULSE NODE */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '16px'
            }}
          >
            <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(0, 243, 255, 0.4))' }} />
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '2px 8px',
                background: 'rgba(0, 243, 255, 0.08)',
                border: '1px solid rgba(0, 243, 255, 0.3)',
                borderRadius: '2px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.62rem',
                color: 'var(--cyan-glow)',
                letterSpacing: '0.12em'
              }}
            >
              <Activity size={12} color="var(--cyan-glow)" />
              <span>LIVE TELEMETRY</span>
            </div>
            <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(0, 243, 255, 0.4), transparent)' }} />
          </div>

          {/* TELEMETRY DATA PANEL */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              background: 'rgba(3, 8, 24, 0.75)',
              border: '1px solid rgba(0, 243, 255, 0.2)',
              borderRadius: '3px',
              padding: '14px',
              gap: '10px'
            }}
          >
            {/* ROW 1: SESSION */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '0.72rem' }}>
              <span style={{ color: '#9ca3af', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={13} color="var(--cyan-glow)" />
                SESSION
              </span>
              <span style={{ color: 'rgba(0, 243, 255, 0.25)', flex: 1, margin: '0 8px', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                ................................................................
              </span>
              <span
                style={{
                  color: sessionColor,
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  background: `${sessionColor}15`,
                  border: `1px solid ${sessionColor}40`,
                  padding: '2px 8px',
                  borderRadius: '2px'
                }}
              >
                {sessionLabel}
              </span>
            </div>

            {/* ROW 2: PROMPT */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '0.72rem' }}>
              <span style={{ color: '#9ca3af', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <HardDrive size={13} color="var(--cyan-glow)" />
                PROMPT
              </span>
              <span style={{ color: 'rgba(0, 243, 255, 0.25)', flex: 1, margin: '0 8px', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                ................................................................
              </span>
              <span
                style={{
                  color: promptLength > 0 ? 'var(--cyan-glow)' : '#9ca3af',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  background: 'rgba(0, 243, 255, 0.08)',
                  border: '1px solid rgba(0, 243, 255, 0.25)',
                  padding: '2px 8px',
                  borderRadius: '2px'
                }}
              >
                {promptLength} / 2000
              </span>
            </div>

            {/* ROW 3: IMAGE */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '0.72rem' }}>
              <span style={{ color: '#9ca3af', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {isImageReady ? <CheckCircle2 size={13} color="var(--lime-accent)" /> : <AlertCircle size={13} color="#f59e0b" />}
                IMAGE
              </span>
              <span style={{ color: 'rgba(0, 243, 255, 0.25)', flex: 1, margin: '0 8px', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                ................................................................
              </span>
              <span
                style={{
                  color: isImageReady ? 'var(--lime-accent)' : '#f59e0b',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  background: isImageReady ? 'rgba(57, 255, 20, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                  border: isImageReady ? '1px solid rgba(57, 255, 20, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)',
                  padding: '2px 8px',
                  borderRadius: '2px'
                }}
              >
                {isImageReady ? 'READY' : 'NOT READY'}
              </span>
            </div>

            {/* ROW 4: CONNECTION */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '0.72rem' }}>
              <span style={{ color: '#9ca3af', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Wifi size={13} color="var(--lime-accent)" />
                CONNECTION
              </span>
              <span style={{ color: 'rgba(0, 243, 255, 0.25)', flex: 1, margin: '0 8px', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                ................................................................
              </span>
              <span
                style={{
                  color: 'var(--lime-accent)',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  background: 'rgba(57, 255, 20, 0.08)',
                  border: '1px solid rgba(57, 255, 20, 0.3)',
                  padding: '2px 8px',
                  borderRadius: '2px'
                }}
              >
                STABLE
              </span>
            </div>

            {/* ROW 5: SUBMISSION */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '0.72rem' }}>
              <span style={{ color: '#9ca3af', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Activity size={13} color={submissionColor} />
                SUBMISSION
              </span>
              <span style={{ color: 'rgba(0, 243, 255, 0.25)', flex: 1, margin: '0 8px', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                ................................................................
              </span>
              <span
                style={{
                  color: submissionColor,
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  background: `${submissionColor}15`,
                  border: `1px solid ${submissionColor}40`,
                  padding: '2px 8px',
                  borderRadius: '2px'
                }}
              >
                {submissionLabel}
              </span>
            </div>

            {/* ROW 6: ATTEMPT */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '0.72rem' }}>
              <span style={{ color: '#9ca3af', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Brain size={13} color="var(--magenta-glow)" />
                ATTEMPT
              </span>
              <span style={{ color: 'rgba(0, 243, 255, 0.25)', flex: 1, margin: '0 8px', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                ................................................................
              </span>
              <span
                style={{
                  color: 'var(--magenta-glow)',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  background: 'rgba(224, 38, 255, 0.1)',
                  border: '1px solid rgba(224, 38, 255, 0.3)',
                  padding: '2px 8px',
                  borderRadius: '2px'
                }}
              >
                01 / 01
              </span>
            </div>

            {/* GAMIFIED LED STATUS BAR & TELEMETRY PROGRESS */}
            <div
              style={{
                marginTop: '10px',
                paddingTop: '10px',
                borderTop: '1px solid rgba(0, 243, 255, 0.15)',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'rgba(0, 243, 255, 0.7)' }}>
                <span>TELEMETRY METRICS</span>
                <span>SYS // OK</span>
              </div>
              <div style={{ display: 'flex', gap: '4px', height: '6px' }}>
                {[...Array(12)].map((_, i) => {
                  const isActive = i < (isSubmitted ? 12 : isImageReady ? 8 : promptLength > 0 ? 5 : 3);
                  const isMagenta = i >= 8;
                  return (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        height: '100%',
                        borderRadius: '1px',
                        background: isActive
                          ? isMagenta
                            ? 'var(--magenta-glow)'
                            : 'var(--cyan-glow)'
                          : 'rgba(0, 243, 255, 0.12)',
                        boxShadow: isActive
                          ? isMagenta
                            ? '0 0 6px var(--magenta-glow)'
                            : '0 0 6px var(--cyan-glow)'
                          : 'none',
                        transition: 'all 0.3s ease'
                      }}
                    />
                  );
                })}
              </div>
            </div>

          </div>

          {/* BOTTOM FOOTER STATUS BAR */}
          <div
            style={{
              marginTop: '12px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '6px 10px',
              background: 'rgba(2, 6, 18, 0.85)',
              border: '1px solid rgba(0, 243, 255, 0.25)',
              borderRadius: '2px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.64rem',
              color: 'var(--cyan-glow)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--cyan-glow)',
                  boxShadow: '0 0 6px var(--cyan-glow)'
                }}
              />
              <span>HUD SYNCED</span>
            </div>
            <span style={{ color: 'rgba(0, 243, 255, 0.5)', letterSpacing: '0.1em' }}>
              ARENA ID // L1-GENAI
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}
