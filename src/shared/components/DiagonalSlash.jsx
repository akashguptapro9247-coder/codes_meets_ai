import React from 'react';
import { motion } from 'framer-motion';

export default function DiagonalSlash({ isActive = false, activeTrack = null }) {
  const isGenAiActive = isActive && activeTrack === 'gen-ai';
  const isManualActive = isActive && activeTrack === 'manual';

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: '50%',
        width: '2px',
        transform: 'translateX(-50%) skewX(-20deg)',
        zIndex: 15,
        pointerEvents: 'none'
      }}
    >
      {/* Base Line */}
      <div
        style={{
          width: '100%',
          height: '100%',
          background: isActive
            ? 'linear-gradient(180deg, rgba(0, 243, 255, 0.4), rgba(224, 38, 255, 0.6), rgba(0, 243, 255, 0.4))'
            : 'rgba(255, 255, 255, 0.1)',
          boxShadow: isActive
            ? isGenAiActive
              ? '0 0 15px var(--cyan-glow)'
              : isManualActive
              ? '0 0 15px var(--magenta-glow)'
              : '0 0 10px rgba(0, 243, 255, 0.3)'
            : 'none',
          transition: 'all 0.4s ease'
        }}
      />

      {/* Moving Electric Light Streak along Slash */}
      {isActive && (
        <motion.div
          initial={{ top: '-20%', opacity: 0 }}
          animate={{ top: ['-20%', '120%'], opacity: [0, 1, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'linear' }}
          style={{
            position: 'absolute',
            left: '-2px',
            width: '6px',
            height: '60px',
            background: isGenAiActive
              ? 'var(--cyan-glow)'
              : isManualActive
              ? 'var(--magenta-glow)'
              : '#ffffff',
            boxShadow: '0 0 15px #ffffff, 0 0 25px var(--cyan-glow)',
            borderRadius: '4px'
          }}
        />
      )}
    </div>
  );
}
