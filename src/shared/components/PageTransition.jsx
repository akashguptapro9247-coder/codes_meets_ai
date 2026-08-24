import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TRANSITION_STEPS = [
  'IDENTITY VERIFIED',
  'SYSTEM INITIALIZING',
  'CODE MEETS AI',
  'EVENT ARENA'
];

export default function PageTransition() {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((prev) => (prev < TRANSITION_STEPS.length - 1 ? prev + 1 : prev));
    }, 180);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="transition-warp-overlay">
      {/* High-speed Laser Sweep Beam */}
      <motion.div
        className="warp-beam"
        initial={{ scaleY: 1, y: '-50vh', opacity: 0.9 }}
        animate={{
          y: ['-50vh', '50vh'],
          scaleY: [1, 30, 1],
          opacity: [0.9, 1, 0]
        }}
        transition={{ duration: 0.75, ease: 'easeInOut' }}
      />

      {/* Sequential Game Telemetry Text */}
      <div
        style={{
          position: 'absolute',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={stepIndex}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            style={{
              fontFamily: 'var(--font-title)',
              fontSize: '1.5rem',
              color: stepIndex === 3 ? 'var(--lime-accent)' : 'var(--cyan-glow)',
              letterSpacing: '0.25em',
              textShadow: stepIndex === 3
                ? '0 0 25px var(--lime-accent)'
                : '0 0 20px var(--cyan-glow)'
            }}
          >
            [ {TRANSITION_STEPS[stepIndex]} ]
          </motion.div>
        </AnimatePresence>

        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'rgba(0, 243, 255, 0.6)' }}>
          DEPLOYS::NET_GRID_01 // ACCESS_GRANTED
        </div>
      </div>
    </div>
  );
}
