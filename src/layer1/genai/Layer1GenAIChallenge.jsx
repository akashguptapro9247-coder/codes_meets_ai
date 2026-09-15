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
import DigitalParticles from '../../shared/components/DigitalParticles';
import ScanOverlay from '../../shared/components/ScanOverlay';
import { supabase } from '../../shared/services/supabaseClient';
import { adminService } from '../../admin/services/adminService';
import { imagekitClient } from '../../shared/services/imagekitClient';
import { eventStateService } from '../../shared/services/eventStateService';
import { soundEngine } from '../../shared/utils/SoundEngine';

export default function Layer1GenAIChallenge({
  participant,
  onBack,
  challengeImage = '/assets/layer1_genai.jpeg',
  challengeTitle = 'LAYER 01 // GENAI TRACK'
}) {
  // Helper to reliably extract the active user ID from props or storage
  const getActiveUserId = () => {
    if (participant?.userId) return participant.userId;
    if (participant?.user_id) return participant.user_id;
    if (participant?.id) return participant.id;

    if (typeof window !== 'undefined') {
      try {
        const storedSession =
          sessionStorage.getItem('cma_participant_session') ||
          localStorage.getItem('cma_participant_session');
        if (storedSession) {
          const parsed = JSON.parse(storedSession);
          return parsed.userId || parsed.user_id || parsed.id || null;
        }
      } catch (e) {}
    }
    return null;
  };

  // Helper to extract participant display name and roll number reliably
  const getActiveParticipantInfo = () => {
    let name = participant?.name;
    let rollNumber = participant?.rollNumber || participant?.roll_number;

    if ((!name || !rollNumber) && typeof window !== 'undefined') {
      try {
        const storedSession =
          sessionStorage.getItem('cma_participant_session') ||
          localStorage.getItem('cma_participant_session');
        if (storedSession) {
          const parsed = JSON.parse(storedSession);
          if (!name) name = parsed.name;
          if (!rollNumber) rollNumber = parsed.rollNumber || parsed.roll_number;
        }
      } catch (e) {}
    }

    return {
      name: name || 'PARTICIPANT',
      rollNumber: rollNumber || 'N/A'
    };
  };

  const userId = getActiveUserId();

  // Synchronous local storage lock check for instant protection against flashes
  const initialLock = (() => {
    if (!userId || typeof window === 'undefined') return { isExpired: false, isSubmitted: false };
    try {
      const isExpired =
        localStorage.getItem(`cma_l1_genai_expired_${userId}`) === 'true' ||
        localStorage.getItem(`cma_l1_genai_timer_expired_${userId}`) === 'true';
      const isSubmitted = localStorage.getItem(`cma_l1_genai_submitted_${userId}`) === 'true';
      return { isExpired, isSubmitted };
    } catch (e) {
      return { isExpired: false, isSubmitted: false };
    }
  })();

  const isPreLocked = Boolean(initialLock.isExpired || initialLock.isSubmitted);

  // Synchronously restore unsubmitted draft prompt and image from storage on initial mount
  const [prompt, setPrompt] = useState(() => {
    if (!userId || typeof window === 'undefined') return '';
    try {
      const isSub = localStorage.getItem(`cma_l1_genai_submitted_${userId}`) === 'true';
      const isExp = localStorage.getItem(`cma_l1_genai_expired_${userId}`) === 'true';
      if (!isSub && !isExp) {
        const saved = localStorage.getItem(`cma_l1_genai_draft_prompt_${userId}`);
        if (saved && typeof saved === 'string') return saved;
      }
    } catch (e) {}
    return '';
  });

  const [images, setImages] = useState(() => {
    if (!userId || typeof window === 'undefined') return [];
    try {
      const isSub = localStorage.getItem(`cma_l1_genai_submitted_${userId}`) === 'true';
      const isExp = localStorage.getItem(`cma_l1_genai_expired_${userId}`) === 'true';
      if (!isSub && !isExp) {
        const savedImg = localStorage.getItem(`cma_l1_genai_draft_image_${userId}`);
        if (savedImg) {
          const parsed = JSON.parse(savedImg);
          if (parsed && (parsed.url || parsed.previewUrl)) {
            return [parsed];
          }
        }
      }
    } catch (e) {}
    return [];
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPreUploading, setIsPreUploading] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(initialLock.isSubmitted);
  const [validationError, setValidationError] = useState(null);
  const [isTimeUp, setIsTimeUp] = useState(initialLock.isExpired);
  const [existingSubmission, setExistingSubmission] = useState(null);
  // Authoritative check: always verify DB state on mount so admin delete is honored immediately
  const [isLoadingSubmission, setIsLoadingSubmission] = useState(true);
  const [timerResetKey, setTimerResetKey] = useState(0);

  const isFinalizingTimeoutRef = useRef(false);
  const activePreUploadPromiseRef = useRef(null);
  const latestUploadedImageRef = useRef(images[0]?.url ? images[0] : null);
  const hasUserEditedRef = useRef(false);
  const isPromptInitializedRef = useRef(false);

  // Persistence keys scoped per participant ID
  const activeUserIdForDraft = userId || getActiveUserId();
  const draftPromptKey = activeUserIdForDraft ? `cma_l1_genai_draft_prompt_${activeUserIdForDraft}` : null;
  const draftImageKey = activeUserIdForDraft ? `cma_l1_genai_draft_image_${activeUserIdForDraft}` : null;

  const clearAllDrafts = (targetId) => {
    const id = targetId || activeUserIdForDraft;
    if (!id) return;
    try {
      localStorage.removeItem(`cma_l1_genai_draft_prompt_${id}`);
      localStorage.removeItem(`cma_l1_genai_draft_image_${id}`);
    } catch (e) {}
  };

  // Track initialization after first mount so initial empty render doesn't overwrite saved draft
  useEffect(() => {
    isPromptInitializedRef.current = true;
  }, []);

  // Persist prompt draft on change (only while challenge is active and not submitted)
  useEffect(() => {
    if (!draftPromptKey || submissionSuccess || isTimeUp || existingSubmission) return;
    // Prevent wiping saved draft with empty string on initial mount
    if (!isPromptInitializedRef.current && prompt === '') return;
    try {
      localStorage.setItem(draftPromptKey, prompt);
    } catch (e) {}
  }, [prompt, draftPromptKey, submissionSuccess, isTimeUp, existingSubmission]);

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
    const activeId = getActiveUserId();
    if (!activeId) {
      setIsLoadingSubmission(false);
      return;
    }

    let isMounted = true;

    const loadSubmission = async () => {
      try {
        const { data } = await adminService.fetchLayer1SubmissionForUser(activeId);
        if (!isMounted) return;

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

          if (data.status === 'TIME_EXPIRED' || data.time_taken === '15:00' || data.time_taken === '00:30') {
            setIsTimeUp(true);
            setSubmissionSuccess(false);
            try {
              localStorage.setItem(`cma_l1_genai_expired_${activeId}`, 'true');
              localStorage.setItem(`cma_l1_genai_timer_expired_${activeId}`, 'true');
            } catch (e) {}
          } else {
            setSubmissionSuccess(true);
            setIsTimeUp(false);
            try {
              localStorage.setItem(`cma_l1_genai_submitted_${activeId}`, 'true');
            } catch (e) {}
          }
        } else {
          // DATABASE HAS NO ACTIVE SUBMISSION (Authoritative source of truth)
          const hadLocalSubmitted = localStorage.getItem(`cma_l1_genai_submitted_${activeId}`) === 'true';
          const hadLocalExpired =
            localStorage.getItem(`cma_l1_genai_expired_${activeId}`) === 'true' ||
            localStorage.getItem(`cma_l1_genai_timer_expired_${activeId}`) === 'true';

          if (hadLocalSubmitted || hadLocalExpired) {
            // Admin deleted previous submission/attempt — reset all stale state completely
            try {
              localStorage.removeItem(`cma_l1_genai_submitted_${activeId}`);
              sessionStorage.removeItem(`cma_l1_genai_submitted_${activeId}`);
              localStorage.removeItem(`cma_l1_genai_expired_${activeId}`);
              sessionStorage.removeItem(`cma_l1_genai_expired_${activeId}`);
              localStorage.removeItem(`cma_l1_genai_timer_expired_${activeId}`);
              sessionStorage.removeItem(`cma_l1_genai_timer_expired_${activeId}`);
              localStorage.removeItem(`cma_l1_genai_timer_start_${activeId}`);
              sessionStorage.removeItem(`cma_l1_genai_timer_start_${activeId}`);
              localStorage.removeItem(`cma_l1_genai_draft_prompt_${activeId}`);
              localStorage.removeItem(`cma_l1_genai_draft_image_${activeId}`);
            } catch (e) {}

            setExistingSubmission(null);
            setSubmissionSuccess(false);
            setIsTimeUp(false);
            setPrompt('');
            setImages([]);
            latestUploadedImageRef.current = null;
            activePreUploadPromiseRef.current = null;
            setTimerResetKey((prev) => prev + 1);
          } else {
            // In-progress unsubmitted attempt — restore drafts if not already in state
            setExistingSubmission(null);
            setSubmissionSuccess(false);
            setIsTimeUp(false);

            if (!hasUserEditedRef.current) {
              try {
                const savedPrompt = localStorage.getItem(`cma_l1_genai_draft_prompt_${activeId}`);
                if (savedPrompt && typeof savedPrompt === 'string') {
                  setPrompt((prev) => (prev.trim().length === 0 ? savedPrompt : prev));
                }
              } catch (e) {}
            }

            try {
              const savedImageRaw = localStorage.getItem(`cma_l1_genai_draft_image_${activeId}`);
              if (savedImageRaw) {
                const parsedImg = JSON.parse(savedImageRaw);
                if (parsedImg && (parsedImg.url || parsedImg.previewUrl)) {
                  setImages((prev) => (prev.length === 0 ? [parsedImg] : prev));
                  if (parsedImg.url) {
                    latestUploadedImageRef.current = parsedImg;
                  }
                }
              }
            } catch (e) {}

            // Check if timer in storage reached timeout
            const timerKey = `cma_l1_genai_timer_start_${activeId}`;
            const storedStart = localStorage.getItem(timerKey);
            if (storedStart) {
              const elapsed = Math.floor((Date.now() - parseInt(storedStart, 10)) / 1000);
              if (elapsed >= 900) {
                handleTimeUp();
              }
            }
          }
        }
      } catch (err) {
        console.error('[Layer1GenAI] loadSubmission error:', err);
      } finally {
        if (isMounted) {
          setIsLoadingSubmission(false);
        }
      }
    };

    loadSubmission();

    // Subscribe to Realtime submission changes (detect Admin delete or updates)
    const channelName = `genai_sub_user_${activeId}_${Date.now()}`;
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
          if (!isMounted) return;
          if (payload.eventType === 'DELETE') {
            const currentTimerKey = `cma_l1_genai_timer_start_${activeId || 'player'}`;
            try {
              localStorage.removeItem(currentTimerKey);
              sessionStorage.removeItem(currentTimerKey);
              localStorage.removeItem(`cma_l1_genai_submitted_${activeId}`);
              localStorage.removeItem(`cma_l1_genai_expired_${activeId}`);
              localStorage.removeItem(`cma_l1_genai_timer_expired_${activeId}`);
              localStorage.removeItem(`cma_l1_genai_draft_prompt_${activeId}`);
              localStorage.removeItem(`cma_l1_genai_draft_image_${activeId}`);
            } catch (e) {}
            setExistingSubmission(null);
            setSubmissionSuccess(false);
            setIsTimeUp(false);
            setPrompt('');
            setImages([]);
            setTimerResetKey((prev) => prev + 1);
            loadSubmission();
          } else if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            if (payload.new && payload.new.user_id === activeId) {
              loadSubmission();
            }
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      if (channel && supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, [userId]);

  const handlePromptChange = (newVal) => {
    hasUserEditedRef.current = true;
    setPrompt(newVal);
  };

  // Add selected image file to local state (enforce single image) & pre-upload for refresh persistence
  const handleAddImages = async (newImages) => {
    if (isTimeUp || isCompleted) return;
    if (!newImages || newImages.length === 0) return;

    const chosen = newImages[0];
    setImages([chosen]);
    if (validationError) setValidationError(null);

    const activeId = userId || getActiveUserId();

    // If item already has a remote url (e.g. restored from draft), save to storage immediately
    if (chosen.url) {
      latestUploadedImageRef.current = chosen;
      try {
        localStorage.setItem(`cma_l1_genai_draft_image_${activeId}`, JSON.stringify(chosen));
      } catch (e) {}
      return;
    }

    latestUploadedImageRef.current = null;

    // Save initial metadata and preview to localStorage immediately
    try {
      localStorage.setItem(`cma_l1_genai_draft_image_${activeId}`, JSON.stringify({
        id: chosen.id,
        name: chosen.name,
        size: chosen.size,
        previewUrl: chosen.previewUrl
      }));
    } catch (e) {}

    // If it has a local File object, pre-upload in background so it survives browser reload
    if (chosen.file && activeId) {
      setIsPreUploading(true);
      const uploadPromise = imagekitClient.uploadImage(chosen.file, activeId);
      activePreUploadPromiseRef.current = uploadPromise;

      uploadPromise
        .then((uploaded) => {
          if (uploaded?.url) {
            const persistedItem = {
              id: chosen.id,
              name: chosen.name || uploaded.name,
              size: chosen.size,
              url: uploaded.url,
              fileId: uploaded.fileId || '',
              filePath: uploaded.filePath || '',
              previewUrl: uploaded.url
            };

            latestUploadedImageRef.current = persistedItem;
            setImages([persistedItem]);
            try {
              localStorage.setItem(`cma_l1_genai_draft_image_${activeId}`, JSON.stringify(persistedItem));
            } catch (e) {}
          }
        })
        .catch((uploadErr) => {
          console.warn('[Layer1GenAI] Background pre-upload warning:', uploadErr);
          // Even if pre-upload fails, chosen image remains in React state for standard upload on submit
        })
        .finally(() => {
          setIsPreUploading(false);
          activePreUploadPromiseRef.current = null;
        });
    }
  };

  // Remove individual image and clear persisted draft
  const handleRemoveImage = (id) => {
    if (isTimeUp || isCompleted) return;
    activePreUploadPromiseRef.current = null;
    latestUploadedImageRef.current = null;
    setIsPreUploading(false);
    setImages((prev) => prev.filter((img, idx) => (img.id ? img.id !== id : idx !== id)));
    const activeId = userId || getActiveUserId();
    if (activeId) {
      try {
        localStorage.removeItem(`cma_l1_genai_draft_image_${activeId}`);
      } catch (e) {}
    }
  };

  // Time expired callback: auto-finalize attempt to DB (idempotent, single execution)
  const handleTimeUp = async () => {
    setIsTimeUp(true);
    soundEngine.playClick();

    const activeId = userId || getActiveUserId();

    if (activeId) {
      const expiredKey = `cma_l1_genai_timer_expired_${activeId}`;
      const generalExpiredKey = `cma_l1_genai_expired_${activeId}`;
      const timerKey = `cma_l1_genai_timer_start_${activeId}`;
      try {
        localStorage.setItem(expiredKey, 'true');
        localStorage.setItem(generalExpiredKey, 'true');
        localStorage.removeItem(timerKey);
        sessionStorage.removeItem(timerKey);
        localStorage.removeItem(`cma_l1_genai_draft_prompt_${activeId}`);
        localStorage.removeItem(`cma_l1_genai_draft_image_${activeId}`);
      } catch (e) {}
    }

    // Prevent race-condition / duplicate timeout submission calls
    if (isFinalizingTimeoutRef.current) return;
    isFinalizingTimeoutRef.current = true;

    // If submission is already loaded and recorded in state, do not re-submit
    if (existingSubmission) return;

    const activeInfo = getActiveParticipantInfo();

    try {
      const { data, error } = await adminService.autoFinalizeLayer1GenAiTimeout({
        userId: activeId,
        username: activeInfo.name,
        rollNumber: activeInfo.rollNumber,
        prompt: prompt.trim(),
        imageItems: latestUploadedImageRef.current ? [latestUploadedImageRef.current] : images
      });

      if (data) {
        setExistingSubmission(data);
      } else if (error) {
        console.error('[Layer1GenAI] Auto-finalization error:', error);
      }
    } catch (err) {
      console.error('[Layer1GenAI] Auto-finalization exception:', err);
    }
  };

  // Real Manual Submission Handler: Optimized pipeline with ImageKit deduplication + Supabase insertion
  const handleSubmit = async () => {
    if (isSubmitting) return;

    if (isTimeUp || existingSubmission?.status === 'TIME_EXPIRED' || existingSubmission?.time_taken === '15:00' || submissionSuccess) {
      setValidationError('CHALLENGE HAS BEEN SUBMITTED / COMPLETED // SUBMISSIONS LOCKED');
      return;
    }

    if (!prompt.trim()) {
      soundEngine.playClick();
      setValidationError('Please formulate your prompt before submitting.');
      return;
    }

    if (prompt.trim().length > 5000) {
      soundEngine.playClick();
      setValidationError('Prompt cannot exceed 5,000 characters.');
      return;
    }

    if (!images || images.length === 0) {
      soundEngine.playClick();
      setValidationError('Please upload your generated image before submitting.');
      return;
    }

    setValidationError(null);
    setIsSubmitting(true);

    const activeId = userId || getActiveUserId();
    const activeInfo = getActiveParticipantInfo();

    // If pre-upload is currently in progress or completed, reuse uploaded asset to avoid duplicate uploads
    let imageItemsToSubmit = images;
    if (latestUploadedImageRef.current && (images[0]?.url || images[0]?.id === latestUploadedImageRef.current.id)) {
      imageItemsToSubmit = [latestUploadedImageRef.current];
    } else if (activePreUploadPromiseRef.current) {
      try {
        const uploaded = await activePreUploadPromiseRef.current;
        if (uploaded?.url) {
          const persistedItem = {
            id: images[0]?.id || Date.now(),
            name: images[0]?.name || uploaded.name,
            size: images[0]?.size,
            url: uploaded.url,
            fileId: uploaded.fileId || '',
            filePath: uploaded.filePath || '',
            previewUrl: uploaded.url
          };
          latestUploadedImageRef.current = persistedItem;
          imageItemsToSubmit = [persistedItem];
          setImages(imageItemsToSubmit);
        }
      } catch (e) {
        // Fall back to submission upload in adminService.submitLayer1GenAi
      }
    }

    // Calculate actual time taken using the session timer
    const timerKey = `cma_l1_genai_timer_start_${activeId || userId || 'player'}`;
    const storedStart = localStorage.getItem(timerKey) || sessionStorage.getItem(timerKey);
    const startMs = storedStart ? parseInt(storedStart, 10) : (Date.now() - 30000);
    const submitMs = Date.now();
    const elapsedSeconds = Math.max(1, Math.min(900, Math.floor((submitMs - startMs) / 1000)));
    const mins = Math.floor(elapsedSeconds / 60);
    const secs = elapsedSeconds % 60;
    const timeTakenFormatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    const startedAt = new Date(startMs).toISOString();
    const submittedAt = new Date(submitMs).toISOString();

    try {
      const { data, error } = await adminService.submitLayer1GenAi({
        userId: activeId,
        username: activeInfo.name,
        rollNumber: activeInfo.rollNumber,
        prompt: prompt.trim(),
        imageItems: imageItemsToSubmit,
        timeTaken: timeTakenFormatted,
        timeTakenSeconds: elapsedSeconds,
        startedAt,
        submittedAt
      });

      if (error) {
        setValidationError(error.message || 'Failed to submit response. Please retry.');
        soundEngine.playClick();
      } else {
        setExistingSubmission(data);
        setSubmissionSuccess(true);
        soundEngine.playBoot();

        // Clear local timer, drafts, and record lock on successful submission
        try {
          localStorage.setItem(`cma_l1_genai_submitted_${activeId}`, 'true');
          localStorage.removeItem(timerKey);
          sessionStorage.removeItem(timerKey);
          localStorage.removeItem(`cma_l1_genai_draft_prompt_${activeId}`);
          localStorage.removeItem(`cma_l1_genai_draft_image_${activeId}`);
        } catch (e) {}
      }
    } catch (err) {
      console.error('Submission exception:', err);
      const msg = err?.message || (typeof err === 'string' ? err : 'A network error occurred. Please try again.');
      setValidationError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isTimeoutState = Boolean(
    isTimeUp ||
    existingSubmission?.status === 'TIME_EXPIRED' ||
    existingSubmission?.time_taken === '15:00' ||
    existingSubmission?.time_taken_seconds === 900
  );
  const isManualCompleted = Boolean(
    (submissionSuccess || (existingSubmission && !isTimeoutState)) &&
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
  const info = getActiveParticipantInfo();

  if (isLoadingSubmission) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 80,
          backgroundColor: '#020612',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          userSelect: 'none'
        }}
      >
        <DigitalParticles />
        <ScanOverlay currentStage={1} hideHeader={true} />
        <div
          className="cyber-card"
          style={{
            padding: '32px 48px',
            textAlign: 'center',
            borderColor: 'var(--cyan-glow)',
            boxShadow: '0 0 35px rgba(0, 243, 255, 0.25)',
            background: 'rgba(4, 9, 24, 0.95)'
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-title)',
              fontSize: '1.1rem',
              color: 'var(--cyan-glow)',
              letterSpacing: '0.15em',
              marginBottom: '10px'
            }}
          >
            AUTHENTICATING ATTEMPT STATE...
          </div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.74rem',
              color: '#9ca3af',
              letterSpacing: '0.1em'
            }}
          >
            VERIFYING DATABASE RECORD
          </div>
        </div>
      </div>
    );
  }

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
                      {(existingSubmission?.username || info.name).toUpperCase()}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: '#9ca3af', letterSpacing: '0.1em' }}>
                      ROLL NUMBER
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--cyan-glow)', fontWeight: 700, marginTop: '2px' }}>
                      {existingSubmission?.roll_number || info.rollNumber}
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
                      {(existingSubmission?.username || info.name).toUpperCase()}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: '#9ca3af', letterSpacing: '0.1em' }}>
                      ROLL NUMBER
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--cyan-glow)', fontWeight: 700, marginTop: '2px' }}>
                      {existingSubmission?.roll_number || info.rollNumber}
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
                key={timerResetKey}
                participantId={userId || 'player'}
                onTimeUp={handleTimeUp}
                disabled={isCompleted}
              />

              {/* STAGE DESCRIPTION & HELPER BUTTONS */}
              <AiPlatformButtons disabled={isSubmitting || submissionSuccess || isTimeUp} />

              {/* PROMPT INPUT TERMINAL */}
              <PromptInput
                value={prompt}
                prompt={prompt}
                onChange={handlePromptChange}
                onChangePrompt={handlePromptChange}
                disabled={isSubmitting || submissionSuccess || isTimeUp}
              />

              {/* IMAGE ASSET UPLOADER */}
              <ImageUploader
                images={images}
                onAddImages={handleAddImages}
                onRemoveImage={handleRemoveImage}
                disabled={isSubmitting || submissionSuccess || isTimeUp || isCompleted}
              />

              {/* SUBMISSION ACTION BAR */}
              <SubmissionControls
                isSubmitting={isSubmitting}
                submissionSuccess={submissionSuccess}
                disabled={isTimeUp || isCompleted}
                validationError={validationError}
                onSubmit={handleSubmit}
              />
            </section>
          </main>
        )}
      </motion.div>
    </div>
  );
}
