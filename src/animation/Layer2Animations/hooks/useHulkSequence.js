import { useState, useEffect, useRef } from 'react';

export function useHulkSequence(onJumble, ready = false) {
  const [animPhase, setAnimPhase] = useState('falling');
  const onJumbleRef = useRef(onJumble);

  useEffect(() => {
    onJumbleRef.current = onJumble;
  }, [onJumble]);

  useEffect(() => {
    if (!ready) return; // Don't start until the model is fully loaded

    // 0ms: falling — sequence starts now that the model is ready

    // 1400ms: impact (landing)
    const timer1 = setTimeout(() => {
      setAnimPhase('impact');
    }, 1400);

    // 5100ms: punch (trigger FLIP logic)
    const timer2 = setTimeout(() => {
      setAnimPhase('punch');
      if (onJumbleRef.current) {
        onJumbleRef.current();
      }
    }, 5100);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [ready]); // Fires exactly once when ready transitions to true

  return { animPhase, setAnimPhase };
}
