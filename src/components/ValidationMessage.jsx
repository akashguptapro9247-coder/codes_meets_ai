import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

export default function ValidationMessage({ message }) {
  if (!message) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -6, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.25 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '10px 14px',
        background: 'rgba(239, 68, 68, 0.12)',
        border: '1px solid rgba(239, 68, 68, 0.5)',
        borderRadius: '2px',
        color: '#f87171',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.75rem',
        letterSpacing: '0.08em',
        boxShadow: '0 0 12px rgba(239, 68, 68, 0.25)',
        marginBottom: '12px'
      }}
    >
      <AlertTriangle size={16} color="#ef4444" />
      <span>{message}</span>
    </motion.div>
  );
}
