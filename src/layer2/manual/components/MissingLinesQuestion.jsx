import React, { useState, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';
import { cpp } from '@codemirror/lang-cpp';
import { java } from '@codemirror/lang-java';
import { python } from '@codemirror/lang-python';
import { Play, RotateCcw } from 'lucide-react';

export default function MissingLinesQuestion({ question, language, onCheck, disabled, isEvaluating }) {
  const [code, setCode] = useState('');

  useEffect(() => {
    if (question && question.code) {
      setCode(question.code);
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

  const handleReset = () => {
    if (disabled) return;
    setCode(question.code);
  };

  const handleRun = () => {
    onCheck(code);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: 1, overflow: 'auto', background: '#1e1e1e' }}>
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
