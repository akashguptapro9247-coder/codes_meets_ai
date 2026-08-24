import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Cpu, Code2, Trophy, Terminal, Lock, ArrowLeft, Radio } from 'lucide-react';
import { soundEngine } from '../utils/SoundEngine';

export default function PageThreeArena({ participant, onBackToRegistration }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 20px',
        boxSizing: 'border-box',
        overflowY: 'auto'
      }}
    >
      {/* Top Arena Navigation Bar */}
      <div
        style={{
          width: '100%',
          maxWidth: '1050px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px'
        }}
      >
        <button
          onClick={() => {
            soundEngine.playClick();
            onBackToRegistration();
          }}
          onMouseEnter={() => soundEngine.playHover()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(0, 243, 255, 0.06)',
            border: '1px solid rgba(0, 243, 255, 0.3)',
            color: 'var(--cyan-glow)',
            padding: '8px 14px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.78rem',
            letterSpacing: '0.1em',
            cursor: 'pointer'
          }}
        >
          <ArrowLeft size={16} />
          <span>[ EDIT IDENTITY ]</span>
        </button>

        <div style={{ display: 'flex', gap: '12px', fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>
          <span className="cyber-badge" style={{ color: 'var(--lime-accent)', borderColor: 'var(--lime-accent)' }}>
            STATUS: SESSION ACTIVE
          </span>
          <span className="cyber-badge">ARENA REGION: 01</span>
        </div>
      </div>

      {/* Main Grid Container */}
      <div
        style={{
          width: '100%',
          maxWidth: '1050px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '20px'
        }}
      >
        {/* Verified Operator Identity Card */}
        <div className="cyber-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <ShieldCheck color="var(--lime-accent)" size={24} />
            <div>
              <h2 style={{ fontFamily: 'var(--font-title)', fontSize: '1.2rem', margin: 0, color: '#ffffff' }}>
                VERIFIED OPERATOR CARD
              </h2>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--cyan-glow)' }}>
                SESSION INITIALIZED // ACCESS GRANTED
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontFamily: 'var(--font-mono)' }}>
            <div style={{ padding: '10px 14px', background: 'rgba(0, 243, 255, 0.05)', borderLeft: '3px solid var(--cyan-glow)' }}>
              <div style={{ fontSize: '0.68rem', color: '#9ca3af' }}>PARTICIPANT NAME</div>
              <div style={{ fontSize: '1.1rem', color: '#ffffff', fontWeight: 700, marginTop: '2px' }}>
                {participant?.name || 'UNKNOWN OPERATOR'}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div style={{ padding: '8px 12px', background: 'rgba(2, 6, 18, 0.8)', border: '1px solid rgba(0, 243, 255, 0.15)' }}>
                <div style={{ fontSize: '0.65rem', color: '#9ca3af' }}>ROLL NUMBER</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--cyan-glow)', marginTop: '2px' }}>
                  {participant?.rollNumber || 'N/A'}
                </div>
              </div>

              <div style={{ padding: '8px 12px', background: 'rgba(2, 6, 18, 0.8)', border: '1px solid rgba(0, 243, 255, 0.15)' }}>
                <div style={{ fontSize: '0.65rem', color: '#9ca3af' }}>BRANCH</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--cyan-glow)', marginTop: '2px' }}>
                  {participant?.branch || 'N/A'}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div style={{ padding: '8px 12px', background: 'rgba(2, 6, 18, 0.8)', border: '1px solid rgba(0, 243, 255, 0.15)' }}>
                <div style={{ fontSize: '0.65rem', color: '#9ca3af' }}>YEAR</div>
                <div style={{ fontSize: '0.9rem', color: '#ffffff', marginTop: '2px' }}>
                  {participant?.year || 'N/A'}
                </div>
              </div>

              <div style={{ padding: '8px 12px', background: 'rgba(2, 6, 18, 0.8)', border: '1px solid rgba(0, 243, 255, 0.15)' }}>
                <div style={{ fontSize: '0.65rem', color: '#9ca3af' }}>SECTION</div>
                <div style={{ fontSize: '0.9rem', color: '#ffffff', marginTop: '2px' }}>
                  {participant?.section || 'N/A'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Admin-Controlled Track Status & Event Countdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Admin Control Notice */}
          <div className="cyber-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--magenta-glow)', marginBottom: '8px' }}>
              <Lock size={20} />
              <span style={{ fontFamily: 'var(--font-title)', fontSize: '0.95rem', letterSpacing: '0.08em' }}>
                ADMIN CONTROLLED BATTLE TRACK
              </span>
            </div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: '#9ca3af', margin: 0, lineHeight: 1.5 }}>
              Track allocation (Generative AI Arena vs Manual Code Arena) is governed by system administrators prior to match start.
            </p>
            <div
              style={{
                marginTop: '12px',
                padding: '8px 12px',
                background: 'rgba(224, 38, 255, 0.1)',
                border: '1px solid var(--magenta-glow)',
                color: '#ffffff',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Radio size={14} className="animate-pulse" color="var(--magenta-glow)" />
              <span>AWAITING ADMIN BROADCAST...</span>
            </div>
          </div>

          {/* Event Launch Countdown */}
          <div className="cyber-card" style={{ padding: '20px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--cyan-glow)', letterSpacing: '0.15em' }}>
              EVENT LAUNCH COUNTDOWN
            </div>
            <div
              style={{
                fontFamily: 'var(--font-title)',
                fontSize: '1.8rem',
                color: '#ffffff',
                fontWeight: 900,
                marginTop: '8px',
                textShadow: '0 0 15px var(--cyan-glow)'
              }}
            >
              04D : 18H : 22M : 45S
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
