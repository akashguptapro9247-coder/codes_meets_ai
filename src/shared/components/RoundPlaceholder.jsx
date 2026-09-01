import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Terminal, Play } from 'lucide-react';
import { soundEngine } from '../utils/SoundEngine';
import { eventStateService } from '../services/eventStateService';
import Layer1GenAIChallenge from '../../layer1/genai/Layer1GenAIChallenge';
import Layer1ManualChallenge from '../../layer1/manual/Layer1ManualChallenge';
import Layer2ManualRoute from '../../layer2/manual/Layer2ManualRoute';
import Layer2GenAIRoute from '../../layer2/genai/Layer2GenAIRoute';

// NOTE: `isChallengeOpen` and `onLaunchChallenge` are LIFTED to EventArenaScene
// so the challenge-launched state survives re-renders of this component.
export default function RoundPlaceholder({
  roundPath,
  roundTitle,
  participant,
  isChallengeOpen,
  onLaunchChallenge,
  onBackToArena
}) {
  const isManualLayer1 =
    (roundPath?.toLowerCase().includes('manual') ||
    roundTitle?.toLowerCase().includes('manual')) &&
    (roundPath?.includes('layer1') || roundPath?.includes('layer/1') || roundPath?.includes('layer-1') ||
     roundTitle?.toLowerCase().includes('layer 01') || roundTitle?.toLowerCase().includes('layer 1'));

  const isManualLayer2 =
    (roundPath?.toLowerCase().includes('manual') ||
    roundTitle?.toLowerCase().includes('manual')) &&
    (roundPath?.includes('layer2') || roundPath?.includes('layer/2') || roundPath?.includes('layer-2') ||
     roundTitle?.toLowerCase().includes('layer 02') || roundTitle?.toLowerCase().includes('layer 2'));

  const isGenAiLayer1 =
    !isManualLayer1 && !isManualLayer2 && (
      (roundPath?.toLowerCase().includes('gen-ai') ||
      roundPath?.toLowerCase().includes('genai') ||
      roundTitle?.toLowerCase().includes('gen ai') ||
      roundTitle?.toLowerCase().includes('genai') ||
      roundTitle?.toLowerCase().includes('prompt')) &&
      (roundPath?.includes('layer1') || roundPath?.includes('layer/1') || roundPath?.includes('layer-1') ||
       roundTitle?.toLowerCase().includes('layer 01') || roundTitle?.toLowerCase().includes('layer 1'))
    );

  const isGenAiLayer2 =
    !isManualLayer1 && !isManualLayer2 && !isGenAiLayer1 && (
      (roundPath?.toLowerCase().includes('gen-ai') ||
      roundPath?.toLowerCase().includes('genai') ||
      roundTitle?.toLowerCase().includes('gen ai') ||
      roundTitle?.toLowerCase().includes('genai')) &&
      (roundPath?.includes('layer2') || roundPath?.includes('layer/2') || roundPath?.includes('layer-2') ||
       roundTitle?.toLowerCase().includes('layer 02') || roundTitle?.toLowerCase().includes('layer 2'))
    );

  // Real-time lock listener — only act if admin CHANGES state from active → inactive
  const prevStateRef = useRef(null);
  React.useEffect(() => {
    const unsubscribe = eventStateService.subscribeToEventState((state) => {
      const prev = prevStateRef.current;
      prevStateRef.current = state;
      if (!prev) return; // Skip first call

      const isLayer1 = roundPath?.includes('layer1') || roundPath?.includes('layer/1') || roundPath?.includes('layer-1') || roundTitle?.toLowerCase().includes('layer 01');
      const isLayer2 = roundPath?.includes('layer2') || roundPath?.includes('layer/2') || roundPath?.includes('layer-2') || roundTitle?.toLowerCase().includes('layer 02');

      if (isLayer1) {
        const wasActive = prev.layer1?.active;
        if (wasActive && !state.layer1?.active) { if (onBackToArena) onBackToArena(); return; }
        if (wasActive && isManualLayer1 && prev.layer1?.activeTrack === 'manual' && state.layer1?.activeTrack !== 'manual') { if (onBackToArena) onBackToArena(); return; }
        if (wasActive && isGenAiLayer1 && prev.layer1?.activeTrack === 'gen-ai' && state.layer1?.activeTrack !== 'gen-ai') { if (onBackToArena) onBackToArena(); return; }
      } else if (isLayer2) {
        const wasActive = prev.layer2?.active;
        if (wasActive && !state.layer2?.active) { if (onBackToArena) onBackToArena(); return; }
        if (wasActive && isManualLayer2 && prev.layer2?.activeTrack === 'manual' && state.layer2?.activeTrack !== 'manual') { if (onBackToArena) onBackToArena(); return; }
        if (wasActive && isGenAiLayer2 && prev.layer2?.activeTrack === 'gen-ai' && state.layer2?.activeTrack !== 'gen-ai') { if (onBackToArena) onBackToArena(); return; }
      }
    });
    return () => unsubscribe();
  }, [roundPath, roundTitle, isManualLayer1, isManualLayer2, isGenAiLayer1, isGenAiLayer2, onBackToArena]);

  // ─── Challenge screens (rendered when isChallengeOpen=true) ───────────────

  if (isChallengeOpen && isManualLayer1) {
    return (
      <Layer1ManualChallenge
        participant={participant}
        onBack={onBackToArena}
      />
    );
  }

  if (isChallengeOpen && isManualLayer2) {
    return (
      <Layer2ManualRoute
        participant={participant}
        onBack={onBackToArena}
        skipIntro={true}
      />
    );
  }

  if (isChallengeOpen && isGenAiLayer1) {
    return (
      <Layer1GenAIChallenge
        participant={participant}
        onBack={onBackToArena}
        challengeImage="/assets/layer1_genai.jpeg"
        challengeTitle={roundTitle}
      />
    );
  }

  if (isChallengeOpen && isGenAiLayer2) {
    return (
      <Layer2GenAIRoute
        participant={participant}
        onBack={onBackToArena}
      />
    );
  }


  // ─── Intro / entry panel ──────────────────────────────────────────────────

  let challengeDescription = '';
  let trackLabel = '';
  let rules = [];

  if (isManualLayer1) {
    challengeDescription = 'Answer a set of technical coding questions. Choose your answer carefully — answers are final and cannot be changed once submitted.';
    trackLabel = 'CODING ASSESSMENT';
    rules = [
      { label: '15 MIN', desc: 'Time Limit' },
      { label: '15 QUESTIONS', desc: 'Total Questions' },
      { label: 'FINAL', desc: 'Answers Locked' }
    ];
  } else if (isManualLayer2) {
    challengeDescription = 'Solve a set of coding challenges — jumbled syntax, missing lines, short logic problems and more. Choose your language and complete as many questions as you can within the time limit.';
    trackLabel = 'JUMBLED CODE CHALLENGE';
    rules = [
      { label: '30 MIN', desc: 'Time Limit' },
      { label: '5 QUESTIONS', desc: 'Total Questions' },
      { label: '3 ATTEMPTS', desc: 'Per Question' }
    ];
  } else if (isGenAiLayer1) {
    challengeDescription = 'Reconstruct the target scene using AI prompts. Observe the reference scene, formulate your prompt, and upload your output.';
    trackLabel = 'AI PROMPT CHALLENGE';
    rules = [
      { label: '15 MIN', desc: 'Time Limit' },
      { label: '1 SUBMISSION', desc: 'One Attempt' },
      { label: 'FINAL', desc: 'Answers Locked' }
    ];
  } else if (isGenAiLayer2) {
    challengeDescription = 'Build a complete project using AI tools and explain your development process. You will be assigned a project topic. Zip your project and submit it along with a detailed explanation of what you built and how AI helped you.';
    trackLabel = 'WEBSITE BUILDING CHALLENGE';
    rules = [
      { label: '30 MIN', desc: 'Time Limit' },
      { label: '1 SUBMISSION', desc: 'One Attempt' },
      { label: 'EXPLANATION', desc: 'Required' }
    ];
  } else {
    challengeDescription = 'Select a round to begin your challenge.';
    trackLabel = 'CHALLENGE';
    rules = [];
  }

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
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {rules.map((item) => (
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
              onLaunchChallenge();
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
            <span>BEGIN CHALLENGE</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
