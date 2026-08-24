import React, { useState, useRef, useEffect } from 'react';
import RegistrationBackground from './RegistrationBackground';
import DigitalParticles from './DigitalParticles';
import ScanOverlay from './ScanOverlay';
import EventHeader from './EventHeader';
import RegistrationForm from './RegistrationForm';
import PlayerProfileCard from './PlayerProfileCard';
import ArenaStatusPanel from './ArenaStatusPanel';
import ProgressTicker from './ProgressTicker';
import PageTransition from './PageTransition';
import { soundEngine } from '../utils/SoundEngine';

export default function RegistrationScene({ onRegistrationSubmit }) {
  const [liveFormData, setLiveFormData] = useState({});
  const [isTransitioning, setIsTransitioning] = useState(false);

  const mousePosition = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      mousePosition.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mousePosition.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleFormSubmit = (participantData) => {
    soundEngine.playWarp();
    setIsTransitioning(true);

    setTimeout(() => {
      setIsTransitioning(false);
      if (onRegistrationSubmit) {
        onRegistrationSubmit(participantData);
      }
    }, 750);
  };

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
      {/* Laser Scan Transition Overlay */}
      {isTransitioning && <PageTransition />}

      {/* 3D Three.js Registration Scene Background */}
      <RegistrationBackground mousePosition={mousePosition} />

      {/* 2D Ambient Particles Overlay */}
      <DigitalParticles />

      {/* Sci-Fi HUD Scan Overlay */}
      <ScanOverlay currentStage={4} />

      {/* LEFT FLOATING PLAYER PROFILE CARD */}
      <PlayerProfileCard formData={liveFormData} />

      {/* RIGHT FLOATING ARENA SYSTEM STATUS PANEL */}
      <ArenaStatusPanel />

      {/* CENTER TERMINAL CONTAINER */}
      <div
        style={{
          zIndex: 30,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          padding: '16px'
        }}
      >
        {/* Top Branding Header */}
        <EventHeader mousePosition={mousePosition} />

        {/* Interactive Game Registration Form */}
        <RegistrationForm
          onSubmit={handleFormSubmit}
          onFormChange={setLiveFormData}
        />
      </div>

      {/* BOTTOM GAME MISSION PROGRESSION FOOTER */}
      <ProgressTicker />
    </div>
  );
}
