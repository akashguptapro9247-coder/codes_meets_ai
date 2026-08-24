import React from 'react';
import { Shield, Lock, Layers } from 'lucide-react';

const STAGES = [
  { id: '01', title: 'SOLO CHALLENGE', locked: false },
  { id: '02', title: 'SKILL ROUND', locked: false },
  { id: '03', title: 'DUO FORMATION', locked: true },
  { id: '04', title: 'GRAND FINALE', locked: true }
];

export default function ProgressTicker() {
  return (
    <footer
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '42px',
        padding: '0 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 35,
        background: 'rgba(3, 7, 18, 0.9)',
        borderTop: '1px solid rgba(0, 243, 255, 0.15)',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.72rem',
        boxSizing: 'border-box'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(0, 243, 255, 0.6)' }}>
        <Layers size={14} color="var(--cyan-glow)" />
        <span>EVENT STAGES</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {STAGES.map((s) => (
          <div
            key={s.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: s.locked ? '#6b7280' : 'var(--cyan-glow)',
              opacity: s.locked ? 0.6 : 1
            }}
          >
            {s.locked ? <Lock size={11} /> : <Shield size={11} color="var(--lime-accent)" />}
            <span>{s.title}</span>
          </div>
        ))}
      </div>

      <div style={{ color: 'rgba(156, 163, 175, 0.4)', fontSize: '0.68rem' }}>
        CODE MEETS AI
      </div>
    </footer>
  );
}
