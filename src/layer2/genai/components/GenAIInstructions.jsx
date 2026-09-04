import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Bot, Folder, FileCode, Bug, CheckSquare, ArrowLeft, ShieldAlert, Terminal, Layers, Cpu, CheckCircle2 } from 'lucide-react';
import { soundEngine } from '../../../shared/utils/SoundEngine';
import ThreeBackground from '../../../shared/components/ThreeBackground';

export default function GenAIInstructions({ participant, onBack, onBegin }) {
  const mousePosition = useRef({ x: 0, y: 0 });
  const [activePhase, setActivePhase] = useState('ALL'); // 'ALL' | 1 | 2 | 3 | 4 | 5
  const [hoveredCapability, setHoveredCapability] = useState(null);
  const [hoveredDuty, setHoveredDuty] = useState(null);

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

  const capabilities = [
    { id: 1, title: 'Understand problem', desc: 'Understand the problem statement & architecture' },
    { id: 2, title: 'Generate code', desc: 'Generate initial code & implementation files' },
    { id: 3, title: 'Structure project', desc: 'Ask AI how to structure folder & components' },
    { id: 4, title: 'Debug runtime errors', desc: 'Use AI assistance to troubleshoot errors' },
    { id: 5, title: 'Improve UI/UX', desc: 'Refine styling, layout & visual presentation' },
    { id: 6, title: 'Explain code', desc: 'Ask AI to explain unfamiliar code snippets' }
  ];

  const duties = [
    { id: 1, label: 'CREATE FOLDER & FILES', text: 'Create project folder & required files in VS Code' },
    { id: 2, label: 'ORGANIZE STRUCTURE', text: 'Organize project structure & paste generated code' },
    { id: 3, label: 'RUN & TROUBLESHOOT', text: 'Run application & troubleshoot issues locally' },
    { id: 4, label: 'UNDERSTAND & EXPLAIN', text: 'Understand & explain what you built in your own words', highlight: true }
  ];

  const phases = [
    {
      num: '01',
      id: 1,
      title: 'SETUP',
      icon: <Folder size={13} color="var(--cyan-glow)" />,
      steps: [
        { num: '1', text: 'Open VS Code' },
        { num: '2', text: 'Create project folder' },
        { num: '3', text: 'Open folder in VS Code' }
      ]
    },
    {
      num: '02',
      id: 2,
      title: 'PLAN & GENERATE',
      icon: <Bot size={13} color="var(--cyan-glow)" />,
      steps: [
        { num: '4', text: 'Read assigned problem statement carefully' },
        { num: '5', text: 'Use ChatGPT/Gemini to plan structure & generate code' }
      ]
    },
    {
      num: '03',
      id: 3,
      title: 'BUILD & EXECUTE',
      icon: <FileCode size={13} color="var(--cyan-glow)" />,
      steps: [
        { num: '6', text: 'Create required files in VS Code' },
        { num: '7', text: 'Paste code into appropriate files' },
        { num: '8', text: 'Run the project locally' }
      ]
    },
    {
      num: '04',
      id: 4,
      title: 'TEST & DEBUG',
      icon: <Bug size={13} color="var(--cyan-glow)" />,
      steps: [
        { num: '9', text: 'Test all major requirements from problem' },
        { num: '10', text: 'Fix errors with debugging & AI assistance' }
      ]
    },
    {
      num: '05',
      id: 5,
      title: 'EXPLAIN & SUBMIT',
      icon: <CheckSquare size={13} color="var(--lime-accent)" />,
      steps: [
        { num: '11', text: 'Explain what you built in your own words' },
        { num: '12', text: 'Submit the project' }
      ]
    }
  ];

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
        padding: '14px 18px',
        boxSizing: 'border-box'
      }}
    >
      {/* 3D Procedural Background */}
      <ThreeBackground mousePosition={mousePosition} />

      {/* Cybernetic Scanline Overlay */}
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

      {/* Main Floating Glassmorphism HUD Briefing Panel */}
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="cyber-card"
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          maxWidth: '1160px',
          padding: '20px 24px',
          boxSizing: 'border-box',
          borderColor: 'var(--cyan-glow)',
          boxShadow: '0 0 50px rgba(0, 243, 255, 0.22), inset 0 0 20px rgba(0, 243, 255, 0.05)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          background: 'rgba(3, 7, 18, 0.95)',
          backdropFilter: 'blur(24px)'
        }}
      >
        {/* 1. HUD HEADER BAR */}
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
                fontSize: '0.74rem',
                letterSpacing: '0.1em',
                cursor: 'pointer',
                borderRadius: '3px'
              }}
            >
              <ArrowLeft size={14} />
              <span>BACK TO ARENA</span>
            </button>

            <div>
              <div style={{ fontFamily: 'var(--font-title)', fontSize: '1.2rem', color: '#ffffff', letterSpacing: '0.08em', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Cpu size={18} color="var(--cyan-glow)" />
                LAYER 02 <span style={{ color: 'var(--cyan-glow)' }}>// GEN AI TRACK</span>
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.64rem', color: 'rgba(0, 243, 255, 0.75)', letterSpacing: '0.14em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--cyan-glow)', display: 'inline-block', boxShadow: '0 0 6px var(--cyan-glow)' }} />
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
              border: '1px solid rgba(57, 255, 20, 0.35)',
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

        {/* 2. HERO MISSION OBJECTIVE NODE (Primary Visual Anchor) */}
        <motion.div
          whileHover={{ borderColor: 'rgba(0, 243, 255, 0.4)' }}
          style={{
            position: 'relative',
            padding: '12px 16px',
            background: 'linear-gradient(90deg, rgba(0, 243, 255, 0.08) 0%, rgba(2, 6, 20, 0.95) 100%)',
            border: '1px solid rgba(0, 243, 255, 0.25)',
            borderRadius: '4px',
            overflow: 'hidden'
          }}
        >
          {/* Animated Scanning Beam Top Border */}
          <motion.div
            animate={{ x: ['-100%', '100%'] }}
            transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '40%',
              height: '2px',
              background: 'linear-gradient(90deg, transparent, var(--cyan-glow), transparent)'
            }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <div style={{ fontFamily: 'var(--font-title)', fontSize: '0.78rem', color: 'var(--cyan-glow)', letterSpacing: '0.12em', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Layers size={14} /> MISSION OBJECTIVE
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--lime-accent)', background: 'rgba(57, 255, 20, 0.1)', padding: '2px 8px', borderRadius: '2px', letterSpacing: '0.1em' }}>
              ACTIVE PROTOCOL
            </span>
          </div>

          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#e5e7eb', lineHeight: 1.45 }}>
            Build a small working web application using AI-assisted development (ChatGPT / Gemini). Use AI for code generation, structure & debugging, while taking full responsibility for local setup, execution, and explaining your build.
          </div>
        </motion.div>

        {/* 3. MIDDLE DUAL SECTION: Authorized AI Capabilities & Player Duties */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          
          {/* LEFT: AUTHORIZED AI CAPABILITIES (Permission System / Chips) */}
          <div
            style={{
              padding: '12px 14px',
              background: 'rgba(57, 255, 20, 0.03)',
              border: '1px solid rgba(57, 255, 20, 0.2)',
              borderRadius: '4px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontFamily: 'var(--font-title)', fontSize: '0.74rem', color: 'var(--lime-accent)', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Bot size={14} /> ALLOWED AI USAGE
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--lime-accent)', letterSpacing: '0.08em' }}>
                6 PERMISSIONS UNLOCKED
              </span>
            </div>

            {/* Interactive Capability Chips Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              {capabilities.map((cap) => {
                const isHovered = hoveredCapability === cap.id;
                return (
                  <motion.div
                    key={cap.id}
                    onMouseEnter={() => {
                      setHoveredCapability(cap.id);
                      soundEngine.playHover();
                    }}
                    onMouseLeave={() => setHoveredCapability(null)}
                    whileHover={{ scale: 1.02 }}
                    style={{
                      padding: '6px 8px',
                      background: isHovered ? 'rgba(57, 255, 20, 0.12)' : 'rgba(57, 255, 20, 0.05)',
                      border: isHovered ? '1px solid var(--lime-accent)' : '1px solid rgba(57, 255, 20, 0.2)',
                      borderRadius: '3px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      cursor: 'pointer',
                      transition: 'background 0.2s, border 0.2s'
                    }}
                  >
                    <CheckCircle2 size={12} color="var(--lime-accent)" />
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: isHovered ? '#ffffff' : '#d1d5db', fontWeight: 600 }}>
                      {cap.title}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* RIGHT: YOUR RESPONSIBILITIES (Player Duty Interface) */}
          <div
            style={{
              padding: '12px 14px',
              background: 'rgba(239, 68, 68, 0.03)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '4px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontFamily: 'var(--font-title)', fontSize: '0.74rem', color: '#ef4444', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldAlert size={14} /> YOUR RESPONSIBILITIES
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: '#ef4444', letterSpacing: '0.08em' }}>
                MANDATORY PLAYER DUTIES
              </span>
            </div>

            {/* Tactical Duty Nodes List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              {duties.map((duty) => {
                const isHovered = hoveredDuty === duty.id;
                return (
                  <motion.div
                    key={duty.id}
                    onMouseEnter={() => {
                      setHoveredDuty(duty.id);
                      soundEngine.playHover();
                    }}
                    onMouseLeave={() => setHoveredDuty(null)}
                    whileHover={{ scale: 1.01 }}
                    style={{
                      padding: '5px 8px',
                      background: duty.highlight
                        ? isHovered ? 'rgba(57, 255, 20, 0.15)' : 'rgba(57, 255, 20, 0.08)'
                        : isHovered ? 'rgba(239, 68, 68, 0.12)' : 'rgba(2, 6, 20, 0.7)',
                      border: duty.highlight
                        ? '1px solid rgba(57, 255, 20, 0.35)'
                        : isHovered ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(239, 68, 68, 0.15)',
                      borderRadius: '3px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      transition: 'background 0.2s, border 0.2s'
                    }}
                  >
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', fontWeight: 800, color: duty.highlight ? 'var(--lime-accent)' : '#ef4444' }}>
                      0{duty.id}
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.67rem', color: duty.highlight ? 'var(--lime-accent)' : '#d1d5db', lineHeight: 1.35 }}>
                      {duty.highlight ? <strong>{duty.text}</strong> : duty.text}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </div>

        </div>

        {/* 4. MISSION WORKFLOW PROTOCOL (Interactive Connected Phase Rail) */}
        <div
          style={{
            padding: '12px 14px',
            background: 'rgba(2, 6, 18, 0.92)',
            border: '1px solid rgba(0, 243, 255, 0.2)',
            borderRadius: '4px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}
        >
          {/* Header & Interactive Phase Rail Filter Tabs */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ fontFamily: 'var(--font-title)', fontSize: '0.78rem', color: 'var(--cyan-glow)', letterSpacing: '0.12em', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Terminal size={15} /> MISSION WORKFLOW PROTOCOL
            </div>

            {/* Interactive Phase Rail Selector */}
            <div style={{ display: 'flex', gap: '4px', background: 'rgba(0, 243, 255, 0.05)', padding: '2px', borderRadius: '3px', border: '1px solid rgba(0, 243, 255, 0.15)' }}>
              <button
                onClick={() => setActivePhase('ALL')}
                style={{
                  padding: '2px 8px',
                  fontSize: '0.62rem',
                  fontFamily: 'var(--font-mono)',
                  color: activePhase === 'ALL' ? '#ffffff' : '#9ca3af',
                  background: activePhase === 'ALL' ? 'var(--cyan-glow)' : 'transparent',
                  border: 'none',
                  borderRadius: '2px',
                  cursor: 'pointer',
                  fontWeight: activePhase === 'ALL' ? 800 : 400
                }}
              >
                ALL PHASES
              </button>
              {phases.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    soundEngine.playClick();
                    setActivePhase(p.id);
                  }}
                  onMouseEnter={() => soundEngine.playHover()}
                  style={{
                    padding: '2px 8px',
                    fontSize: '0.62rem',
                    fontFamily: 'var(--font-mono)',
                    color: activePhase === p.id ? '#ffffff' : '#9ca3af',
                    background: activePhase === p.id ? 'rgba(0, 243, 255, 0.3)' : 'transparent',
                    border: 'none',
                    borderRadius: '2px',
                    cursor: 'pointer'
                  }}
                >
                  P{p.num}
                </button>
              ))}
            </div>
          </div>

          {/* 5 Phase Timeline Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
            {phases.map((phase) => {
              const isActive = activePhase === 'ALL' || activePhase === phase.id;
              return (
                <motion.div
                  key={phase.id}
                  onClick={() => setActivePhase(phase.id)}
                  whileHover={{ scale: 1.02 }}
                  style={{
                    padding: '6px 8px',
                    background: isActive ? 'rgba(0, 243, 255, 0.05)' : 'rgba(0, 243, 255, 0.01)',
                    border: isActive ? '1px solid rgba(0, 243, 255, 0.25)' : '1px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: '3px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    opacity: isActive ? 1 : 0.45,
                    cursor: 'pointer',
                    transition: 'opacity 0.2s, background 0.2s, border 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', fontWeight: 800, color: 'var(--cyan-glow)', background: 'rgba(0, 243, 255, 0.12)', padding: '1px 4px', borderRadius: '2px' }}>
                      P{phase.num}
                    </span>
                    <span style={{ fontFamily: 'var(--font-title)', fontSize: '0.64rem', color: '#ffffff', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      {phase.title}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', paddingLeft: '2px' }}>
                    {phase.steps.map((s) => (
                      <div key={s.num} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: '#d1d5db', display: 'flex', alignItems: 'flex-start', gap: '5px', lineHeight: 1.25 }}>
                        <span style={{ color: 'var(--cyan-glow)', fontWeight: 'bold', flexShrink: 0 }}>{s.num}.</span>
                        <span>{s.text}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* 5. BOTTOM HUD SPECS & ACTION BAR */}
        <div
          style={{
            display: 'flex',
            justify: 'space-between',
            alignItems: 'center',
            paddingTop: '6px',
            borderTop: '1px solid rgba(0, 243, 255, 0.18)',
            flexWrap: 'wrap',
            gap: '10px'
          }}
        >
          {/* HUD Metadata */}
          <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: '#9ca3af' }}>
              TIME: <span style={{ color: 'var(--cyan-glow)', fontWeight: 800 }}>30 MIN</span>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: '#9ca3af' }}>
              PROJECTS: <span style={{ color: 'var(--cyan-glow)', fontWeight: 800 }}>1 ASSIGNED</span>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: '#9ca3af' }}>
              TOOLS: <span style={{ color: 'var(--lime-accent)', fontWeight: 800 }}>VS CODE + CHATGPT / GEMINI</span>
            </div>
          </div>

          {/* Primary CTA Button */}
          <motion.button
            whileHover={{ scale: 1.04, boxShadow: '0 0 28px rgba(0, 243, 255, 0.5)' }}
            whileTap={{ scale: 0.96 }}
            className="cyber-btn"
            onClick={() => {
              soundEngine.playBoot();
              if (onBegin) onBegin();
            }}
            onMouseEnter={() => soundEngine.playHover()}
            style={{
              padding: '9px 26px',
              fontSize: '0.86rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer'
            }}
          >
            <Play size={15} />
            <span>BEGIN GEN AI CHALLENGE</span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
