import React, { useState, useEffect } from 'react';
import { Play } from 'lucide-react';

export default function JumbledCodeQuestion({ question, onCheck, disabled, isEvaluating }) {
  const [lines, setLines] = useState([]);
  
  // Initialize lines on mount or question change
  useEffect(() => {
    if (question && question.jumbledCode) {
      setLines(question.jumbledCode.map((text, idx) => ({ id: `line-${idx}`, text })));
    }
  }, [question]);

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
  };

  const handleRun = () => {
    const code = lines.map(l => l.text).join('\n');
    onCheck(code);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: 1, padding: '16px', overflowY: 'auto' }}>
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
      
      <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', justifyContent: 'flex-end', background: 'rgba(0,0,0,0.2)' }}>
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
