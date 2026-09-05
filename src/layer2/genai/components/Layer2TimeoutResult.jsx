import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldAlert,
  Sparkles,
  Shield,
  Volume2,
  VolumeX,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
  Lock
} from 'lucide-react';
import { soundEngine } from '../../../shared/utils/SoundEngine';

export default function Layer2TimeoutResult({
  participantInfo,
  question,
  hasValidExplanation,
  hasFile,
  explanationLength = 0,
  fileName = '',
  fileSize = '',
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

  const isNoSubmission = !hasValidExplanation && !hasFile;
  const finalStatusText = isNoSubmission ? 'NO SUBMISSION RECEIVED' : 'INCOMPLETE SUBMISSION';

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
          borderBottom: '1px solid rgba(239, 68, 68, 0.3)',
          background: 'rgba(12, 4, 8, 0.92)',
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
            color="#ef4444"
            style={{ filter: 'drop-shadow(0 0 6px #ef4444)' }}
          />
          <div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.62rem',
                color: 'rgba(239, 68, 68, 0.7)',
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
                textShadow: '0 0 12px rgba(239, 68, 68, 0.6)'
              }}
            >
              LAYER 02 // GENAI TRACK
            </h1>
          </div>
        </div>

        {/* Center: Time Expired Locked Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '4px 12px',
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            borderRadius: '2px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.7rem',
            letterSpacing: '0.12em',
            color: '#ef4444'
          }}
        >
          <Lock size={12} color="#ef4444" />
          <span>CHALLENGE CLOSED // TIME EXPIRED</span>
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
              background: 'rgba(18, 4, 8, 0.9)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              borderRadius: '2px',
              color: '#d1d5db'
            }}
          >
            <Shield size={13} color="#ef4444" />
            <span>
              OPERATOR: <strong style={{ color: '#ffffff' }}>{participantInfo.name}</strong>
            </span>
            <span style={{ color: 'rgba(239, 68, 68, 0.4)' }}>|</span>
            <span style={{ color: 'var(--cyan-glow)' }}>ROLL: {participantInfo.rollNumber}</span>
          </div>

          <button
            onClick={toggleSound}
            onMouseEnter={() => soundEngine.playHover()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(18, 4, 8, 0.8)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: muted ? '#6b7280' : '#ef4444',
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
            background: 'rgba(16, 4, 8, 0.96)',
            border: '1px solid rgba(239, 68, 68, 0.5)',
            boxShadow: '0 0 50px rgba(239, 68, 68, 0.2), inset 0 0 25px rgba(239, 68, 68, 0.05)',
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
          <div className="hud-corner hud-top-left" style={{ width: '12px', height: '12px', borderColor: '#ef4444' }} />
          <div className="hud-corner hud-top-right" style={{ width: '12px', height: '12px', borderColor: '#ef4444' }} />
          <div className="hud-corner hud-bottom-left" style={{ width: '12px', height: '12px', borderColor: '#ef4444' }} />
          <div className="hud-corner hud-bottom-right" style={{ width: '12px', height: '12px', borderColor: '#ef4444' }} />

          {/* Top Shield Alert Icon Badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 220, damping: 16, delay: 0.1 }}
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '2px solid #ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 30px rgba(239, 68, 68, 0.4)',
              marginBottom: '14px'
            }}
          >
            <ShieldAlert size={36} color="#ef4444" />
          </motion.div>

          {/* Sub-tag */}
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.7rem',
              color: '#f59e0b',
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
              textShadow: '0 0 20px rgba(239, 68, 68, 0.7), 0 0 40px rgba(245, 158, 11, 0.3)'
            }}
          >
            TIME EXPIRED
          </h1>

          {/* Final Status Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '5px 14px',
              background: isNoSubmission ? 'rgba(239, 68, 68, 0.12)' : 'rgba(245, 158, 11, 0.12)',
              border: isNoSubmission ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid rgba(245, 158, 11, 0.5)',
              borderRadius: '3px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.74rem',
              color: isNoSubmission ? '#ef4444' : '#f59e0b',
              letterSpacing: '0.12em',
              fontWeight: 800,
              marginBottom: '20px'
            }}
          >
            <Lock size={13} color={isNoSubmission ? '#ef4444' : '#f59e0b'} />
            <span>FINAL STATUS: {finalStatusText}</span>
          </div>

          {/* Submission Status Breakdown Checklist */}
          <div
            style={{
              width: '100%',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              marginBottom: '20px'
            }}
          >
            {/* Component 1: Technical Debrief */}
            <div
              style={{
                background: 'rgba(10, 2, 4, 0.85)',
                border: hasValidExplanation
                  ? '1px solid rgba(57, 255, 20, 0.4)'
                  : '1px solid rgba(239, 68, 68, 0.4)',
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
                  background: hasValidExplanation ? 'rgba(57, 255, 20, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  border: hasValidExplanation ? '1px solid var(--lime-accent)' : '1px solid #ef4444',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '2px'
                }}
              >
                {hasValidExplanation ? (
                  <CheckCircle2 size={14} color="var(--lime-accent)" />
                ) : (
                  <XCircle size={14} color="#ef4444" />
                )}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.74rem',
                    color: hasValidExplanation ? 'var(--lime-accent)' : '#ef4444',
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
                    color: hasValidExplanation ? '#9ca3af' : '#ef4444'
                  }}
                >
                  {hasValidExplanation
                    ? `✓ RECEIVED (${explanationLength} chars)`
                    : '✕ NOT RECEIVED'}
                </div>
              </div>
            </div>

            {/* Component 2: Project Archive */}
            <div
              style={{
                background: 'rgba(10, 2, 4, 0.85)',
                border: hasFile
                  ? '1px solid rgba(57, 255, 20, 0.4)'
                  : '1px solid rgba(239, 68, 68, 0.4)',
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
                  background: hasFile ? 'rgba(57, 255, 20, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  border: hasFile ? '1px solid var(--lime-accent)' : '1px solid #ef4444',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '2px'
                }}
              >
                {hasFile ? (
                  <CheckCircle2 size={14} color="var(--lime-accent)" />
                ) : (
                  <XCircle size={14} color="#ef4444" />
                )}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.74rem',
                    color: hasFile ? 'var(--lime-accent)' : '#ef4444',
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
                    color: hasFile ? '#9ca3af' : '#ef4444',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {hasFile ? `✓ RECEIVED (${fileName})` : '✕ NOT RECEIVED'}
                </div>
              </div>
            </div>
          </div>

          {/* Submission Details Metadata Grid */}
          <div
            style={{
              width: '100%',
              background: 'rgba(8, 2, 4, 0.7)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              borderRadius: '3px',
              padding: '12px 16px',
              boxSizing: 'border-box',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '12px',
              marginBottom: '24px',
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
                ROUND DURATION
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#ef4444', fontWeight: 700, marginTop: '2px' }}>
                30:00 (EXPIRED)
              </div>
            </div>
          </div>

          {/* Return to Arena Button */}
          <motion.button
            whileHover={{ scale: 1.02, boxShadow: '0 0 25px rgba(245, 158, 11, 0.4)' }}
            whileTap={{ scale: 0.98 }}
            onClick={handleReturnToArena}
            onMouseEnter={() => soundEngine.playHover()}
            className="cyber-btn"
            style={{
              padding: '11px 32px',
              fontSize: '0.84rem',
              letterSpacing: '0.12em',
              fontWeight: 800,
              borderColor: '#f59e0b',
              color: '#f59e0b',
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
