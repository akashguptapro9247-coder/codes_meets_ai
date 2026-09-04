import React from 'react';
import { motion } from 'framer-motion';
import {
  Brain,
  Activity,
  ShieldCheck,
  Wifi,
  HardDrive,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Layers,
  Repeat,
  FileCheck,
  Radio,
  Lock,
  Compass,
  Target
} from 'lucide-react';

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
  const isPromptReady = promptLength > 0;
  const isSubmitted = Boolean(submissionSuccess || existingSubmission);
  const isMissionReady = isPromptReady && isImageReady && !isTimeUp;

  let submissionLabel = 'IN PROGRESS';
  let submissionColor = '#f59e0b'; // Amber
  if (isSubmitting) {
    submissionLabel = 'DEPLOYING...';
    submissionColor = 'var(--cyan-glow)';
  } else if (isSubmitted) {
    submissionLabel = 'SUBMITTED & LOCKED';
    submissionColor = 'var(--lime-accent)';
  }

  const sessionLabel = isTimeUp ? 'EXPIRED' : 'ACTIVE';
  const sessionColor = isTimeUp ? '#ef4444' : 'var(--lime-accent)';

  // Mission progression steps (The "Game Loop")
  const workflowSteps = [
    { id: 1, label: 'BRIEFING', done: true, current: false },
    { id: 2, label: 'EXPERIMENT (∞)', done: true, current: !isSubmitted },
    { id: 3, label: 'FINAL PROMPT', done: isPromptReady, current: !isPromptReady && !isSubmitted },
    { id: 4, label: 'FINAL ASSET', done: isImageReady, current: isPromptReady && !isImageReady && !isSubmitted },
    { id: 5, label: 'VALIDATION', done: isMissionReady || isSubmitted, current: isPromptReady && isImageReady && !isSubmitted },
    { id: 6, label: 'DEPLOYMENT', done: isSubmitted, current: false }
  ];

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
        padding: '14px',
        boxSizing: 'border-box',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {/* HUD Corner Brackets */}
      <div className="hud-corner hud-top-left" style={{ width: '10px', height: '10px' }} />
      <div className="hud-corner hud-top-right" style={{ width: '10px', height: '10px' }} />
      <div className="hud-corner hud-bottom-left" style={{ width: '10px', height: '10px' }} />
      <div className="hud-corner hud-bottom-right" style={{ width: '10px', height: '10px' }} />

      {/* Top Section Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '10px',
          paddingBottom: '8px',
          borderBottom: '1px solid rgba(0, 243, 255, 0.15)',
          flexShrink: 0
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
            MISSION CONTROL // TACTICAL INTEL
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
          <span>PROJECTOR SCENE ACTIVE</span>
        </div>
      </div>

      {/* Main Scrollable Intel Stack Container */}
      <div
        style={{
          flex: 1,
          width: '100%',
          background: 'linear-gradient(135deg, rgba(2, 6, 20, 0.98) 0%, rgba(10, 18, 45, 0.95) 100%)',
          border: '1px solid rgba(0, 243, 255, 0.25)',
          borderRadius: '4px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          padding: '14px',
          boxSizing: 'border-box',
          gap: '12px',
          position: 'relative'
        }}
      >
        {/* Cyber Grid Overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(rgba(0, 243, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 243, 255, 0.03) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
            pointerEvents: 'none',
            zIndex: 1
          }}
        />

        <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', gap: '12px' }}>
          
          {/* CARD 1: MISSION TITLE & RECONSTRUCTION OBJECTIVE */}
          <div
            style={{
              background: 'rgba(3, 8, 24, 0.9)',
              border: '1px solid rgba(0, 243, 255, 0.25)',
              borderRadius: '4px',
              padding: '12px',
              boxSizing: 'border-box'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '6px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Target size={14} color="var(--cyan-glow)" />
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.68rem',
                    color: 'var(--cyan-glow)',
                    letterSpacing: '0.12em',
                    fontWeight: 800
                  }}
                >
                  MISSION OBJECTIVE // STAGE 01
                </span>
              </div>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6rem',
                  color: 'var(--lime-accent)',
                  background: 'rgba(57, 255, 20, 0.1)',
                  padding: '2px 6px',
                  borderRadius: '2px'
                }}
              >
                PROMPT ENGINEERING
              </span>
            </div>

            <h3
              style={{
                fontFamily: 'var(--font-title)',
                fontSize: '0.95rem',
                color: '#ffffff',
                margin: '0 0 6px 0',
                letterSpacing: '0.08em',
                lineHeight: 1.25,
                textShadow: '0 0 10px rgba(0, 243, 255, 0.4)'
              }}
            >
              "YOUR MEMORY IS YOUR POWER"
            </h3>

            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.78rem',
                color: '#9ca3af',
                lineHeight: 1.45,
                margin: 0
              }}
            >
              Observe the target reference scene on the arena projector. Formulate a precise prompt, iterate freely using authorized AI tools, and submit your exact final prompt alongside your best generated asset.
            </p>
          </div>

          {/* CARD 2: COMPETITION DIRECTIVES & RULES */}
          <div
            style={{
              background: 'rgba(3, 8, 24, 0.9)',
              border: '1px solid rgba(0, 243, 255, 0.2)',
              borderRadius: '4px',
              padding: '12px',
              boxSizing: 'border-box'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <Compass size={14} color="var(--magenta-glow)" />
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.68rem',
                  color: 'var(--magenta-glow)',
                  letterSpacing: '0.12em',
                  fontWeight: 800
                }}
              >
                TACTICAL DIRECTIVES & RULES
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.7rem',
                  color: '#d1d5db'
                }}
              >
                <span
                  style={{
                    color: 'var(--lime-accent)',
                    fontWeight: 700,
                    background: 'rgba(57, 255, 20, 0.12)',
                    padding: '1px 5px',
                    borderRadius: '2px',
                    fontSize: '0.62rem',
                    flexShrink: 0
                  }}
                >
                  [ ∞ PERMITTED ]
                </span>
                <span>
                  <strong>UNLIMITED GENERATIONS:</strong> Experiment with as many prompts and image runs as needed in ChatGPT / Gemini.
                </span>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.7rem',
                  color: '#d1d5db'
                }}
              >
                <span
                  style={{
                    color: 'var(--magenta-glow)',
                    fontWeight: 700,
                    background: 'rgba(224, 38, 255, 0.12)',
                    padding: '1px 5px',
                    borderRadius: '2px',
                    fontSize: '0.62rem',
                    flexShrink: 0
                  }}
                >
                  [ 01 / 01 LOCK ]
                </span>
                <span>
                  <strong>SINGLE SUBMISSION ATTEMPT:</strong> When satisfied, lock your final selected prompt + final asset pair.
                </span>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.7rem',
                  color: '#d1d5db'
                }}
              >
                <span
                  style={{
                    color: 'var(--cyan-glow)',
                    fontWeight: 700,
                    background: 'rgba(0, 243, 255, 0.12)',
                    padding: '1px 5px',
                    borderRadius: '2px',
                    fontSize: '0.62rem',
                    flexShrink: 0
                  }}
                >
                  [ PAIR MATCH ]
                </span>
                <span>
                  <strong>EXACT PAIRING REQUIRED:</strong> The submitted prompt must be the complete final prompt used to create the uploaded image.
                </span>
              </div>
            </div>
          </div>

          {/* CARD 3: MISSION GAME LOOP PROGRESSION */}
          <div
            style={{
              background: 'rgba(3, 8, 24, 0.9)',
              border: '1px solid rgba(0, 243, 255, 0.2)',
              borderRadius: '4px',
              padding: '12px',
              boxSizing: 'border-box'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Repeat size={14} color="var(--cyan-glow)" />
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.68rem',
                    color: 'var(--cyan-glow)',
                    letterSpacing: '0.12em',
                    fontWeight: 800
                  }}
                >
                  MISSION PROGRESSION LOOP
                </span>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: '#9ca3af' }}>
                STAGE STATUS
              </span>
            </div>

            {/* Workflow Step Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '6px'
              }}
            >
              {workflowSteps.map((step) => (
                <div
                  key={step.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '6px 4px',
                    background: step.done
                      ? 'rgba(57, 255, 20, 0.08)'
                      : step.current
                      ? 'rgba(0, 243, 255, 0.12)'
                      : 'rgba(2, 6, 18, 0.6)',
                    border: step.done
                      ? '1px solid rgba(57, 255, 20, 0.3)'
                      : step.current
                      ? '1px solid var(--cyan-glow)'
                      : '1px solid rgba(0, 243, 255, 0.12)',
                    borderRadius: '2px',
                    textAlign: 'center'
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.6rem',
                      fontWeight: 800,
                      color: step.done ? 'var(--lime-accent)' : step.current ? 'var(--cyan-glow)' : '#6b7280'
                    }}
                  >
                    {step.done ? '✓' : step.current ? '●' : '○'} {step.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CARD 4: LIVE TELEMETRY READOUT */}
          <div
            style={{
              background: 'rgba(3, 8, 24, 0.9)',
              border: '1px solid rgba(0, 243, 255, 0.2)',
              borderRadius: '4px',
              padding: '12px',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Activity size={14} color="var(--cyan-glow)" />
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.68rem',
                    color: 'var(--cyan-glow)',
                    letterSpacing: '0.12em',
                    fontWeight: 800
                  }}
                >
                  LIVE SYSTEM TELEMETRY
                </span>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--lime-accent)' }}>
                SYS // ACTIVE
              </span>
            </div>

            {/* ROW 1: SESSION */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>
              <span style={{ color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={12} color="var(--cyan-glow)" /> SESSION
              </span>
              <span style={{ color: sessionColor, fontWeight: 700 }}>{sessionLabel}</span>
            </div>

            {/* ROW 2: EXPERIMENTATION RUNS */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>
              <span style={{ color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={12} color="var(--lime-accent)" /> EXPERIMENTATION
              </span>
              <span style={{ color: 'var(--lime-accent)', fontWeight: 700 }}>UNLIMITED (∞)</span>
            </div>

            {/* ROW 3: FINAL PROMPT LENGTH */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>
              <span style={{ color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <HardDrive size={12} color="var(--cyan-glow)" /> PROMPT COUNTER
              </span>
              <span style={{ color: promptLength > 0 ? 'var(--cyan-glow)' : '#9ca3af', fontWeight: 700 }}>
                {promptLength} / 2000 CHARS
              </span>
            </div>

            {/* ROW 4: FINAL IMAGE STATUS */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>
              <span style={{ color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {isImageReady ? <CheckCircle2 size={12} color="var(--lime-accent)" /> : <AlertCircle size={12} color="#f59e0b" />} IMAGE ASSET
              </span>
              <span style={{ color: isImageReady ? 'var(--lime-accent)' : '#f59e0b', fontWeight: 700 }}>
                {isImageReady ? '1 / 1 ATTACHED' : '0 / 1 ATTACHED'}
              </span>
            </div>

            {/* ROW 5: SUBMISSION ATTEMPT LOCK */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>
              <span style={{ color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Lock size={12} color="var(--magenta-glow)" /> ATTEMPT LOCK
              </span>
              <span style={{ color: 'var(--magenta-glow)', fontWeight: 700 }}>01 / 01 SUBMISSION</span>
            </div>
          </div>

          {/* CARD 5: PRE-FLIGHT MISSION READINESS CHECKLIST */}
          <div
            style={{
              background: isMissionReady
                ? 'rgba(57, 255, 20, 0.08)'
                : 'rgba(3, 8, 24, 0.9)',
              border: isMissionReady
                ? '1px solid rgba(57, 255, 20, 0.4)'
                : '1px solid rgba(0, 243, 255, 0.2)',
              borderRadius: '4px',
              padding: '12px',
              boxSizing: 'border-box'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FileCheck size={14} color={isMissionReady ? 'var(--lime-accent)' : 'var(--cyan-glow)'} />
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.68rem',
                    color: isMissionReady ? 'var(--lime-accent)' : 'var(--cyan-glow)',
                    letterSpacing: '0.12em',
                    fontWeight: 800
                  }}
                >
                  PRE-FLIGHT READINESS CHECK
                </span>
              </div>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  color: isMissionReady ? 'var(--lime-accent)' : '#f59e0b'
                }}
              >
                {isMissionReady ? '100% READY' : 'INCOMPLETE'}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.66rem', color: isPromptReady ? 'var(--lime-accent)' : '#9ca3af' }}>
                {isPromptReady ? '✓ PROMPT ENTERED' : '○ PROMPT REQUIRED'}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.66rem', color: isImageReady ? 'var(--lime-accent)' : '#9ca3af' }}>
                {isImageReady ? '✓ IMAGE ATTACHED' : '○ IMAGE REQUIRED'}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.66rem', color: !isTimeUp ? 'var(--lime-accent)' : '#ef4444' }}>
                {!isTimeUp ? '✓ TIMER ACTIVE' : '✕ TIME EXPIRED'}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.66rem', color: !isSubmitted ? 'var(--lime-accent)' : '#9ca3af' }}>
                {!isSubmitted ? '✓ SUBMISSION OPEN' : '🔒 LOCKED'}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
