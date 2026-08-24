import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Radio } from 'lucide-react';

export default function LockedBlurOverlay({ layerTitle }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
      transition={{ duration: 0.5 }}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 25,
        background: 'rgba(3, 7, 18, 0.75)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        textAlign: 'center',
        pointerEvents: 'all',
        userSelect: 'none'
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Animated Glowing Lock Badge */}
      <motion.div
        animate={{ scale: [0.95, 1.05, 0.95] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'rgba(239, 68, 68, 0.12)',
          border: '1px solid rgba(239, 68, 68, 0.5)',
          boxShadow: '0 0 20px rgba(239, 68, 68, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '12px'
        }}
      >
        <Lock size={26} color="#ef4444" />
      </motion.div>

      {/* Locked Telemetry Message */}
      <h3
        style={{
          fontFamily: 'var(--font-title)',
          fontSize: '1.2rem',
          margin: '0 0 4px 0',
          color: '#ffffff',
          letterSpacing: '0.15em'
        }}
      >
        {layerTitle} — ACCESS LOCKED
      </h3>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.78rem',
          color: 'var(--cyan-glow)',
          letterSpacing: '0.1em',
          marginTop: '4px'
        }}
      >
        <Radio size={14} className="animate-pulse" color="var(--cyan-glow)" />
        <span>WAITING FOR ADMIN ACTIVATION</span>
      </div>
    </motion.div>
  );
}
