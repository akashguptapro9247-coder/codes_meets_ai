import React, { useState } from 'react';
import { toast } from '../../../shared/components/Toast';
import { ConfirmModal } from '../../../shared/components/Modals';
import JumbledCodeQuestion from './JumbledCodeQuestion';
import SyntaxErrorQuestion from './SyntaxErrorQuestion';
import JumbledSyntaxQuestion from './JumbledSyntaxQuestion';
import MissingLinesQuestion from './MissingLinesQuestion';
import ShortLogicQuestion from './ShortLogicQuestion';
import { executeAndEvaluateCode } from '../execution/ExecutionService';
import { soundEngine } from '../../../shared/utils/SoundEngine';

export default function QuestionRenderer({ question, language, state, onUpdateState }) {
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [skipConfirmOpen, setSkipConfirmOpen] = useState(false);

  if (!question || !state) return null;

  // Determine scoring and attempt rules based on question type
  const isLimitedAttempts = question._poolKey === 'q1' || question._poolKey === 'q2';
  const maxAttempts = isLimitedAttempts ? 3 : Infinity;
  
  const handleCheck = async (codeToEvaluate) => {
    if (state.status !== 'pending' || isEvaluating) return;
    
    setIsEvaluating(true);
    soundEngine.playBoot();
    
    try {
      const result = await executeAndEvaluateCode(language, codeToEvaluate, question.expectedOutput);
      
      const newAttemptCount = state.attempts + 1;
      const isCorrect = result.status === 'CORRECT';
      let newMarks = state.marks;
      let newStatus = state.status;
      
      // Scoring logic
      if (isCorrect) {
        if (newAttemptCount === 1) newMarks = 5;
        else if (newAttemptCount === 2) newMarks = 4;
        else newMarks = 3;
        newStatus = 'correct';
        if (soundEngine.playBoot) soundEngine.playBoot();
      } else {
        if (soundEngine.playClick) soundEngine.playClick();
        if (isLimitedAttempts && newAttemptCount >= maxAttempts) {
          newStatus = 'exhausted';
          newMarks = 1;
        }
      }
      
      // Only increment attempts if it was a real evaluation (not a service error)
      if (result.status === 'EXECUTION_SERVICE_ERROR') {
        toast.error(result.message);
        return; // Do NOT consume attempt
      }

      onUpdateState({
        attempts: newAttemptCount,
        marks: newMarks,
        status: newStatus,
        history: [...state.history, { 
          attempt: newAttemptCount, 
          code: codeToEvaluate, 
          result: result.status, 
          output: result.output || '',
          timestamp: Date.now() 
        }]
      });
    } catch (error) {
      console.error('[QuestionRenderer] Execution handler failed:', error);
      toast.error('An unexpected error occurred during evaluation. Please try again.');
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleSkip = () => {
    setSkipConfirmOpen(true);
  };

  const doSkip = () => {
    setSkipConfirmOpen(false);
    const newAttemptCount = state.attempts + 1;
    onUpdateState({
      attempts: newAttemptCount,
      marks: 1,
      status: 'skipped',
      history: [...state.history, {
        attempt: newAttemptCount,
        code: '',
        result: 'SKIPPED',
        output: 'Question skipped.',
        timestamp: Date.now()
      }]
    });
  };


  // Common UI Wrapper
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minHeight: 0, overflow: 'hidden', paddingBottom: 0 }}>

      {/* ── CHALLENGE INFO PANEL ── */}
      <div style={{
        background: 'rgba(2, 6, 20, 0.9)',
        border: '1px solid rgba(0, 243, 255, 0.2)',
        borderRadius: '4px',
        padding: '4px 12px',
      }}>
        {/* Title row + status badges */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '2px' }}>
          <h3 style={{ fontFamily: 'var(--font-title)', color: 'var(--cyan-glow)', margin: 0, fontSize: '1.05rem', letterSpacing: '0.1em' }}>
            {question.title}
          </h3>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <div style={{ padding: '3px 10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(0,243,255,0.15)', borderRadius: '2px', fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>
              <span style={{ color: '#6b7280' }}>ATTEMPTS: </span>
              <span style={{ color: 'var(--magenta-glow)', fontWeight: 700 }}>{state.attempts}{isLimitedAttempts ? ` / ${maxAttempts}` : ''}</span>
            </div>
            <div style={{ padding: '3px 10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(0,243,255,0.15)', borderRadius: '2px', fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>
              <span style={{ color: '#6b7280' }}>STATUS: </span>
              <span style={{
                color: state.status === 'correct' ? 'var(--lime-accent)' : state.status === 'exhausted' || state.status === 'skipped' ? '#ef4444' : '#f59e0b',
                fontWeight: 700, textTransform: 'uppercase'
              }}>{state.status}</span>
            </div>
            <div style={{ padding: '3px 10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(0,243,255,0.15)', borderRadius: '2px', fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>
              <span style={{ color: '#6b7280' }}>MARKS: </span>
              <span style={{ color: 'var(--cyan-glow)', fontWeight: 700 }}>{state.marks} / 5</span>
            </div>
          </div>
        </div>

        {/* Instruction */}
        <p style={{ 
          fontFamily: 'var(--font-body)', 
          fontSize: '1.05rem', 
          lineHeight: 1.35, 
          color: '#f3f4f6', 
          fontWeight: 600,
          margin: '0 0 4px 0' 
        }}>
          {question._instruction || question.instruction}
        </p>

        {/* Explanation + Expected Output row */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 280px', borderLeft: '3px solid var(--magenta-glow)', paddingLeft: '8px' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#9ca3af', marginBottom: '0px', letterSpacing: '0.08em' }}>COMMENTS / EXPLANATION</div>
            <p style={{ 
              fontFamily: 'var(--font-body)', 
              fontSize: '1.05rem', 
              lineHeight: 1.35, 
              color: '#f3f4f6', 
              fontWeight: 600,
              margin: 0 
            }}>
              {question.explanation || 'Arrange the statements so the program runs successfully.'}
            </p>
          </div>
          <div style={{ flex: '0 1 260px' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#9ca3af', marginBottom: '1px', letterSpacing: '0.08em' }}>EXPECTED OUTPUT</div>
            <pre style={{ margin: 0, padding: '4px 8px', background: '#000', color: 'var(--lime-accent)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', borderRadius: '3px', border: '1px solid rgba(57,255,20,0.2)', whiteSpace: 'pre-wrap' }}>
              {question.expectedOutput || 'Program execution completed.'}
            </pre>
          </div>
        </div>
      </div>

      {/* ── MAIN WORKSPACE SPLIT ── */}
      <div style={{ display: 'flex', gap: '12px', flex: 1, minHeight: 0, overflow: 'hidden' }}>

        {/* LEFT: Question-specific component */}
        <div style={{
          flex: 2,
          background: '#09090b',
          border: '1px solid rgba(0,243,255,0.15)',
          borderRadius: '4px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {question._poolKey === 'q1' && <JumbledCodeQuestion question={question} onCheck={handleCheck} disabled={state.status !== 'pending'} isEvaluating={isEvaluating} />}
          {question._poolKey === 'q2' && <SyntaxErrorQuestion question={question} language={language} onCheck={handleCheck} disabled={state.status !== 'pending'} isEvaluating={isEvaluating} />}
          {question._poolKey === 'q3' && <JumbledSyntaxQuestion question={question} language={language} onCheck={handleCheck} disabled={state.status !== 'pending'} isEvaluating={isEvaluating} />}
          {question._poolKey === 'q4' && <MissingLinesQuestion question={question} language={language} onCheck={handleCheck} disabled={state.status !== 'pending'} isEvaluating={isEvaluating} />}
          {question._poolKey === 'q5' && <ShortLogicQuestion question={question} language={language} onCheck={handleCheck} disabled={state.status !== 'pending'} isEvaluating={isEvaluating} />}
        </div>

        {/* RIGHT: Output Terminal + Skip */}
        <div style={{ flex: 1, minWidth: '200px', maxWidth: '280px', display: 'flex', flexDirection: 'column', gap: '10px', overflow: 'hidden' }}>

          {/* Execution Output Terminal */}
          <div style={{
            flex: 1,
            background: 'rgba(2, 6, 18, 0.95)',
            border: '1px solid rgba(0, 243, 255, 0.2)',
            borderRadius: '4px',
            padding: '12px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#9ca3af', marginBottom: '8px', letterSpacing: '0.08em' }}>
              LAST EXECUTION OUTPUT:
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {state.history.length > 0 ? (
                <pre style={{
                  margin: 0, padding: '10px', background: '#000',
                  color: state.history[state.history.length - 1].result === 'CORRECT' ? 'var(--lime-accent)' : '#ef4444',
                  fontFamily: 'var(--font-mono)', fontSize: '0.8rem',
                  whiteSpace: 'pre-wrap', borderRadius: '3px',
                  border: `1px solid ${state.history[state.history.length - 1].result === 'CORRECT' ? 'rgba(57,255,20,0.2)' : 'rgba(239,68,68,0.2)'}`
                }}>
                  {state.history[state.history.length - 1].result === 'COMPILE_ERROR' ? '[COMPILATION ERROR]\n' : ''}
                  {state.history[state.history.length - 1].result === 'RUNTIME_ERROR' ? '[RUNTIME ERROR]\n' : ''}
                  {state.history[state.history.length - 1].output || 'Program executed successfully with no output.'}
                </pre>
              ) : (
                <div style={{ color: '#4b5563', fontSize: '0.78rem', fontStyle: 'italic', fontFamily: 'var(--font-mono)' }}>
                  Run code to see output here.
                </div>
              )}
            </div>
          </div>

          {/* Skip Button */}
          <button
            className="cyber-btn"
            onClick={handleSkip}
            disabled={state.status !== 'pending' || isEvaluating}
            style={{
              padding: '11px',
              borderColor: 'rgba(239, 68, 68, 0.5)',
              color: '#fca5a5',
              background: 'rgba(239, 68, 68, 0.05)',
              opacity: (state.status !== 'pending' || isEvaluating) ? 0.5 : 1,
              fontFamily: 'var(--font-mono)',
              fontSize: '0.78rem',
              letterSpacing: '0.06em'
            }}
          >
            SKIP QUESTION (1 MARK)
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={skipConfirmOpen}
        title="SKIP QUESTION?"
        message="Are you sure you want to skip this question? You will receive 1 mark and cannot return to it."
        onConfirm={doSkip}
        onCancel={() => setSkipConfirmOpen(false)}
      />
    </div>
  );
}

