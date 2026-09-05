import React, { useState, useRef, useLayoutEffect } from 'react';
import AnimatedAnt from './AnimatedAnt';
import AnimatedBug from './AnimatedBug';
import AnimatedBedbug from './AnimatedBedbug';

const TYPE_COMPONENT = {
  ant: AnimatedAnt,
  bug: AnimatedBug,
  bedbug: AnimatedBedbug,
};

// Generate deterministic pseudo-random value based on seed
function seededRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function BugSwarm() {
  // Generate insects with deterministic "random" properties
  const [insects] = useState(() => {
    const bugTypes = ['ant', 'bug', 'bedbug'];
    const generated = [];
    
    // Create 16 insects for better coverage
    const count = 16;
    
    // We have 12 distinct continuous paths (path-1 to path-12)
    const numPaths = 12;
    
    for (let i = 0; i < count; i++) {
      const type = bugTypes[Math.floor(seededRandom(i * 1.7) * bugTypes.length)];
      
      // Speed: 15-40 seconds for full journey (slower for more natural crawling)
      const speed = 15 + seededRandom(i * 4.2) * 25;
      
      // Negative delay = start mid-animation so all bugs appear crawling on page load.
      // Range: 0 to -speed seconds (each bug at a random point in its cycle).
      const delay = -(seededRandom(i * 5.3) * speed);
      
      // Size: 26-38px
      const size = 26 + Math.floor(seededRandom(i * 6.7) * 13);
      
      // Assign path evenly to ensure all paths are populated
      const pathIndex = (i % numPaths) + 1;
      
      generated.push({
        id: i,
        type,
        pathIndex,
        speed: `${speed}s`,
        delay: `${delay}s`,
        size,
      });
    }
    
    return generated;
  });

  const containerRef = useRef(null);
  const [aspectRatio, setAspectRatio] = useState(2); // Default to a wide container

  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        if (height > 0) {
          setAspectRatio(width / height);
        }
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Calculate dynamic angles based on actual container proportions
  // Math.atan2(y, x) gives angle from positive x-axis. 
  // CSS rotation 0deg is UP, so we add 90deg to convert math angle to CSS rotation.
  const angle9 = 90 + Math.atan2(1, aspectRatio) * (180 / Math.PI);
  const angle10 = 90 + Math.atan2(1, -aspectRatio) * (180 / Math.PI);
  const angle11 = 90 + Math.atan2(1.16, 0.68 * aspectRatio) * (180 / Math.PI);
  const angle12 = 90 + Math.atan2(1.16, -0.68 * aspectRatio) * (180 / Math.PI);

  return (
    <>
      <style>{`
        .swarm-insect-ant .animated-ant-container {
          filter:
            drop-shadow(0 0 3px rgba(230, 150, 60, 0.75))
            drop-shadow(0 0 8px rgba(190, 100, 30, 0.50))
            drop-shadow(0 0 14px rgba(150, 70, 15, 0.25));
        }
        .swarm-insect-bug .animated-bug-container {
          filter:
            drop-shadow(0 0 3px rgba(130, 215, 150, 0.75))
            drop-shadow(0 0 8px rgba(76, 160, 96, 0.50))
            drop-shadow(0 0 14px rgba(40, 120, 60, 0.25));
        }
        .swarm-insect-bedbug .animated-bedbug-container {
          filter:
            drop-shadow(0 0 3px rgba(100, 225, 130, 0.75))
            drop-shadow(0 0 8px rgba(59, 185, 94, 0.50))
            drop-shadow(0 0 14px rgba(30, 130, 55, 0.25));
        }

        .bug-swarm {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          z-index: 1;
          overflow: hidden;
          border-radius: 16px;
        }

        .swarm-insect {
          position: absolute;
          transform-origin: center center;
          will-change: transform;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        @keyframes swarmPath1 {
          0%   { top:  -8%; left:  -6%; transform: translate(-50%, -50%) rotate(135deg); }
          3%   { top:   2%; left:   0%; transform: translate(-50%, -50%) rotate(115deg); }
          6%   { top:   7%; left:   6%; transform: translate(-50%, -50%) rotate( 90deg); }
          50%  { top:   8%; left:  50%; transform: translate(-50%, -50%) rotate( 90deg); }
          94%  { top:   7%; left:  94%; transform: translate(-50%, -50%) rotate( 90deg); }
          97%  { top:   2%; left: 100%; transform: translate(-50%, -50%) rotate( 65deg); }
          100% { top:  -8%; left: 108%; transform: translate(-50%, -50%) rotate( 45deg); }
        }
        @keyframes swarmPath2 {
          0%   { top:  -8%; left: 108%; transform: translate(-50%, -50%) rotate(225deg); }
          3%   { top:   0%; left: 100%; transform: translate(-50%, -50%) rotate(205deg); }
          6%   { top:   6%; left:  96%; transform: translate(-50%, -50%) rotate(180deg); }
          50%  { top:  50%; left:  96%; transform: translate(-50%, -50%) rotate(180deg); }
          94%  { top:  94%; left:  96%; transform: translate(-50%, -50%) rotate(180deg); }
          97%  { top: 100%; left: 100%; transform: translate(-50%, -50%) rotate(155deg); }
          100% { top: 108%; left: 108%; transform: translate(-50%, -50%) rotate(135deg); }
        }
        @keyframes swarmPath3 {
          0%   { top: 108%; left: 108%; transform: translate(-50%, -50%) rotate(-45deg); }
          3%   { top: 100%; left: 100%; transform: translate(-50%, -50%) rotate(-65deg); }
          6%   { top:  93%; left:  94%; transform: translate(-50%, -50%) rotate(-90deg); }
          50%  { top:  92%; left:  50%; transform: translate(-50%, -50%) rotate(-90deg); }
          94%  { top:  93%; left:   6%; transform: translate(-50%, -50%) rotate(-90deg); }
          97%  { top: 100%; left:   0%; transform: translate(-50%, -50%) rotate(-115deg); }
          100% { top: 108%; left:  -6%; transform: translate(-50%, -50%) rotate(-135deg); }
        }
        @keyframes swarmPath4 {
          0%   { top: 108%; left:  -6%; transform: translate(-50%, -50%) rotate( 45deg); }
          3%   { top: 100%; left:   0%; transform: translate(-50%, -50%) rotate( 25deg); }
          6%   { top:  94%; left:   4%; transform: translate(-50%, -50%) rotate(  0deg); }
          50%  { top:  50%; left:   4%; transform: translate(-50%, -50%) rotate(  0deg); }
          94%  { top:   6%; left:   4%; transform: translate(-50%, -50%) rotate(  0deg); }
          97%  { top:   0%; left:   0%; transform: translate(-50%, -50%) rotate(-25deg); }
          100% { top:  -8%; left:  -6%; transform: translate(-50%, -50%) rotate(-45deg); }
        }
        @keyframes swarmPath5 {
          0%   { top:  -8%; left:  -6%; transform: translate(-50%, -50%) rotate(135deg); }
          3%   { top:   2%; left:   0%; transform: translate(-50%, -50%) rotate(115deg); }
          6%   { top:   7%; left:   6%; transform: translate(-50%, -50%) rotate( 90deg); }
          40%  { top:   7%; left:  80%; transform: translate(-50%, -50%) rotate( 90deg); }
          44%  { top:   8%; left:  86%; transform: translate(-50%, -50%) rotate(108deg); }
          48%  { top:  11%; left:  91%; transform: translate(-50%, -50%) rotate(135deg); }
          52%  { top:  16%; left:  94%; transform: translate(-50%, -50%) rotate(162deg); }
          56%  { top:  22%; left:  95%; transform: translate(-50%, -50%) rotate(180deg); }
          88%  { top:  88%; left:  95%; transform: translate(-50%, -50%) rotate(180deg); }
          94%  { top:  97%; left:  98%; transform: translate(-50%, -50%) rotate(160deg); }
          100% { top: 108%; left: 108%; transform: translate(-50%, -50%) rotate(135deg); }
        }
        @keyframes swarmPath6 {
          0%   { top: 108%; left: 110%; transform: translate(-50%, -50%) rotate(-45deg); }
          3%   { top: 100%; left: 100%; transform: translate(-50%, -50%) rotate(-65deg); }
          6%   { top:  93%; left:  94%; transform: translate(-50%, -50%) rotate(-90deg); }
          40%  { top:  93%; left:  20%; transform: translate(-50%, -50%) rotate(-90deg); }
          44%  { top:  92%; left:  14%; transform: translate(-50%, -50%) rotate(-72deg); }
          48%  { top:  89%; left:   9%; transform: translate(-50%, -50%) rotate(-45deg); }
          52%  { top:  84%; left:   6%; transform: translate(-50%, -50%) rotate(-18deg); }
          56%  { top:  78%; left:   5%; transform: translate(-50%, -50%) rotate(  0deg); }
          88%  { top:  12%; left:   5%; transform: translate(-50%, -50%) rotate(  0deg); }
          94%  { top:   3%; left:   2%; transform: translate(-50%, -50%) rotate(-20deg); }
          100% { top:  -8%; left:  -6%; transform: translate(-50%, -50%) rotate(-45deg); }
        }
        @keyframes swarmPath7 {
          0%   { top:  -8%; left: 108%; transform: translate(-50%, -50%) rotate(-135deg); }
          3%   { top:   2%; left: 100%; transform: translate(-50%, -50%) rotate(-115deg); }
          6%   { top:   9%; left:  94%; transform: translate(-50%, -50%) rotate( -90deg); }
          50%  { top:   9%; left:  50%; transform: translate(-50%, -50%) rotate( -90deg); }
          94%  { top:   9%; left:   6%; transform: translate(-50%, -50%) rotate( -90deg); }
          97%  { top:   2%; left:   0%; transform: translate(-50%, -50%) rotate( -65deg); }
          100% { top:  -8%; left:  -6%; transform: translate(-50%, -50%) rotate( -45deg); }
        }
        @keyframes swarmPath8 {
          0%   { top: 108%; left:  -6%; transform: translate(-50%, -50%) rotate( 45deg); }
          3%   { top: 100%; left:   0%; transform: translate(-50%, -50%) rotate( 25deg); }
          6%   { top:  95%; left:   4%; transform: translate(-50%, -50%) rotate(  0deg); }
          40%  { top:  22%; left:   4%; transform: translate(-50%, -50%) rotate(  0deg); }
          44%  { top:  16%; left:   5%; transform: translate(-50%, -50%) rotate( 18deg); }
          48%  { top:  11%; left:   8%; transform: translate(-50%, -50%) rotate( 45deg); }
          52%  { top:   8%; left:  13%; transform: translate(-50%, -50%) rotate( 72deg); }
          56%  { top:   7%; left:  19%; transform: translate(-50%, -50%) rotate( 90deg); }
          88%  { top:   7%; left:  90%; transform: translate(-50%, -50%) rotate( 90deg); }
          94%  { top:   2%; left:  98%; transform: translate(-50%, -50%) rotate( 65deg); }
          100% { top:  -8%; left: 108%; transform: translate(-50%, -50%) rotate( 45deg); }
        }



        /* ── PATH POSITION KEYFRAMES (top/left only, translate stays fixed) ── */
        @keyframes swarmPos1 {
          0%   { top:  -8%; left:  -6%; }
          3%   { top:   2%; left:   0%; }
          6%   { top:   7%; left:   6%; }
          50%  { top:   8%; left:  50%; }
          94%  { top:   7%; left:  94%; }
          97%  { top:   2%; left: 100%; }
          100% { top:  -8%; left: 108%; }
        }
        @keyframes swarmPos2 {
          0%   { top:  -8%; left: 108%; }
          3%   { top:   0%; left: 100%; }
          6%   { top:   6%; left:  96%; }
          50%  { top:  50%; left:  96%; }
          94%  { top:  94%; left:  96%; }
          97%  { top: 100%; left: 100%; }
          100% { top: 108%; left: 108%; }
        }
        @keyframes swarmPos3 {
          0%   { top: 108%; left: 108%; }
          3%   { top: 100%; left: 100%; }
          6%   { top:  93%; left:  94%; }
          50%  { top:  92%; left:  50%; }
          94%  { top:  93%; left:   6%; }
          97%  { top: 100%; left:   0%; }
          100% { top: 108%; left:  -6%; }
        }
        @keyframes swarmPos4 {
          0%   { top: 108%; left:  -6%; }
          3%   { top: 100%; left:   0%; }
          6%   { top:  94%; left:   4%; }
          50%  { top:  50%; left:   4%; }
          94%  { top:   6%; left:   4%; }
          97%  { top:   0%; left:   0%; }
          100% { top:  -8%; left:  -6%; }
        }
        @keyframes swarmPos5 {
          0%   { top:  -8%; left:  -6%; }
          3%   { top:   2%; left:   0%; }
          6%   { top:   7%; left:   6%; }
          40%  { top:   7%; left:  80%; }
          44%  { top:   8%; left:  86%; }
          48%  { top:  11%; left:  91%; }
          52%  { top:  16%; left:  94%; }
          56%  { top:  22%; left:  95%; }
          88%  { top:  88%; left:  95%; }
          94%  { top:  97%; left:  98%; }
          100% { top: 108%; left: 108%; }
        }
        @keyframes swarmPos6 {
          0%   { top: 108%; left: 110%; }
          3%   { top: 100%; left: 100%; }
          6%   { top:  93%; left:  94%; }
          40%  { top:  93%; left:  20%; }
          44%  { top:  92%; left:  14%; }
          48%  { top:  89%; left:   9%; }
          52%  { top:  84%; left:   6%; }
          56%  { top:  78%; left:   5%; }
          88%  { top:  12%; left:   5%; }
          94%  { top:   3%; left:   2%; }
          100% { top:  -8%; left:  -6%; }
        }
        @keyframes swarmPos7 {
          0%   { top:  -8%; left: 108%; }
          3%   { top:   2%; left: 100%; }
          6%   { top:   9%; left:  94%; }
          50%  { top:   9%; left:  50%; }
          94%  { top:   9%; left:   6%; }
          97%  { top:   2%; left:   0%; }
          100% { top:  -8%; left:  -6%; }
        }
        @keyframes swarmPos8 {
          0%   { top: 108%; left:  -6%; }
          3%   { top: 100%; left:   0%; }
          6%   { top:  95%; left:   4%; }
          40%  { top:  22%; left:   4%; }
          44%  { top:  16%; left:   5%; }
          48%  { top:  11%; left:   8%; }
          52%  { top:   8%; left:  13%; }
          56%  { top:   7%; left:  19%; }
          88%  { top:   7%; left:  90%; }
          94%  { top:   2%; left:  98%; }
          100% { top:  -8%; left: 108%; }
        }
        /* Diagonal centre-crossing position paths */
        @keyframes swarmPos9 {
          0%   { top:  -8%; left:  -8%; }
          100% { top: 108%; left: 108%; }
        }
        @keyframes swarmPos10 {
          0%   { top:  -8%; left: 108%; }
          100% { top: 108%; left:  -8%; }
        }
        @keyframes swarmPos11 {
          0%   { top:  -8%; left:  20%; }
          15%  { top:  15%; left:  28%; }
          50%  { top:  48%; left:  52%; }
          85%  { top:  80%; left:  74%; }
          100% { top: 108%; left:  88%; }
        }
        @keyframes swarmPos12 {
          0%   { top:  -8%; left:  80%; }
          15%  { top:  15%; left:  72%; }
          50%  { top:  48%; left:  48%; }
          85%  { top:  80%; left:  26%; }
          100% { top: 108%; left:  12%; }
        }

        /* ── BODY ROTATION KEYFRAMES (rotate only, no translate) ── */
        @keyframes swarmRot1 {
          0%   { transform: rotate(135deg); }
          3%   { transform: rotate(115deg); }
          6%   { transform: rotate( 90deg); }
          50%  { transform: rotate( 90deg); }
          94%  { transform: rotate( 90deg); }
          97%  { transform: rotate( 65deg); }
          100% { transform: rotate( 45deg); }
        }
        @keyframes swarmRot2 {
          0%   { transform: rotate(225deg); }
          3%   { transform: rotate(205deg); }
          6%   { transform: rotate(180deg); }
          50%  { transform: rotate(180deg); }
          94%  { transform: rotate(180deg); }
          97%  { transform: rotate(155deg); }
          100% { transform: rotate(135deg); }
        }
        @keyframes swarmRot3 {
          0%   { transform: rotate(-45deg); }
          3%   { transform: rotate(-65deg); }
          6%   { transform: rotate(-90deg); }
          50%  { transform: rotate(-90deg); }
          94%  { transform: rotate(-90deg); }
          97%  { transform: rotate(-115deg); }
          100% { transform: rotate(-135deg); }
        }
        @keyframes swarmRot4 {
          0%   { transform: rotate( 45deg); }
          3%   { transform: rotate( 25deg); }
          6%   { transform: rotate(  0deg); }
          50%  { transform: rotate(  0deg); }
          94%  { transform: rotate(  0deg); }
          97%  { transform: rotate(-25deg); }
          100% { transform: rotate(-45deg); }
        }
        @keyframes swarmRot5 {
          0%   { transform: rotate(135deg); }
          3%   { transform: rotate(115deg); }
          6%   { transform: rotate( 90deg); }
          40%  { transform: rotate( 90deg); }
          44%  { transform: rotate(108deg); }
          48%  { transform: rotate(135deg); }
          52%  { transform: rotate(162deg); }
          56%  { transform: rotate(180deg); }
          88%  { transform: rotate(180deg); }
          94%  { transform: rotate(160deg); }
          100% { transform: rotate(135deg); }
        }
        @keyframes swarmRot6 {
          0%   { transform: rotate(-45deg); }
          3%   { transform: rotate(-65deg); }
          6%   { transform: rotate(-90deg); }
          40%  { transform: rotate(-90deg); }
          44%  { transform: rotate(-72deg); }
          48%  { transform: rotate(-45deg); }
          52%  { transform: rotate(-18deg); }
          56%  { transform: rotate(  0deg); }
          88%  { transform: rotate(  0deg); }
          94%  { transform: rotate(-20deg); }
          100% { transform: rotate(-45deg); }
        }
        @keyframes swarmRot7 {
          0%   { transform: rotate(-135deg); }
          3%   { transform: rotate(-115deg); }
          6%   { transform: rotate( -90deg); }
          50%  { transform: rotate( -90deg); }
          94%  { transform: rotate( -90deg); }
          97%  { transform: rotate( -65deg); }
          100% { transform: rotate( -45deg); }
        }
        @keyframes swarmRot8 {
          0%   { transform: rotate( 45deg); }
          3%   { transform: rotate( 25deg); }
          6%   { transform: rotate(  0deg); }
          40%  { transform: rotate(  0deg); }
          44%  { transform: rotate( 18deg); }
          48%  { transform: rotate( 45deg); }
          52%  { transform: rotate( 72deg); }
          56%  { transform: rotate( 90deg); }
          88%  { transform: rotate( 90deg); }
          94%  { transform: rotate( 65deg); }
          100% { transform: rotate( 45deg); }
        }
        /* Diagonal body rotations — dynamically follow exact travel direction via CSS variables */
        @keyframes swarmRot9  { 0%, 100% { transform: rotate(var(--rot9, 115deg)); } }
        @keyframes swarmRot10 { 0%, 100% { transform: rotate(var(--rot10, 245deg)); } }
        @keyframes swarmRot11 { 0%, 100% { transform: rotate(var(--rot11, 130deg)); } }
        @keyframes swarmRot12 { 0%, 100% { transform: rotate(var(--rot12, 230deg)); } }

        /* ── APPLY position animation to outer, rotation to inner .swarm-body ── */
        .swarm-path-1  { animation: swarmPos1  var(--speed) linear infinite both; animation-delay: var(--delay); }
        .swarm-path-2  { animation: swarmPos2  var(--speed) linear infinite both; animation-delay: var(--delay); }
        .swarm-path-3  { animation: swarmPos3  var(--speed) linear infinite both; animation-delay: var(--delay); }
        .swarm-path-4  { animation: swarmPos4  var(--speed) linear infinite both; animation-delay: var(--delay); }
        .swarm-path-5  { animation: swarmPos5  var(--speed) linear infinite both; animation-delay: var(--delay); }
        .swarm-path-6  { animation: swarmPos6  var(--speed) linear infinite both; animation-delay: var(--delay); }
        .swarm-path-7  { animation: swarmPos7  var(--speed) linear infinite both; animation-delay: var(--delay); }
        .swarm-path-8  { animation: swarmPos8  var(--speed) linear infinite both; animation-delay: var(--delay); }
        .swarm-path-9  { animation: swarmPos9  var(--speed) linear infinite both; animation-delay: var(--delay); }
        .swarm-path-10 { animation: swarmPos10 var(--speed) linear infinite both; animation-delay: var(--delay); }
        .swarm-path-11 { animation: swarmPos11 var(--speed) linear infinite both; animation-delay: var(--delay); }
        .swarm-path-12 { animation: swarmPos12 var(--speed) linear infinite both; animation-delay: var(--delay); }

        .swarm-path-1  .swarm-body { animation: swarmRot1  var(--speed) linear infinite both; animation-delay: var(--delay); }
        .swarm-path-2  .swarm-body { animation: swarmRot2  var(--speed) linear infinite both; animation-delay: var(--delay); }
        .swarm-path-3  .swarm-body { animation: swarmRot3  var(--speed) linear infinite both; animation-delay: var(--delay); }
        .swarm-path-4  .swarm-body { animation: swarmRot4  var(--speed) linear infinite both; animation-delay: var(--delay); }
        .swarm-path-5  .swarm-body { animation: swarmRot5  var(--speed) linear infinite both; animation-delay: var(--delay); }
        .swarm-path-6  .swarm-body { animation: swarmRot6  var(--speed) linear infinite both; animation-delay: var(--delay); }
        .swarm-path-7  .swarm-body { animation: swarmRot7  var(--speed) linear infinite both; animation-delay: var(--delay); }
        .swarm-path-8  .swarm-body { animation: swarmRot8  var(--speed) linear infinite both; animation-delay: var(--delay); }
        .swarm-path-9  .swarm-body { animation: swarmRot9  var(--speed) linear infinite both; animation-delay: var(--delay); }
        .swarm-path-10 .swarm-body { animation: swarmRot10 var(--speed) linear infinite both; animation-delay: var(--delay); }
        .swarm-path-11 .swarm-body { animation: swarmRot11 var(--speed) linear infinite both; animation-delay: var(--delay); }
        .swarm-path-12 .swarm-body { animation: swarmRot12 var(--speed) linear infinite both; animation-delay: var(--delay); }
      `}</style>
      <div 
        className="bug-swarm" 
        ref={containerRef}
        style={{
          '--rot9': `${angle9}deg`,
          '--rot10': `${angle10}deg`,
          '--rot11': `${angle11}deg`,
          '--rot12': `${angle12}deg`,
        }}
      >
        {insects.map((insect) => {
          const InsectComponent = TYPE_COMPONENT[insect.type];
          return (
            <div
              key={insect.id}
              className={`swarm-insect swarm-insect-${insect.type} swarm-path-${insect.pathIndex}`}
              style={{
                '--speed': insect.speed,
                '--delay': insect.delay,
                width: insect.size,
                height: insect.size,
              }}
            >
              {/* Inner wrapper — rotation only, pivot at bug centre */}
              <div className="swarm-body" style={{ width: insect.size, height: insect.size }}>
                <InsectComponent
                  style={{
                    width: insect.size,
                    height: insect.size,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

export default BugSwarm;
