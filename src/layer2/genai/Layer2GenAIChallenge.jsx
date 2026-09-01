import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, FileText, CheckCircle, AlertTriangle, FileBox, X, UploadCloud } from 'lucide-react';
import { toast } from '../../shared/components/Toast';
import { ConfirmModal } from '../../shared/components/Modals';
import GenAITimer from './components/GenAITimer';
import { genaiService } from './services/genaiService';

export default function Layer2GenAIChallenge({ participant, assignment, onSubmissionComplete }) {
  const [explanation, setExplanation] = useState(assignment.explanation || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [isExpired, setIsExpired] = useState(false);
  const [loadedFile, setLoadedFile] = useState(null);
  const [submitConfirmOpen, setSubmitConfirmOpen] = useState(false);
  
  const question = genaiService.getQuestionById(assignment.question_id);
  const isSubmitted = assignment.submitted;

  const handleSubmit = async () => {
    if (!explanation || explanation.trim().length < 50) {
      setError('Please provide a meaningful explanation (minimum 50 characters).');
      return;
    }
    
    if (explanation.length > 5000) {
      setError('Explanation is too long (maximum 5000 characters).');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    
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
    <div style={{ width: '100%', maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px', padding: '20px', paddingBottom: '80px' }}>
      
      {/* Header with Timer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--cyan-glow)', fontSize: '0.9rem', marginBottom: '4px' }}>
            YOUR ASSIGNED PROJECT
          </div>
          <h2 style={{ fontFamily: 'var(--font-title)', fontSize: '2rem', margin: 0, color: '#fff' }}>
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
      
      {/* Submitted / Expired Status */}
      {isSubmitted && (
        <div className="cyber-card" style={{ padding: '20px', background: 'rgba(16, 185, 129, 0.1)', borderColor: '#10b981', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <CheckCircle size={32} color="#10b981" />
          <div>
            <h3 style={{ margin: '0 0 4px 0', color: '#10b981', fontFamily: 'var(--font-title)' }}>PROJECT SUBMITTED SUCCESSFULLY</h3>
            <div style={{ color: '#d1d5db', fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}>
              Your project has been submitted for evaluation. You can close this window.
            </div>
          </div>
        </div>
      )}
      
      {isExpired && !isSubmitted && (
        <div className="cyber-card" style={{ padding: '20px', background: 'rgba(239, 68, 68, 0.1)', borderColor: '#ef4444', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <AlertTriangle size={32} color="#ef4444" />
          <div>
            <h3 style={{ margin: '0 0 4px 0', color: '#ef4444', fontFamily: 'var(--font-title)' }}>TIME EXPIRED</h3>
            <div style={{ color: '#d1d5db', fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}>
              The 30-minute time limit has been reached. You can no longer submit your project.
            </div>
          </div>
        </div>
      )}

      {/* Problem Statement */}
      <div className="cyber-card" style={{ padding: '30px', background: 'rgba(0,0,0,0.4)' }}>
        <h3 style={{ color: 'var(--magenta-glow)', fontFamily: 'var(--font-title)', marginTop: 0, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FileText size={20} /> PROBLEM STATEMENT
        </h3>
        
        <div style={{ color: '#e5e7eb', lineHeight: '1.7', fontSize: '1.05rem', whiteSpace: 'pre-wrap' }}>
          {question.problem_statement}
        </div>
      </div>
      
      {/* Explanation Area */}
      <div className="cyber-card" style={{ padding: '30px', background: 'rgba(0,0,0,0.4)' }}>
        <h3 style={{ color: 'var(--lime-accent)', fontFamily: 'var(--font-title)', marginTop: 0, marginBottom: '16px' }}>
          EXPLAIN WHAT YOU DID
        </h3>
        <p style={{ color: '#9ca3af', marginBottom: '20px', fontSize: '0.9rem' }}>
          Explain in your own words what you built, how it works, what you implemented, and how you used AI during development.
        </p>
        
        <textarea
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          disabled={isSubmitted || isExpired || isSubmitting}
          placeholder="I built..."
          style={{
            width: '100%',
            minHeight: '250px',
            background: 'rgba(0,0,0,0.6)',
            border: '1px solid var(--cyan-glow)',
            borderRadius: '4px',
            padding: '16px',
            color: '#fff',
            fontFamily: 'var(--font-sans)',
            fontSize: '1rem',
            lineHeight: '1.5',
            resize: 'vertical',
            boxSizing: 'border-box'
          }}
        />
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
          <div style={{ color: explanation.length < 50 ? '#ef4444' : '#9ca3af', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
            {explanation.length} / 5000 chars (Min: 50)
          </div>
        </div>
      </div>

      {error && (
        <div style={{ color: '#ef4444', padding: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: '4px' }}>
          {error}
        </div>
      )}

      {/* File Upload Area */}
      {!isSubmitted && (
        <div className="cyber-card" style={{ padding: '30px', background: 'rgba(0,0,0,0.4)', marginTop: '8px' }}>
          <h3 style={{ color: '#f59e0b', fontFamily: 'var(--font-title)', marginTop: 0, marginBottom: '16px' }}>
            UPLOAD PROJECT FILES
          </h3>
          <p style={{ color: '#9ca3af', marginBottom: '20px', fontSize: '0.9rem' }}>
            Please zip your project folder and upload it here. Ensure your `node_modules` or similar heavy folders are excluded.
          </p>
          
          {loadedFile ? (
            <div style={{
              border: '2px solid rgba(16, 185, 129, 0.4)',
              borderRadius: '8px',
              padding: '24px',
              background: 'rgba(16, 185, 129, 0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              flexWrap: 'wrap'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ color: '#10b981' }}><FileBox size={32} /></div>
                <div>
                  <div style={{ color: '#10b981', fontWeight: 'bold', fontSize: '0.8rem', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle size={14} /> FILE LOADED
                  </div>
                  <div style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 600 }}>{loadedFile.name}</div>
                  <div style={{ color: '#9ca3af', fontSize: '0.85rem' }}>{(loadedFile.size / 1024 / 1024).toFixed(2)} MB</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  disabled={isExpired || isSubmitting}
                  onClick={() => { setLoadedFile(null); toast.info('File removed'); }}
                  style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#ef4444', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}
                >
                  <X size={14} /> REMOVE
                </button>
                <label 
                  htmlFor="project-upload" 
                  style={{ background: 'rgba(0, 243, 255, 0.1)', border: '1px solid var(--cyan-glow)', color: 'var(--cyan-glow)', padding: '8px 16px', borderRadius: '4px', cursor: isExpired || isSubmitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}
                >
                  <UploadCloud size={14} /> REPLACE
                </label>
              </div>
            </div>
          ) : (
            <div 
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (isExpired || isSubmitting) return;
                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                  const file = e.dataTransfer.files[0];
                  if (file.size > 50 * 1024 * 1024) {
                    toast.error('File exceeds 50MB limit.');
                    return;
                  }
                  setLoadedFile(file);
                  toast.success('File loaded successfully');
                }
              }}
              style={{
              border: '2px dashed rgba(0, 243, 255, 0.3)',
              borderRadius: '8px',
              padding: '40px 20px',
              textAlign: 'center',
              background: 'rgba(0,0,0,0.2)',
              cursor: isExpired || isSubmitting ? 'not-allowed' : 'pointer'
            }}>
              <label htmlFor="project-upload" style={{ cursor: isExpired || isSubmitting ? 'not-allowed' : 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', width: '100%', height: '100%' }}>
                <div style={{ color: 'var(--cyan-glow)' }}>
                  <UploadCloud size={48} />
                </div>
                <div style={{ color: '#d1d5db', fontFamily: 'var(--font-mono)' }}>
                  Drag and drop your .zip file here, or click to browse
                </div>
              </label>
            </div>
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
                  toast.error('File exceeds 50MB limit.');
                  e.target.value = '';
                  return;
                }
                setLoadedFile(file);
                toast.success('File loaded successfully');
              }
            }}
          />
        </div>
      )}
      
      {/* Submit Button */}
      {!isSubmitted && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
          <motion.button
            whileHover={!isExpired && !isSubmitting ? { scale: 1.05, boxShadow: '0 0 20px rgba(57, 255, 20, 0.4)' } : {}}
            whileTap={!isExpired && !isSubmitting ? { scale: 0.95 } : {}}
            className="cyber-btn"
            onClick={() => {
              setSubmitConfirmOpen(true);
            }}
            disabled={isExpired || isSubmitting}
            style={{ 
              padding: '16px 48px', 
              fontSize: '1.2rem', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              borderColor: isExpired ? '#4b5563' : 'var(--lime-accent)',
              color: isExpired ? '#9ca3af' : '#fff',
              opacity: isExpired || isSubmitting ? 0.5 : 1,
              cursor: isExpired || isSubmitting ? 'not-allowed' : 'pointer'
            }}
          >
            <Send size={24} />
            {isSubmitting ? 'SUBMITTING...' : 'SUBMIT PROJECT'}
          </motion.button>
        </div>
      )}
    
      <ConfirmModal
        isOpen={submitConfirmOpen}
        title="SUBMIT PROJECT?"
        message="Make sure your project is ready and your explanation is complete. You cannot edit this after submission."
        onConfirm={() => { setSubmitConfirmOpen(false); handleSubmit(); }}
        onCancel={() => setSubmitConfirmOpen(false)}
      />
</div>
  );
}
