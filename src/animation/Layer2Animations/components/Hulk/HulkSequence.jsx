import React from 'react';
import { createPortal } from 'react-dom';
import Hulk3D from './Hulk3D';
import HulkEffects from './HulkEffects';
import { useHulkSequence } from '../../hooks/useHulkSequence';
import { useImpactPosition, useFlipJumble } from '../../hooks';

/**
 * HulkSequence — self-contained Hulk animation orchestrator.
 */
export function HulkSequence({
  codeBoxRef,
  lineContainerRef,
  onJumble,
  lines,
  finalLines,
  onSequenceDone,
}) {
  // Impact position (measured from codeBoxRef, updates on resize)
  const impactPos = useImpactPosition(codeBoxRef);

  // FLIP animation: recordFirstPositions must fire BEFORE setLines
  const { recordFirstPositions } = useFlipJumble({
    lineContainerRef,
    lines: lines,
  });

  // Use refs to avoid stale closures in wrappedOnJumble
  const onJumbleRef = React.useRef(null);
  const recordRef = React.useRef(null);
  onJumbleRef.current = onJumble;
  recordRef.current = recordFirstPositions;

  const wrappedOnJumble = React.useCallback(() => {
    if (recordRef.current) recordRef.current();
    if (onJumbleRef.current) onJumbleRef.current();
  }, []);

  // modelReady: true once model-viewer fires its 'load' event.
  // The fall animation and sequence timers are gated on this to avoid
  // racing with the GLB parse that causes frame drops on first load.
  const [modelReady, setModelReady] = React.useState(false);

  // Animation phase sequence — only starts ticking once the model is ready
  const { animPhase, setAnimPhase } = useHulkSequence(wrappedOnJumble, modelReady);

  const [extendedDone, setExtendedDone] = React.useState(false);
  const [hulkExiting, setHulkExiting] = React.useState(false);

  React.useEffect(() => {
    if (animPhase === 'done') {
      const t = setTimeout(() => setExtendedDone(true), 10000);
      return () => clearTimeout(t);
    }
  }, [animPhase]);

  // Fire onSequenceDone as soon as the animation phase is done.
  // extendedDone is only for keeping the cracks portal alive — it must NOT delay
  // the parent's hover-enable state or any post-Hulk UI features.
  const onSequenceDoneRef = React.useRef(onSequenceDone);
  React.useEffect(() => { onSequenceDoneRef.current = onSequenceDone; }, [onSequenceDone]);
  React.useEffect(() => {
    if (animPhase === 'done') {
      if (onSequenceDoneRef.current) onSequenceDoneRef.current();
    }
  }, [animPhase]);

  // Disable interaction on the code-line boxes while Hulk is actively animating
  React.useEffect(() => {
    const el = lineContainerRef?.current;
    if (el) {
      if (animPhase !== 'done') {
        el.classList.add('hulk-animating-lines');
      } else {
        el.classList.remove('hulk-animating-lines');
      }
    }
    return () => {
      if (el) el.classList.remove('hulk-animating-lines');
    };
  }, [animPhase, lineContainerRef]);

  const handleHulkAnimationEnd = React.useCallback(() => {
    setHulkExiting(true);
    setAnimPhase('done');
  }, [setAnimPhase]);

  const isAnimating = animPhase !== 'done' || !extendedDone;
  
  // The falling animation starts immediately
  const isHulkPlaying = animPhase !== 'falling';

  return (
    <>
      <style>{`
        /* Prevent interaction on individual line boxes during Hulk animation */
        .hulk-animating-lines .anim-target-line {
          pointer-events: none !important;
        }

        /* Prevent scrolling on Stage 1 and Stage 3 left containers during Hulk animation */
        .stage-1-scroll.hulk-animating-lines,
        .stage-3-scroll.hulk-animating-lines {
          overflow: hidden !important;
        }

        .anim-hulk-wrapper {
          position: absolute;
          top: var(--impact-y, 40%);
          left: var(--impact-x, 50%);
          transform: translate(-50%, -50%);
          z-index: 1002;
          will-change: transform;
        }

        .anim-hulk-wrapper.falling {
          animation: animHulkFall 1.4s cubic-bezier(0.55, 0.085, 0.68, 0.53) forwards;
        }

        .anim-hulk-wrapper.hulk-exiting {
          animation: animHulkExit 1.05s cubic-bezier(0.45, 0, 0.55, 1) forwards;
          pointer-events: none;
        }

        @keyframes animHulkFall {
          0% {
            top: -150vh;
            left: var(--impact-x, 50%);
            transform: translate(-50%, 0) rotate(-16deg) scale(0.85);
            opacity: 0;
          }
          15% { opacity: 1; }
          60% {
            left: var(--impact-x, 50%);
            transform: translate(-50%, 0) rotate(12deg) scale(0.95);
          }
          85% {
            left: var(--impact-x, 50%);
            transform: translate(-50%, 0) rotate(-6deg) scale(1);
          }
          100% {
            top: var(--impact-y, 40%);
            left: var(--impact-x, 50%);
            transform: translate(-50%, -50%) rotate(0deg) scale(1);
            opacity: 1;
          }
        }

        @keyframes animHulkExit {
          0% {
            top: var(--impact-y, 40%);
            left: var(--impact-x, 50%);
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
          85% { opacity: 1; }
          100% {
            top: -400px;
            left: var(--impact-x, 50%);
            transform: translate(-50%, -50%) scale(1);
            opacity: 0;
          }
        }

        /* Fixed viewport overlay */
        .anim-hulk-layer {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          z-index: 1000;
          pointer-events: none;
          overflow: hidden;
        }
      `}</style>

      {/* Fixed viewport overlay for Hulk */}
      {createPortal(
        <div
          className="anim-hulk-layer"
          style={impactPos ? {
            '--impact-x': `${impactPos.x}px`,
            // Omit --impact-y to restore the original 40% fallback behavior which
            // correctly positioned the Hulk vertically before the recent changes.
          } : {}}
        >
          {/* Falling / Exiting / Stationary Hulk */}
          {isAnimating && (
            <div
              className={`anim-hulk-wrapper ${
                // Only apply .falling once the model is loaded — otherwise the CSS
                // animation races against the GLB parse and skips visible fall frames.
                (modelReady && animPhase === 'falling') ? 'falling' :
                hulkExiting ? 'hulk-exiting' : ''
              }`}
              style={modelReady ? undefined : { visibility: 'hidden' }}
            >
              <Hulk3D
                onAnimationEnd={handleHulkAnimationEnd}
                playing={isHulkPlaying}
                onModelReady={() => setModelReady(true)}
              />
            </div>
          )}

          <HulkEffects isPlaying={isAnimating} codeBoxRef={codeBoxRef} animPhase={animPhase} impactPos={impactPos} />
        </div>,
        document.body
      )}
    </>
  );
}

export default HulkSequence;
