import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Sparkles, Cpu, Eye, Radio, Shield, Zap } from 'lucide-react';

export default function SceneViewer() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        background: 'rgba(3, 7, 20, 0.85)',
        border: '1px solid rgba(0, 243, 255, 0.25)',
        borderRadius: '3px',
        padding: '14px',
        boxSizing: 'border-box',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {/* Corner Brackets */}
      <div className="hud-corner hud-top-left" style={{ width: '10px', height: '10px' }} />
      <div className="hud-corner hud-top-right" style={{ width: '10px', height: '10px' }} />
      <div className="hud-corner hud-bottom-left" style={{ width: '10px', height: '10px' }} />
      <div className="hud-corner hud-bottom-right" style={{ width: '10px', height: '10px' }} />

      {/* Section Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '10px',
          paddingBottom: '8px',
          borderBottom: '1px solid rgba(0, 243, 255, 0.15)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Brain size={16} color="var(--cyan-glow)" />
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.74rem',
              color: 'var(--cyan-glow)',
              letterSpacing: '0.15em',
              fontWeight: 800
            }}
          >
            GENAI CHALLENGE // MEMORY RECONSTRUCTION
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(57, 255, 20, 0.1)',
            border: '1px solid var(--lime-accent)',
            padding: '2px 8px',
            borderRadius: '2px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.62rem',
            color: 'var(--lime-accent)',
            letterSpacing: '0.1em'
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: 'var(--lime-accent)',
              boxShadow: '0 0 8px var(--lime-accent)',
              display: 'inline-block'
            }}
          />
          <span>PROJECTOR ACTIVE</span>
        </div>
      </div>

      {/* Main Visual Arena Card */}
      <div
        style={{
          position: 'relative',
          flex: 1,
          width: '100%',
          minHeight: '200px',
          background: 'linear-gradient(135deg, rgba(2, 6, 20, 0.98) 0%, rgba(10, 18, 45, 0.95) 100%)',
          border: '1px solid rgba(0, 243, 255, 0.3)',
          borderRadius: '4px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          boxSizing: 'border-box'
        }}
      >
        {/* Subtle Cyber Grid Background Overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(rgba(0, 243, 255, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 243, 255, 0.04) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
            pointerEvents: 'none',
            zIndex: 1
          }}
        />

        {/* Ambient Glowing Radial Halos */}
        <div
          style={{
            position: 'absolute',
            top: '20%',
            left: '30%',
            width: '220px',
            height: '220px',
            background: 'radial-gradient(circle, rgba(0, 243, 255, 0.12) 0%, transparent 70%)',
            pointerEvents: 'none',
            zIndex: 1
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '15%',
            right: '25%',
            width: '260px',
            height: '260px',
            background: 'radial-gradient(circle, rgba(224, 38, 255, 0.12) 0%, transparent 70%)',
            pointerEvents: 'none',
            zIndex: 1
          }}
        />

        {/* Animated Cybernetic Centerpiece */}
        <div
          style={{
            position: 'relative',
            zIndex: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '14px',
            maxWidth: '90%'
          }}
        >
          {/* Glowing Neural Ring Badge */}
          <motion.div
            animate={{
              boxShadow: [
                '0 0 20px rgba(0, 243, 255, 0.3)',
                '0 0 40px rgba(224, 38, 255, 0.4)',
                '0 0 20px rgba(0, 243, 255, 0.3)'
              ]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(5, 15, 35, 0.9)',
              border: '2px solid var(--cyan-glow)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Brain size={32} color="var(--cyan-glow)" />
          </motion.div>

          {/* Challenge Motto */}
          <div>
            <h2
              style={{
                fontFamily: 'var(--font-title)',
                fontSize: '1.5rem',
                letterSpacing: '0.12em',
                margin: 0,
                color: '#ffffff',
                textShadow: '0 0 25px rgba(0, 243, 255, 0.6), 0 0 50px rgba(224, 38, 255, 0.4)',
                lineHeight: 1.2
              }}
            >
              "YOUR MEMORY IS YOUR POWER"
            </h2>

            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.72rem',
                color: '#9ca3af',
                letterSpacing: '0.1em',
                marginTop: '6px'
              }}
            >
              RECALL // FORMULATE // RECONSTRUCT
            </div>
          </div>
        </div>

        {/* Bottom Status Bar */}
        <div
          style={{
            position: 'absolute',
            bottom: '8px',
            left: '12px',
            right: '12px',
            zIndex: 3,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '4px 10px',
            background: 'rgba(2, 6, 18, 0.85)',
            border: '1px solid rgba(0, 243, 255, 0.25)',
            borderRadius: '2px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.62rem',
            color: 'var(--cyan-glow)'
          }}
        >
          <span>CHALLENGE ACTIVE</span>
        </div>
      </div>

      {/* Challenge Directives & Guidance Card */}
      <div
        style={{
          marginTop: '10px',
          padding: '10px 12px',
          background: 'rgba(2, 6, 18, 0.9)',
          border: '1px solid rgba(0, 243, 255, 0.15)',
          borderRadius: '2px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          boxSizing: 'border-box'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', fontWeight: 800, color: 'var(--cyan-glow)' }}>
            MISSION DIRECTIVES:
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.64rem', color: 'var(--lime-accent)' }}>
            ONE ATTEMPT ONLY
          </span>
        </div>
        <ul
          style={{
            margin: '4px 0 0 0',
            paddingLeft: '14px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.68rem',
            color: '#9ca3af',
            lineHeight: 1.4
          }}
        >
          <li>Observe the visual scene displayed on the lab projector screen.</li>
          <li>Recall composition, lighting, camera angles, color palettes & cyberpunk motifs.</li>
          <li>Formulate your reconstruction prompt and upload your output image assets.</li>
          <li>Once submitted, your response is locked and sent for manual admin scoring.</li>
        </ul>
      </div>
    </div>
  );
}
