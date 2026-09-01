import React, { useState, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';
import { cpp } from '@codemirror/lang-cpp';
import { java } from '@codemirror/lang-java';
import { python } from '@codemirror/lang-python';
import { Play, RotateCcw } from 'lucide-react';

export default function JumbledSyntaxQuestion({ question, language, onCheck, disabled, isEvaluating }) {
  const [lines, setLines] = useState([]);
  const [code, setCode] = useState('');

  // Initialize lines on mount or question change
  useEffect(() => {
    if (question && question.jumbledCode) {
      const initialLines = question.jumbledCode.map((text, idx) => ({ id: `line-${idx}`, text }));
      setLines(initialLines);
      setCode(initialLines.map(l => l.text).join('\n'));
    }
  }, [question]);

  const getLanguageExtension = () => {
    switch (language.toLowerCase()) {
      case 'c': return cpp();
      case 'java': return java();
      case 'python': return python();
      default: return [];
    }
  };

  const handleDragStart = (e, index) => {
    if (disabled) return;
    e.dataTransfer.setData('text/plain', index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    if (disabled) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, dropIndex) => {
    if (disabled) return;
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
    
    if (dragIndex === dropIndex) return;
    
    const newLines = [...lines];
    const [draggedItem] = newLines.splice(dragIndex, 1);
    newLines.splice(dropIndex, 0, draggedItem);
    
    setLines(newLines);
    
    // Sync the ordered lines to the editor automatically
    setCode(newLines.map(l => l.text).join('\n'));
  };

  const handleReset = () => {
    if (disabled) return;
    if (question && question.jumbledCode) {
      const initialLines = question.jumbledCode.map((text, idx) => ({ id: `line-${idx}`, text }));
      setLines(initialLines);
      setCode(initialLines.map(l => l.text).join('\n'));
    }
  };

  const handleRun = () => {
    // The source sent to execution is ALWAYS the final content in the CodeMirror editor.
    onCheck(code);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
      <div style={{ padding: '8px 16px', background: 'rgba(0, 0, 0, 0.5)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#9ca3af', display: 'flex', justifyContent: 'space-between' }}>
        <span>1. REARRANGE CODE (Drag & Drop)</span>
        <span style={{ fontSize: '0.7rem', color: '#f59e0b' }}>Warning: Dragging resets manual edits below</span>
      </div>
      <div style={{ flex: '1 1 50%', padding: '16px', overflowY: 'auto', background: '#09090b' }}>
        {lines.map((line, idx) => (
          <div
            key={line.id}
            draggable={!disabled}
            onDragStart={(e) => handleDragStart(e, idx)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, idx)}
            style={{
              padding: '12px 16px',
              margin: '0 0 8px 0',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '4px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.9rem',
              color: '#d1d5db',
              cursor: disabled ? 'not-allowed' : 'grab',
              whiteSpace: 'pre',
              userSelect: 'none',
              opacity: disabled ? 0.7 : 1
            }}
          >
            {line.text}
          </div>
        ))}
      </div>

      <div style={{ padding: '8px 16px', background: 'rgba(0, 0, 0, 0.5)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', borderTop: '1px solid rgba(255, 255, 255, 0.1)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#9ca3af' }}>
        <span>2. DEBUG / FIX SYNTAX</span>
      </div>
      <div style={{ flex: '1 1 50%', overflow: 'auto', background: '#1e1e1e' }}>
        <CodeMirror
          value={code}
          height="100%"
          theme={vscodeDark}
          extensions={[getLanguageExtension()]}
          onChange={(value) => setCode(value)}
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
      
      <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', justifyContent: 'space-between', background: 'rgba(0,0,0,0.2)' }}>
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
          disabled={disabled || isEvaluating}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px', opacity: (disabled || isEvaluating) ? 0.5 : 1 }}
        >
          <Play size={16} /> {isEvaluating ? 'EVALUATING...' : 'RUN / CHECK'}
        </button>
      </div>
    </div>
  );
}
