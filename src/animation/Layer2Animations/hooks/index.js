import { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';

// Re-export useHulkSequence from its own file for clean imports
export { useHulkSequence } from './useHulkSequence';

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
    if (pos) {
      setImpactPos(pos);
    } else {
      // If ref is not yet populated during the first layout effect, try again next frame
      requestAnimationFrame(() => {
        const p = updateImpactPos();
        if (p) setImpactPos(p);
      });
    }

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

    // Step 2: Measure ALL LAST positions first (READ phase - prevents layout thrashing)
    const lastPositions = {};
    lineElements.forEach((el) => {
      const id = el.getAttribute('data-line-id');
      if (id && firsts[id] !== undefined) {
        lastPositions[id] = el.offsetTop;
      }
    });

    // Step 3: INVERT (WRITE phase).
    // Also set will-change: transform on each element here so the browser can promote
    // every line to its own GPU compositor layer BEFORE the parent's hulk-punch-shake
    // CSS animation claims the compositing context. This lets each line animate on the
    // compositor thread independently, preventing the parent shake from forcing a
    // full CPU repaint of the subtree every frame.
    lineElements.forEach((el) => {
      const id = el.getAttribute('data-line-id');
      el.style.willChange = 'transform'; // promote to own layer NOW, before transition
      if (id && firsts[id] !== undefined && lastPositions[id] !== undefined) {
        const deltaY = firsts[id] - lastPositions[id];
        if (deltaY !== 0) {
          el.style.transition = 'none';
          el.style.transform = `translate(0, ${deltaY}px)`;
        }
      }
    });

    // Force browser to register the inverted transforms before transitions play.
    // We only need a style flush (not a full layout), so read computedStyle of
    // one element — far cheaper than void document.body.offsetHeight which forces
    // a full-document layout recalculation at the busiest frame (concurrent with
    // flushSync particle creation and hulk-punch-shake starting).
    void getComputedStyle(lineElements[0]).getPropertyValue('transform');

    // Step 4 & 5: PLAY — double rAF guarantees frame 1 paints inverted position before transition starts
    let raf1 = null;
    let raf2 = null;

    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        lineElements.forEach((el, index) => {
          const id = el.getAttribute('data-line-id');
          if (id) {
            // 600ms duration so each box visibly travels its path (enough frames to follow).
            // 45ms stagger: all 6 boxes start within 225ms of each other, meaning all boxes
            // are simultaneously in-flight from ~225ms to ~600ms — 375ms of visible
            // simultaneous travel. Original used 700ms + 35ms stagger for the same reason.
            // translate3d(x,y,z) promotes to GPU compositor layer independent of parent.
            el.style.transition = `transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${index * 45}ms`;
            el.style.transform = 'translate3d(0, 0, 0)';
          }
        });
      });
    });

    // Step 6: Clean up inline styles after all staggered transitions complete
    const maxStaggerDelay = Math.max(0, (lineElements.length - 1) * 45);
    const totalDuration = 600 + maxStaggerDelay + 100;

    const cleanupTimer = setTimeout(() => {
      const elements = lineContainerRef.current?.querySelectorAll('.anim-target-line') || [];
      elements.forEach((el) => {
        el.style.transition = '';
        el.style.transform = '';
        el.style.willChange = ''; // release compositor layer after animation
      });
      if (onAnimationComplete) onAnimationComplete();
    }, totalDuration);

    return () => {
      if (raf1) cancelAnimationFrame(raf1);
      if (raf2) cancelAnimationFrame(raf2);
      clearTimeout(cleanupTimer);
      // Ensure will-change is cleaned up on unmount / re-render
      lineElements.forEach((el) => { el.style.willChange = ''; });
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
        firsts[id] = el.offsetTop;
      }
    });
    firstPositionsRef.current = firsts;
  }, [lineContainerRef]);

  return { recordFirstPositions };
}