import React from 'react';
import { motion } from 'framer-motion';
import { Radio, ShieldAlert, Cpu, Users } from 'lucide-react';

export default function ArenaStatusPanel() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="hidden lg:flex"
      style={{
        position: 'absolute',
        right: '40px',
        top: '50%',
        transform: 'translateY(-50%)',
        width: '230px',
        background: 'rgba(4, 9, 22, 0.75)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(0, 243, 255, 0.25)',
        borderRadius: '4px',
        padding: '20px',
        boxSizing: 'border-box',
        zIndex: 25,
        flexDirection: 'column',
        gap: '14px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.8), inset 0 0 15px rgba(0, 243, 255, 0.1)',
        pointerEvents: 'none'
      }}
    >
      {/* Corner Brackets */}
      <div className="hud-corner hud-top-left" style={{ width: '10px', height: '10px' }} />
      <div className="hud-corner hud-top-right" style={{ width: '10px', height: '10px' }} />
      <div className="hud-corner hud-bottom-left" style={{ width: '10px', height: '10px' }} />
      <div className="hud-corner hud-bottom-right" style={{ width: '10px', height: '10px' }} />

      {/* Panel Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          borderBottom: '1px solid rgba(0, 243, 255, 0.15)',
          paddingBottom: '8px'
        }}
      >
        <Radio size={14} color="var(--lime-accent)" className="animate-pulse" />
        <span
          style={{
            fontFamily: 'var(--font-title)',
            fontSize: '0.75rem',
            color: '#ffffff',
            letterSpacing: '0.15em'
          }}
        >
          ARENA STATUS
        </span>
      </div>

      {/* Metrics List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontFamily: 'var(--font-mono)', fontSize: '0.72rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#9ca3af' }}>AI CORE</span>
          <span style={{ color: 'var(--lime-accent)', fontWeight: 700 }}>ONLINE</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#9ca3af' }}>MATCH SYSTEM</span>
          <span style={{ color: 'var(--cyan-glow)' }}>READY</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#9ca3af' }}>PLAYERS</span>
          <span style={{ color: '#ffffff' }}>WAITING</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#9ca3af' }}>ROUND</span>
          <span style={{ color: 'var(--magenta-glow)', fontWeight: 700 }}>01</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#9ca3af' }}>DIFFICULTY</span>
          <span style={{ color: '#ef4444' }}>UNKNOWN</span>
        </div>
      </div>

      {/* Live System Signal Ticker */}
      <div
        style={{
          padding: '8px 10px',
          background: 'rgba(0, 243, 255, 0.05)',
          borderLeft: '2px solid var(--cyan-glow)',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.65rem',
          color: 'var(--cyan-glow)'
        }}
      >
        [ BROADCAST ]: AWAITING PLAYER INITIALIZATION...
      </div>
    </motion.div>
  );
}
