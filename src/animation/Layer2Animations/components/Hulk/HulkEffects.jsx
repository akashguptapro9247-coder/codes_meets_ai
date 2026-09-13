import React, { useEffect, useState, useRef } from 'react';
import { createPortal, flushSync } from 'react-dom';
import './HulkEffects.css';

// ── Particle Generator ───────────────────────────────────────────────────────
const generateParticles = (count, sizeRange, speedRange, type, originX, originY) => {
  const cx = originX !== undefined ? originX : window.innerWidth / 2;
  // Default: slightly below center (landing / feet level)
  // Punch: caller passes hand/fist position (~40% from top)
  const cy = originY !== undefined ? originY : window.innerHeight * 0.65;
  
  return Array.from({ length: count }).map((_, i) => {
    const angle = Math.random() * Math.PI * 2;
    const dist = speedRange[0] + Math.random() * (speedRange[1] - speedRange[0]);
    const size = sizeRange[0] + Math.random() * (sizeRange[1] - sizeRange[0]);
    let tx = Math.cos(angle) * dist * 1.6;
    let ty = Math.sin(angle) * dist * 0.6 - Math.abs(tx) * 0.3;
    
    if (type === 'punch-dust') {
      tx = Math.cos(angle) * dist * 1.2;
      ty = Math.sin(angle) * dist * 0.8 - Math.abs(tx) * 0.5 + (Math.random() * 20 - 10);
    }
    
    let dur = 800 + Math.random() * 300;
    if (type === 'punch-dust') dur = 700 + Math.random() * 500;
    else if (type === 'punch-debris') dur = 700 + Math.random() * 400;
    else if (type === 'punch-sparks') dur = 250 + Math.random() * 250;
      
    let baseOpacity = 0.5 + Math.random() * 0.5;
    if (type === 'punch-dust') baseOpacity = 0.2 + Math.random() * 0.4;
    else if (type === 'punch-sparks') baseOpacity = 0.8 + Math.random() * 0.2;
    
    return { id: `${type}-${i}-${Date.now()}`, cx, cy, tx, ty, size, dur, type, baseOpacity };
  });
};

