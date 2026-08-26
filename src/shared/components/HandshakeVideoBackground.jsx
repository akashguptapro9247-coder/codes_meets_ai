import React, { useRef, useEffect } from 'react';

export default function HandshakeVideoBackground() {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Ensure completely muted and volume zero
    video.muted = true;
    video.volume = 0;

    // Force autoplay on load
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch((error) => {
        console.warn('Autoplay prevented or failed:', error);
      });
    }
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        zIndex: 0,
        backgroundColor: '#030712'
      }}
    >
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        poster="/assets/handshake-bg.jpg"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center 45%', // Keep handshake focused in center
          transition: 'opacity 0.8s ease-in-out',
          opacity: 0.95
        }}
      >
        <source src="/assets/code-meets-ai-handshake.mp4" type="video/mp4" />
        <source src="/vedios/Human_and_robotic_hand_handshake_202608161113.mp4" type="video/mp4" />
        Your browser does not support HTML5 video background.
      </video>
    </div>
  );
}
