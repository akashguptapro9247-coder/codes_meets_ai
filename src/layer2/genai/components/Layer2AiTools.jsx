import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Sparkles, Bot, ArrowRight } from 'lucide-react';
import { soundEngine } from '../../../shared/utils/SoundEngine';

export default function Layer2AiTools({ disabled = false }) {
  const handleOpenPlatform = (url) => {
    if (disabled) return;
    soundEngine.playClick();
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className="cyber-card"
      style={{
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        padding: '10px 14px',
        background: 'rgba(3, 14, 30, 0.86)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderColor: 'rgba(0, 243, 255, 0.38)',
        boxShadow: '0 0 20px rgba(0, 243, 255, 0.1), inset 0 0 14px rgba(0, 243, 255, 0.03)',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '3px',
        boxSizing: 'border-box',
        opacity: disabled ? 0.5 : 1,
        pointerEvents: disabled ? 'none' : 'auto'
      }}
    >
      {/* Top Subtle Cyan Glow Accent Line */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: 'linear-gradient(90deg, transparent, var(--cyan-glow), transparent)'
        }}
      />

      {/* Header Row: Title & Action Launch Buttons */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px'
        }}
      >
        {/* Section Heading */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Sparkles size={14} color="var(--cyan-glow)" style={{ filter: 'drop-shadow(0 0 5px var(--cyan-glow))' }} />
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.74rem',
              color: 'var(--cyan-glow)',
              letterSpacing: '0.12em',
              fontWeight: 800,
              textShadow: '0 0 8px rgba(0, 243, 255, 0.5)'
            }}
          >
            AI GENERATION TOOLS
          </span>
        </div>

        {/* AI Launch Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* ChatGPT Button */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.03, y: -1, boxShadow: '0 0 18px rgba(16, 185, 129, 0.5)' }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleOpenPlatform('https://chatgpt.com/')}
            onMouseEnter={() => soundEngine.playHover()}
            className="cyber-btn"
            style={{
              padding: '5px 12px',
              fontSize: '0.72rem',
              letterSpacing: '0.08em',
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.28) 0%, rgba(2, 28, 22, 0.92) 100%)',
              borderColor: '#10b981',
              color: '#ffffff',
              boxShadow: '0 0 14px rgba(16, 185, 129, 0.25), inset 0 0 8px rgba(16, 185, 129, 0.12)',
              cursor: 'pointer'
            }}
            title="Open ChatGPT in a new tab"
          >
            <Bot size={13} color="#10b981" style={{ filter: 'drop-shadow(0 0 4px #10b981)' }} />
            <span>CHATGPT</span>
            <ExternalLink size={11} color="#10b981" />
          </motion.button>

          {/* Gemini Button */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.03, y: -1, boxShadow: '0 0 18px rgba(168, 85, 247, 0.5)' }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleOpenPlatform('https://gemini.google.com/')}
            onMouseEnter={() => soundEngine.playHover()}
            className="cyber-btn"
            style={{
              padding: '5px 12px',
              fontSize: '0.72rem',
              letterSpacing: '0.08em',
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.28) 0%, rgba(24, 10, 42, 0.92) 100%)',
              borderColor: '#c084fc',
              color: '#ffffff',
              boxShadow: '0 0 14px rgba(168, 85, 247, 0.25), inset 0 0 8px rgba(168, 85, 247, 0.12)',
              cursor: 'pointer'
            }}
            title="Open Google Gemini in a new tab"
          >
            <Sparkles size={13} color="#c084fc" style={{ filter: 'drop-shadow(0 0 4px #c084fc)' }} />
            <span>GEMINI</span>
            <ExternalLink size={11} color="#c084fc" />
          </motion.button>
        </div>
      </div>

      {/* Guide Content */}
      <p
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '0.74rem',
          color: '#d1d5db',
          lineHeight: '1.4',
          margin: 0
        }}
      >
        Use ChatGPT or Gemini as development assistants to plan, generate, refine, debug, and improve your application. You may use AI during development, but make sure you understand the implementation and can explain your final solution.
      </p>

      {/* Workflow Tag Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(0, 243, 255, 0.06)',
          border: '1px solid rgba(0, 243, 255, 0.22)',
          borderRadius: '2px',
          padding: '4px 8px',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.64rem',
          color: 'var(--cyan-glow)',
          letterSpacing: '0.06em',
          flexWrap: 'wrap',
          boxShadow: 'inset 0 0 8px rgba(0, 243, 255, 0.03)'
        }}
      >
        <span style={{ color: 'var(--lime-accent)', fontWeight: 700 }}>WORKFLOW:</span>
        <span>PLAN</span>
        <ArrowRight size={10} color="rgba(0, 243, 255, 0.6)" />
        <span>GENERATE</span>
        <ArrowRight size={10} color="rgba(0, 243, 255, 0.6)" />
        <span>TEST</span>
        <ArrowRight size={10} color="rgba(0, 243, 255, 0.6)" />
        <span>REFINE</span>
        <ArrowRight size={10} color="rgba(0, 243, 255, 0.6)" />
        <span>EXPLAIN</span>
      </div>

      {/* Short Action Instruction */}
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.64rem',
          color: '#9ca3af',
          lineHeight: '1.35',
          letterSpacing: '0.02em'
        }}
      >
        Build a working solution, test its interactions, then explain what you built and how AI contributed.
      </div>
    </div>
  );
}
