import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Terminal, Play } from 'lucide-react';
import { soundEngine } from '../../shared/utils/SoundEngine';
import { eventStateService } from '../../shared/services/eventStateService';
import Layer2ManualChallenge from './Layer2ManualChallenge';

export default function Layer2ManualRoute({ participant, onBack, skipIntro = false }) {
  const [isWorkspaceLaunched, setIsWorkspaceLaunched] = useState(skipIntro);

  // Real-time lock listener on landing screen — only kick if admin CHANGES state from active -> inactive
  const prevLockStateRef = useRef(null);
  useEffect(() => {
    const unsubscribe = eventStateService.subscribeToEventState((state) => {
      const prev = prevLockStateRef.current;
      prevLockStateRef.current = state;
      if (!prev) return; // Skip initial cached/default state call on mount
      const wasActive = prev.layer2?.active && prev.layer2?.activeTrack === 'manual';
      const isNowActive = state.layer2?.active && state.layer2?.activeTrack === 'manual';
      if (wasActive && !isNowActive) {
        if (onBack) onBack();
      }
    });
    return () => unsubscribe();
  }, [onBack]);

  // If the workspace is launched or skipIntro is true, render the actual challenge
  if (isWorkspaceLaunched || skipIntro) {
    return (
      <Layer2ManualChallenge
        participant={participant}
        onBack={onBack}
      />
    );
  }

  // The dedicated Layer 2 Manual landing screen (Coding Challenge)
  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflowY: 'auto', backgroundColor: '#030712' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 60,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '30px 24px',
          boxSizing: 'border-box',
          background: 'rgba(3, 7, 18, 0.92)',
          backdropFilter: 'blur(20px)'
        }}
      >
        {/* Top Bar */}
        <div
          style={{
            width: '100%',
            maxWidth: '760px',
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'center',
            marginBottom: '20px'
          }}
        >
          <button
            onClick={() => {
              soundEngine.playClick();
              if (onBack) onBack();
            }}
            onMouseEnter={() => soundEngine.playHover()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(0, 243, 255, 0.08)',
              border: '1px solid rgba(0, 243, 255, 0.3)',
              color: 'var(--cyan-glow)',
              padding: '8px 16px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8rem',
              letterSpacing: '0.1em',
              cursor: 'pointer'
            }}
          >
            <ArrowLeft size={16} />
            <span>BACK TO ARENA</span>
          </button>
        </div>

        {/* Challenge Entry Panel */}
        <div
          className="cyber-card"
          style={{
            width: '100%',
            maxWidth: '760px',
            padding: '36px 32px',
            boxSizing: 'border-box',
            borderColor: 'var(--cyan-glow)',
            boxShadow: '0 0 40px rgba(0, 243, 255, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px'
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Terminal size={26} color="var(--cyan-glow)" />
            <div>
              <h2
                style={{
                  fontFamily: 'var(--font-title)',
                  fontSize: '1.5rem',
                  margin: 0,
                  color: '#ffffff',
                  letterSpacing: '0.1em'
                }}
              >
                LAYER 02 — MANUAL TRACK
              </h2>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.72rem',
                  color: 'var(--cyan-glow)',
                  marginTop: '4px',
                  letterSpacing: '0.1em'
                }}
              >
                CODE LOGIC CHALLENGE
              </div>
            </div>
          </div>

          {/* Participant Tag */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 14px',
              background: 'rgba(57, 255, 20, 0.08)',
              border: '1px solid rgba(57, 255, 20, 0.3)',
              borderRadius: '3px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.78rem',
              color: 'var(--lime-accent)'
            }}
          >
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--lime-accent)', display: 'inline-block', boxShadow: '0 0 8px var(--lime-accent)' }} />
            {participant?.name || 'Participant'} — {participant?.rollNumber || participant?.roll_number || 'N/A'}
          </div>

          {/* Challenge Instructions */}
          <div
            style={{
              padding: '18px 20px',
              background: 'rgba(2, 6, 18, 0.95)',
              border: '1px solid rgba(0, 243, 255, 0.18)',
              borderRadius: '4px',
              fontFamily: 'var(--font-body)',
              fontSize: '0.9rem',
              color: '#d1d5db',
              lineHeight: 1.6
            }}
          >
            Solve programming problems using C, Java or Python.<br/><br/>
            • Select one programming language.<br/>
            • Solve all 5 coding questions.<br/>
            • Q1 and Q2 have limited attempts.<br/>
            • Q3, Q4 and Q5 allow unlimited attempts.<br/>
            • Use RUN / CHECK to evaluate your solution.<br/>
            • You can skip a question for 1 mark.<br/>
            • The complete round has one 30-minute timer.
          </div>

          {/* Rules at-a-glance */}
          <div
            style={{
              display: 'flex',
              gap: '12px',
              flexWrap: 'wrap'
            }}
          >
            {[
              { label: '30 MIN', desc: 'Total Round Time' },
              { label: '5 QUESTIONS', desc: '25 Marks' },
              { label: 'C / JAVA / PYTHON', desc: 'Choose Your Language' }
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  flex: '1 1 auto',
                  padding: '10px 14px',
                  background: 'rgba(0, 243, 255, 0.06)',
                  border: '1px solid rgba(0, 243, 255, 0.2)',
                  borderRadius: '3px',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 800, color: 'var(--cyan-glow)' }}>
                  {item.label}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#9ca3af', marginTop: '2px' }}>
                  {item.desc}
                </div>
              </div>
            ))}
          </div>

          {/* Launch Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={() => {
                soundEngine.playBoot();
                setIsWorkspaceLaunched(true);
              }}
              className="cyber-btn"
              style={{
                padding: '12px 32px',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              <Play size={16} />
              <span>BEGIN CHALLENGE</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
