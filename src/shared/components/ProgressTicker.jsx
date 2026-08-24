import React from 'react';
import { Shield, Lock, Layers } from 'lucide-react';

const STAGES = [
  { id: '01', title: '01 TRACK', status: 'ACTIVE (LAYER 1/2)' },
  { id: '02', title: '02 SKILL', status: 'ACTIVE (LAYER 1/2)' },
  { id: '03', title: '03 DUO', status: 'LOCKED (DUO FORMATION)' },
  { id: '04', title: '04 PITCH', status: 'LOCKED (GRAND FINALE)' }
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
        <span>EVENT PROGRESSION MATRIX</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {STAGES.map((s, idx) => {
          const isFuture = idx >= 2;
          return (
            <div
              key={s.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: isFuture ? '#6b7280' : 'var(--cyan-glow)',
                opacity: isFuture ? 0.6 : 1
              }}
            >
              {isFuture ? <Lock size={11} /> : <Shield size={11} color="var(--lime-accent)" />}
              <span>{s.title}</span>
            </div>
          );
        })}
      </div>

      <div style={{ color: 'rgba(156, 163, 175, 0.5)', fontSize: '0.68rem' }}>
        SYSTEM::0x9F_REALTIME_SYNC
      </div>
    </footer>
  );
}
