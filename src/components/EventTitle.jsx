import React from 'react';
import { motion } from 'framer-motion';

export default function EventTitle({ currentStage, mousePosition }) {
  // Compute subtle tilt parallax offset based on normalized mouse coords (-1 to 1)
  const tiltX = mousePosition ? mousePosition.current.y * -5 : 0;
  const tiltY = mousePosition ? mousePosition.current.x * 8 : 0;

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 20,
        transform: `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`,
        transition: 'transform 0.15s ease-out',
        pointerEvents: 'none',
        width: '100%'
      }}
    >
      {/* Unified Main Title Container */}
      <div className="title-container" style={{ whiteSpace: 'nowrap' }}>
        
        {/* Main Title Layer: CODE MEETS AI on ONE horizontal line */}
        <h1 className="main-title" style={{ whiteSpace: 'nowrap' }}>
          {/* "CODE" Reveal */}
          <motion.span
            initial={{ opacity: 0, filter: 'blur(10px)', y: 16 }}
            animate={
              currentStage >= 2
                ? { opacity: 1, filter: 'blur(0px)', y: 0 }
                : { opacity: 0 }
            }
            transition={{ duration: 0.5, ease: 'easeOut' }}
            style={{ display: 'inline-block', marginRight: '0.32em', color: '#ffffff' }}
          >
            CODE
          </motion.span>

          {/* "MEETS" Reveal */}
          <motion.span
            initial={{ opacity: 0, filter: 'blur(10px)', y: 16 }}
            animate={
              currentStage >= 3
                ? { opacity: 1, filter: 'blur(0px)', y: 0 }
                : { opacity: 0 }
            }
            transition={{ duration: 0.5, ease: 'easeOut' }}
            style={{ display: 'inline-block', marginRight: '0.32em', color: '#ffffff' }}
          >
            MEETS
          </motion.span>

          {/* "AI" High Impact Reveal */}
          <motion.span
            className="title-gradient-ai"
            initial={{ opacity: 0, scale: 1.6, filter: 'blur(12px)' }}
            animate={
              currentStage >= 4
                ? { opacity: 1, scale: 1, filter: 'blur(0px)' }
                : { opacity: 0 }
            }
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            style={{ display: 'inline-block' }}
          >
            AI
          </motion.span>
        </h1>
      </div>

      {/* Subtitle directly below title with consistent spacing */}
      <motion.div
        className="title-tech-bar"
        style={{ width: '100%', maxWidth: '620px', marginTop: '16px' }}
        initial={{ opacity: 0, width: '0%' }}
        animate={
          currentStage >= 4
            ? { opacity: 1, width: '100%' }
            : { opacity: 0, width: '0%' }
        }
        transition={{ duration: 0.7, delay: 0.25 }}
      >
        <div className="tech-line" />
        <span
          style={{
            fontSize: 'clamp(0.7rem, 1.2vw, 0.85rem)',
            color: 'var(--cyan-glow)',
            letterSpacing: '0.22em',
            fontWeight: 600,
            whiteSpace: 'nowrap'
          }}
        >
          CYBERNETIC CODING &amp; AI COMPETITION
        </span>
        <div className="tech-line" />
      </motion.div>
    </div>
  );
}
