import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import ThreeBackground from './ThreeBackground';
import DigitalParticles from './DigitalParticles';
import ScanOverlay from './ScanOverlay';
import ArenaHeader from './ArenaHeader';
import LayerCard from './LayerCard';
import ProgressTicker from './ProgressTicker';
import RoundPlaceholder from './RoundPlaceholder';
import { eventStateService } from '../services/eventStateService';

export default function EventArenaScene({ participant, initialRound = null, onNavigate, onForceExit, onOpenAdmin }) {
  const [eventState, setEventState] = useState(eventStateService.getEventState());
  const [activeRound, setActiveRound] = useState(initialRound);

  const mousePosition = useRef({ x: 0, y: 0 });

  // Sync with initialRound prop changes
  useEffect(() => {
    setActiveRound(initialRound);
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
    setActiveRound({ path, title });
    if (onNavigate) onNavigate(path, { path, title });
  };

  const handleBackToArena = () => {
    setActiveRound(null);
    if (onNavigate) onNavigate('/play');
  };

  // Real-time & URL/Refresh Lock Enforcement:
  // If the admin locks/deactivates the round the user is currently in, immediately redirect to Play Page (/play)
  useEffect(() => {
    if (!activeRound) return;

    const path = (activeRound.path || '').toLowerCase();
    const title = (activeRound.title || '').toLowerCase();

    const isLayer1 = path.includes('layer1') || path.includes('layer/1') || path.includes('layer-1') || title.includes('layer 01') || title.includes('layer 1');
    const isLayer2 = path.includes('layer2') || path.includes('layer/2') || path.includes('layer-2') || title.includes('layer 02') || title.includes('layer 2');

    const isManual = path.includes('manual') || title.includes('manual');
    const isGenAi = path.includes('gen-ai') || path.includes('genai') || title.includes('gen ai') || title.includes('genai') || title.includes('prompt');

    let isDisabled = false;

    if (isLayer1) {
      if (!eventState.layer1?.active) {
        isDisabled = true;
      } else if (isManual && eventState.layer1?.activeTrack !== 'manual') {
        isDisabled = true;
      } else if (isGenAi && eventState.layer1?.activeTrack !== 'gen-ai') {
        isDisabled = true;
      }
    } else if (isLayer2) {
      if (!eventState.layer2?.active) {
        isDisabled = true;
      } else if (isManual && eventState.layer2?.activeTrack !== 'manual') {
        isDisabled = true;
      } else if (isGenAi && eventState.layer2?.activeTrack !== 'gen-ai') {
        isDisabled = true;
      }
    }

    if (isDisabled) {
      handleBackToArena();
    }
  }, [activeRound, eventState]);

  return (
    <div
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: '#030712',
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
      <ScanOverlay currentStage={4} />

      {/* Compact Top Arena Header */}
      <ArenaHeader
        participant={participant}
        onOpenAdmin={onOpenAdmin}
      />

      {/* Active Challenge Round Route Placeholder (/layer/1, /layer/2, etc.) */}
      <AnimatePresence>
        {activeRound && (
          <RoundPlaceholder
            roundPath={activeRound.path}
            roundTitle={activeRound.title}
            participant={participant}
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
          genAiDesc="Website Building"
          manualDesc="Jumbled Code Challenge"
          genAiImage="/assets/layer2_genai.png"
          manualImage="/assets/layer2_manual.png"
          onSelectRound={handleSelectRound}
        />
      </main>

      {/* SUBTLE BOTTOM EVENT PROGRESSION TICKER */}
      <ProgressTicker />
    </div>
  );
}
