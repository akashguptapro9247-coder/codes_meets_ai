import React, { useState, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';
import { cpp } from '@codemirror/lang-cpp';
import { java } from '@codemirror/lang-java';
import { python } from '@codemirror/lang-python';
import { Play, RotateCcw } from 'lucide-react';

export default function ShortLogicQuestion({ question, language, onCheck, disabled, isEvaluating }) {
  const [code, setCode] = useState('');

  useEffect(() => {
    // Reset to empty when switching questions since it's a fill-in-the-blank
    setCode('');
  }, [question]);

  const getLanguageExtension = () => {
    switch (language.toLowerCase()) {
      case 'c': return cpp();
      case 'java': return java();
      case 'python': return python();
      default: return [];
    }
  };

  const handleReset = () => {
    if (disabled) return;
    setCode('');
  };

  const handleRun = () => {
    // Final source is codeBefore + user code + codeAfter
    const completeSource = `${question.codeBefore || ''}\n${code}\n${question.codeAfter || ''}`;
    onCheck(completeSource);
  };

  // Enforce maxAnswerLines limitation (visually and logically)
  const handleChange = (value) => {
    const lines = value.split('\n').length;
    if (question.maxAnswerLines && lines > question.maxAnswerLines) {
      // Don't update state if it exceeds max lines
      return;
    }
    setCode(value);
  };

  const currentLines = code.split('\n').length;
  const isLineLimitExceeded = question.maxAnswerLines && currentLines > question.maxAnswerLines;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {question.maxAnswerLines && (
        <div style={{ padding: '8px 16px', background: isLineLimitExceeded ? 'rgba(239, 68, 68, 0.2)' : 'rgba(0, 0, 0, 0.5)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: isLineLimitExceeded ? '#fca5a5' : '#9ca3af', display: 'flex', justifyContent: 'space-between', flexShrink: 0 }}>
          <span>Complete the missing logic.</span>
          <span>LINES: {currentLines} / {question.maxAnswerLines}</span>
        </div>
      )}
      
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#1e1e1e', overflowY: 'auto' }}>
        
        {/* Read-only Code Before */}
        {question.codeBefore && (
          <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)', flexShrink: 0 }}>
            <pre style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: '#6b7280', whiteSpace: 'pre-wrap' }}>
              {question.codeBefore}
            </pre>
          </div>
        )}

        {/* Editable Area */}
        <div style={{ borderLeft: '3px solid var(--magenta-glow)', flexShrink: 0 }}>
          <CodeMirror
            value={code}
            theme={vscodeDark}
            extensions={[getLanguageExtension()]}
            onChange={handleChange}
            readOnly={disabled}
            basicSetup={{
              lineNumbers: true,
              highlightActiveLineGutter: true,
              highlightSpecialChars: true,
              history: true,
              foldGutter: true,
              drawSelection: true,
              dropCursor: true,
              allowMultipleSelections: true,
              indentOnInput: true,
              syntaxHighlighting: true,
              bracketMatching: true,
              closeBrackets: true,
              autocompletion: false,
              rectangularSelection: true,
              crosshairCursor: true,
              highlightActiveLine: true,
              highlightSelectionMatches: true,
              closeBracketsKeymap: true,
              defaultKeymap: true,
              searchKeymap: true,
              historyKeymap: true,
              foldKeymap: true,
              completionKeymap: false,
              lintKeymap: true
            }}
          />
        </div>

        {/* Read-only Code After */}
        {question.codeAfter && (
          <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.05)', flexShrink: 0 }}>
            <pre style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: '#6b7280', whiteSpace: 'pre-wrap' }}>
              {question.codeAfter}
            </pre>
          </div>
        )}

      </div>
      
      <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', justifyContent: 'space-between', background: 'rgba(0,0,0,0.2)', flexShrink: 0 }}>
        <button
          className="cyber-btn"
          onClick={handleReset}
          disabled={disabled || isEvaluating}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderColor: '#f59e0b', color: '#f59e0b', opacity: (disabled || isEvaluating) ? 0.5 : 1 }}
        >
          <RotateCcw size={16} /> RESET
        </button>

        <button
          className="cyber-btn"
          onClick={handleRun}
          disabled={disabled || isEvaluating || isLineLimitExceeded}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px', opacity: (disabled || isEvaluating || isLineLimitExceeded) ? 0.5 : 1 }}
        >
          <Play size={16} /> {isEvaluating ? 'EVALUATING...' : 'RUN / CHECK'}
        </button>
      </div>
    </div>
  );
}
