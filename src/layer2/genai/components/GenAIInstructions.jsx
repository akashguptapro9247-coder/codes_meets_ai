import React from 'react';
import { motion } from 'framer-motion';
import { Play, Code, Bot, Folder, FileCode, Bug, CheckSquare, ArrowLeft } from 'lucide-react';
import { soundEngine } from '../../../shared/utils/SoundEngine';

export default function GenAIInstructions({ onBack, onBegin }) {
  return (
    <div style={{ width: '100%', maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px', padding: '20px', paddingBottom: '80px' }}>
      
      {/* Top Bar - Back to Arena */}
      <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
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
            padding: '8px 16px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8rem',
            letterSpacing: '0.1em',
            cursor: 'pointer'
          }}
        >
          <ArrowLeft size={16} />
          <span>BACK TO ARENA</span>
        </button>
      </div>

      {/* Header */}
      <div className="cyber-card" style={{ padding: '30px', textAlign: 'center', background: 'rgba(0,0,0,0.6)' }}>
        <h1 style={{ fontFamily: 'var(--font-title)', fontSize: '2.2rem', color: '#ffffff', margin: '0 0 10px 0' }}>
          LAYER 2 <span style={{ color: 'var(--cyan-glow)' }}>GEN AI WEBSITE BUILDING</span>
        </h1>
        <p style={{ fontFamily: 'var(--font-mono)', color: '#9ca3af', fontSize: '1rem', margin: 0 }}>
          Build a small working application using AI-assisted development.
        </p>
      </div>

      {/* Info Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
        <div className="cyber-card" style={{ padding: '20px', background: 'rgba(0,0,0,0.4)', borderTop: '2px solid var(--magenta-glow)' }}>
          <div style={{ color: 'var(--magenta-glow)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', marginBottom: '8px' }}>TIME</div>
          <div style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 'bold' }}>30 MINUTES</div>
        </div>
        <div className="cyber-card" style={{ padding: '20px', background: 'rgba(0,0,0,0.4)', borderTop: '2px solid var(--cyan-glow)' }}>
          <div style={{ color: 'var(--cyan-glow)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', marginBottom: '8px' }}>QUESTIONS</div>
          <div style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 'bold' }}>1 ASSIGNED PROJECT</div>
        </div>
        <div className="cyber-card" style={{ padding: '20px', background: 'rgba(0,0,0,0.4)', borderTop: '2px solid var(--lime-accent)' }}>
          <div style={{ color: 'var(--lime-accent)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', marginBottom: '8px' }}>AI TOOLS</div>
          <div style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 'bold' }}>ChatGPT / Gemini ALLOWED</div>
        </div>
        <div className="cyber-card" style={{ padding: '20px', background: 'rgba(0,0,0,0.4)', borderTop: '2px solid #f59e0b' }}>
          <div style={{ color: '#f59e0b', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', marginBottom: '8px' }}>DEVELOPMENT</div>
          <div style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 'bold' }}>VS Code</div>
        </div>
      </div>

      {/* Rules */}
      <div className="cyber-card" style={{ padding: '30px', background: 'rgba(0,0,0,0.4)' }}>
        <h2 style={{ color: 'var(--cyan-glow)', fontFamily: 'var(--font-title)', marginTop: 0, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Bot size={24} /> ALLOWED AI USAGE
        </h2>
        <ul style={{ color: '#d1d5db', lineHeight: '1.8', margin: 0, paddingLeft: '20px', fontFamily: 'var(--font-sans)' }}>
          <li>You may use AI to understand the problem.</li>
          <li>You may use AI to generate code.</li>
          <li>You may ask the AI how to structure the project.</li>
          <li>You may use AI to debug errors.</li>
          <li>You may use AI to improve the UI/UX.</li>
          <li>You may ask the AI to explain unfamiliar code.</li>
        </ul>

        <h2 style={{ color: '#ef4444', fontFamily: 'var(--font-title)', marginTop: '30px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Code size={24} /> YOUR RESPONSIBILITIES
        </h2>
        <ul style={{ color: '#d1d5db', lineHeight: '1.8', margin: 0, paddingLeft: '20px', fontFamily: 'var(--font-sans)' }}>
          <li>You must create the project folder yourself.</li>
          <li>You must create the required files yourself.</li>
          <li>You must organize the project yourself.</li>
          <li>You must paste/enter the generated code into the appropriate files.</li>
          <li>You must run the application yourself.</li>
          <li>You must troubleshoot issues yourself.</li>
          <li><strong>You must understand and explain what you built.</strong></li>
        </ul>
      </div>

      {/* Workflow */}
      <div className="cyber-card" style={{ padding: '30px', background: 'rgba(0,0,0,0.4)' }}>
        <h2 style={{ color: 'var(--lime-accent)', fontFamily: 'var(--font-title)', marginTop: 0, marginBottom: '20px' }}>
          HOW TO BUILD YOUR PROJECT
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Step num="1" icon={<Code size={18} />} text="Open VS Code." />
          <Step num="2" icon={<Folder size={18} />} text="Create a new folder for your project." />
          <Step num="3" icon={<Folder size={18} />} text="Open that folder in VS Code." />
          <Step num="4" icon={<FileCode size={18} />} text="Read your assigned problem carefully." />
          <Step num="5" icon={<Bot size={18} />} text="Use ChatGPT or Gemini to help generate code or understand how to implement the requirements." />
          <Step num="6" icon={<FileCode size={18} />} text="Create the required files manually inside VS Code based on the structure suggested by the AI or your own understanding." />
          <Step num="7" icon={<FileCode size={18} />} text="Paste/write the generated code into the appropriate files." />
          <Step num="8" icon={<Play size={18} />} text="Run the project locally." />
          <Step num="9" icon={<CheckSquare size={18} />} text="Test every major requirement from the problem statement." />
          <Step num="10" icon={<Bug size={18} />} text="Fix any errors using your own debugging and AI assistance." />
          <Step num="11" icon={<FileCode size={18} />} text="Return to the Code Meets AI page and explain what you built in your own words." />
          <Step num="12" icon={<CheckSquare size={18} />} text="Submit the project." />
        </div>
      </div>

      {/* Action */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
        <motion.button
          whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(0, 243, 255, 0.4)' }}
          whileTap={{ scale: 0.95 }}
          className="cyber-btn"
          onClick={() => {
            soundEngine.playBoot();
            if (onBegin) onBegin();
          }}
          onMouseEnter={() => soundEngine.playHover()}
          style={{ padding: '16px 48px', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
        >
          <Play size={24} />
          BEGIN GEN AI CHALLENGE
        </motion.button>
      </div>
    </div>
  );
}

function Step({ num, icon, text }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
      <div style={{ 
        width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(57, 255, 20, 0.1)', 
        border: '1px solid var(--lime-accent)', color: 'var(--lime-accent)', 
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        fontFamily: 'var(--font-mono)', fontWeight: 'bold'
      }}>
        {num}
      </div>
      <div style={{ color: '#d1d5db', lineHeight: '1.6', paddingTop: '4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ color: 'var(--cyan-glow)', opacity: 0.8 }}>{icon}</span>
        {text}
      </div>
    </div>
  );
}
