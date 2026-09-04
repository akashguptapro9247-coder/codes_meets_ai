import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  ArrowLeft,
  Shield,
  Volume2,
  VolumeX,
  Send,
  FileText,
  CheckCircle,
  AlertTriangle,
  FileBox,
  X,
  UploadCloud,
  Terminal,
  Layers,
  Activity
} from 'lucide-react';
import { toast } from '../../shared/components/Toast';
import { ConfirmModal } from '../../shared/components/Modals';
import { soundEngine } from '../../shared/utils/SoundEngine';
import ThreeBackground from '../../shared/components/ThreeBackground';
import GenAITimer from './components/GenAITimer';
import { genaiService } from './services/genaiService';

export default function Layer2GenAIChallenge({
  participant,
  assignment,
  onSubmissionComplete,
  onBack
}) {
  const [explanation, setExplanation] = useState(assignment?.explanation || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [isExpired, setIsExpired] = useState(false);
  const [loadedFile, setLoadedFile] = useState(null);
  const [submitConfirmOpen, setSubmitConfirmOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isTextareaFocused, setIsTextareaFocused] = useState(false);
  const [muted, setMuted] = useState(soundEngine.isMuted());

  const mousePosition = useRef({ x: 0, y: 0 });

  // 1. Mouse Parallax Listener
  useEffect(() => {
    const handleMouseMove = (e) => {
      mousePosition.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1
      };
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // 2. Sound State Sync
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

  // 3. Reliable Participant Info Resolver
  const getActiveParticipantInfo = () => {
    let name = participant?.name;
    let rollNumber = participant?.rollNumber || participant?.roll_number;

    if ((!name || !rollNumber) && typeof window !== 'undefined') {
      try {
        const storedSession =
          sessionStorage.getItem('cma_participant_session') ||
          localStorage.getItem('cma_participant_session');
        if (storedSession) {
          const parsed = JSON.parse(storedSession);
          if (!name) name = parsed.name;
          if (!rollNumber) rollNumber = parsed.rollNumber || parsed.roll_number;
        }
      } catch (e) {}
    }

    return {
      name: (name || 'PARTICIPANT').toUpperCase(),
      rollNumber: rollNumber || 'N/A'
    };
  };

  const participantInfo = getActiveParticipantInfo();
  const question = genaiService.getQuestionById(assignment?.question_id);
  const isSubmitted = assignment?.submitted;

  // 4. Return to Arena Handler
  const handleArenaClick = () => {
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

  // 5. Final Submission Handler
  const handleSubmit = async () => {
    if (!explanation || explanation.trim().length < 50) {
      soundEngine.playClick();
      setError('Please provide a meaningful explanation (minimum 50 characters).');
      return;
    }

    if (explanation.length > 5000) {
      soundEngine.playClick();
      setError('Explanation is too long (maximum 5000 characters).');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    soundEngine.playBoot();

    const activeUserId = participant?.userId || participant?.user_id;
    const { data, error: submitErr } = await genaiService.submitProject(activeUserId, explanation);

    setIsSubmitting(false);

    if (submitErr) {
      setError(submitErr.message || 'Failed to submit project. Please try again.');
    } else {
      toast.success('Project submitted successfully!');
      if (onSubmissionComplete) onSubmissionComplete(data);
    }
  };

  if (!question) {
    return (
      <div
        style={{
          width: '100vw',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#030712',
          color: '#ef4444',
          fontFamily: 'var(--font-mono)'
        }}
      >
        <AlertTriangle size={24} style={{ marginRight: '10px' }} />
        Error: Assigned question not found.
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        maxHeight: '100vh',
        backgroundColor: '#030712',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box'
      }}
    >
      {/* Dynamic Viewport CSS */}
      <style>{`
        .l2-scrollbar::-webkit-scrollbar {
          width: 5px;
          height: 5px;
        }
        .l2-scrollbar::-webkit-scrollbar-track {
          background: rgba(2, 6, 18, 0.5);
        }
        .l2-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 243, 255, 0.25);
          border-radius: 2px;
        }
        .l2-scrollbar::-webkit-scrollbar-thumb:hover {
          background: var(--cyan-glow);
        }
        @media (max-width: 900px) {
          .l2-workspace-container {
            grid-template-columns: 1fr !important;
            overflow-y: auto !important;
            height: auto !important;
          }
        }
      `}</style>

      {/* 3D Ambient Parallax Background */}
      <ThreeBackground mousePosition={mousePosition} />

      {/* Subtle Futuristic Scanline Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 2,
          pointerEvents: 'none',
          background:
            'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.2) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.02), rgba(0, 255, 0, 0.01), rgba(0, 255, 0, 0.02))',
          backgroundSize: '100% 4px, 6px 100%'
        }}
      />

      {/* ==================================================================== */}
      {/* 1. GLOBAL SHARED HEADER — EXACT LAYER 01 GENAI PARITY */}
      {/* ==================================================================== */}
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
        {/* Left: Branding & Arena Back Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            onClick={handleArenaClick}
            onMouseEnter={() => soundEngine.playHover()}
            className="cyber-btn"
            style={{
              padding: '5px 12px',
              fontSize: '0.72rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              borderColor: 'rgba(0, 243, 255, 0.4)',
              color: 'var(--cyan-glow)'
            }}
            title="Return to Arena Dashboard"
          >
            <ArrowLeft size={13} />
            <span>ARENA</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                  fontSize: '1.02rem',
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
        </div>

        {/* Center: Live / Completed Status Indicator */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '4px 12px',
            background: isSubmitted
              ? 'rgba(57, 255, 20, 0.12)'
              : isExpired
              ? 'rgba(239, 68, 68, 0.12)'
              : 'rgba(57, 255, 20, 0.08)',
            border: isSubmitted
              ? '1px solid rgba(57, 255, 20, 0.4)'
              : isExpired
              ? '1px solid rgba(239, 68, 68, 0.4)'
              : '1px solid rgba(57, 255, 20, 0.4)',
            borderRadius: '2px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.7rem',
            letterSpacing: '0.12em',
            color: isExpired ? '#ef4444' : 'var(--lime-accent)'
          }}
        >
          <span
            style={{
              display: 'inline-block',
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              backgroundColor: isExpired ? '#ef4444' : 'var(--lime-accent)',
              boxShadow: isExpired ? '0 0 8px #ef4444' : '0 0 8px var(--lime-accent)',
              animation: isSubmitted || isExpired ? 'none' : 'pulse 2s infinite'
            }}
          />
          <span>
            {isSubmitted
              ? 'RESPONSE RECORDED // SUBMISSION LOCKED'
              : isExpired
              ? 'TIME EXPIRED // SUBMISSION LOCKED'
              : 'CHALLENGE ACTIVE // APPLICATION DEVELOPMENT TRACK'}
          </span>
        </div>

        {/* Right: Operator Identity & SFX Toggle */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.72rem'
          }}
        >
          {/* Operator Info Tag */}
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

          {/* Audio Mute Toggle */}
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

      {/* ==================================================================== */}
      {/* 2. MAIN 100% VIEWPORT WORKSPACE (TWO-COLUMN ARCHITECTURE) */}
      {/* ==================================================================== */}
      <main
        className="l2-workspace-container"
        style={{
          flex: 1,
          position: 'relative',
          zIndex: 10,
          display: 'grid',
          gridTemplateColumns: 'minmax(330px, 1fr) minmax(360px, 1.15fr)',
          gap: '12px',
          maxWidth: '1580px',
          margin: '0 auto',
          width: '100%',
          padding: '10px 18px 12px 18px',
          boxSizing: 'border-box',
          overflow: 'hidden',
          height: 'calc(100vh - 52px)'
        }}
      >
        {/* ================================================================== */}
        {/* LEFT COLUMN: MISSION TARGET & PROBLEM SPECIFICATION */}
        {/* ================================================================== */}
        <section
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            height: '100%',
            minHeight: 0,
            overflow: 'hidden'
          }}
        >
          {/* Card A: Assigned Project Banner (Visual Anchor) */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="cyber-card"
            style={{
              flexShrink: 0,
              padding: '12px 16px',
              background: 'rgba(2, 6, 20, 0.9)',
              borderColor: 'rgba(0, 243, 255, 0.35)',
              boxShadow: '0 0 20px rgba(0, 243, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px'
            }}
          >
            <div style={{ minWidth: 0, flex: 1 }}>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--cyan-glow)',
                  fontSize: '0.7rem',
                  letterSpacing: '0.15em',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginBottom: '2px'
                }}
              >
                <Layers size={13} /> ASSIGNED MISSION TARGET
              </div>
              <h2
                style={{
                  fontFamily: 'var(--font-title)',
                  fontSize: '1.25rem',
                  margin: 0,
                  color: '#ffffff',
                  letterSpacing: '0.04em',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  textShadow: '0 0 10px rgba(0, 243, 255, 0.4)'
                }}
                title={question.title}
              >
                {question.title}
              </h2>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 8px',
                background: 'rgba(0, 243, 255, 0.08)',
                border: '1px solid rgba(0, 243, 255, 0.25)',
                borderRadius: '3px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.65rem',
                color: 'var(--cyan-glow)',
                letterSpacing: '0.1em',
                flexShrink: 0
              }}
            >
              <Activity size={12} />
              <span>GENAI BUILD</span>
            </div>
          </motion.div>

          {/* Card B: Problem Statement / Build Objective (Scrolls internally if long) */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="cyber-card"
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
              padding: '14px 18px',
              background: 'rgba(3, 7, 20, 0.92)',
              borderColor: 'rgba(224, 38, 255, 0.3)',
              boxShadow: '0 0 25px rgba(224, 38, 255, 0.08)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Top Glowing Accent Line */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '2px',
                background: 'linear-gradient(90deg, transparent, var(--magenta-glow), transparent)'
              }}
            />

            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '10px',
                flexShrink: 0
              }}
            >
              <h3
                style={{
                  color: 'var(--magenta-glow)',
                  fontFamily: 'var(--font-title)',
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.98rem',
                  letterSpacing: '0.08em'
                }}
              >
                <FileText size={16} /> BUILD OBJECTIVE // SPECIFICATION
              </h3>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.65rem',
                  color: '#9ca3af',
                  letterSpacing: '0.08em'
                }}
              >
                REQUIREMENT PROTOCOL
              </span>
            </div>

            {/* Problem Statement Content (Internal scroll container) */}
            <div
              className="l2-scrollbar"
              style={{
                flex: 1,
                minHeight: 0,
                overflowY: 'auto',
                color: '#e5e7eb',
                lineHeight: '1.65',
                fontSize: '0.88rem',
                whiteSpace: 'pre-wrap',
                fontFamily: 'var(--font-sans)',
                paddingRight: '6px'
              }}
            >
              {question.problem_statement}
            </div>

            {/* Status Feedback Notice (if submitted or expired) */}
            {isSubmitted && (
              <div
                style={{
                  marginTop: '10px',
                  padding: '8px 12px',
                  background: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid #10b981',
                  borderRadius: '3px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  flexShrink: 0
                }}
              >
                <CheckCircle size={16} color="#10b981" />
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    color: '#10b981'
                  }}
                >
                  PROJECT SUBMITTED // UNDER EVALUATION
                </span>
              </div>
            )}

            {isExpired && !isSubmitted && (
              <div
                style={{
                  marginTop: '10px',
                  padding: '8px 12px',
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid #ef4444',
                  borderRadius: '3px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  flexShrink: 0
                }}
              >
                <AlertTriangle size={16} color="#ef4444" />
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    color: '#ef4444'
                  }}
                >
                  30-MINUTE TIMEOUT EXPIRED // SUBMISSIONS CLOSED
                </span>
              </div>
            )}
          </motion.div>
        </section>

        {/* ================================================================== */}
        {/* RIGHT COLUMN: ACTION SIDE (TIMER, EXPLANATION, UPLOAD, SUBMIT) */}
        {/* ================================================================== */}
        <section
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            height: '100%',
            minHeight: 0,
            overflow: 'hidden'
          }}
        >
          {/* Top Bar: Step Tag + Live Countdown Timer */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0,
              gap: '10px'
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.7rem',
                color: 'var(--cyan-glow)',
                letterSpacing: '0.12em',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--cyan-glow)',
                  boxShadow: '0 0 6px var(--cyan-glow)'
                }}
              />
              PHASE 2: BUILD, EXPLAIN & PACKAGE
            </div>

            {!isSubmitted && (
              <GenAITimer
                assignedAt={assignment?.assigned_at}
                onExpire={() => setIsExpired(true)}
              />
            )}
          </div>

          {/* Card C: Technical Debrief / Explanation (Controlled Height, Internal Scroll) */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32 }}
            className="cyber-card"
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
              padding: '12px 16px',
              background: 'rgba(3, 7, 20, 0.92)',
              borderColor: isTextareaFocused
                ? 'var(--lime-accent)'
                : 'rgba(57, 255, 20, 0.25)',
              boxShadow: isTextareaFocused
                ? '0 0 25px rgba(57, 255, 20, 0.2)'
                : '0 0 15px rgba(57, 255, 20, 0.05)',
              position: 'relative',
              overflow: 'hidden',
              transition: 'border-color 0.25s, box-shadow 0.25s'
            }}
          >
            {/* Top Lime Accent Line */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '2px',
                background: 'linear-gradient(90deg, transparent, var(--lime-accent), transparent)'
              }}
            />

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '4px',
                flexShrink: 0
              }}
            >
              <h3
                style={{
                  color: 'var(--lime-accent)',
                  fontFamily: 'var(--font-title)',
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '7px',
                  fontSize: '0.94rem',
                  letterSpacing: '0.08em'
                }}
              >
                <Terminal size={15} /> EXPLAIN WHAT YOU DID // TECHNICAL DEBRIEF
              </h3>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.62rem',
                  color: '#9ca3af'
                }}
              >
                STEP 11 // REPORT
              </span>
            </div>

            <p
              style={{
                color: '#9ca3af',
                margin: '0 0 8px 0',
                fontSize: '0.78rem',
                fontFamily: 'var(--font-body)',
                lineHeight: 1.35,
                flexShrink: 0
              }}
            >
              Explain in your own words what you built, how it works, what features you implemented, and how you leveraged AI.
            </p>

            {/* Controlled Textarea with internal scrolling */}
            <textarea
              className="l2-scrollbar"
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              onFocus={() => setIsTextareaFocused(true)}
              onBlur={() => setIsTextareaFocused(false)}
              disabled={isSubmitted || isExpired || isSubmitting}
              placeholder="I built an application with features... During development I used AI to..."
              style={{
                flex: 1,
                minHeight: '80px',
                background: 'rgba(2, 6, 18, 0.95)',
                border: isTextareaFocused
                  ? '1px solid var(--lime-accent)'
                  : '1px solid rgba(0, 243, 255, 0.2)',
                borderRadius: '3px',
                padding: '10px 12px',
                color: '#ffffff',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.84rem',
                lineHeight: '1.5',
                resize: 'none',
                boxSizing: 'border-box',
                outline: 'none',
                overflowY: 'auto',
                transition: 'border-color 0.25s, box-shadow 0.25s'
              }}
            />

            {/* Character Counter Bar */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '6px',
                flexShrink: 0
              }}
            >
              <div
                style={{
                  color: explanation.length < 50 ? '#ef4444' : 'var(--lime-accent)',
                  fontSize: '0.72rem',
                  fontFamily: 'var(--font-mono)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>{explanation.length} / 5000 chars (Min: 50)</span>
                {explanation.length >= 50 && (
                  <span style={{ color: 'var(--lime-accent)', fontWeight: 700 }}>✓ READY</span>
                )}
              </div>
              {explanation.length < 50 && (
                <span
                  style={{
                    color: '#ef4444',
                    fontSize: '0.68rem',
                    fontFamily: 'var(--font-mono)'
                  }}
                >
                  {50 - explanation.length} more characters required
                </span>
              )}
            </div>
          </motion.div>

          {/* Validation Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                color: '#ef4444',
                padding: '6px 12px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid #ef4444',
                borderRadius: '3px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                flexShrink: 0
              }}
            >
              <AlertTriangle size={14} />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Card D: Compact File Upload Bay */}
          {!isSubmitted && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.34 }}
              className="cyber-card"
              style={{
                flexShrink: 0,
                padding: '10px 14px',
                background: 'rgba(3, 7, 20, 0.92)',
                borderColor: isDragging ? 'var(--cyan-glow)' : 'rgba(245, 158, 11, 0.25)',
                boxShadow: isDragging
                  ? '0 0 25px rgba(0, 243, 255, 0.25)'
                  : '0 0 15px rgba(245, 158, 11, 0.05)',
                position: 'relative',
                overflow: 'hidden',
                transition: 'border-color 0.25s, box-shadow 0.25s'
              }}
            >
              {/* Top Amber Accent Line */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '2px',
                  background: 'linear-gradient(90deg, transparent, #f59e0b, transparent)'
                }}
              />

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '6px'
                }}
              >
                <h3
                  style={{
                    color: '#f59e0b',
                    fontFamily: 'var(--font-title)',
                    margin: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.92rem',
                    letterSpacing: '0.08em'
                  }}
                >
                  <UploadCloud size={15} /> PROJECT ARCHIVE // UPLOAD BAY
                </h3>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.62rem',
                    color: '#9ca3af'
                  }}
                >
                  STEP 12 // ZIP
                </span>
              </div>

              {loadedFile ? (
                /* Loaded State */
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    borderRadius: '4px',
                    padding: '8px 12px',
                    background: 'rgba(16, 185, 129, 0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '10px'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      minWidth: 0,
                      flex: 1
                    }}
                  >
                    <div style={{ color: '#10b981', flexShrink: 0 }}>
                      <FileBox size={22} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          color: '#fff',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          fontFamily: 'var(--font-mono)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {loadedFile.name}
                      </div>
                      <div
                        style={{
                          color: '#9ca3af',
                          fontSize: '0.7rem',
                          fontFamily: 'var(--font-mono)'
                        }}
                      >
                        {(loadedFile.size / 1024 / 1024).toFixed(2)} MB • READY
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                    <button
                      disabled={isExpired || isSubmitting}
                      onClick={() => {
                        soundEngine.playClick();
                        setLoadedFile(null);
                        toast.info('File removed');
                      }}
                      onMouseEnter={() => soundEngine.playHover()}
                      style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid #ef4444',
                        color: '#ef4444',
                        padding: '4px 10px',
                        borderRadius: '3px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.7rem',
                        fontFamily: 'var(--font-mono)'
                      }}
                    >
                      <X size={12} /> REMOVE
                    </button>
                    <label
                      htmlFor="project-upload"
                      onMouseEnter={() => soundEngine.playHover()}
                      style={{
                        background: 'rgba(0, 243, 255, 0.1)',
                        border: '1px solid var(--cyan-glow)',
                        color: 'var(--cyan-glow)',
                        padding: '4px 10px',
                        borderRadius: '3px',
                        cursor: isExpired || isSubmitting ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.7rem',
                        fontFamily: 'var(--font-mono)'
                      }}
                    >
                      <UploadCloud size={12} /> REPLACE
                    </label>
                  </div>
                </motion.div>
              ) : (
                /* Empty Dropzone State */
                <motion.div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    if (isExpired || isSubmitting) return;
                    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                      const file = e.dataTransfer.files[0];
                      if (file.size > 50 * 1024 * 1024) {
                        soundEngine.playClick();
                        toast.error('File exceeds 50MB limit.');
                        return;
                      }
                      soundEngine.playClick();
                      setLoadedFile(file);
                      toast.success('File loaded successfully');
                    }
                  }}
                  style={{
                    border: isDragging
                      ? '1px dashed var(--cyan-glow)'
                      : '1px dashed rgba(0, 243, 255, 0.3)',
                    borderRadius: '4px',
                    padding: '12px 14px',
                    textAlign: 'center',
                    background: isDragging
                      ? 'rgba(0, 243, 255, 0.08)'
                      : 'rgba(2, 6, 20, 0.6)',
                    cursor: isExpired || isSubmitting ? 'not-allowed' : 'pointer',
                    transition: 'background 0.2s, border-color 0.2s'
                  }}
                >
                  <label
                    htmlFor="project-upload"
                    style={{
                      cursor: isExpired || isSubmitting ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      width: '100%'
                    }}
                  >
                    <UploadCloud
                      size={20}
                      color={isDragging ? 'var(--lime-accent)' : 'var(--cyan-glow)'}
                    />
                    <div style={{ textAlign: 'left' }}>
                      <div
                        style={{
                          color: '#d1d5db',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.78rem'
                        }}
                      >
                        {isDragging
                          ? 'Drop your .zip file here now'
                          : 'Drag & drop project .zip here, or click to browse'}
                      </div>
                      <div
                        style={{
                          color: '#9ca3af',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.65rem'
                        }}
                      >
                        Accepts .zip, .rar, .7z (Max 50MB) • Exclude node_modules
                      </div>
                    </div>
                  </label>
                </motion.div>
              )}

              <input
                type="file"
                accept=".zip,.rar,.7z"
                disabled={isExpired || isSubmitting}
                style={{ display: 'none' }}
                id="project-upload"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    const file = e.target.files[0];
                    if (file.size > 50 * 1024 * 1024) {
                      soundEngine.playClick();
                      toast.error('File exceeds 50MB limit.');
                      e.target.value = '';
                      return;
                    }
                    soundEngine.playClick();
                    setLoadedFile(file);
                    toast.success('File loaded successfully');
                  }
                }}
              />
            </motion.div>
          )}

          {/* Action Button: Final Submit Button (Anchored inside Viewport) */}
          {!isSubmitted && (
            <div style={{ flexShrink: 0, marginTop: '2px' }}>
              <motion.button
                whileHover={
                  !isExpired && !isSubmitting
                    ? { scale: 1.02, boxShadow: '0 0 25px rgba(57, 255, 20, 0.45)' }
                    : {}
                }
                whileTap={!isExpired && !isSubmitting ? { scale: 0.98 } : {}}
                className="cyber-btn"
                onClick={() => {
                  soundEngine.playClick();
                  setSubmitConfirmOpen(true);
                }}
                onMouseEnter={() => {
                  if (!isExpired && !isSubmitting) soundEngine.playHover();
                }}
                disabled={isExpired || isSubmitting}
                style={{
                  width: '100%',
                  padding: '11px 24px',
                  fontSize: '0.98rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  borderColor: isExpired ? '#4b5563' : 'var(--lime-accent)',
                  color: isExpired ? '#9ca3af' : '#fff',
                  opacity: isExpired || isSubmitting ? 0.5 : 1,
                  cursor: isExpired || isSubmitting ? 'not-allowed' : 'pointer',
                  letterSpacing: '0.08em',
                  boxSizing: 'border-box'
                }}
              >
                <Send size={18} />
                <span>{isSubmitting ? 'SUBMITTING PROJECT...' : 'SUBMIT PROJECT'}</span>
              </motion.button>
            </div>
          )}
        </section>
      </main>

      {/* Final Submit Confirmation Modal */}
      <ConfirmModal
        isOpen={submitConfirmOpen}
        title="SUBMIT PROJECT?"
        message="Make sure your project is ready and your explanation is complete. You cannot edit this after submission."
        onConfirm={() => {
          setSubmitConfirmOpen(false);
          handleSubmit();
        }}
        onCancel={() => setSubmitConfirmOpen(false)}
      />
    </div>
  );
}
