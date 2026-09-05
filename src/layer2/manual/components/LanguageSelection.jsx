import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Terminal, Code, Cpu, Shield } from 'lucide-react';
import { soundEngine } from '../../../shared/utils/SoundEngine';

export default function LanguageSelection({ onSelect, onBack, participant, batchYear }) {
  const [selectedLang, setSelectedLang] = useState(null);

  const languages = [
    { id: 'C', name: 'C', icon: <Cpu size={32} /> },
    { id: 'Java', name: 'Java', icon: <Code size={32} /> },
    { id: 'Python', name: 'Python', icon: <Terminal size={32} /> }
  ];

  const handleSelect = (langId) => {
    soundEngine.playClick();
    setSelectedLang(langId);
  };

  const handleConfirm = () => {
    if (selectedLang) {
      soundEngine.playBoot();
      onSelect(selectedLang);
    }
  };

  const isFirstYear = batchYear === '26';

  return (
    <div style={{
      position: 'fixed', inset: 0,
      width: '100vw', height: '100vh',
      zIndex: 80, backgroundColor: '#020612',
      overflow: 'hidden', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      userSelect: 'none'
    }}>
      {/* FLOATING MAIN MANUAL CHALLENGE PANEL */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -15 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="cyber-card"
        style={{
          position: 'relative',
          width: 'calc(100vw - 8vw)',
          height: 'calc(100vh - 6vh)',
          maxWidth: '1440px',
          maxHeight: '880px',
          background: 'rgba(4, 9, 24, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(0, 243, 255, 0.35)',
          boxShadow: '0 25px 75px rgba(0, 0, 0, 0.95), 0 0 45px rgba(0, 243, 255, 0.2), inset 0 0 25px rgba(0, 243, 255, 0.06)',
          borderRadius: '4px',
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxSizing: 'border-box',
          zIndex: 20
        }}
      >
        {/* Four Sci-Fi HUD Corner Brackets */}
        <div className="hud-corner hud-top-left"    style={{ width: '16px', height: '16px', zIndex: 25 }} />
        <div className="hud-corner hud-top-right"   style={{ width: '16px', height: '16px', zIndex: 25 }} />
        <div className="hud-corner hud-bottom-left" style={{ width: '16px', height: '16px', zIndex: 25 }} />
        <div className="hud-corner hud-bottom-right"style={{ width: '16px', height: '16px', zIndex: 25 }} />
      {/* 1. TECHNICAL TOP HEADER */}
      <header
        style={{
          flexShrink: 0,
          height: '60px',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(0, 243, 255, 0.25)',
          background: 'linear-gradient(90deg, rgba(2, 6, 20, 0.95) 0%, rgba(5, 14, 38, 0.95) 100%)',
          boxSizing: 'border-box',
          zIndex: 10
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '4px',
              background: 'rgba(0, 243, 255, 0.15)',
              border: '1px solid var(--cyan-glow)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--cyan-glow)'
            }}
          >
            <Terminal size={17} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span
                style={{
                  fontFamily: 'var(--font-title)',
                  fontSize: '0.92rem',
                  fontWeight: 900,
                  letterSpacing: '0.12em',
                  color: '#ffffff'
                }}
              >
                LAYER 02 // MANUAL CODING CHALLENGE
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span
            className="cyber-badge"
            style={{
              fontSize: '0.64rem',
              padding: '2px 8px',
              background: isFirstYear ? 'rgba(0, 243, 255, 0.15)' : 'rgba(224, 38, 255, 0.15)',
              borderColor: isFirstYear ? 'var(--cyan-glow)' : 'var(--magenta-glow)',
              color: isFirstYear ? 'var(--cyan-glow)' : 'var(--magenta-glow)'
            }}
          >
            {isFirstYear ? '1ST YEAR ASSESSMENT' : '2ND YEAR ASSESSMENT'}
          </span>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '5px 10px',
              background: 'rgba(0, 243, 255, 0.06)',
              border: '1px solid rgba(0, 243, 255, 0.25)',
              borderRadius: '2px'
            }}
          >
            <Shield size={13} color="var(--lime-accent)" />
            <span style={{ fontSize: '0.74rem', color: '#9ca3af', fontFamily: 'var(--font-mono)' }}>
              OPERATOR:
            </span>
            <span
              style={{
                fontSize: '0.78rem',
                fontWeight: 700,
                color: '#ffffff',
                fontFamily: 'var(--font-mono)'
              }}
            >
              {(participant?.name || 'PARTICIPANT').toUpperCase()}
            </span>
            <span style={{ color: 'rgba(0, 243, 255, 0.4)' }}>|</span>
            <span
              style={{
                fontSize: '0.72rem',
                color: 'var(--cyan-glow)',
                fontFamily: 'var(--font-mono)'
              }}
            >
              ROLL: {participant?.rollNumber || participant?.roll_number || '23-XXX'}
            </span>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <div style={{
        flex: 1,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
        position: 'relative'
      }}>
        
        {/* Technical Corner Decorations */}
        <div style={{ position: 'absolute', top: '40px', left: '40px', width: '20px', height: '20px', borderTop: '2px solid rgba(0,243,255,0.3)', borderLeft: '2px solid rgba(0,243,255,0.3)' }} />
        <div style={{ position: 'absolute', top: '40px', right: '40px', width: '20px', height: '20px', borderTop: '2px solid rgba(0,243,255,0.3)', borderRight: '2px solid rgba(0,243,255,0.3)' }} />
        <div style={{ position: 'absolute', bottom: '40px', left: '40px', width: '20px', height: '20px', borderBottom: '2px solid rgba(0,243,255,0.3)', borderLeft: '2px solid rgba(0,243,255,0.3)' }} />
        <div style={{ position: 'absolute', bottom: '40px', right: '40px', width: '20px', height: '20px', borderBottom: '2px solid rgba(0,243,255,0.3)', borderRight: '2px solid rgba(0,243,255,0.3)' }} />

        <div style={{
            background: 'rgba(4, 9, 24, 0.95)',
            border: '1px solid rgba(0, 243, 255, 0.35)',
            boxShadow: '0 0 45px rgba(0, 243, 255, 0.1), inset 0 0 25px rgba(0, 243, 255, 0.05)',
            borderRadius: '4px',
            padding: '40px 60px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            maxWidth: '900px',
            width: '100%',
            position: 'relative'
        }}>
          <h2 style={{ fontFamily: 'var(--font-title)', color: 'var(--cyan-glow)', fontSize: '2rem', marginBottom: '10px', letterSpacing: '0.1em' }}>
            SELECT YOUR LANGUAGE
          </h2>
          <p style={{ color: '#9ca3af', fontFamily: 'var(--font-mono)', marginBottom: '40px', fontSize: '0.9rem' }}>
            Choose carefully. This cannot be changed later.
          </p>

          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
            {languages.map((lang) => (
              <motion.div
                key={lang.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSelect(lang.id)}
                style={{
                  width: '180px',
                  height: '200px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '20px',
                  background: selectedLang === lang.id ? 'rgba(0, 243, 255, 0.08)' : 'rgba(5, 14, 38, 0.8)',
                  border: `1px solid ${selectedLang === lang.id ? 'var(--cyan-glow)' : 'rgba(255, 255, 255, 0.1)'}`,
                  borderRadius: '2px',
                  cursor: 'pointer',
                  color: selectedLang === lang.id ? 'var(--cyan-glow)' : '#9ca3af',
                  transition: 'all 0.2s ease',
                  boxShadow: selectedLang === lang.id ? '0 0 20px rgba(0, 243, 255, 0.2), inset 0 0 10px rgba(0, 243, 255, 0.1)' : 'none',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {selectedLang === lang.id && (
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '2px', background: 'var(--cyan-glow)', boxShadow: '0 0 10px var(--cyan-glow)' }} />
                )}
                {lang.icon}
                <span style={{ fontFamily: 'var(--font-title)', fontSize: '1.2rem', letterSpacing: '0.1em' }}>
                  {lang.name}
                </span>
                {selectedLang === lang.id && (
                  <div style={{ position: 'absolute', bottom: '10px', fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--cyan-glow)' }}>
                    [ SELECTED ]
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          <div style={{ marginTop: '50px', display: 'flex', gap: '20px', width: '100%', justifyContent: 'space-between' }}>
            <button
              onClick={() => {
                soundEngine.playClick();
                if (onBack) onBack();
              }}
              className="cyber-btn"
              style={{
                padding: '12px 24px', 
                fontSize: '0.9rem', 
                borderColor: 'rgba(239, 68, 68, 0.5)', 
                color: '#fca5a5',
                background: 'rgba(239, 68, 68, 0.05)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span style={{ fontSize: '1.2rem', lineHeight: '1' }}>←</span> BACK
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedLang}
              className="cyber-btn"
              style={{
                padding: '12px 32px',
                fontSize: '1rem',
                opacity: selectedLang ? 1 : 0.5,
                cursor: selectedLang ? 'pointer' : 'not-allowed',
                borderColor: selectedLang ? 'var(--cyan-glow)' : 'rgba(255, 255, 255, 0.2)',
                color: selectedLang ? 'var(--cyan-glow)' : '#9ca3af',
                background: selectedLang ? 'rgba(0, 243, 255, 0.1)' : 'transparent',
                fontWeight: selectedLang ? 'bold' : 'normal',
                boxShadow: selectedLang ? '0 0 15px rgba(0, 243, 255, 0.2)' : 'none'
              }}
            >
              CONFIRM SELECTION <span style={{ fontSize: '1.2rem', lineHeight: '1', marginLeft: '8px' }}>→</span>
            </button>
          </div>
        </div>
      </div>
      </motion.div>
    </div>
  );
}
