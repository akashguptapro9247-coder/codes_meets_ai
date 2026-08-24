import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Zap } from 'lucide-react';
import { soundEngine } from '../utils/SoundEngine';

export default function BeginButton({ onClick, currentStage }) {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
    soundEngine.playHover();
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleClick = (e) => {
    e.preventDefault();
    soundEngine.playClick();
    if (onClick) onClick();
  };

  if (currentStage < 4) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={currentStage >= 4 ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 20, scale: 0.95 }}
      transition={{ duration: 0.6, delay: 0.4, ease: 'easeOut' }}
      style={{
        position: 'relative',
        marginTop: '28px',
        zIndex: 35,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px'
      }}
    >
      <button
        className="cyber-btn"
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Micro corner accent dots */}
        <div className="btn-corner-accent" style={{ top: '2px', left: '2px' }} />
        <div className="btn-corner-accent" style={{ bottom: '2px', right: '2px' }} />

        <Zap
          size={18}
          color="var(--cyan-glow)"
          style={{
            filter: isHovered ? 'drop-shadow(0 0 8px #ffffff)' : 'none',
            transition: 'filter 0.3s ease'
          }}
        />

        <span>BEGIN</span>

        <span className="cyber-btn-arrow">
          <ArrowRight size={20} />
        </span>
      </button>

      {/* Small Supporting Micro Text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ delay: 0.9 }}
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.68rem',
          color: 'var(--cyan-glow)',
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        <span>[ INITIALIZING EVENT PROTOCOL ]</span>
      </motion.div>
    </motion.div>
  );
}
