import React from 'react';
import { motion } from 'framer-motion';

export default function EventTitle({ currentStage, mousePosition }) {
  // Compute subtle tilt parallax offset based on normalized mouse coords (-1 to 1)
  const tiltX = mousePosition ? mousePosition.current.y * -8 : 0;
  const tiltY = mousePosition ? mousePosition.current.x * 12 : 0;

  // Code fragments placed around the title
  const floatingCodeBits = [
    { text: '0x00A1_AI_CORE', top: '-28px', left: '-40px', delay: 0 },
    { text: 'fn::optimize(model)', top: '-22px', right: '-50px', delay: 1.2 },
    { text: 'struct NeuralMesh', bottom: '-24px', left: '-20px', delay: 0.7 },
    { text: '01100011_01101111', bottom: '-28px', right: '-30px', delay: 1.8 }
  ];

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
        pointerEvents: 'none'
      }}
    >
      {/* Container for Main Title Layers */}
      <div className="title-container">
        
        {/* Layer 2: Duplicated Glitch Chromatic Layers behind */}
        <div className="glitch-layer glitch-cyan" aria-hidden="true">
          CODE MEETS AI
        </div>
        <div className="glitch-layer glitch-magenta" aria-hidden="true">
          CODE MEETS AI
        </div>

        {/* Layer 6: Light Sweep Beam */}
        <div className="title-light-sweep" />

        {/* Layer 10: Tiny Code Fragments Appearing Around Title */}
        {currentStage >= 4 &&
          floatingCodeBits.map((bit, idx) => (
            <motion.div
              key={idx}
              className="code-snippet-floating"
              style={{
                top: bit.top,
                bottom: bit.bottom,
                left: bit.left,
                right: bit.right
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: [0.3, 0.8, 0.4], scale: [0.95, 1.05, 0.95] }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                delay: bit.delay,
                ease: 'easeInOut'
              }}
            >
              {bit.text}
            </motion.div>
          ))}

        {/* Layer 1: Main Title Layer with Stage Sequences */}
        <h1 className="main-title">
          {/* "CODE" Reveal */}
          <motion.span
            initial={{ opacity: 0, filter: 'blur(12px)', y: 20 }}
            animate={
              currentStage >= 2
                ? { opacity: 1, filter: 'blur(0px)', y: 0 }
                : { opacity: 0 }
            }
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{ display: 'inline-block', marginRight: '0.28em' }}
          >
            CODE
          </motion.span>

          {/* "MEETS" Reveal */}
          <motion.span
            initial={{ opacity: 0, filter: 'blur(12px)', y: 20 }}
            animate={
              currentStage >= 3
                ? { opacity: 1, filter: 'blur(0px)', y: 0 }
                : { opacity: 0 }
            }
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{ display: 'inline-block', marginRight: '0.28em' }}
          >
            MEETS
          </motion.span>

          {/* "AI" High Impact Reveal */}
          <motion.span
            className="title-gradient-ai"
            initial={{ opacity: 0, scale: 2.2, filter: 'blur(20px)' }}
            animate={
              currentStage >= 4
                ? { opacity: 1, scale: [2.2, 0.92, 1], filter: 'blur(0px)' }
                : { opacity: 0 }
            }
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            style={{ display: 'inline-block' }}
          >
            AI
          </motion.span>
        </h1>
      </div>

      {/* Layer 3: Technical Sub-bar & Line Sweep under Title */}
      <motion.div
        className="title-tech-bar"
        style={{ width: '100%', maxWidth: '620px' }}
        initial={{ opacity: 0, width: '0%' }}
        animate={
          currentStage >= 4
            ? { opacity: 1, width: '100%' }
            : { opacity: 0, width: '0%' }
        }
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        <div className="tech-line" />
        <span style={{ fontSize: '0.75rem', color: 'rgba(0, 243, 255, 0.9)', letterSpacing: '0.22em', fontWeight: 600 }}>
          CYBERNETIC CODING &amp; AI COMPETITION
        </span>
        <div className="tech-line" />
      </motion.div>
    </div>
  );
}
