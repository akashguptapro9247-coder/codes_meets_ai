import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Circle } from 'lucide-react';
import { soundEngine } from '../../shared/utils/SoundEngine';
import { OptionWebOverlay } from '../../animation/SpiderMan/OptionWebOverlay';

export default function OptionSelector({
  options,
  selectedOption,
  onSelectOption,
  disabled = false,
  feedbackState = 'idle', // 'idle' | 'processing' | 'revealed'
  correctAnswer = null,
  spiderState
}) {
  const optionKeys = ['A', 'B', 'C', 'D'];
  const isRevealed = feedbackState === 'revealed';
  const isProcessing = feedbackState === 'processing';

  // Latch the web hit so it persists after IMPACT
  const [hitKey, setHitKey] = React.useState(null);

  React.useEffect(() => {
    if (spiderState === 'IMPACT' && selectedOption) {
      setHitKey(selectedOption);
    }
  }, [spiderState, selectedOption]);

  React.useEffect(() => {
    if (feedbackState === 'idle') {
      setHitKey(null);
    }
  }, [feedbackState]);

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
        gap: '14px',
        width: '100%'
      }}
    >
      {optionKeys.map((key) => {
        const optionText = options?.[key];
        if (!optionText) return null;

        const isSelected = selectedOption === key;
        const isCorrect = isRevealed && key === correctAnswer;
        const isWrongSelected = isRevealed && isSelected && key !== correctAnswer;
        const isOtherWhenRevealed = isRevealed && !isCorrect && !isWrongSelected;

        // Visual Styling Calculation
        let background = 'rgba(3, 8, 24, 0.85)';
        let border = '1px solid rgba(0, 243, 255, 0.2)';
        let boxShadow = '0 4px 15px rgba(0, 0, 0, 0.4)';
        let badgeBg = 'rgba(0, 243, 255, 0.12)';
        let badgeBorder = 'rgba(0, 243, 255, 0.35)';
        let badgeColor = 'var(--cyan-glow)';
        let textColor = '#d1d5db';
        let iconColor = 'rgba(255, 255, 255, 0.2)';
        let opacity = 1;

        if (isRevealed) {
          if (isCorrect) {
            background = 'linear-gradient(135deg, rgba(57, 255, 20, 0.22) 0%, rgba(2, 24, 8, 0.95) 100%)';
            border = '2px solid var(--lime-accent)';
            boxShadow = '0 0 30px rgba(57, 255, 20, 0.4), inset 0 0 15px rgba(57, 255, 20, 0.18)';
            badgeBg = 'var(--lime-accent)';
            badgeBorder = 'var(--lime-accent)';
            badgeColor = '#021204';
            textColor = '#ffffff';
            iconColor = 'var(--lime-accent)';
          } else if (isWrongSelected) {
            background = 'linear-gradient(135deg, rgba(239, 68, 68, 0.25) 0%, rgba(26, 4, 8, 0.95) 100%)';
            border = '2px solid #ef4444';
            boxShadow = '0 0 30px rgba(239, 68, 68, 0.4), inset 0 0 15px rgba(239, 68, 68, 0.18)';
            badgeBg = '#ef4444';
            badgeBorder = '#ef4444';
            badgeColor = '#ffffff';
            textColor = '#ffffff';
            iconColor = '#ef4444';
          } else if (isOtherWhenRevealed) {
            opacity = 0.35;
            background = 'rgba(3, 8, 24, 0.4)';
            border = '1px solid rgba(255, 255, 255, 0.08)';
            textColor = '#6b7280';
          }
        } else if (isSelected) {
          background = 'linear-gradient(135deg, rgba(0, 243, 255, 0.22) 0%, rgba(2, 8, 28, 0.95) 100%)';
          border = '2px solid var(--cyan-glow)';
          boxShadow = '0 0 25px rgba(0, 243, 255, 0.35), inset 0 0 15px rgba(0, 243, 255, 0.15)';
          badgeBg = 'var(--cyan-glow)';
          badgeBorder = 'var(--cyan-glow)';
          badgeColor = '#000000';
          textColor = '#ffffff';
          iconColor = 'var(--cyan-glow)';
        }

        const isClickable = !disabled && !isProcessing && !isRevealed;

        return (
          <motion.button
            key={key}
            type="button"
            disabled={!isClickable}
            whileHover={isClickable ? { scale: 1.015, y: -2 } : {}}
            whileTap={isClickable ? { scale: 0.985 } : {}}
            onClick={(e) => {
              if (!isClickable) return;
              soundEngine.playClick();
              const rect = e.currentTarget.getBoundingClientRect();
              onSelectOption(key, rect);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 20px',
              background,
              border,
              boxShadow,
              borderRadius: '4px',
              cursor: isClickable ? 'pointer' : 'not-allowed',
              textAlign: 'left',
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              overflow: 'hidden',
              opacity
            }}
          >
            {/* Left Side: Option Key Badge & Text */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '3px',
                  background: badgeBg,
                  border: `1px solid ${badgeBorder}`,
                  color: badgeColor,
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.88rem',
                  fontWeight: 900,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'all 0.25s ease'
                }}
              >
                {key}
              </div>

              <span
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.92rem',
                  fontWeight: isSelected || isCorrect ? 700 : 500,
                  color: textColor,
                  lineHeight: 1.4,
                  wordBreak: 'break-word',
                  transition: 'color 0.25s ease'
                }}
              >
                {optionText}
              </span>
            </div>

            {/* Right Side: Status / Selection Icon */}
            <div style={{ marginLeft: '12px', flexShrink: 0, color: iconColor }}>
              {isRevealed ? (
                isCorrect ? (
                  <CheckCircle2 size={22} color="var(--lime-accent)" />
                ) : isWrongSelected ? (
                  <XCircle size={22} color="#ef4444" />
                ) : (
                  <Circle size={20} />
                )
              ) : isSelected ? (
                <CheckCircle2 size={20} />
              ) : (
                <Circle size={20} />
              )}
            </div>

            {/* Glowing Corner Accents */}
            {(isSelected || isCorrect || isWrongSelected) && (
              <>
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '6px',
                    height: '6px',
                    backgroundColor: isRevealed
                      ? isCorrect
                        ? 'var(--lime-accent)'
                        : '#ef4444'
                      : 'var(--cyan-glow)'
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '6px',
                    height: '6px',
                    backgroundColor: isRevealed
                      ? isCorrect
                        ? 'var(--lime-accent)'
                        : '#ef4444'
                      : 'var(--cyan-glow)'
                  }}
                />
              </>
            )}

            {/* Spider-Man Web Overlay (Finalized Implementation) */}
            <OptionWebOverlay isVisible={hitKey === key} />
          </motion.button>
        );
      })}
    </div>
  );
}
