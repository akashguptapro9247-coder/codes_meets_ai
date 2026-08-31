"use client";

import React, { useMemo } from "react";

// Create a seeded random number generator (pure, no module-level mutation)
function createRng(initialSeed) {
  let s = initialSeed;
  return () => {
    const x = Math.sin(s++) * 10000;
    return x - Math.floor(x);
  };
}

function generateWebPatch(
  cx, 
  cy, 
  radius, 
  numSpokes, 
  numRings, 
  startAngle, 
  endAngle,
  rng
) {
  const spokes = [];
  const rings = [];

  const angleStep = (endAngle - startAngle) / (numSpokes - 1);
  const spokeAngles = Array.from({ length: numSpokes }, (_, i) => startAngle + i * angleStep);

  // Generate Spokes
  spokeAngles.forEach((angle) => {
    // Add random variation to spoke length (0.8x to 1.2x)
    const spokeRad = radius * (0.8 + rng() * 0.4); 
    const x2 = cx + Math.cos(angle) * spokeRad;
    const y2 = cy + Math.sin(angle) * spokeRad;
    spokes.push({ x1: cx, y1: cy, x2, y2 });
  });

  // Generate Rings
  const ringSpacing = radius / numRings;
  for (let r = 1; r <= numRings; r++) {
    const currentRadius = r * ringSpacing;
    let path = "";
    
    for (let i = 0; i < numSpokes - 1; i++) {
      const angle1 = spokeAngles[i];
      const angle2 = spokeAngles[i + 1];
      
      // Randomize attachment points on spokes
      const r1 = currentRadius * (0.9 + rng() * 0.2);
      const r2 = currentRadius * (0.9 + rng() * 0.2);
      
      const p1x = cx + Math.cos(angle1) * r1;
      const p1y = cy + Math.sin(angle1) * r1;
      const p2x = cx + Math.cos(angle2) * r2;
      const p2y = cy + Math.sin(angle2) * r2;
      
      // Control point for the curve (pull it towards the center for the classic spiderweb sag)
      const midAngle = (angle1 + angle2) / 2;
      const sagRadius = currentRadius * 0.75; 
      const cpx = cx + Math.cos(midAngle) * sagRadius;
      const cpy = cy + Math.sin(midAngle) * sagRadius;
      
      if (i === 0) {
        path += `M ${p1x} ${p1y} `;
      }
      path += `Q ${cpx} ${cpy} ${p2x} ${p2y} `;
    }

    // Connect last to first if it's a full 360 web
    if (endAngle - startAngle >= Math.PI * 1.9) {
      const angle1 = spokeAngles[numSpokes - 1];
      const angle2 = spokeAngles[0];
      const r2 = currentRadius * (0.9 + rng() * 0.2);

      const p2x = cx + Math.cos(angle2) * r2;
      const p2y = cy + Math.sin(angle2) * r2;

      // Adjust midAngle for wrap-around
      let midAngle = (angle1 + angle2) / 2;
      if (Math.abs(angle1 - angle2) > Math.PI) {
         midAngle += Math.PI;
      }

      const sagRadius = currentRadius * 0.75;
      const cpx = cx + Math.cos(midAngle) * sagRadius;
      const cpy = cy + Math.sin(midAngle) * sagRadius;
      
      path += `Q ${cpx} ${cpy} ${p2x} ${p2y} `;
    }
    rings.push(path);
  }

  return { spokes, rings, cx, cy };
}

export function OptionWebOverlay({ isVisible }) {
  // Procedurally generate multiple web patches only once
  const patches = useMemo(() => {
    const rng = createRng(42); // Deterministic seed for consistent webs
    return [
      // Top Left Corner
      generateWebPatch(0, 0, 140, 8, 6, 0, Math.PI / 2 + 0.2, rng),
      // Bottom Right Corner
      generateWebPatch(400, 120, 160, 9, 7, Math.PI, Math.PI * 1.5 + 0.2, rng),
      // Center Left (Full Web)
      generateWebPatch(80, 80, 90, 10, 5, 0, Math.PI * 2, rng),
      // Top Right Corner
      generateWebPatch(380, -20, 120, 7, 5, Math.PI / 2, Math.PI + 0.2, rng),
      // Bottom Center (Partial)
      generateWebPatch(220, 140, 110, 8, 5, Math.PI * 1.1, Math.PI * 1.9, rng)
    ];
  }, []);

  if (!isVisible) return null;

  return (
    <>
      <style>
        {`
          @keyframes webDraw {
            0% { stroke-dashoffset: 1; }
            100% { stroke-dashoffset: 0; }
          }
          @keyframes spokeFade {
            0% { opacity: 0; }
            100% { opacity: 0.75; }
          }
          @keyframes ringFade {
            0% { opacity: 0; }
            100% { opacity: 0.6; }
          }
        `}
      </style>
      <div style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'hidden', borderRadius: '12px', backgroundColor: 'rgba(8, 51, 68, 0.2)', backdropFilter: 'blur(0.5px)', zIndex: 0 }}>
      <svg
        viewBox="0 0 400 120"
        preserveAspectRatio="xMidYMid slice"
        style={{ width: '100%', height: '100%', stroke: 'white', filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.5))" }}
        strokeWidth="1.5"
        fill="none"
      >
        {patches.map((patch, patchIdx) => {
          // Stagger the appearance of each patch
          const patchDelay = patchIdx * 0.08;
          
          return (
            <g key={`patch-${patchIdx}`}>
              {/* Draw radial spokes */}
              {patch.spokes.map((spoke, i) => {
                const customDelay = patchDelay + i * 0.015;
                return (
                  <line
                    key={`spoke-${patchIdx}-${i}`}
                    x1={spoke.x1}
                    y1={spoke.y1}
                    x2={spoke.x2}
                    y2={spoke.y2}
                    pathLength="1"
                    strokeDasharray="1"
                    style={{
                      animation: `webDraw 0.2s ease-out ${customDelay}s both, spokeFade 0.2s linear ${customDelay}s both`
                    }}
                  />
                );
              })}

              {/* Draw concentric web rings */}
              {patch.rings.map((ringPath, i) => {
                const customDelay = patchDelay + 0.12 + i * 0.05;
                return (
                  <path
                    key={`ring-${patchIdx}-${i}`}
                    d={ringPath}
                    pathLength="1"
                    strokeDasharray="1"
                    style={{
                      animation: `webDraw 0.25s ease-out ${customDelay}s both, ringFade 0.2s linear ${customDelay}s both`
                    }}
                  />
                );
              })}
            </g>
          );
        })}
      </svg>
    </div>
    </>
  );
}
