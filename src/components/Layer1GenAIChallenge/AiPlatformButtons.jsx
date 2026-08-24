import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Sparkles, Bot } from 'lucide-react';
import { soundEngine } from '../../utils/SoundEngine';

export default function AiPlatformButtons() {
  const handleOpenPlatform = (url) => {
    soundEngine.playClick();
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px',
        padding: '8px 14px',
        background: 'rgba(2, 6, 20, 0.85)',
        border: '1px solid rgba(0, 243, 255, 0.2)',
        borderRadius: '3px',
        boxSizing: 'border-box'
      }}
    >
      {/* Guidance Label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Sparkles size={13} color="var(--cyan-glow)" />
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.72rem',
            color: '#d1d5db',
            letterSpacing: '0.04em'
          }}
        >
          Experiment with your prompt:
        </span>
      </div>

      {/* AI Launch Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* ChatGPT Button */}
        <motion.button
          type="button"
          whileHover={{ scale: 1.03, y: -1 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => handleOpenPlatform('https://chatgpt.com/')}
          className="cyber-btn"
          style={{
            padding: '6px 14px',
            fontSize: '0.75rem',
            letterSpacing: '0.08em',
            fontWeight: 800,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'linear-gradient(135deg, rgba(16, 163, 127, 0.2) 0%, rgba(2, 22, 16, 0.95) 100%)',
            borderColor: '#10b981',
            color: '#ffffff',
            boxShadow: '0 0 15px rgba(16, 185, 129, 0.25)',
            cursor: 'pointer'
          }}
          title="Open ChatGPT in a new tab to test prompt and generate image"
        >
          <Bot size={14} color="#10b981" />
          <span>CHATGPT</span>
          <ExternalLink size={12} color="#10b981" />
        </motion.button>

        {/* Gemini Button */}
        <motion.button
          type="button"
          whileHover={{ scale: 1.03, y: -1 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => handleOpenPlatform('https://gemini.google.com/')}
          className="cyber-btn"
          style={{
            padding: '6px 14px',
            fontSize: '0.75rem',
            letterSpacing: '0.08em',
            fontWeight: 800,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(147, 51, 234, 0.2) 50%, rgba(12, 8, 30, 0.95) 100%)',
            borderColor: 'var(--magenta-glow)',
            color: '#ffffff',
            boxShadow: '0 0 15px rgba(224, 38, 255, 0.25)',
            cursor: 'pointer'
          }}
          title="Open Google Gemini in a new tab to test prompt and generate image"
        >
          <Sparkles size={14} color="var(--magenta-glow)" />
          <span>GEMINI</span>
          <ExternalLink size={12} color="var(--magenta-glow)" />
        </motion.button>
      </div>
    </div>
  );
}
