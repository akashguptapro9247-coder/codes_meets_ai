import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// A simple global state for toasts so we can trigger them from anywhere without a context provider if needed.
// However, since we are in React, it's better to render a ToastContainer at the app root, or just use a state in the component.
// To avoid refactoring the whole app, we'll use a singleton event emitter pattern for Toasts.

const listeners = new Set();

export const toast = {
  show: (message, type = 'info', duration = 3000) => {
    listeners.forEach(listener => listener({ id: Date.now(), message, type, duration }));
  },
  success: (msg, dur) => toast.show(msg, 'success', dur),
  error: (msg, dur) => toast.show(msg, 'error', dur),
  warning: (msg, dur) => toast.show(msg, 'warning', dur),
  info: (msg, dur) => toast.show(msg, 'info', dur),
};

export function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleAdd = (t) => {
      setToasts(prev => [...prev, t]);
      if (t.duration !== Infinity) {
        setTimeout(() => {
          setToasts(prev => prev.filter(toast => toast.id !== t.id));
        }, t.duration);
      }
    };
    listeners.add(handleAdd);
    return () => listeners.delete(handleAdd);
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      pointerEvents: 'none'
    }}>
      <AnimatePresence>
        {toasts.map(t => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            style={{
              pointerEvents: 'auto',
              minWidth: '250px',
              maxWidth: '350px',
              padding: '12px 16px',
              background: 'rgba(2, 6, 18, 0.95)',
              border: '1px solid',
              borderColor: t.type === 'success' ? 'var(--lime-accent)' : 
                           t.type === 'error' ? '#ef4444' : 
                           t.type === 'warning' ? '#f59e0b' : 'var(--cyan-glow)',
              borderRadius: '4px',
              boxShadow: `0 0 15px ${
                t.type === 'success' ? 'rgba(57, 255, 20, 0.2)' : 
                t.type === 'error' ? 'rgba(239, 68, 68, 0.2)' : 
                t.type === 'warning' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(0, 243, 255, 0.2)'
              }`,
              color: '#fff',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              backdropFilter: 'blur(10px)'
            }}
          >
            <div style={{ flex: 1, wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
              {t.message}
            </div>
            <button
              onClick={() => setToasts(prev => prev.filter(toast => toast.id !== t.id))}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#9ca3af',
                cursor: 'pointer',
                padding: 0,
                fontSize: '1rem',
                lineHeight: 1
              }}
            >
              &times;
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
