import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Code2, ArrowRight } from 'lucide-react';
import DiagonalSlash from './DiagonalSlash';
import LockedBlurOverlay from './LockedBlurOverlay';
import { soundEngine } from '../utils/SoundEngine';

export default function LayerCard({
  layerKey = 'layer1',
  layerNumber = '01',
  layerTitle = 'LAYER 01',
  layerState = { active: false, activeTrack: null },
  isPromoted = true,
  genAiDesc = 'Prompt Engineering',
  manualDesc = 'Manual Coding',
  genAiImage = '/assets/layer1_genai.jpeg',
  manualImage = '/assets/layer1_manual.jpeg',
  onSelectRound
}) {
  const isAccessible = layerKey === 'layer2' ? (Boolean(layerState?.active) && Boolean(isPromoted)) : Boolean(layerState?.active);
  const active = isAccessible;
  const activeTrack = isAccessible ? layerState?.activeTrack : null;
  const [isHovered, setIsHovered] = useState(false);
  const [wasJustUnlocked, setWasJustUnlocked] = useState(false);

  // Play unlock chime sound & trigger 1s unlock flare when state shifts from inactive -> active
  useEffect(() => {
    if (active) {
      soundEngine.playBoot();
      setWasJustUnlocked(true);
      const timer = setTimeout(() => setWasJustUnlocked(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [active, activeTrack]);

  const handleGenAiClick = () => {
    if (!active || activeTrack !== 'gen-ai') return;
    soundEngine.playClick();
    if (onSelectRound) onSelectRound(`/${layerKey}/gen-ai`, `${layerTitle} - GEN AI TRACK`);
  };

  const handleManualClick = () => {
    if (!active || activeTrack !== 'manual') return;
    soundEngine.playClick();
    if (onSelectRound) onSelectRound(`/${layerKey}/manual`, `${layerTitle} - MANUAL TRACK`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: layerNumber === '01' ? 0.1 : 0.25 }}
      onMouseEnter={() => {
        setIsHovered(true);
        if (active) soundEngine.playHover();
      }}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'relative',
        width: '100%',
        height: 'calc(44vh - 40px)',
        minHeight: '220px',
        maxHeight: '300px',
        background: 'rgba(4, 9, 22, 0.85)',
        backdropFilter: 'blur(16px)',
        border: active
          ? activeTrack === 'gen-ai'
            ? '1px solid var(--cyan-glow)'
            : '1px solid var(--magenta-glow)'
          : '1px solid rgba(0, 243, 255, 0.2)',
        boxShadow: active
          ? isHovered
            ? '0 0 35px rgba(0, 243, 255, 0.4), inset 0 0 20px rgba(0, 243, 255, 0.2)'
            : '0 0 20px rgba(0, 243, 255, 0.2)'
          : '0 8px 30px rgba(0, 0, 0, 0.8)',
        borderRadius: '4px',
        overflow: 'hidden', // STRICT CLIPPING ON ENTIRE CARD
        boxSizing: 'border-box',
        transition: 'border-color 0.3s ease, box-shadow 0.3s ease'
      }}
    >
      {/* Corner Bracket Accents */}
      <div className="hud-corner hud-top-left" style={{ width: '14px', height: '14px', zIndex: 22 }} />
      <div className="hud-corner hud-top-right" style={{ width: '14px', height: '14px', zIndex: 22 }} />
      <div className="hud-corner hud-bottom-left" style={{ width: '14px', height: '14px', zIndex: 22 }} />
      <div className="hud-corner hud-bottom-right" style={{ width: '14px', height: '14px', zIndex: 22 }} />

      {/* Diagonal Slash Separator */}
      <DiagonalSlash isActive={active} activeTrack={activeTrack} />

      {/* Card Header Badge */}
      <div
        style={{
          position: 'absolute',
          top: '12px',
          left: '20px',
          zIndex: 22,
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-title)',
            fontSize: '0.9rem',
            color: '#ffffff',
            letterSpacing: '0.15em',
            fontWeight: 800,
            textShadow: '0 0 12px rgba(0, 243, 255, 0.9), 0 0 20px rgba(0, 0, 0, 0.9)'
          }}
        >
          {layerTitle}
        </span>

        {active ? (
          <span
            className="cyber-badge"
            style={{
              borderColor: activeTrack === 'gen-ai' ? 'var(--cyan-glow)' : 'var(--magenta-glow)',
              color: activeTrack === 'gen-ai' ? 'var(--cyan-glow)' : 'var(--magenta-glow)'
            }}
          >
            ACTIVE TRACK: {activeTrack?.toUpperCase()}
          </span>
        ) : (
          <span className="cyber-badge" style={{ borderColor: '#ef4444', color: '#ef4444' }}>
            LOCKED
          </span>
        )}
      </div>

      {/* Unlock Flare Animation */}
      <AnimatePresence>
        {wasJustUnlocked && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: [0, 0.8, 0], scale: [0.8, 1.2, 1.4] }}
            transition={{ duration: 0.9 }}
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 30,
              background: 'radial-gradient(circle at center, var(--cyan-glow), transparent 70%)',
              pointerEvents: 'none'
            }}
          />
        )}
      </AnimatePresence>

      {/* LOCKED OVERLAY (renders when active === false) */}
      {!active && <LockedBlurOverlay layerTitle={layerKey === 'layer2' && !isPromoted ? 'LAYER 02 // PROMOTION REQUIRED' : layerTitle} />}

      {/* MAIN TWO-COLUMN SLASH CONTENT WITH GAMIFIED ARTWORK */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          width: '100%',
          height: '100%',
          paddingTop: '36px',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* LEFT COLUMN: GEN AI TRACK */}
        <div
          onClick={handleGenAiClick}
          style={{
            position: 'relative',
            overflow: 'hidden', // STRICT CLIPPING
            padding: '24px 32px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'flex-start',
            cursor: active && activeTrack === 'gen-ai' ? 'pointer' : 'default'
          }}
        >
          {/* Z-Index 1: Track Artwork Background (Brighter & Vibrant) */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 1,
              backgroundImage: `url(${genAiImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: active
                ? activeTrack === 'gen-ai'
                  ? 'saturate(1.3) brightness(1.25) contrast(1.15)'
                  : 'saturate(0.5) brightness(0.65) contrast(1.2)'
                : 'saturate(0.8) brightness(0.85)',
              opacity: active ? (activeTrack === 'gen-ai' ? 0.92 : 0.45) : 0.65,
              transform: isHovered && active && activeTrack === 'gen-ai' ? 'scale(1.05)' : 'scale(1)',
              transition: 'all 0.5s ease'
            }}
          />

          {/* Z-Index 2: Lighter Overlay Gradient to let bright artwork shine while preserving contrast */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 2,
              background: active && activeTrack === 'gen-ai'
                ? 'linear-gradient(135deg, rgba(3, 7, 18, 0.55) 0%, rgba(3, 7, 18, 0.2) 50%, rgba(3, 7, 18, 0.6) 100%)'
                : 'linear-gradient(135deg, rgba(3, 7, 18, 0.75) 0%, rgba(3, 7, 18, 0.55) 100%)',
              transition: 'background 0.4s ease'
            }}
          />

          {/* Z-Index 4: Existing HTML Typography & Controls */}
          <div
            style={{
              position: 'relative',
              zIndex: 4,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '6px'
            }}
          >
            <Sparkles size={20} color="var(--cyan-glow)" style={{ filter: 'drop-shadow(0 0 6px var(--cyan-glow))' }} />
            <h3
              style={{
                fontFamily: 'var(--font-title)',
                fontSize: '1.25rem',
                margin: 0,
                color: '#ffffff',
                letterSpacing: '0.12em',
                textShadow: '0 0 16px var(--cyan-glow), 0 2px 6px rgba(0, 0, 0, 0.9)'
              }}
            >
              GEN AI TRACK
            </h3>
          </div>

          <p
            style={{
              position: 'relative',
              zIndex: 4,
              fontFamily: 'var(--font-mono)',
              fontSize: '0.85rem',
              color: '#ffffff',
              margin: '0 0 16px 0',
              fontWeight: 700,
              textShadow: '0 0 12px var(--cyan-glow), 0 2px 6px rgba(0, 0, 0, 0.95)'
            }}
          >
            {genAiDesc}
          </p>

          {/* Action Trigger Button */}
          {active && activeTrack === 'gen-ai' ? (
            <motion.button
              whileHover={{ scale: 1.04, x: 4 }}
              className="cyber-btn"
              style={{
                position: 'relative',
                zIndex: 5,
                padding: '8px 20px',
                fontSize: '0.8rem',
                letterSpacing: '0.15em'
              }}
            >
              <span>ENTER ROUND</span>
              <ArrowRight size={14} />
            </motion.button>
          ) : (
            <span
              style={{
                position: 'relative',
                zIndex: 4,
                fontFamily: 'var(--font-mono)',
                fontSize: '0.7rem',
                color: '#e5e7eb',
                textShadow: '0 1px 4px rgba(0, 0, 0, 0.9)'
              }}
            >
              [ TRACK INACTIVE ]
            </span>
          )}
        </div>

        {/* RIGHT COLUMN: MANUAL TRACK */}
        <div
          onClick={handleManualClick}
          style={{
            position: 'relative',
            overflow: 'hidden', // STRICT CLIPPING
            padding: '24px 32px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'flex-end',
            textAlign: 'right',
            cursor: active && activeTrack === 'manual' ? 'pointer' : 'default'
          }}
        >
          {/* Z-Index 1: Track Artwork Background (Brighter & Vibrant) */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 1,
              backgroundImage: `url(${manualImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: active
                ? activeTrack === 'manual'
                  ? 'saturate(1.3) brightness(1.25) contrast(1.15)'
                  : 'saturate(0.5) brightness(0.65) contrast(1.2)'
                : 'saturate(0.8) brightness(0.85)',
              opacity: active ? (activeTrack === 'manual' ? 0.92 : 0.45) : 0.65,
              transform: isHovered && active && activeTrack === 'manual' ? 'scale(1.05)' : 'scale(1)',
              transition: 'all 0.5s ease'
            }}
          />

          {/* Z-Index 2: Lighter Overlay Gradient to let bright artwork shine while preserving contrast */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 2,
              background: active && activeTrack === 'manual'
                ? 'linear-gradient(135deg, rgba(3, 7, 18, 0.55) 0%, rgba(3, 7, 18, 0.2) 50%, rgba(3, 7, 18, 0.6) 100%)'
                : 'linear-gradient(135deg, rgba(3, 7, 18, 0.75) 0%, rgba(3, 7, 18, 0.55) 100%)',
              transition: 'background 0.4s ease'
            }}
          />

          {/* Z-Index 4: Existing HTML Typography & Controls */}
          <div
            style={{
              position: 'relative',
              zIndex: 4,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '6px'
            }}
          >
            <h3
              style={{
                fontFamily: 'var(--font-title)',
                fontSize: '1.25rem',
                margin: 0,
                color: '#ffffff',
                letterSpacing: '0.12em',
                textShadow: '0 0 16px var(--magenta-glow), 0 2px 6px rgba(0, 0, 0, 0.9)'
              }}
            >
              MANUAL TRACK
            </h3>
            <Code2 size={20} color="var(--magenta-glow)" style={{ filter: 'drop-shadow(0 0 6px var(--magenta-glow))' }} />
          </div>

          <p
            style={{
              position: 'relative',
              zIndex: 4,
              fontFamily: 'var(--font-mono)',
              fontSize: '0.85rem',
              color: '#ffffff',
              margin: '0 0 16px 0',
              fontWeight: 700,
              textShadow: '0 0 12px var(--magenta-glow), 0 2px 6px rgba(0, 0, 0, 0.95)'
            }}
          >
            {manualDesc}
          </p>

          {/* Action Trigger Button */}
          {active && activeTrack === 'manual' ? (
            <motion.button
              whileHover={{ scale: 1.04, x: -4 }}
              className="cyber-btn"
              style={{
                position: 'relative',
                zIndex: 5,
                padding: '8px 20px',
                fontSize: '0.8rem',
                letterSpacing: '0.15em',
                borderColor: 'var(--magenta-glow)',
                color: 'var(--magenta-glow)'
              }}
            >
              <span>ENTER ROUND</span>
              <ArrowRight size={14} />
            </motion.button>
          ) : (
            <span
              style={{
                position: 'relative',
                zIndex: 4,
                fontFamily: 'var(--font-mono)',
                fontSize: '0.7rem',
                color: '#e5e7eb',
                textShadow: '0 1px 4px rgba(0, 0, 0, 0.9)'
              }}
            >
              [ TRACK INACTIVE ]
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