// ── Particle Component ───────────────────────────────────────────────────────
function HulkParticle({ p }) {
  const [moved, setMoved] = useState(false);

  useEffect(() => {
    // Double rAF to ensure browser paints initial position before transition starts
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setMoved(true));
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const x = moved ? p.cx + p.tx : p.cx;
  const y = moved ? p.cy + p.ty : p.cy;
  const opacity = moved ? 0 : p.baseOpacity;
  const scale = moved ? 0 : 1;
  const isPunch = p.type.startsWith('punch');
  const isSpark = p.type === 'punch-sparks';
  const isDust = p.type === 'punch-dust';

  // Physical debris and spark coloring
  const color = isSpark 
    ? (p.id.length % 2 === 0 ? 'rgb(255, 180, 50)' : 'rgb(255, 230, 120)')
    : (isDust ? 'rgb(180, 180, 180)' : (isPunch ? 'rgb(245, 240, 230)' : 'rgb(220, 215, 210)'));

  return (
    <div style={{
      position: 'absolute',
      top: 0, left: 0,
      width: p.size,
      height: p.size,
      borderRadius: isSpark ? '50%' : (isDust ? '50%' : '2px'),
      backgroundColor: color,
      boxShadow: isSpark ? '0 0 6px rgba(255,200,50,0.8)' : (isDust ? 'none' : '0 2px 4px rgba(0,0,0,0.3)'),
      filter: isDust ? `blur(${Math.max(2, p.size * 0.15)}px)` : 'none',
      pointerEvents: 'none',
      transform: `translate(${x}px, ${y}px) scale(${scale})`,
      opacity,
      zIndex: isDust ? 1 : 2,
      transition: moved
        ? `transform ${p.dur}ms cubic-bezier(${isSpark ? '0.1, 0.9, 0.2, 1' : (isDust ? '0.2, 0.8, 0.2, 1' : '0.05, 0.9, 0.2, 1')}), opacity ${p.dur}ms ease-out`
        : 'none',
    }} />
  );
}

const generateCornerCracks = (cornerX, cornerY, cornerType, densityLevel) => {
  const landingPaths = [];
  const punchPaths = [];
  
  let baseAngleStart, baseAngleEnd;
  if (cornerType === 'tl') { baseAngleStart = 5; baseAngleEnd = 85; }
  else if (cornerType === 'tr') { baseAngleStart = 95; baseAngleEnd = 175; }
  else if (cornerType === 'bl') { baseAngleStart = 275; baseAngleEnd = 355; }
  else if (cornerType === 'br') { baseAngleStart = 185; baseAngleEnd = 265; }

  const randomRange = (min, max) => min + Math.random() * (max - min);

  // Density settings
  let maxPrimary = 2, maxDepth = 2, branchChance = 0.8, punchChance = 0.8, lengthScale = 0.5;
  if (densityLevel === 'large') {
    maxPrimary = 4; maxDepth = 4; branchChance = 0.4; punchChance = 0.3; lengthScale = 1.0;
  } else if (densityLevel === 'medium') {
    maxPrimary = 3; maxDepth = 3; branchChance = 0.6; punchChance = 0.6; lengthScale = 0.7;
  } else { // small
    maxPrimary = 2; maxDepth = 1; branchChance = 0.9; punchChance = 0.9; lengthScale = 0.4;
  }

  function growBranch(startX, startY, angleDeg, depth, targetPaths, isLandingBranch) {
    if (depth > maxDepth) return;
    
    const numSegments = Math.floor(randomRange(2, depth === 0 ? 5 : 3));
    let cx = startX;
    let cy = startY;
    let currentAngle = angleDeg;
    
    let path = `M${cx.toFixed(1)},${cy.toFixed(1)}`;
    
    for (let i = 0; i < numSegments; i++) {
      const segLen = (randomRange(40, 160) * lengthScale) / (depth * 0.7 + 1);
      
      const bend = Math.random() > 0.8 ? randomRange(20, 50) : randomRange(-15, 15);
      currentAngle += (Math.random() > 0.5 ? bend : -bend);
      
      const rad = currentAngle * Math.PI / 180;
      cx += Math.cos(rad) * segLen;
      cy += Math.sin(rad) * segLen;
      
      path += ` L${cx.toFixed(1)},${cy.toFixed(1)}`;
      
      // Chance to spawn a sub-branch of the same target phase
      if (Math.random() > branchChance + (depth * 0.15)) {
        const branchAngle = currentAngle + (Math.random() > 0.5 ? 1 : -1) * randomRange(20, 70);
        growBranch(cx, cy, branchAngle, depth + 1, targetPaths, isLandingBranch);
      }
      
      // Punch expansion: spawn punch-only sub-branches from this landing node
      if (isLandingBranch && Math.random() > punchChance) {
        const punchBranchAngle = currentAngle + (Math.random() > 0.5 ? 1 : -1) * randomRange(15, 80);
        growBranch(cx, cy, punchBranchAngle, depth + 1, punchPaths, false);
      }
    }
    
    let w;
    if (depth === 0) w = randomRange(0.6, 1.1);
    else if (depth === 1) w = randomRange(0.35, 0.7);
    else w = randomRange(0.15, 0.4);
    
    const o = Math.max(0.1, randomRange(0.4, 0.8) - (depth * 0.1));
    
    targetPaths.push({ d: path, w, o });
  }

  // Generate landing primary cracks
  const numLanding = Math.floor(randomRange(1, maxPrimary + 1)); 
  for (let i = 0; i < numLanding; i++) {
    const a = randomRange(baseAngleStart, baseAngleEnd);
    growBranch(cornerX, cornerY, a, 0, landingPaths, true);
  }
  
  // Generate punch primary cracks originating from the corner
  const numPunch = Math.floor(randomRange(1, maxPrimary + 2));
  for (let i = 0; i < numPunch; i++) {
    const a = randomRange(baseAngleStart, baseAngleEnd);
    growBranch(cornerX, cornerY, a, 0, punchPaths, false);
  }

  return { landingPaths, punchPaths };
};

// ── Cracks Component ─────────────────────────────────────────────────────────
function HulkCracks({ type }) {
  const isPunch = type === 'punch';
  const cornerSize = '65vw';
  const cornerH = '65vh';

  // Generate cracks randomly ONCE when the component mounts (landing).
  // They stay perfectly stationary across re-renders.
  const cracks = React.useMemo(() => {
    const corners = ['tl', 'tr', 'bl', 'br'];
    const shuffled = [...corners].sort(() => Math.random() - 0.5);
    const numLarge = Math.random() > 0.5 ? 2 : 1;
    const profile = {};
    
    shuffled.forEach((corner, i) => {
      if (i < numLarge) {
        profile[corner] = 'large';
      } else {
        profile[corner] = Math.random() > 0.5 ? 'small' : 'medium';
      }
    });

    return {
      tl: generateCornerCracks(0, 0, 'tl', profile.tl),
      tr: generateCornerCracks(1000, 0, 'tr', profile.tr),
      bl: generateCornerCracks(0, 1000, 'bl', profile.bl),
      br: generateCornerCracks(1000, 1000, 'br', profile.br)
    };
  }, []);

  const svgStyle = {
    position: 'absolute',
    fill: 'none',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    filter: 'drop-shadow(0 0 2px rgba(255,255,255,0.4))',
    width: cornerSize,
    height: cornerH,
  };

  const renderPaths = (paths) => paths.map((p, i) => (
    <path key={i} d={p.d} stroke={`rgba(255, 255, 255, ${p.o})`} strokeWidth={p.w} />
  ));

  return (
    <>
      <svg viewBox="0 0 1000 1000" preserveAspectRatio="xMinYMin slice" style={{ ...svgStyle, top: 0, left: 0 }}>
        {renderPaths(cracks.tl.landingPaths)}
        {isPunch && renderPaths(cracks.tl.punchPaths)}
      </svg>
      <svg viewBox="0 0 1000 1000" preserveAspectRatio="xMaxYMin slice" style={{ ...svgStyle, top: 0, right: 0 }}>
        {renderPaths(cracks.tr.landingPaths)}
        {isPunch && renderPaths(cracks.tr.punchPaths)}
      </svg>
      <svg viewBox="0 0 1000 1000" preserveAspectRatio="xMinYMax slice" style={{ ...svgStyle, bottom: 0, left: 0 }}>
        {renderPaths(cracks.bl.landingPaths)}
        {isPunch && renderPaths(cracks.bl.punchPaths)}
      </svg>
      <svg viewBox="0 0 1000 1000" preserveAspectRatio="xMaxYMax slice" style={{ ...svgStyle, bottom: 0, right: 0 }}>
        {renderPaths(cracks.br.landingPaths)}
        {isPunch && renderPaths(cracks.br.punchPaths)}
      </svg>
    </>
  );
}

// ── Main Controller ──────────────────────────────────────────────────────────
export function HulkEffects({ isPlaying, codeBoxRef, animPhase, impactPos }) {
  const [particles, setParticles] = useState([]);
  const [cracksType, setCracksType] = useState(null); // 'landing' | 'punch' | null
  
  useEffect(() => {
    if (!isPlaying) {
      // Reset everything when sequence stops/restarts
      setParticles([]);
      // Do not clear cracks: let them persist for the rest of the session
      // setCracksType(null);
      document.documentElement.classList.remove('hulk-punch-shake');
      if (codeBoxRef?.current) {
        codeBoxRef.current.classList.remove('hulk-land-shake');
      }
      return;
    }

    let timer1, timer2;

    if (animPhase === 'impact') {
      // ── 1. LANDING EVENT ──
      const landX = impactPos ? impactPos.x : window.innerWidth / 2;
      setParticles(generateParticles(25, [12, 24], [60, 150], 'landing', landX));
      setCracksType('landing');

      if (codeBoxRef?.current) {
        const el = codeBoxRef.current;
        el.classList.remove('hulk-land-shake');
        void el.offsetWidth; // force reflow
        el.classList.add('hulk-land-shake');
      }
      timer1 = setTimeout(() => setParticles([]), 1100);

    } else if (animPhase === 'punch') {
      // ── 2. PUNCH EVENT ──
      // Origin: midpoint between both fists.
      // Hulk model wrapper has translateX(-35px), so true center is impactPos.x - 35.
      const punchOriginX = (impactPos ? impactPos.x : window.innerWidth / 2) - 35;
      const punchOriginY = window.innerHeight * 0.42;
      const punchParticles = [
        ...generateParticles(30, [25, 110], [30, 200], 'punch-dust',   punchOriginX, punchOriginY),
        ...generateParticles(25, [10, 40], [100, 280], 'punch-debris', punchOriginX, punchOriginY),
        ...generateParticles(12, [3, 7],   [150, 400], 'punch-sparks', punchOriginX, punchOriginY)
      ];

      if (codeBoxRef?.current) {
        const el = codeBoxRef.current;
        el.classList.remove('hulk-land-shake');
        el.classList.remove('hulk-punch-shake');
        void el.offsetWidth; // force reflow before re-adding
        el.style.animationName = Math.random() > 0.5 ? 'hulkPunchShakeA' : 'hulkPunchShakeB';
        el.classList.add('hulk-punch-shake');
        timer1 = setTimeout(() => el.classList.remove('hulk-punch-shake'), 600);
      }

      flushSync(() => {
        setParticles(punchParticles);
        setCracksType('punch');
      });

      timer2 = setTimeout(() => setParticles([]), 1500);
    }

    return () => {
      if (timer1) clearTimeout(timer1);
      if (timer2) clearTimeout(timer2);
    };
  }, [isPlaying, codeBoxRef, animPhase]);

  // Always return the portal container so it exists as an independent layer.
  // We only render elements inside when they are active.
  return createPortal(
    <div style={{
      position: 'fixed',
      inset: 0,
      width: '100vw',
      height: '100vh',
      pointerEvents: 'none',
      zIndex: 9999, // High z-index, above model viewer
      overflow: 'hidden'
    }}>
      {/* Persisting cracks */}
      {cracksType && <HulkCracks type={cracksType} />}
      
      {/* Transient particles */}
      {particles.map(p => (
        <HulkParticle key={p.id} p={p} />
      ))}
    </div>,
    document.body
  );
}

export default HulkEffects;
