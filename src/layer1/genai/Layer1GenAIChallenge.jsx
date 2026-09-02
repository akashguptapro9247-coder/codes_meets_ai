import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ChallengeHeader from './ChallengeHeader';
import SceneViewer from './SceneViewer';
import PromptInput from './PromptInput';
import AiPlatformButtons from './AiPlatformButtons';
import ImageUploader from './ImageUploader';
import CountdownTimer from './CountdownTimer';
import SubmissionControls from './SubmissionControls';
import DigitalParticles from '../../shared/components/DigitalParticles';
import ScanOverlay from '../../shared/components/ScanOverlay';
import { supabase } from '../../shared/services/supabaseClient';
import { adminService } from '../../admin/services/adminService';
import { eventStateService } from '../../shared/services/eventStateService';
import { soundEngine } from '../../shared/utils/SoundEngine';

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
          setSubmissionSuccess(true);
        } else {
          // If Admin deleted submission or no submission exists
          setExistingSubmission(null);
          setSubmissionSuccess(false);
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
    setImages((prev) => (newImages && newImages.length > 0 ? [newImages[0]] : []));
    if (validationError) setValidationError(null);
  };

  // Remove individual image
  const handleRemoveImage = (id) => {
    setImages((prev) => prev.filter((img, idx) => (img.id ? img.id !== id : idx !== id)));
  };

  // Time expired callback
  const handleTimeUp = () => {
    setIsTimeUp(true);
    soundEngine.playClick();
  };

  // Real Submission Handler: ImageKit upload + Supabase insertion
  const handleSubmit = async () => {
    if (isTimeUp) {
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

        // Short success delay, then automatically navigate back to the Event Arena (/play)
        setTimeout(() => {
          if (onBack) onBack();
        }, 1500);
      }
    } catch (err) {
      console.error('Submission exception:', err);
      setValidationError('A network error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
          border: '1px solid rgba(0, 243, 255, 0.35)',
          boxShadow: '0 25px 75px rgba(0, 0, 0, 0.95), 0 0 45px rgba(0, 243, 255, 0.2), inset 0 0 25px rgba(0, 243, 255, 0.06)',
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
        <div className="hud-corner hud-top-left" style={{ width: '16px', height: '16px', zIndex: 25 }} />
        <div className="hud-corner hud-top-right" style={{ width: '16px', height: '16px', zIndex: 25 }} />
        <div className="hud-corner hud-bottom-left" style={{ width: '16px', height: '16px', zIndex: 25 }} />
        <div className="hud-corner hud-bottom-right" style={{ width: '16px', height: '16px', zIndex: 25 }} />

        {/* 1. TOP CHALLENGE HEADER */}
        <ChallengeHeader participant={participant} onBack={onBack} />

        {/* 2. MAIN 2-COLUMN CHALLENGE ARENA WORKSPACE */}
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
          {/* LEFT COLUMN: TARGET SCENE RECONSTRUCTION VIEWER */}
          <section style={{ height: '100%', overflow: 'hidden' }}>
            <SceneViewer imageUrl={challengeImage} />
          </section>

          {/* RIGHT COLUMN: PROMPT INPUT, ASSET UPLOAD, SUBMIT & 15-MIN TIMER */}
          <section
            style={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '12px',
              overflow: 'hidden',
              boxSizing: 'border-box'
            }}
          >
            {/* Top Workspace Area: Large Prompt Textarea */}
            <div style={{ flex: '1 1 auto', display: 'flex', flexDirection: 'column' }}>
              <PromptInput
                value={prompt}
                onChange={(val) => {
                  setPrompt(val);
                  if (validationError) setValidationError(null);
                }}
                disabled={Boolean(existingSubmission || submissionSuccess || isTimeUp)}
                maxLength={2000}
              />
            </div>

            {/* Quick AI Experimentation Buttons (ChatGPT & Gemini) */}
            <div style={{ flexShrink: 0 }}>
              <AiPlatformButtons />
            </div>

            {/* Middle Workspace Area: Reference Image Uploader */}
            <div style={{ flexShrink: 0 }}>
              <ImageUploader
                images={images}
                onAddImages={handleAddImages}
                onRemoveImage={handleRemoveImage}
                disabled={Boolean(existingSubmission || submissionSuccess || isTimeUp)}
                maxImages={1}
              />
            </div>

            {/* Bottom Action & Timer Control Bar */}
            <div
              style={{
                flexShrink: 0,
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                gap: '14px',
                alignItems: 'center',
                paddingTop: '6px',
                borderTop: '1px solid rgba(0, 243, 255, 0.15)'
              }}
            >
              {/* Submit & Validation Controls */}
              <SubmissionControls
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                submissionSuccess={Boolean(existingSubmission || submissionSuccess)}
                disabled={isTimeUp}
                validationError={validationError}
              />

              {/* 15-Minute Countdown Timer (Bottom Right) */}
              <CountdownTimer
                participantId={userId || 'player'}
                onTimeUp={handleTimeUp}
              />
            </div>
          </section>
        </main>
      </motion.div>
    </div>
  );
}
