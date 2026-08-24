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
          background: 'rgba(3, 7, 18, 0.45)',
          backdropFilter: 'contrast(1.05) brightness(0.95)'
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
            radial-gradient(circle at center, transparent 35%, rgba(3, 7, 18, 0.75) 80%, rgba(3, 7, 18, 0.95) 100%),
            linear-gradient(180deg, rgba(3, 7, 18, 0.6) 0%, transparent 25%, transparent 75%, rgba(3, 7, 18, 0.7) 100%)
          `
        }}
      />
    </>
  );
}
