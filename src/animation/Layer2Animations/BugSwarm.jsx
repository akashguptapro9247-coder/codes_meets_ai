import React, { useState } from 'react';
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
    
    // Create 12 insects for better coverage
    const count = 12;
    
    // We have 8 distinct continuous paths (path-1 to path-8)
    const numPaths = 8;
    
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

        .swarm-path-1 { animation: swarmPath1 var(--speed) linear infinite both; animation-delay: var(--delay); }
        .swarm-path-2 { animation: swarmPath2 var(--speed) linear infinite both; animation-delay: var(--delay); }
        .swarm-path-3 { animation: swarmPath3 var(--speed) linear infinite both; animation-delay: var(--delay); }
        .swarm-path-4 { animation: swarmPath4 var(--speed) linear infinite both; animation-delay: var(--delay); }
        .swarm-path-5 { animation: swarmPath5 var(--speed) linear infinite both; animation-delay: var(--delay); }
        .swarm-path-6 { animation: swarmPath6 var(--speed) linear infinite both; animation-delay: var(--delay); }
        .swarm-path-7 { animation: swarmPath7 var(--speed) linear infinite both; animation-delay: var(--delay); }
        .swarm-path-8 { animation: swarmPath8 var(--speed) linear infinite both; animation-delay: var(--delay); }
      `}</style>
      <div className="bug-swarm">
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
              <InsectComponent
                style={{
                  width: insect.size,
                  height: insect.size,
                }}
              />
            </div>
          );
        })}
      </div>
    </>
  );
}

export default BugSwarm;
