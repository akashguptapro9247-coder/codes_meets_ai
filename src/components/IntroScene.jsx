import React, { useState, useEffect, useRef } from 'react';
import HandshakeVideoBackground from './HandshakeVideoBackground';
import VideoOverlay from './VideoOverlay';
import DigitalParticles from './DigitalParticles';
import ScanOverlay from './ScanOverlay';
import EventTitle from './EventTitle';
import BeginButton from './BeginButton';
import IntroTransition from './IntroTransition';
import RegistrationScene from './RegistrationScene';
import { soundEngine } from '../utils/SoundEngine';

export default function IntroScene({ onBegin }) {
  // Stage 0: Black, Stage 1: HUD Boot, Stage 2: "CODE", Stage 3: "MEETS", Stage 4: "AI" + CTA Active
  const [stage, setStage] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Mouse Parallax position ref
  const mousePosition = useRef({ x: 0, y: 0 });

  // Handle Mouse movement for smooth Title & Parallax tilt
  useEffect(() => {
    const handleMouseMove = (e) => {
      mousePosition.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mousePosition.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Boot Sequence Timers (Run ONCE on load, independent of 8s video loop)
  useEffect(() => {
    const timer1 = setTimeout(() => setStage(1), 300);
    const timer2 = setTimeout(() => {
      setStage(2);
      soundEngine.playBoot();
    }, 1000);
    const timer3 = setTimeout(() => setStage(3), 1800);
    const timer4 = setTimeout(() => setStage(4), 2600);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, []);

  // Trigger Cinematic Transition from Page 1 to Page 2
  const handleBegin = () => {
    soundEngine.playWarp();
    setIsTransitioning(true);

    setTimeout(() => {
      setIsTransitioning(false);
      if (onBegin) onBegin();
    }, 650);
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
        justifyContent: 'center'
      }}
    >
      {/* z-index 0: Native HTML5 Loop Handshake Video Background */}
      <HandshakeVideoBackground />

      {/* z-index 1: Dark Cinematic Overlay & Radial Vignette */}
      <VideoOverlay />

      {/* z-index 2: Floating Digital Particles & Code Fragments Overlay */}
      <DigitalParticles />

      {/* z-index 10: HUD Scanner & Telemetry Overlay */}
      <ScanOverlay currentStage={stage} isLandingPage={true} />

      {/* Laser Scan Transition Overlay */}
      {isTransitioning && <IntroTransition />}

      {/* z-index 20: Layered Animated Event Title */}
      <EventTitle currentStage={stage} mousePosition={mousePosition} />

      {/* z-index 30: Cyber Game CTA Button */}
      <BeginButton onClick={handleBegin} currentStage={stage} />
    </div>
  );
}
