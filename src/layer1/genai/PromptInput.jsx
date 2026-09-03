import React, { useState } from 'react';
import { Terminal, AlignLeft, AlertCircle } from 'lucide-react';

export default function PromptInput({
  value,
  prompt,
  onChange,
  onChangePrompt,
  disabled = false,
  maxLength = 2000
}) {
  const [isFocused, setIsFocused] = useState(false);
  const textValue = value !== undefined ? value : prompt !== undefined ? prompt : '';
  const currentLength = textValue.length;
  const isNearLimit = currentLength > maxLength * 0.85;

  const handleChange = (e) => {
    const newVal = e.target.value;
    if (newVal.length <= maxLength) {
      if (typeof onChange === 'function') onChange(newVal);
      if (typeof onChangePrompt === 'function') onChangePrompt(newVal);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        background: 'rgba(3, 7, 20, 0.7)',
        border: isFocused
          ? '1px solid var(--cyan-glow)'
          : '1px solid rgba(0, 243, 255, 0.2)',
        boxShadow: isFocused
          ? '0 0 25px rgba(0, 243, 255, 0.25), inset 0 0 15px rgba(0, 243, 255, 0.08)'
          : 'none',
        borderRadius: '3px',
        padding: '12px',
        boxSizing: 'border-box',
        transition: 'all 0.3s ease',
        position: 'relative',
        opacity: disabled ? 0.6 : 1
      }}
    >
      {/* Header Bar with Label & Character Counter */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Terminal size={14} color={isFocused ? 'var(--cyan-glow)' : 'rgba(0, 243, 255, 0.7)'} />
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.72rem',
              color: isFocused ? '#ffffff' : 'var(--cyan-glow)',
              letterSpacing: '0.12em',
              fontWeight: 700
            }}
          >
            FINAL PROMPT // SUBMISSION
          </span>
        </div>

        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.68rem',
            color: isNearLimit ? '#f59e0b' : 'rgba(0, 243, 255, 0.6)',
            letterSpacing: '0.08em'
          }}
        >
          <span>{currentLength}</span> / <span>{maxLength}</span> CHARS
        </div>
      </div>

      {/* Large Cyber Monospace Textarea */}
      <textarea
        value={textValue}
        onChange={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        disabled={disabled}
        placeholder="Paste the exact final prompt you used to generate your submitted image..."
        style={{
          width: '100%',
          height: '140px',
          background: 'rgba(2, 6, 18, 0.95)',
          border: '1px solid rgba(0, 243, 255, 0.15)',
          borderRadius: '2px',
          padding: '10px 12px',
          boxSizing: 'border-box',
          color: '#ffffff',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.82rem',
          lineHeight: '1.5',
          resize: 'none',
          outline: 'none',
          transition: 'border-color 0.3s ease',
          cursor: disabled ? 'not-allowed' : 'text'
        }}
      />
    </div>
  );
}
