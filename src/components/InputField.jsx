import React, { useState, forwardRef } from 'react';
import { Check } from 'lucide-react';
import { soundEngine } from '../utils/SoundEngine';

const InputField = forwardRef(function InputField({
  label,
  value,
  onChange,
  placeholder,
  error,
  type = 'text',
  icon: Icon,
  onKeyDown
}, ref) {
  const [isFocused, setIsFocused] = useState(false);
  const isValid = Boolean(value && String(value).trim().length > 0 && !error);

  const handleFocus = () => {
    setIsFocused(true);
    soundEngine.playHover();
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* Label Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '6px'
        }}
      >
        <label
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.72rem',
            color: isFocused ? 'var(--cyan-glow)' : isValid ? '#ffffff' : 'rgba(0, 243, 255, 0.7)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'color 0.25s ease'
          }}
        >
          {Icon && <Icon size={13} color={isFocused ? 'var(--cyan-glow)' : isValid ? 'var(--lime-accent)' : '#6b7280'} />}
          {label}
        </label>

        {error ? (
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.65rem',
              color: '#ef4444',
              letterSpacing: '0.08em'
            }}
          >
            ! DATA REQUIRED
          </span>
        ) : isValid ? (
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.65rem',
              color: 'var(--lime-accent)',
              letterSpacing: '0.08em',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Check size={11} color="var(--lime-accent)" /> VERIFIED
          </span>
        ) : null}
      </div>

      {/* Interactive Input Box with Cyber Corner Brackets */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          background: isFocused ? 'rgba(5, 15, 36, 0.95)' : isValid ? 'rgba(4, 18, 32, 0.9)' : 'rgba(2, 6, 18, 0.85)',
          border: error
            ? '1px solid #ef4444'
            : isFocused
            ? '1px solid var(--cyan-glow)'
            : isValid
            ? '1px solid rgba(57, 255, 20, 0.4)'
            : '1px solid rgba(0, 243, 255, 0.25)',
          boxShadow: isFocused
            ? '0 0 15px rgba(0, 243, 255, 0.35), inset 0 0 10px rgba(0, 243, 255, 0.15)'
            : error
            ? '0 0 12px rgba(239, 68, 68, 0.4)'
            : isValid
            ? '0 0 8px rgba(57, 255, 20, 0.15)'
            : 'none',
          transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          clipPath: 'polygon(6px 0%, 100% 0%, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0% 100%, 0% 6px)'
        }}
      >
        {/* Animated Light Beam Travelling around Border when Focused */}
        {isFocused && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: '-100%',
              width: '100%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(0, 243, 255, 0.3), transparent)',
              animation: 'light-sweep 2s infinite ease-in-out',
              pointerEvents: 'none'
            }}
          />
        )}

        <input
          ref={ref}
          type={type}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          style={{
            width: '100%',
            padding: '11px 36px 11px 14px',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: '#ffffff',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.85rem',
            letterSpacing: '0.05em'
          }}
        />

        {/* Subtle Checkmark Status Icon when Field Filled */}
        {isValid && (
          <div
            style={{
              position: 'absolute',
              right: '12px',
              pointerEvents: 'none',
              color: 'var(--lime-accent)',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Check size={14} />
          </div>
        )}
      </div>
    </div>
  );
});

export default InputField;
