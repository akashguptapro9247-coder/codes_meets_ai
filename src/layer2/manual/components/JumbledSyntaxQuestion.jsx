import React, { useState, useEffect, useRef, useCallback } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';
import { cpp } from '@codemirror/lang-cpp';
import { java } from '@codemirror/lang-java';
import { python } from '@codemirror/lang-python';
import { EditorView } from '@codemirror/view';
import { Play, RotateCcw } from 'lucide-react';
import { BombSequence, BugSwarm } from '../../../animation/Layer2Animations';
const EDGE_ZONE   = 80;   // px from top/bottom edge that activates scroll
const MAX_SPEED   = 14;   // max px per frame at the very edge
const MIN_SPEED   = 2;    // min px per frame at the outer boundary of the zone

export default function JumbledSyntaxQuestion({ question, language, onCheck, disabled, isEvaluating }) {
  const [lines, setLines] = useState([]);
  const [finalLines, setFinalLines] = useState([]);
  const [code, setCode] = useState('');

  const scrollRef  = useRef(null);   // ref to the scrollable lines container
  const leftPaneRef = useRef(null);  // ref to the left workspace for BombSequence
  const rafRef     = useRef(null);   // requestAnimationFrame ID
  const scrollDir  = useRef(0);      // -1 = up, 0 = none, 1 = down
  const scrollSpd  = useRef(0);      // px per frame

  // Initialize lines on mount or question change
  useEffect(() => {
    if (question && question.jumbledCode) {
      const targetLines = question.jumbledCode.map((text, idx) => ({ id: `line-${idx}`, text }));
      const preImpactLines = [...targetLines].reverse();
      
      setLines(preImpactLines);
      setFinalLines(targetLines);
      setCode(targetLines.map(l => l.text).join('\n'));
    }
  }, [question]);

  // ── AUTO-SCROLL ENGINE ──────────────────────────────────────────────────
  const startScrollLoop = useCallback(() => {
    if (rafRef.current) return; // already running
    const tick = () => {
      const el = scrollRef.current;
      if (el && scrollDir.current !== 0) {
        el.scrollTop += scrollDir.current * scrollSpd.current;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const stopScrollLoop = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    scrollDir.current = 0;
    scrollSpd.current = 0;
  }, []);

  // Stop loop when component unmounts
  useEffect(() => () => stopScrollLoop(), [stopScrollLoop]);

  // Called on the CONTAINER's onDragOver to update scroll direction/speed
  const handleContainerDragOver = useCallback((e) => {
    const el = scrollRef.current;
    if (!el || disabled) return;

    const { top, bottom } = el.getBoundingClientRect();
    const y = e.clientY;
    const distFromTop    = y - top;
    const distFromBottom = bottom - y;

    if (distFromTop < EDGE_ZONE && distFromTop >= 0) {
      // Near top → scroll up
      const ratio = 1 - distFromTop / EDGE_ZONE;           // 0…1 (1 = very close to edge)
      scrollDir.current = -1;
      scrollSpd.current = MIN_SPEED + ratio * (MAX_SPEED - MIN_SPEED);
      startScrollLoop();
    } else if (distFromBottom < EDGE_ZONE && distFromBottom >= 0) {
      // Near bottom → scroll down
      const ratio = 1 - distFromBottom / EDGE_ZONE;
      scrollDir.current = 1;
      scrollSpd.current = MIN_SPEED + ratio * (MAX_SPEED - MIN_SPEED);
      startScrollLoop();
    } else {
      stopScrollLoop();
    }
  }, [disabled, startScrollLoop, stopScrollLoop]);

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
    stopScrollLoop();
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
      const targetLines = question.jumbledCode.map((text, idx) => ({ id: `line-${idx}`, text }));
      setLines(targetLines);
      setFinalLines(targetLines);
      setCode(targetLines.map(l => l.text).join('\n'));
    }
  };

  const handleRun = () => {
    // The source sent to execution is ALWAYS the final content in the CodeMirror editor.
    onCheck(code);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', minHeight: 0 }}>
      {/* Workspaces container - side by side */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        
        {/* LEFT WORKSPACE: REARRANGE CODE */}
        <div ref={leftPaneRef} style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, borderRight: '1px solid rgba(0, 243, 255, 0.2)' }}>
          <div style={{ padding: '8px 16px', background: 'rgba(0, 0, 0, 0.5)', borderBottom: '1px solid rgba(0, 243, 255, 0.1)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#9ca3af', display: 'flex', justifyContent: 'space-between', flexShrink: 0 }}>
            <span>1. REARRANGE CODE</span>
            <span style={{ fontSize: '0.7rem', color: '#f59e0b' }}>Warning: Dragging resets manual edits</span>
          </div>
          <div 
            ref={scrollRef}
            onDragOver={handleContainerDragOver}
            onDragLeave={stopScrollLoop}
            onDrop={stopScrollLoop}
            style={{ flex: 1, padding: '16px', overflowY: 'auto', background: '#09090b', minHeight: 0 }}
          >
            {lines.map((line, idx) => (
              <div
                key={line.id}
                draggable={!disabled}
                className="anim-target-line"
                data-line-id={line.id}
                onDragStart={(e) => handleDragStart(e, idx)}
                onDragOver={handleDragOver}
                onDragEnd={stopScrollLoop}
                onDrop={(e) => handleDrop(e, idx)}
                style={{
                  padding: '10px 14px',
                  margin: '0 0 6px 0',
                  background: 'rgba(5, 14, 38, 0.85)',
                  border: '1px solid rgba(0, 243, 255, 0.12)',
                  borderRadius: '2px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.88rem',
                  color: disabled ? '#4b5563' : '#d1d5db',
                  cursor: disabled ? 'not-allowed' : 'grab',
                  userSelect: 'none',
                  opacity: disabled ? 0.7 : 1,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  transition: 'border-color 0.15s ease, background 0.15s ease'
                }}
              >
                <span style={{
                  flexShrink: 0, fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
                  color: 'rgba(0,243,255,0.3)', minWidth: '20px', textAlign: 'right',
                  userSelect: 'none', paddingTop: '3px'
                }}>
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <span style={{ color: disabled ? '#4b5563' : 'rgba(0,243,255,0.25)', userSelect: 'none', flexShrink: 0, paddingTop: '1px' }}>⋮</span>
                <div style={{ flex: 1, whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                  {line.text}
                </div>
              </div>
            ))}
          </div>
          <BombSequence codeBoxRef={leftPaneRef} lineContainerRef={scrollRef} onJumble={() => setLines(finalLines)} lines={lines} finalLines={finalLines} />
        </div>

        {/* RIGHT WORKSPACE: DEBUG / FIX SYNTAX */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <div style={{ padding: '8px 16px', background: 'rgba(0, 0, 0, 0.5)', borderBottom: '1px solid rgba(0, 243, 255, 0.1)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#9ca3af', flexShrink: 0 }}>
            <span>2. DEBUG / FIX SYNTAX</span>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', background: '#1e1e1e', minHeight: 0, position: 'relative' }}>
            <CodeMirror
              value={code}
              height="100%"
              theme={vscodeDark}
              extensions={[getLanguageExtension(), EditorView.lineWrapping]}
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
            <BugSwarm />
          </div>
        </div>
      </div>
      
      {/* FOOTER ACTIONS */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(0, 243, 255, 0.1)', display: 'flex', justifyContent: 'space-between', background: 'rgba(0,0,0,0.2)', flexShrink: 0 }}>
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
