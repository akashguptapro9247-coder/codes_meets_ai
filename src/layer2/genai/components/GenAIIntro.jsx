import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, Terminal } from 'lucide-react';
import { soundEngine } from '../../../shared/utils/SoundEngine';

export default function GenAIIntro({ participant, onBack, onBegin }) {
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
          padding: '24px 20px',
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
            marginBottom: '16px'
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

        {/* Challenge Entry Panel (Base: Pic 2) */}
        <div
          className="cyber-card"
          style={{
            width: '100%',
            maxWidth: '760px',
            padding: '28px 32px',
            boxSizing: 'border-box',
            borderColor: 'var(--cyan-glow)',
            boxShadow: '0 0 40px rgba(0, 243, 255, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
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
                LAYER 02 - GEN AI TRACK
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
                WEBSITE BUILDING CHALLENGE
              </div>
            </div>
          </div>

          {/* Participant Tag */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              background: 'rgba(57, 255, 20, 0.08)',
              border: '1px solid rgba(57, 255, 20, 0.3)',
              borderRadius: '3px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.78rem',
              color: 'var(--lime-accent)',
              alignSelf: 'flex-start'
            }}
          >
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--lime-accent)', display: 'inline-block', boxShadow: '0 0 8px var(--lime-accent)' }} />
            {participant?.name || 'Participant'} — {participant?.rollNumber || participant?.roll_number || 'N/A'}
          </div>

          {/* High-Level Challenge Overview Box */}
          <div
            style={{
              padding: '18px 20px',
              background: 'rgba(2, 6, 18, 0.95)',
              border: '1px solid rgba(0, 243, 255, 0.18)',
              borderRadius: '4px',
              fontFamily: 'var(--font-body)',
              fontSize: '0.88rem',
              color: '#d1d5db',
              lineHeight: 1.6
            }}
          >
            Build a complete project using AI tools and explain your development process. You will be assigned a project topic. Zip your project and submit it along with a detailed explanation of what you built and how AI helped you.
          </div>

          {/* 3 Track Fact Cards */}
          <div
            style={{
              display: 'flex',
              gap: '12px',
              flexWrap: 'wrap'
            }}
          >
            {[
              { label: '30 MIN', desc: 'Time Limit' },
              { label: '1 SUBMISSION', desc: 'One Attempt' },
              { label: 'EXPLANATION', desc: 'Required' }
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  flex: '1 1 0px',
                  minWidth: '160px',
                  padding: '12px 14px',
                  background: 'rgba(0, 243, 255, 0.06)',
                  border: '1px solid rgba(0, 243, 255, 0.2)',
                  borderRadius: '3px',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', fontWeight: 800, color: 'var(--cyan-glow)' }}>
                  {item.label}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: '#9ca3af', marginTop: '3px' }}>
                  {item.desc}
                </div>
              </div>
            ))}
          </div>

          {/* Launch Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
            <button
              onClick={() => {
                soundEngine.playBoot();
                if (onBegin) onBegin();
              }}
              onMouseEnter={() => soundEngine.playHover()}
              className="cyber-btn"
              style={{
                padding: '12px 32px',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                cursor: 'pointer'
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
