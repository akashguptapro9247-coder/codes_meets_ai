import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { soundEngine } from '../utils/SoundEngine';

const SelectField = forwardRef(function SelectField({
  label,
  value,
  onChange,
  options = [],
  placeholder = 'Select option',
  error,
  icon: Icon,
  onKeyDown,
  onConfirmNext
}, ref) {
  const [isFocused, setIsFocused] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const containerRef = useRef(null);
  const buttonRef = useRef(null);

  // Normalize options into objects: { value, label }
  const normalizedOptions = options.map((opt) =>
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );

  // Expose focus and control methods via ref
  useImperativeHandle(ref, () => ({
    focus: () => {
      buttonRef.current?.focus();
      setIsOpen(true);
    },
    open: () => {
      setIsOpen(true);
    },
    close: () => {
      setIsOpen(false);
    },
    node: buttonRef.current
  }));

  // Update highlighted index when value changes or menu opens
  useEffect(() => {
    if (isOpen) {
      const idx = normalizedOptions.findIndex((opt) => opt.value === value);
      setHighlightedIndex(idx >= 0 ? idx : 0);
    }
  }, [isOpen, value]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFocus = () => {
    setIsFocused(true);
    soundEngine.playHover();
    setIsOpen(true);
  };

  const handleBlur = (e) => {
    if (containerRef.current && !containerRef.current.contains(e.relatedTarget)) {
      setIsFocused(false);
      setIsOpen(false);
    }
  };

  const selectOption = (optValue) => {
    if (onChange) {
      onChange({ target: { value: optValue } });
    }
    setIsOpen(false);
    if (onConfirmNext) {
      setTimeout(() => {
        onConfirmNext();
      }, 10);
    }
  };

  const handleKeyDownInternal = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else {
        setHighlightedIndex((prev) => (prev + 1) % normalizedOptions.length);
      }
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else {
        setHighlightedIndex((prev) => (prev - 1 + normalizedOptions.length) % normalizedOptions.length);
      }
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      if (isOpen && normalizedOptions.length > 0) {
        const selectedOpt = normalizedOptions[highlightedIndex] || normalizedOptions[0];
        selectOption(selectedOpt.value);
      } else if (onConfirmNext) {
        onConfirmNext();
      } else if (onKeyDown) {
        onKeyDown(e);
      }
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      return;
    }

    if (onKeyDown) {
      onKeyDown(e);
    }
  };

  const isValid = Boolean(value && String(value).trim().length > 0 && !error);
  const selectedOptionObj = normalizedOptions.find((opt) => opt.value === value);

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
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
            ! SELECTION REQUIRED
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

      {/* Cyber Select Trigger Field */}
      <div
        ref={buttonRef}
        tabIndex={0}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDownInternal}
        onClick={() => setIsOpen((prev) => !prev)}
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '11px 14px',
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
          clipPath: 'polygon(6px 0%, 100% 0%, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0% 100%, 0% 6px)',
          cursor: 'pointer',
          outline: 'none'
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.85rem',
            letterSpacing: '0.05em',
            color: value ? '#ffffff' : '#6b7280'
          }}
        >
          {selectedOptionObj ? selectedOptionObj.label : placeholder}
        </span>

        <div
          style={{
            color: isFocused ? 'var(--cyan-glow)' : isValid ? 'var(--lime-accent)' : 'rgba(0, 243, 255, 0.6)',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease, color 0.25s ease'
          }}
        >
          <ChevronDown size={16} />
        </div>
      </div>

      {/* Cyber Option Dropdown Menu Overlay */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            zIndex: 100,
            background: '#050a18',
            border: '1px solid var(--cyan-glow)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.95), 0 0 18px rgba(0, 243, 255, 0.3)',
            borderRadius: '2px',
            maxHeight: '200px',
            overflowY: 'auto',
            padding: '4px 0'
          }}
        >
          {normalizedOptions.map((opt, index) => {
            const isSelected = opt.value === value;
            const isHighlighted = index === highlightedIndex;

            return (
              <div
                key={opt.value}
                onClick={(e) => {
                  e.stopPropagation();
                  selectOption(opt.value);
                }}
                onMouseEnter={() => setHighlightedIndex(index)}
                style={{
                  padding: '9px 14px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.82rem',
                  letterSpacing: '0.05em',
                  cursor: 'pointer',
                  background: isHighlighted
                    ? 'rgba(0, 243, 255, 0.2)'
                    : isSelected
                    ? 'rgba(0, 243, 255, 0.1)'
                    : 'transparent',
                  color: isHighlighted || isSelected ? 'var(--cyan-glow)' : '#ffffff',
                  borderLeft: isHighlighted ? '3px solid var(--cyan-glow)' : '3px solid transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>{opt.label}</span>
                {isSelected && <Check size={13} color="var(--cyan-glow)" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});

export default SelectField;
