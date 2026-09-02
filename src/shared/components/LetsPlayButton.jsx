import React, { useState, forwardRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Play, Sparkles } from 'lucide-react';
import { soundEngine } from '../utils/SoundEngine';

const LetsPlayButton = forwardRef(function LetsPlayButton({ onClick, isComplete = false }, ref) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
    soundEngine.playHover();
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleFocus = () => {
    setIsFocused(true);
    soundEngine.playHover();
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const handleClick = (e) => {
    e.preventDefault();
    soundEngine.playClick();
    if (onClick) onClick();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick(e);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        marginTop: '10px'
      }}
    >
      <button
        ref={ref}
        className="cyber-btn"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
        style={{
          width: '100%',
          padding: '15px 32px',
          background: (isHovered || isFocused)
            ? 'rgba(0, 243, 255, 0.25)'
            : isComplete
            ? 'rgba(0, 243, 255, 0.15)'
            : 'rgba(5, 12, 28, 0.85)',
          borderColor: (isHovered || isFocused)
            ? '#ffffff'
            : isComplete
            ? 'var(--cyan-glow)'
            : 'rgba(0, 243, 255, 0.4)',
          boxShadow: (isHovered || isFocused || isComplete)
            ? '0 0 30px rgba(0, 243, 255, 0.6), inset 0 0 20px rgba(0, 243, 255, 0.3)'
            : '0 0 10px rgba(0, 243, 255, 0.1)',
          outline: isFocused ? '2px solid var(--cyan-glow)' : 'none',
          outlineOffset: '2px',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Micro corner accent dots */}
        <div className="btn-corner-accent" style={{ top: '2px', left: '2px' }} />
        <div className="btn-corner-accent" style={{ bottom: '2px', right: '2px' }} />

        {isComplete ? (
          <Sparkles
            size={18}
            color="var(--cyan-glow)"
            style={{
              filter: 'drop-shadow(0 0 10px var(--cyan-glow))',
              animation: 'pulse 1.5s infinite ease-in-out'
            }}
          />
        ) : (
          <Play
            size={16}
            color={(isHovered || isFocused) ? '#ffffff' : 'var(--cyan-glow)'}
            fill={(isHovered || isFocused) ? '#ffffff' : 'var(--cyan-glow)'}
          />
        )}

        <span style={{ fontSize: '1rem', letterSpacing: '0.22em', fontWeight: 800 }}>
          LET'S PLAY
        </span>

        <span className="cyber-btn-arrow">
          <ArrowRight size={18} />
        </span>
      </button>
    </motion.div>
  );
});

export default LetsPlayButton;
