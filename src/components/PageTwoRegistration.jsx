import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Users, Trophy, Cpu, Code2, ArrowLeft, CheckCircle2, Shuffle, Sparkles } from 'lucide-react';
import { soundEngine } from '../utils/SoundEngine';

const RANDOM_CODENAMES = [
  'NEURAL_PHANTOM_77', 'SYNAPSE_OPERATOR', 'CYBER_VALKYRIE_09',
  'MATRIX_HACKER_X', 'QUANTUM_NEXUS', 'AI_SPECTRE_42',
  'DEEP_ZERO_PROT', 'ALGO_WARRIOR_99', 'BYTE_SHADOW'
];

export default function PageTwoRegistration({ onBack }) {
  const [codename, setCodename] = useState('');
  const [email, setEmail] = useState('');
  const [track, setTrack] = useState('NEURAL_AI');
  const [mode, setMode] = useState('SOLO');
  const [isRegistered, setIsRegistered] = useState(false);

  const generateCodename = () => {
    soundEngine.playHover();
    const randomName = RANDOM_CODENAMES[Math.floor(Math.random() * RANDOM_CODENAMES.length)];
    setCodename(randomName);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    soundEngine.playClick();
    setIsRegistered(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '30px 20px',
        boxSizing: 'border-box',
        overflowY: 'auto'
      }}
    >
      {/* Top Back Navigation & Arena Bar */}
      <div
        style={{
          width: '100%',
          maxWidth: '1000px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}
      >
        <button
          onClick={() => {
            soundEngine.playClick();
            onBack();
          }}
          onMouseEnter={() => soundEngine.playHover()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(0, 243, 255, 0.05)',
            border: '1px solid rgba(0, 243, 255, 0.3)',
            color: 'var(--cyan-glow)',
            padding: '8px 16px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8rem',
            letterSpacing: '0.1em',
            cursor: 'pointer'
          }}
        >
          <ArrowLeft size={16} />
          <span>[ RETURN TO BOOT SCREEN ]</span>
        </button>

        <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
          <span className="cyber-badge">ARENA: ONLINE</span>
          <span className="cyber-badge" style={{ borderColor: 'var(--magenta-glow)', color: 'var(--magenta-glow)' }}>
            OPERATORS: 1,482 REGISTERED
          </span>
        </div>
      </div>

      {/* Main Container Grid */}
      <div
        style={{
          width: '100%',
          maxWidth: '1000px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px'
        }}
      >
        {/* Left Column: Registration Form */}
        <div className="cyber-card" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <Shield color="var(--cyan-glow)" size={22} />
            <h2
              style={{
                fontFamily: 'var(--font-title)',
                fontSize: '1.4rem',
                margin: 0,
                color: '#ffffff',
                letterSpacing: '0.08em'
              }}
            >
              ARENA REGISTRATION
            </h2>
          </div>
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.78rem',
              color: '#9ca3af',
              marginTop: '4px',
              marginBottom: '20px'
            }}
          >
            CLAIM YOUR OPERATOR IDENTITY TO ENTER THE COMPETITION GRID.
          </p>

          <AnimatePresence mode="wait">
            {!isRegistered ? (
              <motion.form key="form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Codename Input */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      color: 'var(--cyan-glow)',
                      marginBottom: '6px'
                    }}
                  >
                    OPERATOR CODENAME
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      required
                      placeholder="e.g. CYBER_NEURAL_01"
                      className="cyber-input"
                      value={codename}
                      onChange={(e) => setCodename(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={generateCodename}
                      style={{
                        padding: '0 12px',
                        background: 'rgba(0, 243, 255, 0.1)',
                        border: '1px solid rgba(0, 243, 255, 0.4)',
                        color: 'var(--cyan-glow)',
                        cursor: 'pointer'
                      }}
                      title="Generate Cyber Handle"
                    >
                      <Shuffle size={16} />
                    </button>
                  </div>
                </div>

                {/* Email Access Key Input */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      color: 'var(--cyan-glow)',
                      marginBottom: '6px'
                    }}
                  >
                    ACCESS EMAIL / DEPLOYMENT KEY
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="operator@neuralmesh.io"
                    className="cyber-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                {/* Track Selection */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      color: 'var(--cyan-glow)',
                      marginBottom: '6px'
                    }}
                  >
                    COMPETITION BATTLE TRACK
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {[
                      { id: 'NEURAL_AI', label: '🧠 NEURAL AI BATTLEGROUND', desc: 'LLM Agents & Autonomous Coders' },
                      { id: 'ALGO_SPEED', label: '⚡ ALGORITHMIC SPEED ARENA', desc: 'High-Performance DSA & Code' },
                      { id: 'FULLSTACK_WAR', label: '🌐 CYBER FULL-STACK WAR', desc: 'Generative UI & Real-time Web' }
                    ].map((t) => (
                      <div
                        key={t.id}
                        onClick={() => {
                          soundEngine.playHover();
                          setTrack(t.id);
                        }}
                        style={{
                          padding: '10px 14px',
                          border: track === t.id ? '1px solid var(--cyan-glow)' : '1px solid rgba(255, 255, 255, 0.08)',
                          background: track === t.id ? 'rgba(0, 243, 255, 0.12)' : 'rgba(0, 0, 0, 0.4)',
                          cursor: 'pointer',
                          borderRadius: '2px',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <div style={{ fontFamily: 'var(--font-title)', fontSize: '0.85rem', color: track === t.id ? '#ffffff' : '#d1d5db' }}>
                          {t.label}
                        </div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#9ca3af', marginTop: '2px' }}>
                          {t.desc}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mode Select */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      color: 'var(--cyan-glow)',
                      marginBottom: '6px'
                    }}
                  >
                    OPERATOR SQUAD MODE
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    {[
                      { id: 'SOLO', label: 'SOLO OPERATOR' },
                      { id: 'SQUAD', label: 'SQUAD DISCORD' }
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          soundEngine.playHover();
                          setMode(m.id);
                        }}
                        style={{
                          padding: '10px',
                          border: mode === m.id ? '1px solid var(--magenta-glow)' : '1px solid rgba(255, 255, 255, 0.1)',
                          background: mode === m.id ? 'rgba(224, 38, 255, 0.15)' : 'rgba(0, 0, 0, 0.4)',
                          color: mode === m.id ? '#ffffff' : '#9ca3af',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.75rem',
                          cursor: 'pointer'
                        }}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit Deploy Button */}
                <button type="submit" className="cyber-btn" style={{ width: '100%', marginTop: '10px' }}>
                  <Sparkles size={18} />
                  <span>DEPLOY INTO ARENA</span>
                </button>
              </motion.form>
            ) : (
              /* Success Modal Feedback */
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                  textAlign: 'center',
                  padding: '30px 10px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '16px'
                }}
              >
                <CheckCircle2 color="var(--lime-accent)" size={60} />
                <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.4rem', margin: 0, color: '#ffffff' }}>
                  OPERATOR VERIFIED
                </h3>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--cyan-glow)' }}>
                  WELCOME TO THE GRID, <strong style={{ color: '#ffffff' }}>{codename || 'OPERATOR'}</strong>
                </p>
                <div
                  style={{
                    padding: '12px',
                    background: 'rgba(57, 255, 20, 0.1)',
                    border: '1px solid var(--lime-accent)',
                    borderRadius: '4px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    color: '#ffffff'
                  }}
                >
                  ACCESS KEY SENT TO: {email}
                  <br />
                  STAGE 01 PROTOCOL STARTS IN 04 DAYS.
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column: Arena Stats & Live Leaderboard Preview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Prize Pool Card */}
          <div className="cyber-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--magenta-glow)' }}>
              <Trophy size={20} />
              <span style={{ fontFamily: 'var(--font-title)', fontSize: '1rem', letterSpacing: '0.1em' }}>
                PRIZE POOL & ARENA BOUNTY
              </span>
            </div>
            <div
              style={{
                fontFamily: 'var(--font-title)',
                fontSize: '2.4rem',
                color: '#ffffff',
                fontWeight: 900,
                marginTop: '10px',
                textShadow: '0 0 15px rgba(224, 38, 255, 0.5)'
              }}
            >
              $50,000 USD
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#9ca3af', marginTop: '6px' }}>
              TOP OPERATORS RECEIVE DIRECT AI LAB SPONSORSHIPS & COMPUTING CREDITS
            </div>
          </div>

          {/* Arena Ticker */}
          <div className="cyber-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--cyan-glow)', marginBottom: '12px' }}>
              <Code2 size={20} />
              <span style={{ fontFamily: 'var(--font-title)', fontSize: '0.95rem', letterSpacing: '0.08em' }}>
                LIVE ARENA TRANSMISSIONS
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
              {[
                { time: '12:34:01', msg: 'Operator @cyber_zero registered for Neural AI' },
                { time: '12:32:15', msg: 'New Squad team "DeepCode" formed' },
                { time: '12:28:44', msg: 'Arena 01 Compute Clusters scaled to 128 GPUs' }
              ].map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '8px',
                    background: 'rgba(0, 243, 255, 0.05)',
                    borderLeft: '2px solid var(--cyan-glow)',
                    color: '#d1d5db'
                  }}
                >
                  <span style={{ color: 'var(--cyan-glow)', marginRight: '8px' }}>[{item.time}]</span>
                  {item.msg}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
