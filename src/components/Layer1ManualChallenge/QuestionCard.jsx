import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';
import OptionSelector from './OptionSelector';

export default function QuestionCard({
  question,
  currentIndex,
  totalQuestions,
  selectedOption,
  onSelectOption,
  answeredQuestionsMap,
  disabled = false,
  feedbackState = 'idle' // 'idle' | 'processing' | 'revealed'
}) {
  if (!question) return null;

  const isRevealed = feedbackState === 'revealed';
  const isProcessing = feedbackState === 'processing';
  const isCorrectAnswer = isRevealed && selectedOption === question.correct_answer;

  return (
    <motion.div
      key={question.id || currentIndex}
      initial={{ opacity: 0, x: 25 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -25 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        justifyContent: 'space-between',
        gap: '16px'
      }}
    >
      {/* Top Question Header & Progress Bar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Question Index Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '1rem',
                fontWeight: 900,
                color: 'var(--cyan-glow)',
                letterSpacing: '0.08em'
              }}
            >
              QUESTION {String(currentIndex + 1).padStart(2, '0')} / {String(totalQuestions).padStart(2, '0')}
            </span>

            {/* Clean Neutral Mode Badge - No internal scoring or difficulty exposed */}
            <span
              className="cyber-badge"
              style={{
                fontSize: '0.68rem',
                padding: '2px 8px',
                background: 'rgba(0, 243, 255, 0.1)',
                borderColor: 'var(--cyan-glow)',
                color: 'var(--cyan-glow)'
              }}
            >
              TECHNICAL QUESTION
            </span>

            {/* Live Feedback Indicator */}
            {isProcessing && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.72rem',
                  color: 'var(--cyan-glow)',
                  animation: 'pulse 1s infinite'
                }}
              >
                <Clock size={13} className="animate-spin" />
                VERIFYING...
              </span>
            )}
            {isRevealed && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  color: isCorrectAnswer ? 'var(--lime-accent)' : '#ef4444'
                }}
              >
                {isCorrectAnswer ? (
                  <>
                    <CheckCircle2 size={14} color="var(--lime-accent)" />
                    CORRECT
                  </>
                ) : (
                  <>
                    <XCircle size={14} color="#ef4444" />
                    INCORRECT
                  </>
                )}
              </span>
            )}
          </div>

          {/* 15 Visual Progress Dots */}
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            {Array.from({ length: totalQuestions }).map((_, i) => {
              const isAnswered = answeredQuestionsMap && answeredQuestionsMap[i] !== undefined;
              const isCurrent = i === currentIndex;

              return (
                <div
                  key={i}
                  style={{
                    width: isCurrent ? '12px' : '8px',
                    height: isCurrent ? '12px' : '8px',
                    borderRadius: '50%',
                    background: isCurrent
                      ? 'var(--cyan-glow)'
                      : isAnswered
                      ? 'var(--lime-accent)'
                      : 'rgba(255, 255, 255, 0.15)',
                    boxShadow: isCurrent ? '0 0 10px var(--cyan-glow)' : 'none',
                    transition: 'all 0.25s ease'
                  }}
                  title={`Question ${i + 1}`}
                />
              );
            })}
          </div>
        </div>

        {/* Horizontal Progress Meter */}
        <div
          style={{
            width: '100%',
            height: '3px',
            background: 'rgba(255, 255, 255, 0.08)',
            borderRadius: '2px',
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              width: `${((currentIndex + 1) / totalQuestions) * 100}%`,
              height: '100%',
              background: 'linear-gradient(90deg, var(--cyan-glow) 0%, var(--lime-accent) 100%)',
              transition: 'width 0.4s ease'
            }}
          />
        </div>
      </div>

      {/* Main Question Body Area */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '20px 24px',
          background: 'rgba(2, 6, 22, 0.9)',
          border: '1px solid rgba(0, 243, 255, 0.2)',
          borderRadius: '4px',
          boxShadow: 'inset 0 0 30px rgba(0, 243, 255, 0.04)',
          gap: '12px'
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '1.08rem',
            lineHeight: 1.55,
            color: '#f3f4f6',
            fontWeight: 600
          }}
        >
          {question.question}
        </div>

        {question.code && (
          <pre
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.92rem',
              lineHeight: 1.45,
              color: 'var(--cyan-glow)',
              background: 'rgba(0, 0, 0, 0.65)',
              border: '1px solid rgba(0, 243, 255, 0.25)',
              borderRadius: '4px',
              padding: '12px 16px',
              margin: 0,
              overflowX: 'auto',
              whiteSpace: 'pre-wrap'
            }}
          >
            <code>{question.code}</code>
          </pre>
        )}
      </div>

      {/* 4 Options Selector */}
      <div style={{ flexShrink: 0 }}>
        <OptionSelector
          options={question.options}
          selectedOption={selectedOption}
          onSelectOption={onSelectOption}
          disabled={disabled || isProcessing || isRevealed}
          feedbackState={feedbackState}
          correctAnswer={question.correct_answer}
        />
      </div>
    </motion.div>
  );
}
