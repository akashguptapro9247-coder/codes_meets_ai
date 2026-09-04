import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Bot, Folder, FileCode, Bug, CheckSquare, ArrowLeft, ShieldAlert, Terminal, Layers } from 'lucide-react';
import { soundEngine } from '../../../shared/utils/SoundEngine';
import ThreeBackground from '../../../shared/components/ThreeBackground';

export default function GenAIInstructions({ participant, onBack, onBegin }) {
  const mousePosition = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      mousePosition.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1
      };
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        overflowY: 'auto',
        backgroundColor: '#030712',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px 20px',
        boxSizing: 'border-box'
      }}
    >
      {/* 3D Animated Background (Sits behind the HUD card) */}
      <ThreeBackground mousePosition={mousePosition} />

      {/* Scanline Overlay for Cybernetic HUD feel */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 2,
          pointerEvents: 'none',
          background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.03), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.03))',
          backgroundSize: '100% 4px, 6px 100%'
        }}
      />

      {/* Main Mission Briefing HUD Container (Sits in front at zIndex 10) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="cyber-card"
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          maxWidth: '1160px',
          padding: '22px 26px',
          boxSizing: 'border-box',
          borderColor: 'var(--cyan-glow)',
          boxShadow: '0 0 50px rgba(0, 243, 255, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          background: 'rgba(3, 7, 18, 0.94)',
          backdropFilter: 'blur(24px)'
        }}
      >
        {/* 1. TOP BAR */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => {
                soundEngine.playClick();
                if (onBack) onBack();
              }}
              onMouseEnter={() => soundEngine.playHover()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(0, 243, 255, 0.08)',
                border: '1px solid rgba(0, 243, 255, 0.3)',
                color: 'var(--cyan-glow)',
                padding: '6px 14px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                letterSpacing: '0.1em',
                cursor: 'pointer'
              }}
            >
              <ArrowLeft size={15} />
              <span>BACK TO ARENA</span>
            </button>

            <div>
              <div style={{ fontFamily: 'var(--font-title)', fontSize: '1.2rem', color: '#ffffff', letterSpacing: '0.08em', margin: 0 }}>
                LAYER 02 <span style={{ color: 'var(--cyan-glow)' }}>// GEN AI TRACK</span>
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'rgba(0, 243, 255, 0.7)', letterSpacing: '0.12em' }}>
                TACTICAL MISSION BRIEFING PROTOCOL
              </div>
            </div>
          </div>

          {/* Participant Tag */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '5px 12px',
              background: 'rgba(57, 255, 20, 0.08)',
              border: '1px solid rgba(57, 255, 20, 0.3)',
              borderRadius: '3px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.74rem',
              color: 'var(--lime-accent)'
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--lime-accent)', display: 'inline-block', boxShadow: '0 0 6px var(--lime-accent)' }} />
            {participant?.name || 'Participant'} — {participant?.rollNumber || participant?.roll_number || 'N/A'}
          </div>
        </div>

        {/* 2. MAIN BRIEFING GRID (2 Columns — Base: Pic 3) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.25fr', gap: '14px' }}>
          
          {/* LEFT COLUMN: Objective, Allowed AI Usage, Your Responsibilities */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            
            {/* Mission Objective */}
            <div
              style={{
                padding: '12px 14px',
                background: 'rgba(0, 243, 255, 0.04)',
                border: '1px solid rgba(0, 243, 255, 0.2)',
                borderRadius: '4px'
              }}
            >
              <div style={{ fontFamily: 'var(--font-title)', fontSize: '0.75rem', color: 'var(--cyan-glow)', letterSpacing: '0.1em', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Layers size={14} /> MISSION OBJECTIVE
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: '#d1d5db', lineHeight: 1.4 }}>
                Build a small working web application using AI-assisted development (ChatGPT / Gemini). Use AI for code generation, structure & debugging, while taking full responsibility for local setup, execution, and explaining your build.
              </div>
            </div>

            {/* Allowed AI Usage */}
            <div
              style={{
                padding: '12px 14px',
                background: 'rgba(57, 255, 20, 0.04)',
                border: '1px solid rgba(57, 255, 20, 0.22)',
                borderRadius: '4px'
              }}
            >
              <div style={{ fontFamily: 'var(--font-title)', fontSize: '0.75rem', color: 'var(--lime-accent)', letterSpacing: '0.1em', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Bot size={14} /> ALLOWED AI USAGE
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px 10px', fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: '#d1d5db' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ color: 'var(--lime-accent)', fontWeight: 'bold' }}>✓</span> Understand problem
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ color: 'var(--lime-accent)', fontWeight: 'bold' }}>✓</span> Generate code
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ color: 'var(--lime-accent)', fontWeight: 'bold' }}>✓</span> Structure project
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ color: 'var(--lime-accent)', fontWeight: 'bold' }}>✓</span> Debug runtime errors
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ color: 'var(--lime-accent)', fontWeight: 'bold' }}>✓</span> Improve UI/UX
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ color: 'var(--lime-accent)', fontWeight: 'bold' }}>✓</span> Explain code
                </div>
              </div>
            </div>

            {/* Your Responsibilities */}
            <div
              style={{
                padding: '12px 14px',
                background: 'rgba(239, 68, 68, 0.04)',
                border: '1px solid rgba(239, 68, 68, 0.22)',
                borderRadius: '4px'
              }}
            >
              <div style={{ fontFamily: 'var(--font-title)', fontSize: '0.75rem', color: '#ef4444', letterSpacing: '0.1em', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldAlert size={14} /> YOUR RESPONSIBILITIES
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: '#d1d5db' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ color: '#ef4444', fontWeight: 'bold' }}>•</span> Create project folder & required files in VS Code
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ color: '#ef4444', fontWeight: 'bold' }}>•</span> Organize project structure & paste generated code
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ color: '#ef4444', fontWeight: 'bold' }}>•</span> Run application & troubleshoot issues locally
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ color: 'var(--lime-accent)', fontWeight: 'bold' }}>★</span> <strong>Understand & explain what you built in your own words</strong>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Mission Workflow Protocol (All 12 Steps in 5 Phases) */}
          <div
            style={{
              padding: '12px 14px',
              background: 'rgba(2, 6, 18, 0.9)',
              border: '1px solid rgba(0, 243, 255, 0.18)',
              borderRadius: '4px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontFamily: 'var(--font-title)', fontSize: '0.78rem', color: 'var(--cyan-glow)', letterSpacing: '0.12em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Terminal size={15} /> MISSION WORKFLOW PROTOCOL
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: '#9ca3af', letterSpacing: '0.1em' }}>
                12 STEPS // 5 PHASES
              </div>
            </div>

            {/* 5 Phase Cards Grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              
              {/* Phase 01 */}
              <PhaseCard 
                phase="01" 
                title="SETUP" 
                icon={<Folder size={13} color="var(--cyan-glow)" />} 
                steps={[
                  { num: '1', text: 'Open VS Code' },
                  { num: '2', text: 'Create project folder' },
                  { num: '3', text: 'Open folder in VS Code' }
                ]}
              />

              {/* Phase 02 */}
              <PhaseCard 
                phase="02" 
                title="PLAN & GENERATE" 
                icon={<Bot size={13} color="var(--cyan-glow)" />} 
                steps={[
                  { num: '4', text: 'Read assigned problem statement carefully' },
                  { num: '5', text: 'Use ChatGPT/Gemini to plan structure & generate code' }
                ]}
              />

              {/* Phase 03 */}
              <PhaseCard 
                phase="03" 
                title="BUILD & EXECUTE" 
                icon={<FileCode size={13} color="var(--cyan-glow)" />} 
                steps={[
                  { num: '6', text: 'Create required files in VS Code' },
                  { num: '7', text: 'Paste code into appropriate files' },
                  { num: '8', text: 'Run the project locally' }
                ]}
              />

              {/* Phase 04 */}
              <PhaseCard 
                phase="04" 
                title="TEST & DEBUG" 
                icon={<Bug size={13} color="var(--cyan-glow)" />} 
                steps={[
                  { num: '9', text: 'Test all major requirements from problem' },
                  { num: '10', text: 'Fix errors with debugging & AI assistance' }
                ]}
              />

              {/* Phase 05 */}
              <PhaseCard 
                phase="05" 
                title="EXPLAIN & SUBMIT" 
                icon={<CheckSquare size={13} color="var(--lime-accent)" />} 
                steps={[
                  { num: '11', text: 'Explain what you built in your own words' },
                  { num: '12', text: 'Submit the project' }
                ]}
              />

            </div>
          </div>

        </div>

        {/* 3. BOTTOM BAR (Stats + Action Button) */}
        <div
          style={{
            display: 'flex',
            justify: 'space-between',
            alignItems: 'center',
            paddingTop: '8px',
            borderTop: '1px solid rgba(0, 243, 255, 0.15)',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          {/* Quick HUD Specs */}
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#9ca3af' }}>
              TIME: <span style={{ color: 'var(--cyan-glow)', fontWeight: 800 }}>30 MIN</span>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#9ca3af' }}>
              PROJECTS: <span style={{ color: 'var(--cyan-glow)', fontWeight: 800 }}>1 ASSIGNED</span>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#9ca3af' }}>
              TOOLS: <span style={{ color: 'var(--lime-accent)', fontWeight: 800 }}>VS CODE + CHATGPT / GEMINI</span>
            </div>
          </div>

          {/* Primary Action Button */}
          <motion.button
            whileHover={{ scale: 1.03, boxShadow: '0 0 24px rgba(0, 243, 255, 0.4)' }}
            whileTap={{ scale: 0.97 }}
            className="cyber-btn"
            onClick={() => {
              soundEngine.playBoot();
              if (onBegin) onBegin();
            }}
            onMouseEnter={() => soundEngine.playHover()}
            style={{
              padding: '10px 28px',
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer'
            }}
          >
            <Play size={16} />
            <span>BEGIN GEN AI CHALLENGE</span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

function PhaseCard({ phase, title, icon, steps }) {
  return (
    <div
      style={{
        padding: '7px 10px',
        background: 'rgba(0, 243, 255, 0.03)',
        border: '1px solid rgba(0, 243, 255, 0.12)',
        borderRadius: '3px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', fontWeight: 800, color: 'var(--cyan-glow)', background: 'rgba(0, 243, 255, 0.1)', padding: '1px 5px', borderRadius: '2px' }}>
          PHASE {phase}
        </span>
        <span style={{ fontFamily: 'var(--font-title)', fontSize: '0.68rem', color: '#ffffff', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: '4px' }}>
          {icon} {title}
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', paddingLeft: '4px' }}>
        {steps.map((s) => (
          <div key={s.num} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#9ca3af', display: 'flex', alignItems: 'flex-start', gap: '6px', lineHeight: 1.3 }}>
            <span style={{ color: 'var(--cyan-glow)', fontWeight: 'bold' }}>{s.num}.</span>
            <span>{s.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
