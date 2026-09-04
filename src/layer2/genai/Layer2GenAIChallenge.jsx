import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, FileText, CheckCircle, AlertTriangle, FileBox, X, UploadCloud, Terminal, Layers } from 'lucide-react';
import { toast } from '../../shared/components/Toast';
import { ConfirmModal } from '../../shared/components/Modals';
import { soundEngine } from '../../shared/utils/SoundEngine';
import ThreeBackground from '../../shared/components/ThreeBackground';
import GenAITimer from './components/GenAITimer';
import { genaiService } from './services/genaiService';

export default function Layer2GenAIChallenge({ participant, assignment, onSubmissionComplete }) {
  const [explanation, setExplanation] = useState(assignment.explanation || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [isExpired, setIsExpired] = useState(false);
  const [loadedFile, setLoadedFile] = useState(null);
  const [submitConfirmOpen, setSubmitConfirmOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isTextareaFocused, setIsTextareaFocused] = useState(false);

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
  
  const question = genaiService.getQuestionById(assignment.question_id);
  const isSubmitted = assignment.submitted;

  const handleSubmit = async () => {
    if (!explanation || explanation.trim().length < 50) {
      soundEngine.playClick();
      setError('Please provide a meaningful explanation (minimum 50 characters).');
      return;
    }
    
    if (explanation.length > 5000) {
      soundEngine.playClick();
      setError('Explanation is too long (maximum 5000 characters).');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    soundEngine.playBoot();
    
    const { data, error: submitErr } = await genaiService.submitProject(participant.userId || participant.user_id, explanation);
    
    setIsSubmitting(false);
    
    if (submitErr) {
      setError(submitErr.message || 'Failed to submit project. Please try again.');
    } else {
      onSubmissionComplete(data);
    }
  };

  if (!question) {
    return <div style={{ color: 'red', padding: '20px' }}>Error: Assigned question not found.</div>;
  }

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        backgroundColor: '#030712',
        overflowX: 'hidden'
      }}
    >
      {/* 3D Ambient Background */}
      <ThreeBackground mousePosition={mousePosition} />

      {/* Subtle Scanline Overlay */}
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

      {/* Main Content Workspace */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          maxWidth: '1040px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          padding: '24px 20px',
          paddingBottom: '80px',
          boxSizing: 'border-box'
        }}
      >
        {/* 1. Header with Active Mission Badge & Live Timer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--cyan-glow)',
                  fontSize: '0.8rem',
                  letterSpacing: '0.12em',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Layers size={14} /> YOUR ASSIGNED PROJECT
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.65rem',
                  color: 'var(--lime-accent)',
                  background: 'rgba(57, 255, 20, 0.1)',
                  border: '1px solid rgba(57, 255, 20, 0.3)',
                  padding: '2px 8px',
                  borderRadius: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--lime-accent)', display: 'inline-block', boxShadow: '0 0 6px var(--lime-accent)' }} />
                MISSION ACTIVE
              </span>
            </div>

            <h2 style={{ fontFamily: 'var(--font-title)', fontSize: '1.85rem', margin: 0, color: '#ffffff', letterSpacing: '0.04em' }}>
              {question.title}
            </h2>
          </div>
          
          {!isSubmitted && (
            <GenAITimer 
              assignedAt={assignment.assigned_at} 
              onExpire={() => setIsExpired(true)} 
            />
          )}
        </div>
        
        {/* 2. Submitted Banner */}
        {isSubmitted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="cyber-card"
            style={{
              padding: '18px 22px',
              background: 'rgba(16, 185, 129, 0.1)',
              borderColor: '#10b981',
              boxShadow: '0 0 30px rgba(16, 185, 129, 0.2)',
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}
          >
            <CheckCircle size={32} color="#10b981" />
            <div>
              <h3 style={{ margin: '0 0 4px 0', color: '#10b981', fontFamily: 'var(--font-title)', fontSize: '1.1rem' }}>PROJECT SUBMITTED SUCCESSFULLY</h3>
              <div style={{ color: '#d1d5db', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                Your project has been submitted for evaluation. You can close this window.
              </div>
            </div>
          </motion.div>
        )}
        
        {/* 3. Expired Banner */}
        {isExpired && !isSubmitted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="cyber-card"
            style={{
              padding: '18px 22px',
              background: 'rgba(239, 68, 68, 0.1)',
              borderColor: '#ef4444',
              boxShadow: '0 0 30px rgba(239, 68, 68, 0.2)',
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}
          >
            <AlertTriangle size={32} color="#ef4444" />
            <div>
              <h3 style={{ margin: '0 0 4px 0', color: '#ef4444', fontFamily: 'var(--font-title)', fontSize: '1.1rem' }}>TIME EXPIRED</h3>
              <div style={{ color: '#d1d5db', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                The 30-minute time limit has been reached. You can no longer submit your project.
              </div>
            </div>
          </motion.div>
        )}

        {/* 4. Problem Statement Card */}
        <motion.div
          whileHover={{ borderColor: 'rgba(224, 38, 255, 0.45)' }}
          className="cyber-card"
          style={{
            position: 'relative',
            padding: '24px 28px',
            background: 'rgba(3, 7, 20, 0.9)',
            borderColor: 'rgba(224, 38, 255, 0.25)',
            boxShadow: '0 0 30px rgba(224, 38, 255, 0.1)',
            overflow: 'hidden'
          }}
        >
          {/* Subtle Top Glowing Line */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, var(--magenta-glow), transparent)' }} />

          <h3 style={{ color: 'var(--magenta-glow)', fontFamily: 'var(--font-title)', marginTop: 0, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem', letterSpacing: '0.08em' }}>
            <FileText size={20} /> PROBLEM STATEMENT
          </h3>
          
          <div style={{ color: '#e5e7eb', lineHeight: '1.7', fontSize: '0.98rem', whiteSpace: 'pre-wrap', fontFamily: 'var(--font-sans)' }}>
            {question.problem_statement}
          </div>
        </motion.div>
        
        {/* 5. Explanation Input Card */}
        <motion.div
          className="cyber-card"
          style={{
            position: 'relative',
            padding: '24px 28px',
            background: 'rgba(3, 7, 20, 0.9)',
            borderColor: isTextareaFocused ? 'var(--lime-accent)' : 'rgba(57, 255, 20, 0.25)',
            boxShadow: isTextareaFocused ? '0 0 30px rgba(57, 255, 20, 0.2)' : '0 0 20px rgba(57, 255, 20, 0.05)',
            transition: 'border-color 0.3s, box-shadow 0.3s',
            overflow: 'hidden'
          }}
        >
          {/* Top Line */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, var(--lime-accent), transparent)' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h3 style={{ color: 'var(--lime-accent)', fontFamily: 'var(--font-title)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', letterSpacing: '0.08em' }}>
              <Terminal size={18} /> EXPLAIN WHAT YOU DID
            </h3>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: '#9ca3af' }}>
              STEP 11 // EVALUATION SUMMARY
            </span>
          </div>

          <p style={{ color: '#9ca3af', marginBottom: '16px', fontSize: '0.88rem', fontFamily: 'var(--font-body)', lineHeight: 1.5 }}>
            Explain in your own words what you built, how it works, what you implemented, and how you used AI during development.
          </p>
          
          <textarea
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            onFocus={() => setIsTextareaFocused(true)}
            onBlur={() => setIsTextareaFocused(false)}
            disabled={isSubmitted || isExpired || isSubmitting}
            placeholder="I built..."
            style={{
              width: '100%',
              minHeight: '220px',
              background: 'rgba(2, 6, 18, 0.95)',
              border: isTextareaFocused ? '1px solid var(--lime-accent)' : '1px solid rgba(0, 243, 255, 0.2)',
              borderRadius: '4px',
              padding: '16px',
              color: '#ffffff',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.92rem',
              lineHeight: '1.6',
              resize: 'vertical',
              boxSizing: 'border-box',
              outline: 'none',
              transition: 'border-color 0.3s, box-shadow 0.3s'
            }}
          />
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
            <div style={{ color: explanation.length < 50 ? '#ef4444' : 'var(--lime-accent)', fontSize: '0.78rem', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>{explanation.length} / 5000 chars (Min: 50)</span>
              {explanation.length >= 50 && <span style={{ color: 'var(--lime-accent)' }}>✓ READY</span>}
            </div>
            {explanation.length < 50 && (
              <span style={{ color: '#ef4444', fontSize: '0.72rem', fontFamily: 'var(--font-mono)' }}>
                {50 - explanation.length} more characters needed
              </span>
            )}
          </div>
        </motion.div>

        {/* 6. Validation Error Box */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              color: '#ef4444',
              padding: '12px 16px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid #ef4444',
              borderRadius: '4px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <AlertTriangle size={16} />
            <span>{error}</span>
          </motion.div>
        )}

        {/* 7. Interactive File Upload Area */}
        {!isSubmitted && (
          <motion.div
            className="cyber-card"
            style={{
              position: 'relative',
              padding: '24px 28px',
              background: 'rgba(3, 7, 20, 0.9)',
              borderColor: isDragging ? 'var(--cyan-glow)' : 'rgba(245, 158, 11, 0.25)',
              boxShadow: isDragging ? '0 0 35px rgba(0, 243, 255, 0.3)' : '0 0 20px rgba(245, 158, 11, 0.05)',
              transition: 'border-color 0.3s, box-shadow 0.3s',
              overflow: 'hidden'
            }}
          >
            {/* Top Accent Line */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, #f59e0b, transparent)' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h3 style={{ color: '#f59e0b', fontFamily: 'var(--font-title)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', letterSpacing: '0.08em' }}>
                <UploadCloud size={18} /> UPLOAD PROJECT FILES
              </h3>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: '#9ca3af' }}>
                STEP 12 // ZIP ARCHIVE
              </span>
            </div>

            <p style={{ color: '#9ca3af', marginBottom: '18px', fontSize: '0.88rem', fontFamily: 'var(--font-body)' }}>
              Please zip your project folder and upload it here. Ensure your `node_modules` or similar heavy folders are excluded.
            </p>
            
            {loadedFile ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                  border: '2px solid rgba(16, 185, 129, 0.4)',
                  borderRadius: '6px',
                  padding: '20px 24px',
                  background: 'rgba(16, 185, 129, 0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                  flexWrap: 'wrap'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ color: '#10b981' }}><FileBox size={32} /></div>
                  <div>
                    <div style={{ color: '#10b981', fontWeight: 'bold', fontSize: '0.78rem', marginBottom: '3px', display: 'flex', alignItems: 'center', gap: '5px', fontFamily: 'var(--font-mono)' }}>
                      <CheckCircle size={14} /> FILE LOADED & READY
                    </div>
                    <div style={{ color: '#fff', fontSize: '1.05rem', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{loadedFile.name}</div>
                    <div style={{ color: '#9ca3af', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>{(loadedFile.size / 1024 / 1024).toFixed(2)} MB</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button 
                    disabled={isExpired || isSubmitting}
                    onClick={() => {
                      soundEngine.playClick();
                      setLoadedFile(null);
                      toast.info('File removed');
                    }}
                    onMouseEnter={() => soundEngine.playHover()}
                    style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#ef4444', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontFamily: 'var(--font-mono)' }}
                  >
                    <X size={14} /> REMOVE
                  </button>
                  <label 
                    htmlFor="project-upload" 
                    onMouseEnter={() => soundEngine.playHover()}
                    style={{ background: 'rgba(0, 243, 255, 0.1)', border: '1px solid var(--cyan-glow)', color: 'var(--cyan-glow)', padding: '8px 16px', borderRadius: '4px', cursor: isExpired || isSubmitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontFamily: 'var(--font-mono)' }}
                  >
                    <UploadCloud size={14} /> REPLACE
                  </label>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                whileHover={{ scale: 1.01, borderColor: 'var(--cyan-glow)' }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  if (isExpired || isSubmitting) return;
                  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    const file = e.dataTransfer.files[0];
                    if (file.size > 50 * 1024 * 1024) {
                      soundEngine.playClick();
                      toast.error('File exceeds 50MB limit.');
                      return;
                    }
                    soundEngine.playClick();
                    setLoadedFile(file);
                    toast.success('File loaded successfully');
                  }
                }}
                style={{
                  border: isDragging ? '2px dashed var(--cyan-glow)' : '2px dashed rgba(0, 243, 255, 0.3)',
                  borderRadius: '6px',
                  padding: '36px 20px',
                  textAlign: 'center',
                  background: isDragging ? 'rgba(0, 243, 255, 0.08)' : 'rgba(2, 6, 20, 0.6)',
                  cursor: isExpired || isSubmitting ? 'not-allowed' : 'pointer',
                  transition: 'background 0.2s, border-color 0.2s'
                }}
              >
                <label htmlFor="project-upload" style={{ cursor: isExpired || isSubmitting ? 'not-allowed' : 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', width: '100%', height: '100%' }}>
                  <motion.div
                    animate={isDragging ? { y: [-4, 4, -4] } : {}}
                    transition={{ repeat: Infinity, duration: 1.2 }}
                    style={{ color: isDragging ? 'var(--lime-accent)' : 'var(--cyan-glow)' }}
                  >
                    <UploadCloud size={44} />
                  </motion.div>
                  <div style={{ color: '#d1d5db', fontFamily: 'var(--font-mono)', fontSize: '0.88rem' }}>
                    {isDragging ? 'Drop your .zip file here now' : 'Drag and drop your .zip file here, or click to browse'}
                  </div>
                  <div style={{ color: '#9ca3af', fontFamily: 'var(--font-mono)', fontSize: '0.72rem' }}>
                    Supported: .zip, .rar, .7z (Max: 50MB)
                  </div>
                </label>
              </motion.div>
            )}
            
            <input 
              type="file" 
              accept=".zip,.rar,.7z"
              disabled={isExpired || isSubmitting}
              style={{ display: 'none' }} 
              id="project-upload"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  const file = e.target.files[0];
                  if (file.size > 50 * 1024 * 1024) {
                    soundEngine.playClick();
                    toast.error('File exceeds 50MB limit.');
                    e.target.value = '';
                    return;
                  }
                  soundEngine.playClick();
                  setLoadedFile(file);
                  toast.success('File loaded successfully');
                }
              }}
            />
          </motion.div>
        )}
        
        {/* 8. Final Submit Action Button */}
        {!isSubmitted && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
            <motion.button
              whileHover={!isExpired && !isSubmitting ? { scale: 1.04, boxShadow: '0 0 25px rgba(57, 255, 20, 0.45)' } : {}}
              whileTap={!isExpired && !isSubmitting ? { scale: 0.96 } : {}}
              className="cyber-btn"
              onClick={() => {
                soundEngine.playClick();
                setSubmitConfirmOpen(true);
              }}
              onMouseEnter={() => {
                if (!isExpired && !isSubmitting) soundEngine.playHover();
              }}
              disabled={isExpired || isSubmitting}
              style={{ 
                padding: '14px 48px', 
                fontSize: '1.1rem', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px',
                borderColor: isExpired ? '#4b5563' : 'var(--lime-accent)',
                color: isExpired ? '#9ca3af' : '#fff',
                opacity: isExpired || isSubmitting ? 0.5 : 1,
                cursor: isExpired || isSubmitting ? 'not-allowed' : 'pointer'
              }}
            >
              <Send size={20} />
              <span>{isSubmitting ? 'SUBMITTING PROJECT...' : 'SUBMIT PROJECT'}</span>
            </motion.button>
          </div>
        )}
      
        <ConfirmModal
          isOpen={submitConfirmOpen}
          title="SUBMIT PROJECT?"
          message="Make sure your project is ready and your explanation is complete. You cannot edit this after submission."
          onConfirm={() => {
            setSubmitConfirmOpen(false);
            handleSubmit();
          }}
          onCancel={() => setSubmitConfirmOpen(false)}
        />
      </motion.div>
    </div>
  );
}
