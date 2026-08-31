"use client";

import React, { useState } from "react";

// Pre-generated static particles with deterministic pseudo-random offsets for React purity rules
const STATIC_PARTICLES = Array.from({ length: 12 }).map((_, i) => {
  const seed = Math.sin(i + 1) * 10000;
  const pseudoRandom = seed - Math.floor(seed);
  const angle = (i * Math.PI * 2) / 12;
  const dist = 30 + pseudoRandom * 30;
  const length = 12 + pseudoRandom * 18;
  return {
    x: Math.cos(angle) * dist,
    y: Math.sin(angle) * dist,
    length,
    rotation: (i * 30) + (pseudoRandom * 10 - 5),
  };
});

export function WebShot({ startPoint, endPoint, animState }) {
  // The shooting line itself is now rendered as a 3D <Line> inside the Canvas
  // (same primitive as the hanging web). This component only handles the impact effect.

  const [showImpact, setShowImpact] = useState(false);

  // Manage showImpact state transitions during render
  const [prevAnimState, setPrevAnimState] = useState(animState);
  if (animState !== prevAnimState) {
    setPrevAnimState(animState);
    if (animState === "IMPACT") {
      setShowImpact(true);
    } else if (animState === "SHOOTING" || animState === "IDLE" || animState === "RETRACTING") {
      setShowImpact(false);
    }
  }

  if (!startPoint || !endPoint || animState === "IDLE") return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {/* Impact explosion animation */}
      {showImpact && (
        <div
          className="absolute origin-center"
          style={{
            left: endPoint.x,
            top: endPoint.y,
            transform: "translate(-50%, -50%)",
          }}
        >
          {/* Ripple Ring */}
          <div className="absolute rounded-full border border-white/80 animate-[ping_0.4s_ease-out_forwards] w-16 h-16 -ml-8 -mt-8" />
          <div className="absolute rounded-full border-2 border-cyan-400/50 animate-[ping_0.5s_ease-out_0.05s_forwards] w-20 h-20 -ml-10 -mt-10" />

          {/* Flash Core */}
          <div className="absolute rounded-full bg-white blur-[2px] w-6 h-6 -ml-3 -mt-3 animate-[ping_0.3s_ease-out_forwards]" />

          {/* Debris particles flying outwards */}
          {STATIC_PARTICLES.map((p, i) => (
            <div
              key={`particle-${i}`}
              className="absolute bg-white/95 origin-left rounded-full transition-all duration-300 ease-out"
              style={{
                width: p.length,
                height: 1.2,
                transform: `rotate(${p.rotation}deg) translateX(${showImpact ? p.x : 0}px)`,
                opacity: showImpact ? 0 : 1,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
