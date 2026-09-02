import React, { useState, useRef, useEffect } from 'react';

const VIDEO_1_PATH = '/vedios/background_video-1.mp4';
const VIDEO_2_PATH = '/vedios/background_video-2.mp4';

export default function HandshakeVideoBackground() {
  const video1Ref = useRef(null);
  const video2Ref = useRef(null);

  const [activeVideo, setActiveVideo] = useState(1);
  const [video1Opacity, setVideo1Opacity] = useState(0.95);
  const [video2Opacity, setVideo2Opacity] = useState(0);

  useEffect(() => {
    const v1 = video1Ref.current;
    const v2 = video2Ref.current;

    if (v1) {
      v1.muted = true;
      v1.volume = 0;
      v1.play().catch((err) => console.warn('V1 play prevented:', err));
    }

    if (v2) {
      v2.muted = true;
      v2.volume = 0;
      // Preload video2 so it's ready for instant, seamless playback
      v2.load();
    }
  }, []);

  const handleVideo1Ended = () => {
    const v2 = video2Ref.current;
    if (v2) {
      v2.currentTime = 0;
      v2.play().catch((err) => console.warn('V2 play prevented:', err));
    }
    // Initiate smooth 0.8s opacity crossfade transition
    setActiveVideo(2);
    setVideo2Opacity(0.95);
    setVideo1Opacity(0);
  };

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
      {/* Video 1: Plays once on load */}
      <video
        ref={video1Ref}
        autoPlay
        muted
        playsInline
        onEnded={handleVideo1Ended}
        poster="/assets/handshake-bg.jpg"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center 45%', // Keep handshake focused in center
          transition: 'opacity 0.8s ease-in-out',
          opacity: video1Opacity,
          pointerEvents: 'none',
          zIndex: activeVideo === 1 ? 2 : 1
        }}
      >
        <source src={VIDEO_1_PATH} type="video/mp4" />
        <source src="/assets/background_video-1.mp4" type="video/mp4" />
        Your browser does not support HTML5 video background.
      </video>

      {/* Video 2: Preloaded, crossfades in seamlessly on Video 1 end, loops indefinitely */}
      <video
        ref={video2Ref}
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
          opacity: video2Opacity,
          pointerEvents: 'none',
          zIndex: activeVideo === 2 ? 2 : 1
        }}
      >
        <source src={VIDEO_2_PATH} type="video/mp4" />
        <source src="/assets/background_video-2.mp4" type="video/mp4" />
        Your browser does not support HTML5 video background.
      </video>
    </div>
  );
}
