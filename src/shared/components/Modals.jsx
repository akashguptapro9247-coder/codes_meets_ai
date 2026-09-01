import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, confirmText = 'CONFIRM', cancelText = 'CANCEL' }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(4px)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="cyber-card"
            style={{
              background: 'rgba(2, 6, 18, 0.95)',
              padding: '24px',
              maxWidth: '400px',
              width: '90%',
              border: '1px solid var(--magenta-glow)',
              boxShadow: '0 0 20px rgba(255, 0, 255, 0.15)'
            }}
          >
            <h3 style={{ color: 'var(--magenta-glow)', marginTop: 0, fontFamily: 'var(--font-title)' }}>{title}</h3>
            <p style={{ color: '#d1d5db', fontFamily: 'var(--font-body)', fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>
              {message}
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
              <button className="cyber-btn" onClick={onCancel} style={{ padding: '8px 16px', fontSize: '0.8rem', borderColor: '#4b5563', color: '#9ca3af' }}>
                {cancelText}
              </button>
              <button className="cyber-btn" onClick={onConfirm} style={{ padding: '8px 16px', fontSize: '0.8rem', borderColor: 'var(--lime-accent)', color: 'var(--lime-accent)' }}>
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export function PromptModal({ isOpen, title, message, defaultValue, onConfirm, onCancel, confirmText = 'SUBMIT' }) {
  const [value, setValue] = useState(defaultValue || '');

  // Reset value when opened
  React.useEffect(() => {
    if (isOpen) setValue(defaultValue || '');
  }, [isOpen, defaultValue]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(4px)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="cyber-card"
            style={{
              background: 'rgba(2, 6, 18, 0.95)',
              padding: '24px',
              maxWidth: '400px',
              width: '90%',
              border: '1px solid var(--cyan-glow)',
              boxShadow: '0 0 20px rgba(0, 243, 255, 0.15)'
            }}
          >
            <h3 style={{ color: 'var(--cyan-glow)', marginTop: 0, fontFamily: 'var(--font-title)' }}>{title}</h3>
            <p style={{ color: '#d1d5db', fontFamily: 'var(--font-body)', fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>
              {message}
            </p>
            <input
              type="text"
              value={value}
              onChange={e => setValue(e.target.value)}
              autoFocus
              style={{
                width: '100%',
                padding: '10px 12px',
                background: 'rgba(0,0,0,0.5)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#fff',
                fontFamily: 'var(--font-mono)',
                marginTop: '12px',
                boxSizing: 'border-box'
              }}
              onKeyDown={e => {
                if (e.key === 'Enter') onConfirm(value);
                if (e.key === 'Escape') onCancel();
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
              <button className="cyber-btn" onClick={onCancel} style={{ padding: '8px 16px', fontSize: '0.8rem', borderColor: '#4b5563', color: '#9ca3af' }}>
                CANCEL
              </button>
              <button className="cyber-btn" onClick={() => onConfirm(value)} style={{ padding: '8px 16px', fontSize: '0.8rem', borderColor: 'var(--cyan-glow)', color: 'var(--cyan-glow)' }}>
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
