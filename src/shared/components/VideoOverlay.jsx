import React from 'react';

export default function VideoOverlay() {
  return (
    <>
      {/* Dark Transparent Overlay to ensure high text contrast */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1,
          pointerEvents: 'none',
          background: 'rgba(3, 7, 18, 0.28)',
          backdropFilter: 'contrast(1.02) brightness(1.02)'
        }}
      />

      {/* Radial Vignette & Gradient for Cinematic Depth */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1,
          pointerEvents: 'none',
          background: `
            radial-gradient(circle at center, transparent 45%, rgba(3, 7, 18, 0.55) 85%, rgba(3, 7, 18, 0.88) 100%),
            linear-gradient(180deg, rgba(3, 7, 18, 0.4) 0%, transparent 25%, transparent 75%, rgba(3, 7, 18, 0.5) 100%)
          `
        }}
      />
    </>
  );
}
