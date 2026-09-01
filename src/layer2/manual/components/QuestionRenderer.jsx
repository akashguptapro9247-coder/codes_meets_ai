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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px' }}>
      {/* Instructions & Status Header */}
      <div className="cyber-card" style={{ padding: '16px', background: 'rgba(2, 6, 18, 0.9)', borderColor: 'rgba(0, 243, 255, 0.2)' }}>
        <h3 style={{ fontFamily: 'var(--font-title)', color: 'var(--cyan-glow)', margin: '0 0 8px 0' }}>{question.title}</h3>
        <p style={{ color: '#d1d5db', fontFamily: 'var(--font-body)', fontSize: '0.9rem', margin: '0 0 16px 0' }}>
          {question._instruction || question.instruction}
        </p>
        
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'inline-block', padding: '6px 12px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
            <span style={{ color: '#9ca3af' }}>ATTEMPTS:</span> <span style={{ color: 'var(--magenta-glow)', fontWeight: 'bold' }}>{state.attempts} {isLimitedAttempts ? `/ ${maxAttempts}` : ''}</span>
          </div>
          <div style={{ display: 'inline-block', padding: '6px 12px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
            <span style={{ color: '#9ca3af' }}>STATUS:</span>{' '}
            <span style={{ 
              color: state.status === 'correct' ? 'var(--lime-accent)' : 
                     state.status === 'exhausted' || state.status === 'skipped' ? '#ef4444' : '#f59e0b',
              fontWeight: 'bold', textTransform: 'uppercase'
            }}>
              {state.status}
            </span>
          </div>
          <div style={{ display: 'inline-block', padding: '6px 12px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
            <span style={{ color: '#9ca3af' }}>MARKS SECURED:</span> <span style={{ color: 'var(--cyan-glow)', fontWeight: 'bold' }}>{state.marks} / 5</span>
          </div>
        </div>

        {/* Dynamic Explanation & Expected Output */}
        <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(255, 255, 255, 0.03)', borderLeft: '3px solid var(--magenta-glow)', borderRadius: '0 4px 4px 0' }}>
          <h4 style={{ color: '#9ca3af', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', margin: '0 0 4px 0' }}>COMMENTS / EXPLANATION</h4>
          <p style={{ color: '#d1d5db', margin: '0 0 12px 0', fontSize: '0.9rem', lineHeight: '1.4' }}>{question.explanation || 'Arrange the statements so the program runs successfully.'}</p>
          
          <h4 style={{ color: '#9ca3af', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', margin: '0 0 4px 0' }}>EXPECTED OUTPUT</h4>
          <pre style={{ margin: 0, padding: '8px', background: '#000', color: 'var(--lime-accent)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', borderRadius: '4px' }}>
            {question.expectedOutput || 'Program execution completed.'}
          </pre>
        </div>
      </div>

      {/* Render Specific Question Type UI */}
      <div style={{ flex: 1, display: 'flex', gap: '16px', minHeight: 0 }}>
        <div style={{ flex: 2, display: 'flex', flexDirection: 'column', background: '#09090b', borderRadius: '4px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
          {question._poolKey === 'q1' && <JumbledCodeQuestion question={question} onCheck={handleCheck} disabled={state.status !== 'pending'} isEvaluating={isEvaluating} />}
          {question._poolKey === 'q2' && <SyntaxErrorQuestion question={question} language={language} onCheck={handleCheck} disabled={state.status !== 'pending'} isEvaluating={isEvaluating} />}
          {question._poolKey === 'q3' && <JumbledSyntaxQuestion question={question} language={language} onCheck={handleCheck} disabled={state.status !== 'pending'} isEvaluating={isEvaluating} />}
          {question._poolKey === 'q4' && <MissingLinesQuestion question={question} language={language} onCheck={handleCheck} disabled={state.status !== 'pending'} isEvaluating={isEvaluating} />}
          {question._poolKey === 'q5' && <ShortLogicQuestion question={question} language={language} onCheck={handleCheck} disabled={state.status !== 'pending'} isEvaluating={isEvaluating} />}
        </div>
        
        {/* Output & Controls Panel */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="cyber-card" style={{ flex: 1, padding: '12px', background: 'rgba(2, 6, 18, 0.9)', overflowY: 'auto' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#9ca3af', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>LAST EXECUTION OUTPUT:</h4>
            {state.history.length > 0 ? (
              <pre style={{ 
                margin: 0, padding: '12px', background: '#000', color: state.history[state.history.length-1].result === 'CORRECT' ? 'var(--lime-accent)' : '#ef4444', 
                fontFamily: 'var(--font-mono)', fontSize: '0.85rem', whiteSpace: 'pre-wrap', borderRadius: '4px' 
              }}>
                {state.history[state.history.length-1].result === 'COMPILE_ERROR' ? '[COMPILATION ERROR]\n' : ''}
                {state.history[state.history.length-1].result === 'RUNTIME_ERROR' ? '[RUNTIME ERROR]\n' : ''}
                {state.history[state.history.length-1].output || 'Program executed successfully with no output.'}
              </pre>
            ) : (
              <div style={{ color: '#6b7280', fontSize: '0.8rem', fontStyle: 'italic' }}>Run code to see output here.</div>
            )}
          </div>
          
          <button 
            className="cyber-btn" 
            onClick={handleSkip}
            disabled={state.status !== 'pending' || isEvaluating}
            style={{ padding: '12px', borderColor: '#ef4444', color: '#fca5a5', opacity: (state.status !== 'pending' || isEvaluating) ? 0.5 : 1 }}
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
