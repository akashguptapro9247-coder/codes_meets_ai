import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Shield,
  Volume2,
  VolumeX,
  Play,
  Terminal,
  Folder,
  Bot,
  FileCode,
  CheckSquare
} from 'lucide-react';
import { soundEngine } from '../../../shared/utils/SoundEngine';

export default function GenAIInstructions({ participant, onBack, onBegin }) {
  const [muted, setMuted] = useState(soundEngine.isMuted());
  const [currentVideo, setCurrentVideo] = useState(1); // 1 = background1 (loop), 2 = background2 (cinematic run)
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [hasBegun, setHasBegun] = useState(false);

  const video1Ref = useRef(null);
  const video2Ref = useRef(null);
  const fallbackTimeoutRef = useRef(null);

  // 1. Sound State Sync
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

  // 2. Participant Info Resolver (matches Page 3 hierarchy)
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

  // 3. Autoplay & Video 1 initialization
  useEffect(() => {
    if (video1Ref.current) {
      video1Ref.current.play().catch(() => {});
    }
  }, []);

  // Cleanup fallback timers on unmount
  useEffect(() => {
    return () => {
      if (fallbackTimeoutRef.current) {
        clearTimeout(fallbackTimeoutRef.current);
      }
    };
  }, []);

  // 4. Begin Challenge Transition Trigger (State Flow: BRIEFING -> EXITING -> VIDEO 2 -> PAGE 3)
  const handleBeginClick = () => {
    if (isTransitioning || hasBegun) return;
    soundEngine.playBoot();
    setIsTransitioning(true);

    // Smooth switch to Video 2 after exit animation
    if (video2Ref.current) {
      video2Ref.current.currentTime = 0;
      video2Ref.current.play().then(() => {
        setCurrentVideo(2);
        if (video1Ref.current) {
          video1Ref.current.pause();
        }
      }).catch((err) => {
        console.warn('[GenAIInstructions] Video 2 play error, switching display state:', err);
        setCurrentVideo(2);
      });
    } else {
      setCurrentVideo(2);
    }

    // Safety fallback: if video fails to emit onEnded within 25 seconds, proceed automatically
    fallbackTimeoutRef.current = setTimeout(() => {
      handleVideo2Ended();
    }, 25000);
  };

  // 5. Video 2 Completion Handler -> Direct navigation to Page 3
  const handleVideo2Ended = () => {
    if (hasBegun) return;
    setHasBegun(true);
    if (fallbackTimeoutRef.current) {
      clearTimeout(fallbackTimeoutRef.current);
    }
    if (onBegin) {
      onBegin();
    }
  };

  // 6. Workflow Modules Configuration (P01 - P04 ONLY)
  const leftModules = [
    {
      id: 'P01',
      title: 'SETUP',
      icon: <Folder size={14} color="var(--cyan-glow)" />,
      delay: 0.1,
      bullets: [
        'Open VS Code',
        'Create project folder',
        'Prepare required files'
      ]
    },
    {
      id: 'P03',
      title: 'BUILD & EXECUTE',
      icon: <FileCode size={14} color="var(--cyan-glow)" />,
      delay: 0.2,
      bullets: [
        'Create the required files',
        'Add the generated code',
        'Run the application locally'
      ]
    }
  ];

  const rightModules = [
    {
      id: 'P02',
      title: 'PLAN & GENERATE',
      icon: <Bot size={14} color="var(--cyan-glow)" />,
      delay: 0.15,
      bullets: [
        'Read the assigned task',
        'Plan with ChatGPT / Gemini',
        'Generate required code'
      ]
    },
    {
      id: 'P04',
      title: 'DEBUG & SUBMIT',
      icon: <CheckSquare size={14} color="var(--lime-accent)" />,
      delay: 0.25,
      bullets: [
        'Test the application',
        'Fix errors and refine the result',
        'Explain what you built & submit'
      ]
    }
  ];

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
        .hud-corner-tl {
          position: absolute; top: -1px; left: -1px; width: 7px; height: 7px;
          border-top: 2px solid var(--cyan-glow); border-left: 2px solid var(--cyan-glow);
          pointer-events: none;
        }
        .hud-corner-tr {
          position: absolute; top: -1px; right: -1px; width: 7px; height: 7px;
          border-top: 2px solid var(--cyan-glow); border-right: 2px solid var(--cyan-glow);
          pointer-events: none;
        }
        .hud-corner-bl {
          position: absolute; bottom: -1px; left: -1px; width: 7px; height: 7px;
          border-bottom: 2px solid var(--cyan-glow); border-left: 2px solid var(--cyan-glow);
          pointer-events: none;
        }
        .hud-corner-br {
          position: absolute; bottom: -1px; right: -1px; width: 7px; height: 7px;
          border-bottom: 2px solid var(--cyan-glow); border-right: 2px solid var(--cyan-glow);
          pointer-events: none;
        }
        @media (max-width: 1024px) {
          .hud-side-column {
            width: 220px !important;
          }
          .hud-module-card {
            padding: 10px 12px !important;
          }
        }
      `}</style>

      {/* ==================================================================== */}
      {/* 1. FIXED GLOBAL HEADER — EXACT MATCH WITH PAGE 3 (REMAINS FIXED)     */}
      {/* ==================================================================== */}
      <header
        style={{
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 20px',
          borderBottom: '1px solid rgba(0, 243, 255, 0.25)',
          background: 'rgba(2, 6, 18, 0.94)',
          backdropFilter: 'blur(8px)',
          boxSizing: 'border-box',
          zIndex: 30,
          gap: '12px',
          height: '52px'
        }}
      >
        {/* Left: Branding & Layer Badge */}
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

        {/* Center: Live Status Indicator */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '4px 12px',
            background: 'rgba(57, 255, 20, 0.08)',
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
              boxShadow: '0 0 8px var(--lime-accent)',
              animation: 'pulse 2s infinite'
            }}
          />
          <span>CHALLENGE ACTIVE // APPLICATION DEVELOPMENT TRACK</span>
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
      {/* 2. CINEMATIC VIDEO PLAYERS (SEAMLESS DUAL-VIDEO ARCHITECTURE)        */}
      {/* ==================================================================== */}
      <div
        style={{
          position: 'absolute',
          top: '52px',
          left: 0,
          right: 0,
          bottom: 0,
          overflow: 'hidden',
          zIndex: 0,
          backgroundColor: '#030712'
        }}
      >
        {/* VIDEO 1: Idle Thor Looping Ambient Video */}
        <video
          ref={video1Ref}
          src="/vedios/layer2Genai.thor.backgound1.mp4"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center center',
            opacity: currentVideo === 1 ? 1 : 0,
            transition: 'opacity 0.35s ease',
            pointerEvents: 'none',
            zIndex: 1
          }}
        />

        {/* VIDEO 2: Cinematic Mission Start Animation Video (Plays Once -> Page 3) */}
        <video
          ref={video2Ref}
          src="/vedios/layer2Genai.thor.backgound2.mp4"
          muted
          playsInline
          preload="auto"
          onEnded={handleVideo2Ended}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center center',
            opacity: currentVideo === 2 ? 1 : 0,
            transition: 'opacity 0.35s ease',
            pointerEvents: 'none',
            zIndex: 2
          }}
        />

        {/* Subtle Ambient Readability Tint */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: isTransitioning ? 'rgba(2, 6, 18, 0.15)' : 'rgba(2, 6, 18, 0.32)',
            transition: 'background-color 0.5s ease',
            zIndex: 3,
            pointerEvents: 'none'
          }}
        />

        {/* Futuristic Scanline Overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 4,
            pointerEvents: 'none',
            background:
              'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.22) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.02), rgba(0, 255, 0, 0.01), rgba(0, 255, 0, 0.02))',
            backgroundSize: '100% 4px, 6px 100%'
          }}
        />
      </div>

      {/* ==================================================================== */}
      {/* 3. FLOATING HUD WORKFLOW OVERLAY (ANIMATES OUT ON BEGIN)             */}
      {/* ==================================================================== */}
      <div
        style={{
          position: 'relative',
          flex: 1,
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '16px 28px 24px 28px',
          boxSizing: 'border-box',
          pointerEvents: isTransitioning ? 'none' : 'auto'
        }}
      >
        <AnimatePresence>
          {!isTransitioning && (
            <motion.div
              key="workflow-hud-content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.35 } }}
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              {/* TOP/MAIN AREA: SYMMETRICAL FLOATING WORKFLOW MODULES */}
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  maxWidth: '1540px',
                  margin: '0 auto',
                  gap: '24px'
                }}
              >
                {/* LEFT COLUMN: P01 (TOP LEFT) & P03 (LOWER LEFT) */}
                <div
                  className="hud-side-column"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '26px',
                    width: '280px',
                    flexShrink: 0
                  }}
                >
                  {leftModules.map((mod) => (
                    <motion.div
                      key={mod.id}
                      initial={{ opacity: 0, x: -35 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -45, transition: { duration: 0.35 } }}
                      transition={{ duration: 0.4, delay: mod.delay, ease: 'easeOut' }}
                      className="hud-module-card"
                      style={{
                        position: 'relative',
                        padding: '14px 16px',
                        background: 'rgba(2, 6, 23, 0.78)',
                        border: '1px solid rgba(0, 243, 255, 0.35)',
                        boxShadow: '0 0 20px rgba(0, 243, 255, 0.12), inset 0 0 14px rgba(0, 243, 255, 0.04)',
                        backdropFilter: 'blur(12px)',
                        borderRadius: '3px'
                      }}
                    >
                      <div className="hud-corner-tl" />
                      <div className="hud-corner-tr" />
                      <div className="hud-corner-bl" />
                      <div className="hud-corner-br" />

                      {/* Module Header */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          borderBottom: '1px solid rgba(0, 243, 255, 0.2)',
                          paddingBottom: '8px',
                          marginBottom: '10px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '0.68rem',
                              fontWeight: 800,
                              color: 'var(--cyan-glow)',
                              background: 'rgba(0, 243, 255, 0.15)',
                              border: '1px solid rgba(0, 243, 255, 0.35)',
                              padding: '1px 6px',
                              borderRadius: '2px',
                              letterSpacing: '0.1em'
                            }}
                          >
                            {mod.id}
                          </span>
                          <span
                            style={{
                              fontFamily: 'var(--font-title)',
                              fontSize: '0.78rem',
                              color: '#ffffff',
                              letterSpacing: '0.08em',
                              textShadow: '0 0 8px rgba(0, 243, 255, 0.5)'
                            }}
                          >
                            {mod.title}
                          </span>
                        </div>
                        {mod.icon}
                      </div>

                      {/* Bullets */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {mod.bullets.map((b, idx) => (
                          <div
                            key={idx}
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '0.72rem',
                              color: '#d1d5db',
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '6px',
                              lineHeight: 1.35
                            }}
                          >
                            <span style={{ color: 'var(--cyan-glow)', flexShrink: 0 }}>•</span>
                            <span>{b}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* CENTER: UNCLUTTERED THOR HERO ZONE */}
                <div style={{ flex: 1, minWidth: '40px' }} />

                {/* RIGHT COLUMN: P02 (TOP RIGHT) & P04 (LOWER RIGHT) */}
                <div
                  className="hud-side-column"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '26px',
                    width: '280px',
                    flexShrink: 0
                  }}
                >
                  {rightModules.map((mod) => (
                    <motion.div
                      key={mod.id}
                      initial={{ opacity: 0, x: 35 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 45, transition: { duration: 0.35 } }}
                      transition={{ duration: 0.4, delay: mod.delay, ease: 'easeOut' }}
                      className="hud-module-card"
                      style={{
                        position: 'relative',
                        padding: '14px 16px',
                        background: 'rgba(2, 6, 23, 0.78)',
                        border: '1px solid rgba(0, 243, 255, 0.35)',
                        boxShadow: '0 0 20px rgba(0, 243, 255, 0.12), inset 0 0 14px rgba(0, 243, 255, 0.04)',
                        backdropFilter: 'blur(12px)',
                        borderRadius: '3px'
                      }}
                    >
                      <div className="hud-corner-tl" />
                      <div className="hud-corner-tr" />
                      <div className="hud-corner-bl" />
                      <div className="hud-corner-br" />

                      {/* Module Header */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          borderBottom: '1px solid rgba(0, 243, 255, 0.2)',
                          paddingBottom: '8px',
                          marginBottom: '10px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '0.68rem',
                              fontWeight: 800,
                              color: mod.id === 'P04' ? 'var(--lime-accent)' : 'var(--cyan-glow)',
                              background: mod.id === 'P04' ? 'rgba(57, 255, 20, 0.15)' : 'rgba(0, 243, 255, 0.15)',
                              border: mod.id === 'P04' ? '1px solid rgba(57, 255, 20, 0.35)' : '1px solid rgba(0, 243, 255, 0.35)',
                              padding: '1px 6px',
                              borderRadius: '2px',
                              letterSpacing: '0.1em'
                            }}
                          >
                            {mod.id}
                          </span>
                          <span
                            style={{
                              fontFamily: 'var(--font-title)',
                              fontSize: '0.78rem',
                              color: '#ffffff',
                              letterSpacing: '0.08em',
                              textShadow: '0 0 8px rgba(0, 243, 255, 0.5)'
                            }}
                          >
                            {mod.title}
                          </span>
                        </div>
                        {mod.icon}
                      </div>

                      {/* Bullets */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {mod.bullets.map((b, idx) => (
                          <div
                            key={idx}
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '0.72rem',
                              color: '#d1d5db',
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '6px',
                              lineHeight: 1.35
                            }}
                          >
                            <span style={{ color: mod.id === 'P04' ? 'var(--lime-accent)' : 'var(--cyan-glow)', flexShrink: 0 }}>•</span>
                            <span>{b}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* BOTTOM SECTION: >_ MISSION WORKFLOW & BEGIN GENAI CHALLENGE BUTTON */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 25, transition: { duration: 0.35 } }}
                transition={{ duration: 0.45, delay: 0.3, ease: 'easeOut' }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '10px',
                  width: '100%',
                  marginTop: '12px'
                }}
              >
                {/* HUD Label: >_ MISSION WORKFLOW */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.74rem',
                    color: 'var(--cyan-glow)',
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    textShadow: '0 0 8px rgba(0, 243, 255, 0.6)'
                  }}
                >
                  <span style={{ color: 'var(--lime-accent)', fontWeight: 800 }}>&gt;_</span>
                  <span>MISSION WORKFLOW</span>
                </div>

                {/* BEGIN GENAI CHALLENGE BUTTON */}
                <motion.button
                  whileHover={{ scale: 1.04, boxShadow: '0 0 35px rgba(0, 243, 255, 0.6)' }}
                  whileTap={{ scale: 0.96 }}
                  onClick={handleBeginClick}
                  onMouseEnter={() => soundEngine.playHover()}
                  className="cyber-btn"
                  style={{
                    padding: '12px 38px',
                    fontSize: '0.94rem',
                    fontFamily: 'var(--font-title)',
                    letterSpacing: '0.12em',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    cursor: 'pointer',
                    background: 'linear-gradient(135deg, rgba(0, 243, 255, 0.25) 0%, rgba(2, 6, 23, 0.9) 100%)',
                    border: '1px solid var(--cyan-glow)',
                    color: '#ffffff',
                    borderRadius: '3px',
                    boxShadow: '0 0 24px rgba(0, 243, 255, 0.35)',
                    textShadow: '0 0 8px rgba(0, 243, 255, 0.8)'
                  }}
                >
                  <Play size={15} fill="var(--cyan-glow)" color="var(--cyan-glow)" />
                  <span>BEGIN GENAI CHALLENGE</span>
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
