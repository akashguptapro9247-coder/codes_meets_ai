import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Lock, ArrowRight, ShieldAlert } from 'lucide-react';
import ChallengeHeader from './ChallengeHeader';
import SceneViewer from './SceneViewer';
import PromptInput from './PromptInput';
import AiPlatformButtons from './AiPlatformButtons';
import ImageUploader from './ImageUploader';
import CountdownTimer from './CountdownTimer';
import SubmissionControls from './SubmissionControls';
import DigitalParticles from '../DigitalParticles';
import ScanOverlay from '../ScanOverlay';
import { supabase } from '../../services/supabaseClient';
import { adminService } from '../../services/adminService';
import { eventStateService } from '../../services/eventStateService';
import { soundEngine } from '../../utils/SoundEngine';

export default function Layer1GenAIChallenge({
  participant,
  onBack,
  challengeImage = '/assets/layer1_genai.jpeg',
  challengeTitle = 'LAYER 01 // PROMPT ENGINEERING & SCENE RECONSTRUCTION'
}) {
  const [prompt, setPrompt] = useState('');
  const [images, setImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [validationError, setValidationError] = useState(null);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [existingSubmission, setExistingSubmission] = useState(null);
  const isFinalizingTimeoutRef = useRef(false);

  const userId = participant?.userId || participant?.user_id;

  // Real-time lock listener: if admin locks Layer 1 or deactivates GenAI track, exit immediately to Play Page
  useEffect(() => {
    const unsubscribe = eventStateService.subscribeToEventState((state) => {
      if (!state.layer1?.active || state.layer1?.activeTrack !== 'gen-ai') {
        if (onBack) onBack();
      }
    });
    return () => unsubscribe();
  }, [onBack]);

  // Load any existing submission from Supabase on mount and listen to realtime updates
  useEffect(() => {
    if (!userId) return;

    const loadSubmission = () => {
      adminService.fetchLayer1SubmissionForUser(userId).then(({ data }) => {
        if (data) {
          setExistingSubmission(data);
          if (data.prompt) setPrompt(data.prompt);
          if (data.image_urls && Array.isArray(data.image_urls)) {
            const loadedImages = data.image_urls.map((url, idx) => ({
              id: `loaded_${idx}`,
              url,
              fileId: data.image_file_ids?.[idx] || '',
              filePath: data.image_paths?.[idx] || '',
              previewUrl: url,
              name: `Uploaded Asset #${idx + 1}`
            }));
            setImages(loadedImages);
          }
          if (data.status === 'TIME_EXPIRED' || data.time_taken === '15:00') {
            setIsTimeUp(true);
          } else {
            setSubmissionSuccess(true);
          }
        } else {
          // If Admin deleted submission or no submission exists
          setExistingSubmission(null);
          setSubmissionSuccess(false);

          // Check if timer in localStorage is already expired
          const timerKey = `cma_l1_genai_timer_start_${userId || 'player'}`;
          const storedStart = localStorage.getItem(timerKey);
          if (storedStart) {
            const elapsed = Math.floor((Date.now() - parseInt(storedStart, 10)) / 1000);
            if (elapsed >= 900) {
              handleTimeUp();
            }
          }
        }
      });
    };

    loadSubmission();

    // Subscribe to Realtime submission changes (detect Admin delete)
    const channelName = `genai_sub_user_${userId}_${Date.now()}`;
    const channel = supabase
      ?.channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'layer_1_genai_submissions'
        },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            loadSubmission();
          } else if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            if (payload.new && payload.new.user_id === userId) {
              loadSubmission();
            }
          }
        }
      )
      .subscribe();

    return () => {
      if (channel && supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, [userId]);

  // Add selected image file to local state (enforce single image)
  const handleAddImages = (newImages) => {
    if (isTimeUp || isCompleted) return;
    setImages((prev) => (newImages && newImages.length > 0 ? [newImages[0]] : []));
    if (validationError) setValidationError(null);
  };

  // Remove individual image
  const handleRemoveImage = (id) => {
    if (isTimeUp || isCompleted) return;
    setImages((prev) => prev.filter((img, idx) => (img.id ? img.id !== id : idx !== id)));
  };

  // Time expired callback: auto-finalize attempt to DB
  const handleTimeUp = async () => {
    setIsTimeUp(true);
    soundEngine.playClick();

    const timerKey = `cma_l1_genai_timer_start_${userId || 'player'}`;
    try {
      localStorage.removeItem(timerKey);
    } catch (e) {}

    // Prevent race-condition / duplicate timeout submission calls
    if (isFinalizingTimeoutRef.current) return;
    isFinalizingTimeoutRef.current = true;

    try {
      const { data } = await adminService.autoFinalizeLayer1GenAiTimeout({
        userId,
        username: participant?.name || 'Participant',
        rollNumber: participant?.rollNumber || participant?.roll_number || '',
        prompt: prompt.trim(),
        imageItems: images
      });

      if (data) {
        setExistingSubmission(data);
      }
    } catch (err) {
      console.error('[Layer1GenAI] Auto-finalization error:', err);
    }
  };

  // Real Submission Handler: ImageKit upload + Supabase insertion
  const handleSubmit = async () => {
    if (isTimeUp || existingSubmission?.status === 'TIME_EXPIRED') {
      setValidationError('CHALLENGE TIME HAS EXPIRED // SUBMISSIONS LOCKED');
      return;
    }

    if (!prompt.trim()) {
      soundEngine.playClick();
      setValidationError('Please formulate your prompt before submitting.');
      return;
    }

    if (!images || images.length === 0) {
      soundEngine.playClick();
      setValidationError('Please upload your generated image before submitting.');
      return;
    }

    setValidationError(null);
    setIsSubmitting(true);

    // Calculate actual time taken using the session timer
    const timerKey = `cma_l1_genai_timer_start_${userId || 'player'}`;
    const storedStart = localStorage.getItem(timerKey);
    const startTime = storedStart ? parseInt(storedStart, 10) : Date.now();
    const elapsedSeconds = Math.max(0, Math.min(900, Math.floor((Date.now() - startTime) / 1000)));
    const mins = Math.floor(elapsedSeconds / 60);
    const secs = elapsedSeconds % 60;
    const timeTakenFormatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    try {
      const { data, error } = await adminService.submitLayer1GenAi({
        userId,
        username: participant?.name || 'Participant',
        rollNumber: participant?.rollNumber || participant?.roll_number || '',
        prompt: prompt.trim(),
        imageItems: images,
        timeTaken: timeTakenFormatted,
        timeTakenSeconds: elapsedSeconds
      });

      if (error) {
        setValidationError(error.message || 'Failed to submit response. Please retry.');
        soundEngine.playClick();
      } else {
        setExistingSubmission(data);
        setSubmissionSuccess(true);
        soundEngine.playBoot();

        // Clear local timer on successful submission
        try {
          localStorage.removeItem(timerKey);
        } catch (e) {}
      }
    } catch (err) {
      console.error('Submission exception:', err);
      setValidationError('A network error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isTimeoutState = Boolean(isTimeUp || existingSubmission?.status === 'TIME_EXPIRED');
  const isManualCompleted = Boolean(
    (submissionSuccess || (existingSubmission && existingSubmission.status !== 'TIME_EXPIRED')) &&
    !isTimeoutState
  );
  const isCompleted = isTimeoutState || isManualCompleted;

  const cardBorder = isTimeoutState
    ? '1px solid rgba(239, 68, 68, 0.5)'
    : isManualCompleted
    ? '1px solid rgba(57, 255, 20, 0.4)'
    : '1px solid rgba(0, 243, 255, 0.35)';

  const cardShadow = isTimeoutState
    ? '0 25px 75px rgba(0, 0, 0, 0.95), 0 0 45px rgba(239, 68, 68, 0.25), inset 0 0 25px rgba(239, 68, 68, 0.08)'
    : isManualCompleted
    ? '0 25px 75px rgba(0, 0, 0, 0.95), 0 0 45px rgba(57, 255, 20, 0.2), inset 0 0 25px rgba(57, 255, 20, 0.06)'
    : '0 25px 75px rgba(0, 0, 0, 0.95), 0 0 45px rgba(0, 243, 255, 0.2), inset 0 0 25px rgba(0, 243, 255, 0.06)';

  const cornerColor = isTimeoutState ? '#ef4444' : isManualCompleted ? 'var(--lime-accent)' : undefined;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 80,
        backgroundColor: '#020612',
        overflow: 'hidden', // STRICTLY NO PAGE SCROLLING
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none'
      }}
    >
      {/* 2D Digital Particles Ambient Background */}
      <DigitalParticles />

      {/* CRT Scanline & HUD Telemetry Overlay */}
      <ScanOverlay currentStage={1} hideHeader={true} />

      {/* FLOATING MAIN CHALLENGE PANEL (4-6vw horizontal margin, 3-5vh vertical margin) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -15 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="cyber-card"
        style={{
          position: 'relative',
          width: 'calc(100vw - 8vw)',
          height: 'calc(100vh - 6vh)',
          maxWidth: '1560px',
          maxHeight: '880px',
          background: 'rgba(4, 9, 24, 0.94)',
          backdropFilter: 'blur(20px)',
          border: cardBorder,
          boxShadow: cardShadow,
          borderRadius: '4px',
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden', // STRICT CLIPPING
          boxSizing: 'border-box',
          zIndex: 20
        }}
      >
        {/* Four Sci-Fi HUD Corner Brackets */}
        <div className="hud-corner hud-top-left" style={{ width: '16px', height: '16px', zIndex: 25, borderColor: cornerColor }} />
        <div className="hud-corner hud-top-right" style={{ width: '16px', height: '16px', zIndex: 25, borderColor: cornerColor }} />
        <div className="hud-corner hud-bottom-left" style={{ width: '16px', height: '16px', zIndex: 25, borderColor: cornerColor }} />
        <div className="hud-corner hud-bottom-right" style={{ width: '16px', height: '16px', zIndex: 25, borderColor: cornerColor }} />

        {/* 1. TOP CHALLENGE HEADER */}
        <ChallengeHeader participant={participant} onBack={onBack} isCompleted={isCompleted} />

        {/* 2. MAIN WORKSPACE OR SUBMISSION COMPLETION SCREEN */}
        {isCompleted ? (
          <main
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px',
              boxSizing: 'border-box',
              overflowY: 'auto'
            }}
          >
            {isTimeoutState ? (
              /* DEDICATED TIMEOUT / AUTO-FINALIZED SCREEN */
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                style={{
                  width: '100%',
                  maxWidth: '680px',
                  background: 'rgba(18, 4, 8, 0.95)',
                  border: '1px solid rgba(239, 68, 68, 0.5)',
                  boxShadow: '0 0 50px rgba(239, 68, 68, 0.2), inset 0 0 20px rgba(239, 68, 68, 0.08)',
                  borderRadius: '6px',
                  padding: '32px 28px',
                  boxSizing: 'border-box',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  position: 'relative'
                }}
              >
                {/* Inner Corner Brackets */}
                <div className="hud-corner hud-top-left" style={{ width: '12px', height: '12px', borderColor: '#ef4444' }} />
                <div className="hud-corner hud-top-right" style={{ width: '12px', height: '12px', borderColor: '#ef4444' }} />
                <div className="hud-corner hud-bottom-left" style={{ width: '12px', height: '12px', borderColor: '#ef4444' }} />
                <div className="hud-corner hud-bottom-right" style={{ width: '12px', height: '12px', borderColor: '#ef4444' }} />

                {/* Timeout Icon Badge */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 220, damping: 16, delay: 0.15 }}
                  style={{
                    width: '68px',
                    height: '68px',
                    borderRadius: '50%',
                    background: 'rgba(239, 68, 68, 0.12)',
                    border: '2px solid #ef4444',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 30px rgba(239, 68, 68, 0.4)',
                    marginBottom: '16px'
                  }}
                >
                  <ShieldAlert size={38} color="#ef4444" />
                </motion.div>

                {/* Stage Sub-tag */}
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.72rem',
                    color: '#f59e0b',
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    marginBottom: '6px'
                  }}
                >
                  GENAI CHALLENGE // LAYER 01
                </div>

                {/* Main Completion Title */}
                <h1
                  style={{
                    fontFamily: 'var(--font-title)',
                    fontSize: '1.75rem',
                    margin: '0 0 12px 0',
                    color: '#ffffff',
                    letterSpacing: '0.12em',
                    textShadow: '0 0 20px rgba(239, 68, 68, 0.7), 0 0 40px rgba(245, 158, 11, 0.3)'
                  }}
                >
                  TIME EXPIRED
                </h1>

                {/* Status Pill Badges */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    marginBottom: '14px',
                    flexWrap: 'wrap'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '4px 12px',
                      background: 'rgba(245, 158, 11, 0.12)',
                      border: '1px solid rgba(245, 158, 11, 0.4)',
                      borderRadius: '2px',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.68rem',
                      color: '#f59e0b',
                      letterSpacing: '0.1em'
                    }}
                  >
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#f59e0b', boxShadow: '0 0 6px #f59e0b' }} />
                    <span>RESPONSE AUTO-FINALIZED</span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '4px 12px',
                      background: 'rgba(239, 68, 68, 0.12)',
                      border: '1px solid rgba(239, 68, 68, 0.4)',
                      borderRadius: '2px',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.68rem',
                      color: '#ef4444',
                      letterSpacing: '0.1em'
                    }}
                  >
                    <Lock size={12} color="#ef4444" />
                    <span>RESPONSE LOCKED</span>
                  </div>
                </div>

                {/* Auto-submitted Wording Notice */}
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.74rem',
                    color: '#d1d5db',
                    letterSpacing: '0.06em',
                    marginBottom: '20px'
                  }}
                >
                  YOUR ATTEMPT HAS BEEN AUTOMATICALLY RECORDED
                </div>

                {/* Participant & Submission Metadata Grid */}
                <div
                  style={{
                    width: '100%',
                    background: 'rgba(2, 6, 18, 0.85)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    borderRadius: '4px',
                    padding: '16px',
                    boxSizing: 'border-box',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                    gap: '12px',
                    marginBottom: '20px',
                    textAlign: 'left'
                  }}
                >
                  <div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: '#9ca3af', letterSpacing: '0.1em' }}>
                      OPERATOR NAME
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: '#ffffff', fontWeight: 700, marginTop: '2px' }}>
                      {(participant?.name || existingSubmission?.username || 'PARTICIPANT').toUpperCase()}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: '#9ca3af', letterSpacing: '0.1em' }}>
                      ROLL NUMBER
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--cyan-glow)', fontWeight: 700, marginTop: '2px' }}>
                      {participant?.rollNumber || participant?.roll_number || existingSubmission?.roll_number || 'N/A'}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: '#9ca3af', letterSpacing: '0.1em' }}>
                      ATTEMPT NUMBER
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--magenta-glow)', fontWeight: 700, marginTop: '2px' }}>
                      01 / 01
                    </div>
                  </div>

                  <div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: '#9ca3af', letterSpacing: '0.1em' }}>
                      STATUS
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: '#ef4444', fontWeight: 700, marginTop: '2px' }}>
                      TIME EXPIRED
                    </div>
                  </div>
                </div>

                {/* Read-Only Auto-submitted Details Summary */}
                <div
                  style={{
                    width: '100%',
                    background: 'rgba(2, 6, 18, 0.6)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: '4px',
                    padding: '14px',
                    boxSizing: 'border-box',
                    marginBottom: '24px',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: '#f59e0b', letterSpacing: '0.12em', fontWeight: 800, marginBottom: '10px' }}>
                    AUTO-FINALIZED RECORD (READ-ONLY)
                  </div>

                  {/* Prompt Field Display */}
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: '#9ca3af', marginBottom: '4px' }}>
                      PROMPT STATUS:
                    </div>
                    {(prompt.trim() || existingSubmission?.prompt) ? (
                      <div
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.74rem',
                          color: '#e5e7eb',
                          background: 'rgba(0, 0, 0, 0.4)',
                          border: '1px solid rgba(0, 243, 255, 0.2)',
                          padding: '8px 12px',
                          borderRadius: '3px',
                          lineHeight: 1.4,
                          maxHeight: '75px',
                          overflowY: 'auto'
                        }}
                      >
                        {prompt.trim() || existingSubmission?.prompt}
                      </div>
                    ) : (
                      <div
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.74rem',
                          color: '#ef4444',
                          fontStyle: 'italic',
                          background: 'rgba(239, 68, 68, 0.08)',
                          border: '1px solid rgba(239, 68, 68, 0.25)',
                          padding: '8px 12px',
                          borderRadius: '3px'
                        }}
                      >
                        NOT PROVIDED
                      </div>
                    )}
                  </div>

                  {/* Image Field Display */}
                  <div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: '#9ca3af', marginBottom: '4px' }}>
                      IMAGE STATUS:
                    </div>
                    {((images && images.length > 0) || (existingSubmission?.image_urls && existingSubmission.image_urls.length > 0)) ? (
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <img
                          src={images?.[0]?.previewUrl || images?.[0]?.url || existingSubmission?.image_urls?.[0]}
                          alt="Submitted Asset"
                          style={{
                            width: '56px',
                            height: '56px',
                            objectFit: 'cover',
                            borderRadius: '3px',
                            border: '1px solid var(--cyan-glow)'
                          }}
                        />
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.66rem', color: '#f59e0b' }}>
                          ✓ ASSET RECORDED AT TIMEOUT
                        </div>
                      </div>
                    ) : (
                      <div
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.74rem',
                          color: '#ef4444',
                          fontStyle: 'italic',
                          background: 'rgba(239, 68, 68, 0.08)',
                          border: '1px solid rgba(239, 68, 68, 0.25)',
                          padding: '8px 12px',
                          borderRadius: '3px'
                        }}
                      >
                        NOT UPLOADED
                      </div>
                    )}
                  </div>
                </div>

                {/* Primary Action Button */}
                <button
                  onClick={() => {
                    soundEngine.playClick();
                    if (onBack) onBack();
                  }}
                  onMouseEnter={() => soundEngine.playHover()}
                  className="cyber-btn"
                  style={{
                    padding: '12px 32px',
                    fontSize: '0.82rem',
                    letterSpacing: '0.12em',
                    borderColor: '#f59e0b',
                    color: '#f59e0b',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    cursor: 'pointer',
                    boxShadow: '0 0 20px rgba(245, 158, 11, 0.25)'
                  }}
                >
                  <span>RETURN TO ARENA</span>
                  <ArrowRight size={16} />
                </button>
              </motion.div>
            ) : (
              /* DEDICATED MANUAL SUBMISSION SUCCESSFUL SCREEN */
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                style={{
                  width: '100%',
                  maxWidth: '680px',
                  background: 'rgba(3, 10, 26, 0.95)',
                  border: '1px solid rgba(57, 255, 20, 0.4)',
                  boxShadow: '0 0 50px rgba(57, 255, 20, 0.15), inset 0 0 20px rgba(57, 255, 20, 0.05)',
                  borderRadius: '6px',
                  padding: '32px 28px',
                  boxSizing: 'border-box',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  position: 'relative'
                }}
              >
                {/* Inner Corner Brackets */}
                <div className="hud-corner hud-top-left" style={{ width: '12px', height: '12px', borderColor: 'var(--lime-accent)' }} />
                <div className="hud-corner hud-top-right" style={{ width: '12px', height: '12px', borderColor: 'var(--lime-accent)' }} />
                <div className="hud-corner hud-bottom-left" style={{ width: '12px', height: '12px', borderColor: 'var(--lime-accent)' }} />
                <div className="hud-corner hud-bottom-right" style={{ width: '12px', height: '12px', borderColor: 'var(--lime-accent)' }} />

                {/* Success Icon Badge */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 220, damping: 16, delay: 0.15 }}
                  style={{
                    width: '68px',
                    height: '68px',
                    borderRadius: '50%',
                    background: 'rgba(57, 255, 20, 0.1)',
                    border: '2px solid var(--lime-accent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 30px rgba(57, 255, 20, 0.4)',
                    marginBottom: '16px'
                  }}
                >
                  <CheckCircle2 size={38} color="var(--lime-accent)" />
                </motion.div>

                {/* Stage Sub-tag */}
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.72rem',
                    color: 'var(--cyan-glow)',
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    marginBottom: '6px'
                  }}
                >
                  LAYER 01 // GENAI CHALLENGE
                </div>

                {/* Main Completion Title */}
                <h1
                  style={{
                    fontFamily: 'var(--font-title)',
                    fontSize: '1.75rem',
                    margin: '0 0 12px 0',
                    color: '#ffffff',
                    letterSpacing: '0.12em',
                    textShadow: '0 0 20px rgba(57, 255, 20, 0.6), 0 0 40px rgba(0, 243, 255, 0.3)'
                  }}
                >
                  SUBMISSION SUCCESSFUL
                </h1>

                {/* Status Pill Badges */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    marginBottom: '24px',
                    flexWrap: 'wrap'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '4px 12px',
                      background: 'rgba(57, 255, 20, 0.12)',
                      border: '1px solid rgba(57, 255, 20, 0.4)',
                      borderRadius: '2px',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.68rem',
                      color: 'var(--lime-accent)',
                      letterSpacing: '0.1em'
                    }}
                  >
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--lime-accent)', boxShadow: '0 0 6px var(--lime-accent)' }} />
                    <span>RESPONSE RECORDED</span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '4px 12px',
                      background: 'rgba(0, 243, 255, 0.08)',
                      border: '1px solid rgba(0, 243, 255, 0.3)',
                      borderRadius: '2px',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.68rem',
                      color: 'var(--cyan-glow)',
                      letterSpacing: '0.1em'
                    }}
                  >
                    <Lock size={12} color="var(--cyan-glow)" />
                    <span>SUBMISSION LOCKED</span>
                  </div>
                </div>

                {/* Participant & Submission Metadata Grid */}
                <div
                  style={{
                    width: '100%',
                    background: 'rgba(2, 6, 18, 0.85)',
                    border: '1px solid rgba(0, 243, 255, 0.2)',
                    borderRadius: '4px',
                    padding: '16px',
                    boxSizing: 'border-box',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                    gap: '12px',
                    marginBottom: '20px',
                    textAlign: 'left'
                  }}
                >
                  <div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: '#9ca3af', letterSpacing: '0.1em' }}>
                      OPERATOR NAME
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: '#ffffff', fontWeight: 700, marginTop: '2px' }}>
                      {(participant?.name || existingSubmission?.username || 'PARTICIPANT').toUpperCase()}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: '#9ca3af', letterSpacing: '0.1em' }}>
                      ROLL NUMBER
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--cyan-glow)', fontWeight: 700, marginTop: '2px' }}>
                      {participant?.rollNumber || participant?.roll_number || existingSubmission?.roll_number || 'N/A'}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: '#9ca3af', letterSpacing: '0.1em' }}>
                      SUBMISSION TIME
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--lime-accent)', fontWeight: 700, marginTop: '2px' }}>
                      {existingSubmission?.time_taken ? `DURATION ${existingSubmission.time_taken}` : (existingSubmission?.submitted_at ? new Date(existingSubmission.submitted_at).toLocaleTimeString() : 'RECORDED')}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: '#9ca3af', letterSpacing: '0.1em' }}>
                      ATTEMPT NUMBER
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--magenta-glow)', fontWeight: 700, marginTop: '2px' }}>
                      01 / 01
                    </div>
                  </div>
                </div>

                {/* Read-Only Submitted Prompt & Image Summary */}
                {(prompt.trim() || (images && images.length > 0) || (existingSubmission && (existingSubmission.prompt || existingSubmission.image_urls))) && (
                  <div
                    style={{
                      width: '100%',
                      background: 'rgba(2, 6, 18, 0.6)',
                      border: '1px solid rgba(0, 243, 255, 0.15)',
                      borderRadius: '4px',
                      padding: '14px',
                      boxSizing: 'border-box',
                      marginBottom: '24px',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--cyan-glow)', letterSpacing: '0.12em', fontWeight: 800, marginBottom: '8px' }}>
                      RECORDED RESPONSE (READ-ONLY)
                    </div>

                    {(prompt.trim() || existingSubmission?.prompt) && (
                      <div style={{ marginBottom: (images?.length || existingSubmission?.image_urls?.length) ? '12px' : 0 }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: '#9ca3af', marginBottom: '4px' }}>
                          PROMPT:
                        </div>
                        <div
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.74rem',
                            color: '#e5e7eb',
                            background: 'rgba(0, 0, 0, 0.4)',
                            border: '1px solid rgba(0, 243, 255, 0.2)',
                            padding: '8px 12px',
                            borderRadius: '3px',
                            lineHeight: 1.4,
                            maxHeight: '75px',
                            overflowY: 'auto'
                          }}
                        >
                          {prompt.trim() || existingSubmission?.prompt}
                        </div>
                      </div>
                    )}

                    {((images && images.length > 0) || (existingSubmission?.image_urls && existingSubmission.image_urls.length > 0)) && (
                      <div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: '#9ca3af', marginBottom: '4px' }}>
                          SUBMITTED ASSET:
                        </div>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                          <img
                            src={images?.[0]?.previewUrl || images?.[0]?.url || existingSubmission?.image_urls?.[0]}
                            alt="Submitted Asset"
                            style={{
                              width: '56px',
                              height: '56px',
                              objectFit: 'cover',
                              borderRadius: '3px',
                              border: '1px solid var(--cyan-glow)'
                            }}
                          />
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.66rem', color: 'var(--lime-accent)' }}>
                            ✓ ASSET EVALUATION PENDING MANUAL SCORING
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Primary Action Button */}
                <button
                  onClick={() => {
                    soundEngine.playClick();
                    if (onBack) onBack();
                  }}
                  onMouseEnter={() => soundEngine.playHover()}
                  className="cyber-btn"
                  style={{
                    padding: '12px 32px',
                    fontSize: '0.82rem',
                    letterSpacing: '0.12em',
                    borderColor: 'var(--cyan-glow)',
                    color: 'var(--cyan-glow)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    cursor: 'pointer',
                    boxShadow: '0 0 20px rgba(0, 243, 255, 0.2)'
                  }}
                >
                  <span>RETURN TO ARENA</span>
                  <ArrowRight size={16} />
                </button>
              </motion.div>
            )}
          </main>
        ) : (
          /* ACTIVE 2-COLUMN WORKSPACE */
          <main
            style={{
              flex: 1,
              display: 'grid',
              gridTemplateColumns: '44% 56%',
              gap: '16px',
              padding: '16px 20px',
              boxSizing: 'border-box',
              overflow: 'hidden'
            }}
          >
            {/* LEFT COLUMN: TARGET SCENE RECONSTRUCTION VIEWER / LIVE TELEMETRY HUD */}
            <section style={{ height: '100%', overflow: 'hidden' }}>
              <SceneViewer
                prompt={prompt}
                images={images}
                submissionSuccess={submissionSuccess}
                existingSubmission={existingSubmission}
                isSubmitting={isSubmitting}
                isTimeUp={isTimeUp}
              />
            </section>

            {/* RIGHT COLUMN: PROMPT INPUT, ASSET UPLOAD, SUBMIT & 15-MIN TIMER */}
            <section
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                height: '100%',
                overflowY: 'auto',
                boxSizing: 'border-box',
                paddingRight: '4px'
              }}
            >
              {/* 15-MIN COUNTDOWN TIMER */}
              <CountdownTimer
                participantId={userId || 'player'}
                onTimeUp={handleTimeUp}
              />

              {/* STAGE DESCRIPTION & HELPER BUTTONS */}
              <AiPlatformButtons disabled={isSubmitting || submissionSuccess || isTimeUp} />

              {/* PROMPT INPUT TERMINAL */}
              <PromptInput
                value={prompt}
                prompt={prompt}
                onChange={setPrompt}
                onChangePrompt={setPrompt}
                disabled={isSubmitting || submissionSuccess || isTimeUp}
              />

              {/* IMAGE ASSET UPLOADER */}
              <ImageUploader
                images={images}
                onAddImages={handleAddImages}
                onRemoveImage={handleRemoveImage}
                disabled={isSubmitting || submissionSuccess || isTimeUp}
              />

              {/* SUBMISSION ACTION BAR */}
              <SubmissionControls
                isSubmitting={isSubmitting}
                submissionSuccess={submissionSuccess}
                validationError={validationError}
                onSubmit={handleSubmit}
                isTimeUp={isTimeUp}
              />
            </section>
          </main>
        )}
      </motion.div>
    </div>
  );
}
