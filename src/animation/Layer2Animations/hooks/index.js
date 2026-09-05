import { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';

// Re-export useBombSequence from its own file for clean imports
export { useBombSequence } from './useBombSequence';

/**
 * Hook for managing impact position from a target element.
 * Updates on mount and window resize.
 *
 * @param {React.RefObject} targetRef - Ref to the element to measure
 * @returns {{ x: number, y: number } | null}
 */
export function useImpactPosition(targetRef) {
  const [impactPos, setImpactPos] = useState(null);

  useLayoutEffect(() => {
    const updateImpactPos = () => {
      if (targetRef.current) {
        const rect = targetRef.current.getBoundingClientRect();
        return {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2
        };
      }
      return null;
    };

    const pos = updateImpactPos();
    if (pos) setImpactPos(pos);

    const handleResize = () => {
      const p = updateImpactPos();
      if (p) setImpactPos(p);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [targetRef]);

  return impactPos;
}

/**
 * Hook for container impact shake animation.
 * Returns the CSS class to apply when animPhase === 'impact'.
 *
 * @param {string} animPhase
 * @returns {string}
 */
export function useContainerImpactShake(animPhase) {
  return animPhase === 'impact' ? 'anim-impact-shake' : '';
}

/**
 * Hook for code line impact shake animation.
 * Returns the CSS class to apply during impact and explosion phases.
 *
 * @param {string} animPhase
 * @returns {string}
 */
export function useLineImpactShake(animPhase) {
  return (animPhase === 'impact' || animPhase === 'explosion') ? 'anim-line-impact-shake' : '';
}

/**
 * Hook for FLIP (First, Last, Invert, Play) animation of code line reordering.
 *
 * Usage:
 *   const { recordFirstPositions } = useFlipJumble({ lineContainerRef, lines });
 *
 *   Call recordFirstPositions() synchronously BEFORE updating lines state.
 *   The hook will automatically detect the change in `lines` and run the animation.
 *
 * @param {Object} options
 * @param {React.RefObject} options.lineContainerRef - Ref to the container holding .code-line-item elements
 * @param {Array} options.lines - Current lines array (animation fires when this changes)
 * @param {Function} [options.onAnimationComplete] - Optional callback when animation finishes
 */
export function useFlipJumble({ lineContainerRef, lines, onAnimationComplete }) {
  const firstPositionsRef = useRef(null);

  // FLIP Steps 2, 3, 4: runs after React has committed the new lines order to the DOM
  useLayoutEffect(() => {
    if (!firstPositionsRef.current || !lineContainerRef.current) return;

    const firsts = firstPositionsRef.current;
    firstPositionsRef.current = null; // consume — prevents re-triggering for the same jumble

    const lineElements = Array.from(
      lineContainerRef.current.querySelectorAll('.anim-target-line')
    );

    if (lineElements.length === 0) return;

    // Step 2 & 3: Measure LAST positions and INVERT (offset to where elements were)
    lineElements.forEach((el) => {
      const id = el.getAttribute('data-line-id');
      if (id && firsts[id] !== undefined) {
        const lastTop = el.getBoundingClientRect().top;
        const deltaY = firsts[id] - lastTop;
        if (deltaY !== 0) {
          el.style.transition = 'none';
          el.style.transform = `translate(0, ${deltaY}px)`;
        }
      }
    });

    // Force synchronous reflow so browser registers the inverted offsets
    void document.body.offsetHeight;

    // Step 4 & 5: PLAY — double rAF guarantees frame 1 paints inverted offset before transition starts
    let raf1 = null;
    let raf2 = null;

    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        lineElements.forEach((el, index) => {
          const id = el.getAttribute('data-line-id');
          if (id) {
            el.style.transition = `transform 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) ${index * 35}ms, border-color 0.15s ease, background 0.15s ease`;
            el.style.transform = 'translate(0, 0)';
          }
        });
      });
    });

    // Step 6: Clean up inline transform and transition styles after all staggered line transitions complete
    const maxStaggerDelay = Math.max(0, (lineElements.length - 1) * 35);
    const totalDuration = 700 + maxStaggerDelay + 100;

    const cleanupTimer = setTimeout(() => {
      const elements = lineContainerRef.current?.querySelectorAll('.anim-target-line') || [];
      elements.forEach((el) => {
        el.style.transition = '';
        el.style.transform = '';
      });
      if (onAnimationComplete) onAnimationComplete();
    }, totalDuration);

    return () => {
      if (raf1) cancelAnimationFrame(raf1);
      if (raf2) cancelAnimationFrame(raf2);
      clearTimeout(cleanupTimer);
    };
  }, [lines]); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Call this BEFORE updating lines state to record the current (FIRST) positions.
   * Must be called synchronously before setLines().
   */
  const recordFirstPositions = useCallback(() => {
    if (!lineContainerRef.current) return;
    const lineElements = lineContainerRef.current.querySelectorAll('.anim-target-line');
    const firsts = {};
    lineElements.forEach((el) => {
      const id = el.getAttribute('data-line-id');
      if (id) {
        firsts[id] = el.getBoundingClientRect().top;
      }
    });
    firstPositionsRef.current = firsts;
  }, [lineContainerRef]);

  return { recordFirstPositions };
}