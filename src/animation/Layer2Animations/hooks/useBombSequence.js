import { useState, useEffect, useRef } from 'react';

export function useBombSequence(onJumble) {
  const [animPhase, setAnimPhase] = useState('falling');
  const onJumbleRef = useRef(onJumble);

  // Keep ref updated to avoid stale closures if onJumble changes,
  // without triggering the effect to re-run.
  useEffect(() => {
    onJumbleRef.current = onJumble;
  }, [onJumble]);

  useEffect(() => {
    // 0ms: falling (initial state)
    
    // 1400ms: impact
    const timer1 = setTimeout(() => {
      setAnimPhase('impact');
    }, 1400);

    // 1700ms: explosion (trigger FLIP logic immediately)
    const timer2 = setTimeout(() => {
      setAnimPhase('explosion');
      if (onJumbleRef.current) {
        onJumbleRef.current();
      }
    }, 1700);

    // 2400ms: jumbling (advance state)
    const timer3 = setTimeout(() => {
      setAnimPhase('jumbling');
    }, 2400);

    // 3300ms: cleanup
    const timer4 = setTimeout(() => {
      setAnimPhase('cleanup');
    }, 3300);

    // 3800ms: done
    const timer5 = setTimeout(() => {
      setAnimPhase('done');
    }, 3800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
    };
  }, []); // Run exactly once on mount

  return animPhase;
}
