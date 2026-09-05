import React from 'react';
import Bomb from './Bomb';
import Explosion from './Explosion';
import { useBombSequence } from '../hooks/useBombSequence';
import { useImpactPosition, useFlipJumble } from '../hooks';

/**
 * BombSequence — self-contained bomb + explosion animation orchestrator.
 *
 * Renders the fixed-viewport animation layer (bomb fall, impact, explosion)
 * and:
 *  - Applies anim-impact-shake to the .challenge-container (codeBoxRef) on impact
 *  - Applies anim-line-impact-shake to all .code-line-item elements on impact+explosion
 *  - Triggers FLIP code-line jumbling (via useFlipJumble) at the correct moment
 *
 * Props:
 *   codeBoxRef        {React.RefObject}  Ref to .challenge-container (impact target + shake)
 *   lineContainerRef  {React.RefObject}  Ref to .line-list (FLIP + line shake)
 *   onJumble          {Function}         Calls setLines(FINAL_JUMBLED_LINES) in parent
 *   finalLines        {Array}            The jumbled lines — FLIP triggers when this changes
 */
export function BombSequence({
  codeBoxRef,
  lineContainerRef,
  onJumble,
  finalLines,
}) {
  // ── Impact position (measured from codeBoxRef, updates on resize) ───────────
  const impactPos = useImpactPosition(codeBoxRef);

  // ── FLIP animation: recordFirstPositions must fire BEFORE setLines ──────────
  const { recordFirstPositions } = useFlipJumble({
    lineContainerRef,
    lines: finalLines,
  });

  // Use refs to avoid stale closures in wrappedOnJumble
  const onJumbleRef     = React.useRef(null);
  const recordRef       = React.useRef(null);
  onJumbleRef.current   = onJumble;
  recordRef.current     = recordFirstPositions;

  // Intercept onJumble to record FIRST positions before state update triggers DOM change
  const wrappedOnJumble = React.useCallback(() => {
    if (recordRef.current) recordRef.current();   // FLIP Step 1: capture current positions
    if (onJumbleRef.current) onJumbleRef.current(); // triggers setLines → DOM update → FLIP runs
  }, []);

  // ── Animation phase sequence ─────────────────────────────────────────────────
  const animPhase = useBombSequence(wrappedOnJumble);

  // ── Apply shake classes directly to DOM elements (self-contained) ────────────
  React.useEffect(() => {
    const container  = codeBoxRef?.current;
    const lineList   = lineContainerRef?.current;

    if (animPhase === 'impact') {
      // Shake the challenge container box
      if (container) {
        container.classList.add('anim-impact-shake');
        const remove = () => container.classList.remove('anim-impact-shake');
        container.addEventListener('animationend', remove, { once: true });
      }
      // Shake each code line
      if (lineList) {
        const items = lineList.querySelectorAll('.code-line-item');
        items.forEach((el) => {
          el.classList.add('anim-line-impact-shake');
          const remove = () => el.classList.remove('anim-line-impact-shake');
          el.addEventListener('animationend', remove, { once: true });
        });
      }
    }
  }, [animPhase, codeBoxRef, lineContainerRef]);

  // ── Derived visibility flags ─────────────────────────────────────────────────
  const isAnimating   = animPhase !== 'done';
  const showBomb      = animPhase === 'falling' || animPhase === 'impact';
  const showExplosion = animPhase === 'explosion' || animPhase === 'jumbling' || animPhase === 'cleanup';

  return (
    <>
      {/* Fixed viewport overlay for bomb + explosion ─────────────────────────── */}
      {isAnimating && (
        <div
          className="anim-bomb-layer"
          style={impactPos ? {
            '--impact-x': `${impactPos.x}px`,
            '--impact-y': `${impactPos.y}px`,
          } : {}}
        >
          {/* Falling / squash-impact bomb */}
          {showBomb && (
            <div className={`anim-bomb-wrapper ${animPhase === 'impact' ? 'impact' : animPhase}`}>
              <Bomb />
            </div>
          )}

          {/* Explosion visual layers */}
          <Explosion animPhase={animPhase} />
        </div>
      )}
    </>
  );
}

export default BombSequence;