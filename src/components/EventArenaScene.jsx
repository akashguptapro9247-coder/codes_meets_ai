import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ThreeBackground from './ThreeBackground';
import DigitalParticles from './DigitalParticles';
import ScanOverlay from './ScanOverlay';
import ArenaHeader from './ArenaHeader';
import LayerCard from './LayerCard';
import ProgressTicker from './ProgressTicker';
import RoundPlaceholder from './RoundPlaceholder';
import { eventStateService } from '../services/eventStateService';
import { soundEngine } from '../utils/SoundEngine';

export default function EventArenaScene({ participant, initialRound = null, onNavigate, onForceExit, onOpenAdmin }) {
  const [eventState, setEventState] = useState(eventStateService.getEventState());

  // activeRound: tracks WHICH round the user selected (null = arena view)
  // Use a ref to store the initial value so we don't set it again if the prop
  // bounces with a new object reference (same value).
  const [activeRound, setActiveRound] = useState(initialRound);
  const activeRoundRef = useRef(activeRound);

  // isChallengeOpen: LIFTED from RoundPlaceholder so it survives re-renders
  // When the user clicks BEGIN CHALLENGE this becomes true and is never reset
  // by a prop/state change — only by explicit back navigation.
  const [isChallengeOpen, setIsChallengeOpen] = useState(false);

  const mousePosition = useRef({ x: 0, y: 0 });

  // Sync with initialRound prop changes — but ONLY update activeRound if the
  // actual path value changed (not just a new object reference for the same round).
  // This prevents remounting RoundPlaceholder and resetting isChallengeOpen.
  useEffect(() => {
    if (!initialRound) {
      // Navigated back to /play
      if (activeRoundRef.current !== null) {
        activeRoundRef.current = null;
        setActiveRound(null);
        setIsChallengeOpen(false);
      }
      return;
    }
    // Only update if the path actually changed
    if (activeRoundRef.current?.path !== initialRound.path) {
      activeRoundRef.current = initialRound;
      setActiveRound(initialRound);
      setIsChallengeOpen(false); // new round selected — reset challenge open
    }
  }, [initialRound]);

  // Handle Mouse movement for smooth 3D parallax
  useEffect(() => {
    const handleMouseMove = (e) => {
      mousePosition.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mousePosition.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Subscribe to Realtime Admin State changes from Supabase
  useEffect(() => {
    const unsubscribe = eventStateService.subscribeToEventState((newState) => {
      setEventState(newState);
    });
    return () => unsubscribe();
  }, []);

  const handleSelectRound = (path, title) => {
    if ((path.startsWith('/layer2') || path.startsWith('/layer/2')) && !participant?.promoted_to_layer2) {
      soundEngine.playClick();
      return;
    }
    // Only open a new round if it is different from the currently active one
    if (activeRoundRef.current?.path === path) return;
    const round = { path, title };
    activeRoundRef.current = round;
    setActiveRound(round);
    setIsChallengeOpen(false);
    if (onNavigate) onNavigate(path, round);
  };

  const handleBackToArena = () => {
    console.error('[CMA DEBUG] handleBackToArena CALLED', new Error().stack);
    activeRoundRef.current = null;
    setActiveRound(null);
    setIsChallengeOpen(false);
    if (onNavigate) onNavigate('/play');
  };

  // Real-time Lock Enforcement:
  // Only redirect if the admin ACTIVELY changes state from active → inactive.
  // We compare previous vs current state so the initial mount (active:false default)
  // never incorrectly kicks the user.
  const prevEventStateRef = useRef(null);
  useEffect(() => {
    const prev = prevEventStateRef.current;
    prevEventStateRef.current = eventState;

    // Skip on first render — prev is null, nothing to compare
    if (!prev) return;
    if (!activeRoundRef.current) return;

    const path = (activeRoundRef.current.path || '').toLowerCase();
    const title = (activeRoundRef.current.title || '').toLowerCase();

    const isLayer1 = path.includes('layer1') || path.includes('layer/1') || path.includes('layer-1') || title.includes('layer 01') || title.includes('layer 1');
    const isLayer2 = path.includes('layer2') || path.includes('layer/2') || path.includes('layer-2') || title.includes('layer 02') || title.includes('layer 2');
    const isManual = path.includes('manual') || title.includes('manual');
    const isGenAi = path.includes('gen-ai') || path.includes('genai') || title.includes('gen ai') || title.includes('genai') || title.includes('prompt');

    let isDisabled = false;

    if (isLayer1) {
      const wasActive = prev.layer1?.active;
      const nowActive = eventState.layer1?.active;
      const trackChanged = prev.layer1?.activeTrack !== eventState.layer1?.activeTrack;
      if (wasActive && !nowActive) isDisabled = true;
      else if (wasActive && trackChanged) {
        if (isManual && eventState.layer1?.activeTrack !== 'manual') isDisabled = true;
        else if (isGenAi && eventState.layer1?.activeTrack !== 'gen-ai') isDisabled = true;
      }
    } else if (isLayer2) {
      const wasActive = prev.layer2?.active;
      const nowActive = eventState.layer2?.active;
      const trackChanged = prev.layer2?.activeTrack !== eventState.layer2?.activeTrack;
      if (wasActive && !nowActive) isDisabled = true;
      else if (wasActive && trackChanged) {
        if (isManual && eventState.layer2?.activeTrack !== 'manual') isDisabled = true;
        else if (isGenAi && eventState.layer2?.activeTrack !== 'gen-ai') isDisabled = true;
      }
    }

    if (isDisabled) {
      console.error('[CMA DEBUG] LOCK EFFECT triggered disable. prev=', prev, 'cur=', eventState, 'round=', activeRoundRef.current);
      handleBackToArena();
    }
  }, [eventState]);

  return (
    <div
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: '#030712',
        backgroundImage: 'radial-gradient(ellipse at 50% 35%, rgba(0, 243, 255, 0.05) 0%, rgba(4, 9, 22, 0.95) 60%, #030712 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none'
      }}
    >
      {/* 3D Three.js Arena Background */}
      <ThreeBackground mousePosition={mousePosition} />

      {/* 2D Digital Particles Overlay */}
      <DigitalParticles />

      {/* CRT Scanline & Telemetry Overlay */}
      <ScanOverlay currentStage={4} hideHeader={true} />

      {/* Compact Top Arena Header */}
      <ArenaHeader
        participant={participant}
        onOpenAdmin={onOpenAdmin}
      />

      {/* Active Challenge Round Route Placeholder (/layer/1, /layer/2, etc.) */}
      <AnimatePresence>
        {activeRound && (
          <RoundPlaceholder
            key={activeRound.path}
            roundPath={activeRound.path}
            roundTitle={activeRound.title}
            participant={participant}
            isChallengeOpen={isChallengeOpen}
            onLaunchChallenge={() => setIsChallengeOpen(true)}
            onBackToArena={handleBackToArena}
          />
        )}
      </AnimatePresence>

      {/* MAIN CONTENT: TWO LARGE HORIZONTAL LAYER CARDS WITH CUSTOM TRACK ARTWORK */}
      <main
        style={{
          width: '100%',
          maxWidth: '1200px',
          height: 'calc(100vh - 120px)',
          marginTop: '64px',
          marginBottom: '42px',
          padding: '0 28px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: '20px',
          zIndex: 20
        }}
      >
        {/* CARD 1: LAYER 01 */}
        <LayerCard
          layerKey="layer1"
          layerNumber="01"
          layerTitle="LAYER 01"
          layerState={eventState.layer1}
          genAiDesc="Prompt Engineering"
          manualDesc="Manual Coding"
          genAiImage="/assets/layer1_genai.jpeg"
          manualImage="/assets/layer1_manual.jpeg"
          onSelectRound={handleSelectRound}
        />

        {/* CARD 2: LAYER 02 */}
        <LayerCard
          layerKey="layer2"
          layerNumber="02"
          layerTitle="LAYER 02"
          layerState={eventState.layer2}
          isPromoted={Boolean(participant?.promoted_to_layer2)}
          genAiDesc="Website Building"
          manualDesc="Jumbled Code Challenge"
          genAiImage="/assets/layer2_genai.png"
          manualImage="/assets/layer2_manual.png"
          onSelectRound={handleSelectRound}
        />

        {/* CARD 3: LAYER 03 — read-only problem viewer, no tracks */}
        <Layer3Card
          active={Boolean(eventState.layer3?.active)}
          onEnter={() => { if (onNavigate) onNavigate('/layer3', null); }}
        />
      </main>

      {/* SUBTLE BOTTOM EVENT PROGRESSION TICKER */}
      <ProgressTicker />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Layer3Card — simple locked / unlocked card with no GenAI/Manual track split
// ---------------------------------------------------------------------------
function Layer3Card({ active, onEnter }) {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <motion.div
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'relative',
        width: '100%',
        height: 'calc(22vh - 20px)',
        minHeight: '100px',
        maxHeight: '140px',
        background: 'rgba(4, 9, 22, 0.85)',
        backdropFilter: 'blur(16px)',
        border: active
          ? '1px solid var(--cyan-glow)'
          : '1px solid rgba(0, 243, 255, 0.2)',
        boxShadow: active
          ? isHovered
            ? '0 0 35px rgba(0, 243, 255, 0.4), inset 0 0 20px rgba(0, 243, 255, 0.2)'
            : '0 0 20px rgba(0, 243, 255, 0.2)'
          : '0 8px 30px rgba(0, 0, 0, 0.8)',
        borderRadius: '4px',
        overflow: 'hidden',
        boxSizing: 'border-box',
        transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        padding: '0 28px',
        gap: '24px',
        cursor: active ? 'pointer' : 'default'
      }}
      onClick={() => { if (active) onEnter(); }}
    >
      {/* Corner accents */}
      <div className="hud-corner hud-top-left" style={{ width: '14px', height: '14px', zIndex: 22 }} />
      <div className="hud-corner hud-top-right" style={{ width: '14px', height: '14px', zIndex: 22 }} />
      <div className="hud-corner hud-bottom-left" style={{ width: '14px', height: '14px', zIndex: 22 }} />
      <div className="hud-corner hud-bottom-right" style={{ width: '14px', height: '14px', zIndex: 22 }} />

      {/* Locked blur overlay */}
      {!active && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 10,
            backdropFilter: 'blur(6px)',
            background: 'rgba(3, 7, 18, 0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-title)',
              fontSize: '1rem',
              color: 'rgba(239, 68, 68, 0.85)',
              letterSpacing: '0.25em',
              textShadow: '0 0 12px rgba(239, 68, 68, 0.7)'
            }}
          >
            LAYER 03 // LOCKED
          </span>
        </div>
      )}

      {/* Title & badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', zIndex: 5 }}>
        <span
          style={{
            fontFamily: 'var(--font-title)',
            fontSize: '0.9rem',
            color: '#ffffff',
            letterSpacing: '0.15em',
            fontWeight: 800,
            textShadow: '0 0 12px rgba(0, 243, 255, 0.9)'
          }}
        >
          LAYER 03
        </span>
        <span
          className="cyber-badge"
          style={{
            borderColor: active ? 'var(--cyan-glow)' : '#ef4444',
            color: active ? 'var(--cyan-glow)' : '#ef4444'
          }}
        >
          {active ? 'ACTIVE' : 'LOCKED'}
        </span>
      </div>

      {/* Description */}
      <div style={{ flex: 1, zIndex: 5 }}>
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.82rem',
            color: active ? '#d1d5db' : '#6b7280',
            margin: 0,
            letterSpacing: '0.05em'
          }}
        >
          Build Round — Problem Statements
        </p>
      </div>

      {/* Enter button */}
      {active && (
        <motion.button
          whileHover={{ scale: 1.04, x: 4 }}
          className="cyber-btn"
          style={{
            zIndex: 5,
            padding: '8px 20px',
            fontSize: '0.8rem',
            letterSpacing: '0.15em',
            pointerEvents: 'none'
          }}
        >
          <span>VIEW PROBLEMS</span>
        </motion.button>
      )}
    </motion.div>
  );
}
