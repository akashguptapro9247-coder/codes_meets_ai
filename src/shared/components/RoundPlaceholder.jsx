import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Terminal, Play } from 'lucide-react';
import { soundEngine } from '../utils/SoundEngine';
import { eventStateService } from '../services/eventStateService';
import Layer1GenAIChallenge from '../../layer1/genai/Layer1GenAIChallenge';
import Layer1ManualChallenge from '../../layer1/manual/Layer1ManualChallenge';

export default function RoundPlaceholder({ roundPath, roundTitle, participant, onBackToArena }) {
  const isManualLayer1 =
    roundPath?.toLowerCase().includes('manual') ||
    roundTitle?.toLowerCase().includes('manual');

  const isGenAiLayer1 =
    !isManualLayer1 && (
      roundPath?.toLowerCase().includes('gen-ai') ||
      roundPath?.toLowerCase().includes('genai') ||
      roundTitle?.toLowerCase().includes('gen ai') ||
      roundTitle?.toLowerCase().includes('genai') ||
      roundTitle?.toLowerCase().includes('prompt') ||
      roundPath === '/layer/1' ||
      roundPath === '/layer1'
    );

  const [isWorkspaceLaunched, setIsWorkspaceLaunched] = useState(false);

  // Real-time lock listener on placeholder screen
  useEffect(() => {
    const unsubscribe = eventStateService.subscribeToEventState((state) => {
      const isLayer1 = roundPath?.includes('1') || roundTitle?.includes('1') || roundTitle?.includes('01');
      const isLayer2 = roundPath?.includes('2') || roundTitle?.includes('2') || roundTitle?.includes('02');

      if (isLayer1) {
        if (!state.layer1?.active) {
          if (onBackToArena) onBackToArena();
        } else if (isManualLayer1 && state.layer1?.activeTrack !== 'manual') {
          if (onBackToArena) onBackToArena();
        } else if (isGenAiLayer1 && state.layer1?.activeTrack !== 'gen-ai') {
          if (onBackToArena) onBackToArena();
        }
      } else if (isLayer2) {
        if (!state.layer2?.active) {
          if (onBackToArena) onBackToArena();
        }
      }
    });
    return () => unsubscribe();
  }, [roundPath, roundTitle, isManualLayer1, isGenAiLayer1, onBackToArena]);

  // If Manual workspace is launched, render the complete Manual Coding MCQ challenge interface
  if (isWorkspaceLaunched && isManualLayer1) {
    return (
      <Layer1ManualChallenge
        participant={participant}
        onBack={onBackToArena}
      />
    );
  }

  // If GenAI workspace is launched, render the complete GenAI challenge interface
  if (isWorkspaceLaunched && isGenAiLayer1) {
    return (
      <Layer1GenAIChallenge
        participant={participant}
        onBack={onBackToArena}
        challengeImage="/assets/layer1_genai.jpeg"
        challengeTitle={roundTitle}
      />
    );
  }

  // Description based on track type — clean, student-facing language
  const challengeDescription = isManualLayer1
    ? 'Answer a set of technical coding questions. Choose your answer carefully — answers are final and cannot be changed once submitted.'
    : 'Reconstruct the target scene using AI prompts. Observe the reference scene, formulate your prompt, and upload your output.';

  const launchLabel = 'BEGIN CHALLENGE';
  const trackLabel = isManualLayer1 ? 'CODING ASSESSMENT' : 'AI PROMPT CHALLENGE';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 60,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '30px 24px',
        boxSizing: 'border-box',
        background: 'rgba(3, 7, 18, 0.92)',
        backdropFilter: 'blur(20px)'
      }}
    >
      {/* Top Bar */}
      <div
        style={{
          width: '100%',
          maxWidth: '760px',
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'center',
          marginBottom: '20px'
        }}
      >
        <button
          onClick={() => {
            soundEngine.playClick();
            onBackToArena();
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

      {/* Challenge Entry Panel */}
      <div
        className="cyber-card"
        style={{
          width: '100%',
          maxWidth: '760px',
          padding: '36px 32px',
          boxSizing: 'border-box',
          borderColor: 'var(--cyan-glow)',
          boxShadow: '0 0 40px rgba(0, 243, 255, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Terminal size={26} color="var(--cyan-glow)" />
          <div>
            <h2
              style={{
                fontFamily: 'var(--font-title)',
                fontSize: '1.5rem',
                margin: 0,
                color: '#ffffff',
                letterSpacing: '0.1em'
              }}
            >
              {roundTitle}
            </h2>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.72rem',
                color: 'var(--cyan-glow)',
                marginTop: '4px',
                letterSpacing: '0.1em'
              }}
            >
              {trackLabel}
            </div>
          </div>
        </div>

        {/* Participant Tag */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 14px',
            background: 'rgba(57, 255, 20, 0.08)',
            border: '1px solid rgba(57, 255, 20, 0.3)',
            borderRadius: '3px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.78rem',
            color: 'var(--lime-accent)'
          }}
        >
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--lime-accent)', display: 'inline-block', boxShadow: '0 0 8px var(--lime-accent)' }} />
          {participant?.name || 'Participant'} — {participant?.rollNumber || participant?.roll_number || 'N/A'}
        </div>

        {/* Challenge Instructions */}
        <div
          style={{
            padding: '18px 20px',
            background: 'rgba(2, 6, 18, 0.95)',
            border: '1px solid rgba(0, 243, 255, 0.18)',
            borderRadius: '4px',
            fontFamily: 'var(--font-body)',
            fontSize: '0.9rem',
            color: '#d1d5db',
            lineHeight: 1.6
          }}
        >
          {challengeDescription}
        </div>

        {/* Rules at-a-glance */}
        <div
          style={{
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap'
          }}
        >
          {[
            { label: '15 MIN', desc: 'Time Limit' },
            { label: isManualLayer1 ? '15 QUESTIONS' : '1 SUBMISSION', desc: isManualLayer1 ? 'Total Questions' : 'One Attempt' },
            { label: 'FINAL', desc: 'Answers Locked' }
          ].map((item) => (
            <div
              key={item.label}
              style={{
                flex: '1 1 auto',
                padding: '10px 14px',
                background: 'rgba(0, 243, 255, 0.06)',
                border: '1px solid rgba(0, 243, 255, 0.2)',
                borderRadius: '3px',
                textAlign: 'center'
              }}
            >
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 800, color: 'var(--cyan-glow)' }}>
                {item.label}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#9ca3af', marginTop: '2px' }}>
                {item.desc}
              </div>
            </div>
          ))}
        </div>

        {/* Launch Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={() => {
              soundEngine.playBoot();
              setIsWorkspaceLaunched(true);
            }}
            className="cyber-btn"
            style={{
              padding: '12px 32px',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <Play size={16} />
            <span>{launchLabel}</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
