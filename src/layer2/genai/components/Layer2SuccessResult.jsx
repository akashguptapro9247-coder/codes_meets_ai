import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Sparkles,
  Shield,
  Volume2,
  VolumeX,
  ArrowRight,
  FileText,
  FileBox,
  Clock,
  Layers,
  Users
} from 'lucide-react';
import { soundEngine } from '../../../shared/utils/SoundEngine';

export default function Layer2SuccessResult({
  participantInfo,
  question,
  explanation,
  loadedFile,
  assignment,
  onBack
}) {
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

  const handleReturnToArena = () => {
    soundEngine.playClick();
    if (onBack) {
      onBack();
      return;
    }
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', '/play');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const submittedAtFormatted = assignment?.submitted_at
    ? new Date(assignment.submitted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const fileName = loadedFile?.name || 'project_archive.zip';
  const fileSize = loadedFile?.size ? `${(loadedFile.size / 1024 / 1024).toFixed(2)} MB` : 'READY';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        position: 'relative',
        zIndex: 10,
        boxSizing: 'border-box'
      }}
    >
      {/* 1. TOP HEADER */}
      <header
        style={{
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 20px',
          borderBottom: '1px solid rgba(0, 243, 255, 0.25)',
          background: 'rgba(2, 6, 18, 0.92)',
          backdropFilter: 'blur(8px)',
          boxSizing: 'border-box',
          zIndex: 20,
          gap: '12px',
          height: '52px'
        }}
      >
        {/* Left: Branding */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Sparkles
            size={18}
            color="var(--cyan-glow)"
            style={{ filter: 'drop-shadow(0 0 6px var(--cyan-glow))' }}
          />
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
              CODE MEETS AI // STAGE 02
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
              LAYER 02 // GENAI TRACK
            </h1>
          </div>
        </div>

        {/* Center: Submission Locked Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '4px 12px',
            background: 'rgba(57, 255, 20, 0.12)',
            border: '1px solid rgba(57, 255, 20, 0.4)',
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
              boxShadow: '0 0 8px var(--lime-accent)'
            }}
          />
          <span>RESPONSE RECORDED // SUBMISSION LOCKED</span>
        </div>

        {/* Right: Operator Identity & SFX */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.72rem'
          }}
        >
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
              OPERATOR: <strong style={{ color: '#ffffff' }}>{participantInfo.name}</strong>
            </span>
            <span style={{ color: 'rgba(0, 243, 255, 0.4)' }}>|</span>
            <span style={{ color: 'var(--cyan-glow)' }}>ROLL: {participantInfo.rollNumber}</span>
          </div>

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
              padding: '5px 11px',
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

      {/* 2. MAIN RESULT CONTENT VIEWPORT */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px 20px',
          boxSizing: 'border-box',
          overflowY: 'auto'
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="cyber-card"
          style={{
            width: '100%',
            maxWidth: '740px',
            background: 'rgba(3, 8, 22, 0.96)',
            border: '1px solid rgba(57, 255, 20, 0.45)',
            boxShadow: '0 0 50px rgba(57, 255, 20, 0.15), inset 0 0 25px rgba(57, 255, 20, 0.04)',
            borderRadius: '4px',
            padding: '28px 32px',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            position: 'relative'
          }}
        >
          {/* HUD Corner Accents */}
          <div className="hud-corner hud-top-left" style={{ width: '12px', height: '12px', borderColor: 'var(--lime-accent)' }} />
          <div className="hud-corner hud-top-right" style={{ width: '12px', height: '12px', borderColor: 'var(--lime-accent)' }} />
          <div className="hud-corner hud-bottom-left" style={{ width: '12px', height: '12px', borderColor: 'var(--lime-accent)' }} />
          <div className="hud-corner hud-bottom-right" style={{ width: '12px', height: '12px', borderColor: 'var(--lime-accent)' }} />

          {/* Top Checkmark Icon Badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 220, damping: 16, delay: 0.1 }}
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(57, 255, 20, 0.12)',
              border: '2px solid var(--lime-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 30px rgba(57, 255, 20, 0.35)',
              marginBottom: '14px'
            }}
          >
            <CheckCircle2 size={36} color="var(--lime-accent)" />
          </motion.div>

          {/* Sub-tag */}
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.7rem',
              color: 'var(--cyan-glow)',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              marginBottom: '4px'
            }}
          >
            LAYER 02 // GENAI TRACK
          </div>

          {/* Main Title */}
          <h1
            style={{
              fontFamily: 'var(--font-title)',
              fontSize: '1.8rem',
              margin: '0 0 10px 0',
              color: '#ffffff',
              letterSpacing: '0.08em',
              textShadow: '0 0 20px rgba(57, 255, 20, 0.6), 0 0 40px rgba(0, 243, 255, 0.3)'
            }}
          >
            PROJECT SUBMITTED
          </h1>

          {/* Status Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '5px 14px',
              background: 'rgba(57, 255, 20, 0.12)',
              border: '1px solid rgba(57, 255, 20, 0.5)',
              borderRadius: '3px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.74rem',
              color: 'var(--lime-accent)',
              letterSpacing: '0.12em',
              fontWeight: 800,
              marginBottom: '20px'
            }}
          >
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: 'var(--lime-accent)',
                boxShadow: '0 0 8px var(--lime-accent)',
                animation: 'pulse 2s infinite'
              }}
            />
            <span>STATUS: UNDER EVALUATION</span>
          </div>

          {/* Received Components Checklist */}
          <div
            style={{
              width: '100%',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              marginBottom: '20px'
            }}
          >
            {/* Card 1: Technical Debrief */}
            <div
              style={{
                background: 'rgba(2, 6, 20, 0.85)',
                border: '1px solid rgba(57, 255, 20, 0.35)',
                borderRadius: '3px',
                padding: '12px 14px',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px'
              }}
            >
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: 'rgba(57, 255, 20, 0.15)',
                  border: '1px solid var(--lime-accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '2px'
                }}
              >
                <CheckCircle2 size={14} color="var(--lime-accent)" />
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.74rem',
                    color: 'var(--lime-accent)',
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    marginBottom: '2px'
                  }}
                >
                  TECHNICAL DEBRIEF
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.68rem',
                    color: '#9ca3af'
                  }}
                >
                  ✓ {explanation?.length || 0} characters recorded
                </div>
              </div>
            </div>

            {/* Card 2: Project Archive */}
            <div
              style={{
                background: 'rgba(2, 6, 20, 0.85)',
                border: '1px solid rgba(57, 255, 20, 0.35)',
                borderRadius: '3px',
                padding: '12px 14px',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px'
              }}
            >
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: 'rgba(57, 255, 20, 0.15)',
                  border: '1px solid var(--lime-accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '2px'
                }}
              >
                <CheckCircle2 size={14} color="var(--lime-accent)" />
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.74rem',
                    color: 'var(--lime-accent)',
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    marginBottom: '2px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  PROJECT ARCHIVE
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.68rem',
                    color: '#9ca3af',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  ✓ {fileName} ({fileSize})
                </div>
              </div>
            </div>
          </div>

          {/* Submission Details Metadata Grid */}
          <div
            style={{
              width: '100%',
              background: 'rgba(2, 6, 18, 0.7)',
              border: '1px solid rgba(0, 243, 255, 0.2)',
              borderRadius: '3px',
              padding: '12px 16px',
              boxSizing: 'border-box',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '12px',
              marginBottom: '18px',
              textAlign: 'left'
            }}
          >
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: '#9ca3af', letterSpacing: '0.1em' }}>
                OPERATOR NAME
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#ffffff', fontWeight: 700, marginTop: '2px' }}>
                {participantInfo.name}
              </div>
            </div>

            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: '#9ca3af', letterSpacing: '0.1em' }}>
                ROLL NUMBER
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--cyan-glow)', fontWeight: 700, marginTop: '2px' }}>
                {participantInfo.rollNumber}
              </div>
            </div>

            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: '#9ca3af', letterSpacing: '0.1em' }}>
                ASSIGNED TARGET
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--magenta-glow)', fontWeight: 700, marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={question?.title}>
                {question?.title || 'Web Application'}
              </div>
            </div>

            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: '#9ca3af', letterSpacing: '0.1em' }}>
                SUBMITTED AT
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--lime-accent)', fontWeight: 700, marginTop: '2px' }}>
                {submittedAtFormatted}
              </div>
            </div>
          </div>

          {/* DESK VERIFICATION NOTICE (Secondary Polished Card) */}
          <div
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, rgba(0, 243, 255, 0.06) 0%, rgba(2, 6, 20, 0.95) 100%)',
              border: '1px solid rgba(0, 243, 255, 0.35)',
              borderRadius: '3px',
              padding: '14px 20px',
              boxSizing: 'border-box',
              marginBottom: '22px',
              position: 'relative'
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-title)',
                fontSize: '0.84rem',
                color: 'var(--cyan-glow)',
                letterSpacing: '0.12em',
                fontWeight: 800,
                marginBottom: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <Users size={15} color="var(--cyan-glow)" />
              <span>DESK VERIFICATION</span>
            </div>

            <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '0.82rem',
                color: '#e5e7eb',
                lineHeight: 1.5,
                margin: '0 0 10px 0'
              }}
            >
              Please remain seated. Our team members will visit your desk shortly to verify your website and evaluate your implementation.
            </p>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(0, 243, 255, 0.08)',
                border: '1px solid rgba(0, 243, 255, 0.25)',
                borderRadius: '2px',
                padding: '3px 10px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.66rem',
                color: 'var(--cyan-glow)',
                letterSpacing: '0.08em'
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--cyan-glow)',
                  boxShadow: '0 0 6px var(--cyan-glow)',
                  animation: 'pulse 1.8s infinite'
                }}
              />
              <span>TEAM VERIFICATION PENDING</span>
            </div>
          </div>

          {/* Return to Arena Button */}
          <motion.button
            whileHover={{ scale: 1.02, boxShadow: '0 0 25px rgba(57, 255, 20, 0.4)' }}
            whileTap={{ scale: 0.98 }}
            onClick={handleReturnToArena}
            onMouseEnter={() => soundEngine.playHover()}
            className="cyber-btn"
            style={{
              padding: '11px 32px',
              fontSize: '0.84rem',
              letterSpacing: '0.12em',
              fontWeight: 800,
              borderColor: 'var(--lime-accent)',
              color: 'var(--lime-accent)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer'
            }}
          >
            <span>RETURN TO ARENA</span>
            <ArrowRight size={16} />
          </motion.button>
        </motion.div>
      </main>
    </div>
  );
}
