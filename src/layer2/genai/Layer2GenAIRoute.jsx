import React, { useState, useEffect } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import GenAIInstructions from './components/GenAIInstructions';
import Layer2GenAIChallenge from './Layer2GenAIChallenge';
import { genaiService } from './services/genaiService';

export default function Layer2GenAIRoute({ participant, onBack }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [assignment, setAssignment] = useState(null);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (!participant) return;
    
    const initializeAssignment = async () => {
      setLoading(true);
      
      // Try fetching existing assignment
      const { data: existing, error: fetchErr } = await genaiService.fetchParticipantSubmission(participant.userId || participant.user_id);
      
      if (fetchErr) {
        setError(fetchErr.message);
        setLoading(false);
        return;
      }
      
      if (existing) {
        setAssignment(existing);
        setLoading(false);
      } else {
        // If not started yet, we'll assign it when they click BEGIN
        setLoading(false);
      }
    };
    
    initializeAssignment();
  }, [participant]);

  const handleBeginChallenge = async () => {
    if (assignment) {
      setHasStarted(true);
      return;
    }
    
    setLoading(true);
    const { data, error } = await genaiService.assignRandomQuestion(participant);
    
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    
    setAssignment(data);
    setHasStarted(true);
    setLoading(false);
  };

  const handleSubmissionComplete = (updatedAssignment) => {
    setAssignment(updatedAssignment);
  };

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 100,
        backgroundColor: '#030712',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto'
      }}
    >
      {/* Top Bar */}
      <div 
        style={{
          padding: '20px 32px',
          borderBottom: '1px solid rgba(0, 243, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          background: 'rgba(3, 7, 18, 0.95)',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}
      >
        <button
          onClick={onBack}
          className="cyber-btn"
          style={{
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'transparent',
            borderColor: 'rgba(0, 243, 255, 0.3)'
          }}
        >
          <ArrowLeft size={16} />
          <span>BACK TO ARENA</span>
        </button>
      </div>

      <div style={{ flex: 1, padding: '24px', display: 'flex', justifyContent: 'center' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh', gap: '16px', color: 'var(--cyan-glow)' }}>
            <Loader2 size={48} className="animate-spin" />
            <div style={{ fontFamily: 'var(--font-mono)' }}>INITIALIZING GEN AI PROTOCOL...</div>
          </div>
        ) : error ? (
          <div style={{ color: '#ef4444', padding: '20px', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
            <h2>Initialization Error</h2>
            <p>{error}</p>
          </div>
        ) : !hasStarted && !assignment?.submitted ? (
          <GenAIInstructions onBegin={handleBeginChallenge} />
        ) : (
          <Layer2GenAIChallenge 
            participant={participant} 
            assignment={assignment} 
            onSubmissionComplete={handleSubmissionComplete}
          />
        )}
      </div>
    </div>
  );
}
