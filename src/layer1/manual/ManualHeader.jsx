import React from 'react';
import { Terminal, Shield, Cpu, Activity } from 'lucide-react';

export default function ManualHeader({ participant, batchInfo, currentQuestion, totalQuestions }) {
  const isFirstYear = batchInfo?.batch === '26';

  return (
    <header
      style={{
        flexShrink: 0,
        height: '60px',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(0, 243, 255, 0.25)',
        background: 'linear-gradient(90deg, rgba(2, 6, 20, 0.95) 0%, rgba(5, 14, 38, 0.95) 100%)',
        boxSizing: 'border-box',
        zIndex: 10
      }}
    >
      {/* Left: Mission Title & Track Badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            width: '30px',
            height: '30px',
            borderRadius: '4px',
            background: 'rgba(0, 243, 255, 0.15)',
            border: '1px solid var(--cyan-glow)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--cyan-glow)'
          }}
        >
          <Terminal size={17} />
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{
                fontFamily: 'var(--font-title)',
                fontSize: '0.92rem',
                fontWeight: 900,
                letterSpacing: '0.12em',
                color: '#ffffff'
              }}
            >
              LAYER 01 // TECHNICAL CODING ASSESSMENT
            </span>
          </div>
        </div>
      </div>

      {/* Right: Operator Identity & Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <span
          className="cyber-badge"
          style={{
            fontSize: '0.64rem',
            padding: '2px 8px',
            background: isFirstYear ? 'rgba(0, 243, 255, 0.15)' : 'rgba(224, 38, 255, 0.15)',
            borderColor: isFirstYear ? 'var(--cyan-glow)' : 'var(--magenta-glow)',
            color: isFirstYear ? 'var(--cyan-glow)' : 'var(--magenta-glow)'
          }}
        >
          {isFirstYear ? '1ST YEAR ASSESSMENT' : '2ND YEAR ASSESSMENT'}
        </span>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '5px 12px',
            background: 'rgba(0, 243, 255, 0.06)',
            border: '1px solid rgba(0, 243, 255, 0.25)',
            borderRadius: '2px'
          }}
        >
          <Shield size={13} color="var(--cyan-glow)" />
          <span style={{ fontSize: '0.74rem', color: '#9ca3af', fontFamily: 'var(--font-mono)' }}>
            OPERATOR:
          </span>
          <span
            style={{
              fontSize: '0.78rem',
              fontWeight: 700,
              color: '#ffffff',
              fontFamily: 'var(--font-mono)'
            }}
          >
            {participant?.name || 'Participant'}
          </span>
          <span
            style={{
              fontSize: '0.72rem',
              color: 'var(--cyan-glow)',
              fontFamily: 'var(--font-mono)'
            }}
          >
            [{participant?.rollNumber || participant?.roll_number || 'N/A'}]
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: 'var(--lime-accent)',
              boxShadow: '0 0 8px var(--lime-accent)',
              animation: 'pulse 1.8s infinite'
            }}
          />
          <span
            style={{
              fontSize: '0.68rem',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              color: 'var(--lime-accent)',
              letterSpacing: '0.08em'
            }}
          >
            SESSION ACTIVE
          </span>
        </div>
      </div>
    </header>
  );
}
