import React, { useEffect, useRef } from 'react';
import hulkGlb from '../../assets/new_hulk_animated_smooth_stationary_final.glb?url';

function Hulk3D({ className = '', style = {}, onAnimationEnd, playing = false, onModelReady }) {
  const viewerRef = useRef(null);
  const onModelReadyRef = useRef(onModelReady);
  useEffect(() => { onModelReadyRef.current = onModelReady; }, [onModelReady]);

  // Pre-warm the HTTP cache as early as possible so model-viewer gets a cache hit
  // instead of triggering a synchronous parse during the fall animation.
  useEffect(() => {
    fetch(hulkGlb, { mode: 'no-cors' }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!document.querySelector('script#model-viewer-script')) {
      const script = document.createElement('script');
      script.id = 'model-viewer-script';
      script.type = 'module';
      script.src = 'https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js';
      document.head.appendChild(script);
    }
  }, []);

  // On model load: immediately pause so the GLB does NOT play during the fall.
  // Also signal the parent that the model is ready to start the sequence.
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    const handleLoad = () => {
      viewer.pause();
      viewer.currentTime = 0;
      if (onModelReadyRef.current) onModelReadyRef.current();
    };
    viewer.addEventListener('load', handleLoad);
    if (viewer.loaded) {
      viewer.pause();
      viewer.currentTime = 0;
      if (onModelReadyRef.current) onModelReadyRef.current();
    }
    return () => viewer.removeEventListener('load', handleLoad);
  }, []);

  // Diagnostics removed for final fix.

  // When playing becomes true (Hulk reached impact position), start the GLB animation
  useEffect(() => {
    const viewer = viewerRef.current;
    let rafId;
    let exitFired = false;

    if (playing && viewer) {
      viewer.play();

      // JUMP_UP_TIME: ~50% through the jump-up portion of the GLB.
      // Jump starts at ~4.1s, animation ends at ~5.13s (window = ~1.03s).
      // Midpoint: 4.1 + 0.515 ≈ 4.6s.
      const JUMP_UP_TIME = 4.6;

      const checkTime = () => {
        const duration = viewer.duration || 5.13;

        // Fire the upward exit as soon as Hulk begins his jump-up
        if (!exitFired && viewer.currentTime >= JUMP_UP_TIME) {
          exitFired = true;
          if (onAnimationEnd) onAnimationEnd();
          // Keep the rAF loop alive until animation finishes so we can pause cleanly
        }

        // Pause the viewer at the very end of the animation
        if (viewer.currentTime >= duration - 0.05) {
          viewer.pause();
          return; // stop the loop
        }

        rafId = requestAnimationFrame(checkTime);
      };

      rafId = requestAnimationFrame(checkTime);
    }

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [playing, onAnimationEnd]);

  return (
    <div className={`bomb-component ${className}`} style={{ width: 950, height: 950, transform: 'translateX(-35px)', pointerEvents: 'none', overflow: 'visible', ...style }}>
      <model-viewer
        ref={viewerRef}
        src={hulkGlb}
        scale="0.45 0.45 0.45"
        autoplay
        animation-name="animation-sequence"
        style={{ width: '100%', height: '100%', pointerEvents: 'none', cursor: 'default' }}
        camera-controls="false"
        disable-zoom="true"
        shadow-intensity="1"
        field-of-view="30deg"
        min-field-of-view="30deg"
        max-field-of-view="30deg"
        camera-orbit="0deg 90deg 222%"
        min-camera-orbit="0deg 90deg 222%"
        max-camera-orbit="0deg 90deg 222%"
        interaction-prompt="none"
      ></model-viewer>
    </div>
  );
}

export default Hulk3D;
