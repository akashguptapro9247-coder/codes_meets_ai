import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, BookOpen, ChevronDown, ChevronRight } from 'lucide-react';
import { eventStateService } from '../shared/services/eventStateService';
import layer3Data from '../../layer3_questions_manual.json';

const rawProblems = layer3Data.problems || [];
// Arrange sequentially in numerical order
const problems = [...rawProblems].sort((a, b) => (Number(a.id) || 0) - (Number(b.id) || 0));

function QuestionCard({ problem }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      style={{
        background: 'rgba(4, 9, 22, 0.88)',
        border: isExpanded
          ? '1px solid var(--cyan-glow)'
          : '1px solid rgba(0, 243, 255, 0.18)',
        borderRadius: '6px',
        boxShadow: isExpanded
          ? '0 0 25px rgba(0, 243, 255, 0.22), 0 4px 24px rgba(0, 0, 0, 0.7)'
          : '0 4px 16px rgba(0, 0, 0, 0.5)',
        boxSizing: 'border-box',
        overflow: 'hidden',
        transition: 'border-color 0.25s ease, box-shadow 0.25s ease'
      }}
    >
      {/* Collapsed Header Bar — Title & Number always visible, click to toggle */}
      <button
        onClick={() => setIsExpanded((prev) => !prev)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          padding: '18px 24px',
          background: isExpanded ? 'rgba(0, 243, 255, 0.03)' : 'transparent',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          color: 'inherit',
          outline: 'none',
          transition: 'background 0.2s ease'
        }}
        onMouseEnter={(e) => {
          if (!isExpanded) e.currentTarget.style.background = 'rgba(0, 243, 255, 0.04)';
        }}
        onMouseLeave={(e) => {
          if (!isExpanded) e.currentTarget.style.background = 'transparent';
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
          {/* Question Number */}
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '1rem',
              fontWeight: 700,
              color: 'var(--cyan-glow)',
              letterSpacing: '0.04em',
              flexShrink: 0,
              textShadow: '0 0 10px rgba(0, 243, 255, 0.5)'
            }}
          >
            {problem.id}.
          </span>

          {/* Question Title */}
          <h3
            style={{
              fontFamily: 'var(--font-title)',
              fontSize: '1.02rem',
              margin: 0,
              color: '#ffffff',
              letterSpacing: '0.06em',
              fontWeight: 700,
              textShadow: isExpanded ? '0 0 12px rgba(0, 243, 255, 0.4)' : 'none',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'normal',
              wordBreak: 'break-word',
              lineHeight: 1.4
            }}
          >
            {problem.title}
          </h3>
        </div>

        {/* Small Expand Arrow / Chevron on Right Side */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '28px',
            height: '28px',
            borderRadius: '4px',
            background: isExpanded ? 'rgba(0, 243, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)',
            border: isExpanded ? '1px solid var(--cyan-glow)' : '1px solid rgba(255, 255, 255, 0.1)',
            color: isExpanded ? 'var(--cyan-glow)' : '#9ca3af',
            flexShrink: 0,
            transition: 'all 0.25s ease'
          }}
        >
          <ChevronDown
            size={16}
            style={{
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.3s ease'
            }}
          />
        </div>
      </button>

      {/* Expanded Problem Statement */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div
              style={{
                padding: '16px 24px 22px 24px',
                borderTop: '1px solid rgba(0, 243, 255, 0.12)',
                background: 'rgba(2, 6, 18, 0.4)'
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.65rem',
                  color: 'var(--cyan-glow)',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  marginBottom: '10px',
                  opacity: 0.85
                }}
              >
                Problem Statement
              </div>
              <p
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.88rem',
                  color: '#e5e7eb',
                  lineHeight: 1.7,
                  margin: 0,
                  whiteSpace: 'pre-line',
                  wordBreak: 'break-word',
                  letterSpacing: '0.02em'
                }}
              >
                {problem.problem_statement}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Layer3QuestionsPage({ onBack }) {
  const prevLockStateRef = useRef(null);

  // Real-time lock listener — return to arena if locked or admin actively locks Layer 3
  useEffect(() => {
    const initial = eventStateService.getEventState();
    if (initial && initial.layer3 && !initial.layer3.active) {
      if (onBack) onBack();
      return;
    }

    const unsubscribe = eventStateService.subscribeToEventState((state) => {
      const prev = prevLockStateRef.current;
      prevLockStateRef.current = state;
      if (!prev) return;
      const wasActive = prev.layer3?.active;
      const isNowActive = state.layer3?.active;
      if (wasActive && !isNowActive) {
        if (onBack) onBack();
      }
    });
    return () => unsubscribe();
  }, [onBack]);

  return (
    <div
      style={{
        width: '100vw',
        minHeight: '100vh',
        height: '100vh',
        background: '#030712',
        backgroundImage: 'radial-gradient(ellipse at 50% 20%, rgba(0, 243, 255, 0.04) 0%, rgba(4, 9, 22, 0.98) 70%, #030712 100%)',
        overflowY: 'auto',
        overflowX: 'hidden',
        position: 'relative'
      }}
    >
      {/* Sticky Top Header Bar */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'rgba(3, 7, 18, 0.97)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(0, 243, 255, 0.15)',
          padding: '14px 32px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}
      >
        <button
          onClick={() => { if (onBack) onBack(); }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 16px',
            background: 'transparent',
            border: '1px solid rgba(0, 243, 255, 0.35)',
            color: 'var(--cyan-glow)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            letterSpacing: '0.12em',
            cursor: 'pointer',
            borderRadius: '3px',
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0, 243, 255, 0.08)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
        >
          <ArrowLeft size={14} />
          BACK TO ARENA
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <BookOpen size={18} color="var(--cyan-glow)" />
          <span
            style={{
              fontFamily: 'var(--font-title)',
              fontSize: '1rem',
              color: '#ffffff',
              letterSpacing: '0.14em',
              textShadow: '0 0 14px var(--cyan-glow)'
            }}
          >
            LAYER 03 — MANUAL QUESTIONS
          </span>
          <ChevronRight size={14} color="#6b7280" />
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.72rem',
              color: '#9ca3af',
              letterSpacing: '0.1em'
            }}
          >
            {problems.length} PROBLEMS
          </span>
        </div>
      </div>

      {/* Sequentially Ordered Scrollable Questions List */}
      <main
        style={{
          maxWidth: '920px',
          margin: '0 auto',
          padding: '28px 24px 80px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}
      >
        {problems.map((problem) => (
          <QuestionCard key={problem.id} problem={problem} />
        ))}
      </main>
    </div>
  );
}
