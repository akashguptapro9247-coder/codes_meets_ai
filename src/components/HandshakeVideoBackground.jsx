import React, { useRef, useEffect } from 'react';

export default function HandshakeVideoBackground() {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Ensure completely muted and volume zero
    video.muted = true;
    video.volume = 0;

    // Automatically freeze on the final frame when video ends
    const handleEnded = () => {
      video.pause();
    };

    video.addEventListener('ended', handleEnded);

    // Play once from beginning if not ended
    if (!video.ended) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.warn('Autoplay prevented or failed:', error);
        });
      }
    } else {
      video.pause();
    }

    return () => {
      video.removeEventListener('ended', handleEnded);
    };
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
        playsInline
        poster="/assets/handshake-bg.jpg"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center 45%', // Keep handshake focused in center
          transition: 'opacity 0.8s ease-in-out, filter 0.8s ease-in-out',
          opacity: 1.0,
          filter: 'brightness(1.08) contrast(1.04)'
        }}
      >
        <source src="/assets/code-meets-ai-handshake.mp4" type="video/mp4" />
        <source src="/vedios/Human_and_robotic_hand_handshake_202608161113.mp4" type="video/mp4" />
        Your browser does not support HTML5 video background.
      </video>
    </div>
  );
}
