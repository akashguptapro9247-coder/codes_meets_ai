import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play } from 'lucide-react';
import { BombSequence } from '../../../animation/Layer2Animations';
import '../../../animation/Layer2Animations/animation.css';
const EDGE_ZONE   = 80;   // px from top/bottom edge that activates scroll
const MAX_SPEED   = 14;   // max px per frame at the very edge
const MIN_SPEED   = 2;    // min px per frame at the outer boundary of the zone

export default function JumbledCodeQuestion({ question, onCheck, disabled, isEvaluating }) {
  const [lines, setLines] = useState([]);
  const [finalLines, setFinalLines] = useState([]);
  
  const scrollRef  = useRef(null);   // ref to the scrollable lines container
  const codeBoxRef = useRef(null);   // ref to the outermost container for BombSequence
  const rafRef     = useRef(null);   // requestAnimationFrame ID
  const scrollDir  = useRef(0);      // -1 = up, 0 = none, 1 = down
  const scrollSpd  = useRef(0);      // px per frame
  useEffect(() => {
    if (question && question.jumbledCode) {
      const targetLines = question.jumbledCode.map((text, idx) => ({ id: `line-${idx}`, text }));
      const preImpactLines = [...targetLines].reverse();
      
      setLines(preImpactLines);
      setFinalLines(targetLines);
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

  // ── EXISTING DRAG HANDLERS (unchanged) ─────────────────────────────────
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
  };

  const handleRun = () => {
    const code = lines.map(l => l.text).join('\n');
    onCheck(code);
  };

  return (
    <div ref={codeBoxRef} style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', minHeight: 0 }}>
      {/* Section label */}
      <div style={{
        padding: '8px 14px',
        background: 'rgba(0,0,0,0.4)',
        borderBottom: '1px solid rgba(0,243,255,0.1)',
        fontFamily: 'var(--font-mono)', fontSize: '0.68rem',
        color: '#4b5563', letterSpacing: '0.1em',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0
      }}>
        <span>DRAG TO REORDER LINES</span>
        <span style={{ color: disabled ? '#4b5563' : 'rgba(0,243,255,0.4)', fontSize: '0.62rem' }}>
          {disabled ? 'LOCKED' : 'ACTIVE'}
        </span>
      </div>

      {/* Draggable lines — only this element scrolls */}
      <div
        ref={scrollRef}
        onDragOver={handleContainerDragOver}
        onDragLeave={stopScrollLoop}
        onDrop={stopScrollLoop}
        style={{ flex: 1, minHeight: 0, padding: '12px', overflowY: 'auto' }}
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
              whiteSpace: 'pre',
              userSelect: 'none',
              opacity: disabled ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              transition: 'border-color 0.15s ease, background 0.15s ease'
            }}
          >
            <span style={{
              flexShrink: 0, fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
              color: 'rgba(0,243,255,0.3)', minWidth: '20px', textAlign: 'right',
              userSelect: 'none'
            }}>
              {String(idx + 1).padStart(2, '0')}
            </span>
            <span style={{ color: disabled ? '#4b5563' : 'rgba(0,243,255,0.25)', userSelect: 'none', flexShrink: 0 }}>⋮</span>
            {line.text}
          </div>
        ))}
      </div>

      {/* Action bar */}
      <div style={{
        padding: '10px 14px',
        borderTop: '1px solid rgba(0, 243, 255, 0.12)',
        display: 'flex',
        justifyContent: 'flex-end',
        background: 'rgba(0,0,0,0.3)',
        flexShrink: 0
      }}>
        <button
          className="cyber-btn"
          onClick={handleRun}
          disabled={disabled || isEvaluating}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 24px',
            borderColor: (disabled || isEvaluating) ? 'rgba(255,255,255,0.1)' : 'var(--cyan-glow)',
            color: (disabled || isEvaluating) ? '#4b5563' : 'var(--cyan-glow)',
            background: (disabled || isEvaluating) ? 'transparent' : 'rgba(0,243,255,0.06)',
            opacity: (disabled || isEvaluating) ? 0.5 : 1,
            boxShadow: (disabled || isEvaluating) ? 'none' : '0 0 12px rgba(0,243,255,0.15)'
          }}
        >
          <Play size={15} />
          {isEvaluating ? 'EVALUATING...' : 'RUN / CHECK'}
        </button>
      </div>
      <BombSequence codeBoxRef={codeBoxRef} lineContainerRef={scrollRef} onJumble={() => setLines(finalLines)} lines={lines} finalLines={finalLines} />
    </div>
  );
}

