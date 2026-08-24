import React from 'react';
import { motion } from 'framer-motion';

export default function IntroTransition() {
  return (
    <div className="transition-warp-overlay">
      {/* High Speed Scanning Laser Beam */}
      <motion.div
        className="warp-beam"
        initial={{ scaleY: 1, y: '-50vh', opacity: 0.8 }}
        animate={{
          y: ['-50vh', '50vh'],
          scaleY: [1, 25, 1],
          opacity: [0.9, 1, 0]
        }}
        transition={{ duration: 0.65, ease: 'easeInOut' }}
      />

      {/* Interface Scan Telemetry Text */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: [0, 1, 0], scale: [0.9, 1.05, 1.1] }}
        transition={{ duration: 0.65 }}
        style={{
          position: 'absolute',
          fontFamily: 'var(--font-title)',
          fontSize: '1.4rem',
          color: 'var(--cyan-glow)',
          letterSpacing: '0.3em',
          textShadow: '0 0 20px var(--cyan-glow)'
        }}
      >
        [ ARENA ENTRY PROTOCOL INITIALIZED ]
      </motion.div>
    </div>
  );
}
