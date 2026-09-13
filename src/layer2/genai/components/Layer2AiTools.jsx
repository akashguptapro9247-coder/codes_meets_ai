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
        gap: '8px',
        padding: '12px 16px',
        background: 'rgba(6, 22, 48, 0.85)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        borderColor: 'rgba(0, 243, 255, 0.42)',
        boxShadow: '0 0 22px rgba(0, 243, 255, 0.12), inset 0 0 16px rgba(0, 243, 255, 0.04)',
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
              fontSize: '0.76rem',
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
            whileHover={{ scale: 1.03, y: -1, boxShadow: '0 0 20px rgba(16, 185, 129, 0.55)' }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleOpenPlatform('https://chatgpt.com/')}
            onMouseEnter={() => soundEngine.playHover()}
            className="cyber-btn"
            style={{
              padding: '6px 14px',
              fontSize: '0.74rem',
              letterSpacing: '0.08em',
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.32) 0%, rgba(4, 36, 28, 0.92) 100%)',
              borderColor: '#10b981',
              color: '#ffffff',
              boxShadow: '0 0 16px rgba(16, 185, 129, 0.28), inset 0 0 8px rgba(16, 185, 129, 0.15)',
              cursor: 'pointer'
            }}
            title="Open ChatGPT in a new tab"
          >
            <Bot size={14} color="#10b981" style={{ filter: 'drop-shadow(0 0 4px #10b981)' }} />
            <span>CHATGPT</span>
            <ExternalLink size={12} color="#10b981" />
          </motion.button>

          {/* Gemini Button */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.03, y: -1, boxShadow: '0 0 20px rgba(168, 85, 247, 0.55)' }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleOpenPlatform('https://gemini.google.com/')}
            onMouseEnter={() => soundEngine.playHover()}
            className="cyber-btn"
            style={{
              padding: '6px 14px',
              fontSize: '0.74rem',
              letterSpacing: '0.08em',
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.32) 0%, rgba(32, 12, 56, 0.92) 100%)',
              borderColor: '#c084fc',
              color: '#ffffff',
              boxShadow: '0 0 16px rgba(168, 85, 247, 0.28), inset 0 0 8px rgba(168, 85, 247, 0.15)',
              cursor: 'pointer'
            }}
            title="Open Google Gemini in a new tab"
          >
            <Sparkles size={14} color="#c084fc" style={{ filter: 'drop-shadow(0 0 4px #c084fc)' }} />
            <span>GEMINI</span>
            <ExternalLink size={12} color="#c084fc" />
          </motion.button>
        </div>
      </div>

      {/* Guide Content */}
      <p
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '0.76rem',
          color: '#e2e8f0',
          lineHeight: '1.45',
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
          background: 'rgba(0, 243, 255, 0.08)',
          border: '1px solid rgba(0, 243, 255, 0.28)',
          borderRadius: '2px',
          padding: '5px 10px',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.66rem',
          color: 'var(--cyan-glow)',
          letterSpacing: '0.06em',
          flexWrap: 'wrap',
          boxShadow: 'inset 0 0 10px rgba(0, 243, 255, 0.04)'
        }}
      >
        <span style={{ color: 'var(--lime-accent)', fontWeight: 700 }}>WORKFLOW:</span>
        <span>PLAN</span>
        <ArrowRight size={10} color="rgba(0, 243, 255, 0.7)" />
        <span>GENERATE</span>
        <ArrowRight size={10} color="rgba(0, 243, 255, 0.7)" />
        <span>TEST</span>
        <ArrowRight size={10} color="rgba(0, 243, 255, 0.7)" />
        <span>REFINE</span>
        <ArrowRight size={10} color="rgba(0, 243, 255, 0.7)" />
        <span>EXPLAIN</span>
      </div>

      {/* Short Action Instruction */}
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.66rem',
          color: '#cbd5e1',
          lineHeight: '1.35',
          letterSpacing: '0.02em'
        }}
      >
        Build a working solution, test its interactions, then explain what you built and how AI contributed.
      </div>
    </div>
  );
}
