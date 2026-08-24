import React from 'react';
import { motion } from 'framer-motion';

export default function EventHeader({ mousePosition }) {
  const tiltX = mousePosition ? mousePosition.current.y * -4 : 0;
  const tiltY = mousePosition ? mousePosition.current.x * 6 : 0;

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 20,
        transform: `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`,
        transition: 'transform 0.15s ease-out',
        pointerEvents: 'none',
        marginBottom: '14px'
      }}
    >
      <div className="title-container" style={{ transform: 'scale(0.65)' }}>
        {/* Layer 2: Duplicated Glitch Chromatic Layers */}
        <div className="glitch-layer glitch-cyan" aria-hidden="true">
          CODE MEETS AI
        </div>
        <div className="glitch-layer glitch-magenta" aria-hidden="true">
          CODE MEETS AI
        </div>

        {/* Layer 6: Light Sweep Beam */}
        <div className="title-light-sweep" />

        {/* Main Header Title */}
        <h1 className="main-title" style={{ fontSize: 'clamp(2rem, 4.5vw, 3.8rem)' }}>
          <span style={{ marginRight: '0.25em' }}>CODE</span>
          <span style={{ marginRight: '0.25em' }}>MEETS</span>
          <span className="title-gradient-ai">AI</span>
        </h1>
      </div>

      {/* Micro Status Line */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.8 }}
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.65rem',
          color: 'var(--cyan-glow)',
          letterSpacing: '0.25em',
          marginTop: '-12px',
          textTransform: 'uppercase'
        }}
      >
        [ TERMINAL IDENTITY GATEWAY // v2.4 ]
      </motion.div>
    </div>
  );
}
