import React from 'react';

export default function VideoOverlay() {
  return (
    <>
      {/* Light transparent tint for text contrast without blocking center image */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1,
          pointerEvents: 'none',
          background: 'rgba(3, 7, 18, 0.35)',
          backdropFilter: 'contrast(1.02)'
        }}
      />

      {/* Cinematic Radial Vignette to preserve original dark edge framing */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1,
          pointerEvents: 'none',
          background: `
            radial-gradient(circle at center, transparent 35%, rgba(3, 7, 18, 0.7) 80%, rgba(3, 7, 18, 0.95) 100%),
            linear-gradient(180deg, rgba(3, 7, 18, 0.5) 0%, transparent 25%, transparent 75%, rgba(3, 7, 18, 0.6) 100%)
          `
        }}
      />
    </>
  );
}
