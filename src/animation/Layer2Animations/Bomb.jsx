import React from 'react';

function Bomb({ className = '', style = {} }) {
  return (
    <>
      <style>{`
        /* Bomb position & motion wrapper */
        .anim-bomb-wrapper {
          position: absolute;
          top: var(--impact-y, 40%);
          left: var(--impact-x, 50%);
          transform: translate(-50%, -50%);
          z-index: 1002;
          will-change: transform;
        }

        .anim-bomb-wrapper.falling {
          animation: animBombFall 1.4s cubic-bezier(0.55, 0.085, 0.68, 0.53) forwards;
        }

        .anim-bomb-wrapper.impact {
          animation: animBombBounce 0.3s ease-out forwards;
        }

        /* Bomb falling motion from top of screen viewport to center impact point */
        @keyframes animBombFall {
          0% {
            top: -180px;
            left: var(--impact-x, 50%);
            transform: translate(-50%, 0) rotate(-16deg) scale(0.85);
            opacity: 0;
          }
          15% { opacity: 1; }
          60% {
            left: var(--impact-x, 50%);
            transform: translate(-50%, 0) rotate(12deg) scale(0.95);
          }
          85% {
            left: var(--impact-x, 50%);
            transform: translate(-50%, 0) rotate(-6deg) scale(1);
          }
          100% {
            top: var(--impact-y, 40%);
            left: var(--impact-x, 50%);
            transform: translate(-50%, -50%) rotate(0deg) scale(1);
            opacity: 1;
          }
        }

        /* Heavy landing impact squash */
        @keyframes animBombBounce {
          0% {
            top: var(--impact-y, 40%);
            left: var(--impact-x, 50%);
            transform: translate(-50%, -50%) scale(1);
          }
          40% {
            top: var(--impact-y, 40%);
            left: var(--impact-x, 50%);
            transform: translate(-50%, -35%) scale(1.25, 0.75);
          }
          75% {
            top: var(--impact-y, 40%);
            left: var(--impact-x, 50%);
            transform: translate(-50%, -55%) scale(0.9, 1.1);
          }
          100% {
            top: var(--impact-y, 40%);
            left: var(--impact-x, 50%);
            transform: translate(-50%, -50%) scale(1.1, 0.95);
          }
        }

        /* Bomb Fuse Spark Flicker Animation */
        .anim-spark-outer-glow, .anim-spark-rays {
          animation: animSparkFlicker 0.12s ease-in-out infinite alternate;
          transform-origin: center center;
        }

        @keyframes animSparkFlicker {
          0% {
            transform: scale(0.85) rotate(0deg);
            opacity: 0.8;
          }
          100% {
            transform: scale(1.25) rotate(18deg);
            opacity: 1;
          }
        }
      `}</style>
      <div className={`bomb-component ${className}`} style={{ width: 80, height: 95, ...style }}>
        <svg
          viewBox="0 0 100 120"
          width="100%"
          height="100%"
          className="bomb-svg"
        >
          <defs>
            {/* Dark Metallic Spherical Body Gradient */}
            <radialGradient id="bombBodyGrad" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#475569" />
              <stop offset="35%" stopColor="#1e293b" />
              <stop offset="70%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#020617" />
            </radialGradient>

            {/* Top Metallic Cap Gradient */}
            <linearGradient id="bombCapGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#64748b" />
              <stop offset="50%" stopColor="#334155" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>

            {/* Fuse Spark Radial Gradient */}
            <radialGradient id="sparkGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="30%" stopColor="#fef08a" />
              <stop offset="70%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#dc2626" stopOpacity="0" />
            </radialGradient>
          </defs>

          <g className="bomb-group">
            {/* FUSE CORD */}
            <path
              className="bomb-fuse-cord"
              d="M 50 32 C 50 20, 68 18, 62 8"
              fill="none"
              stroke="#d97706"
              strokeWidth="3.5"
              strokeLinecap="round"
            />

            {/* BURNING SPARK & FIRE AT FUSE TIP */}
            <g className="bomb-spark-group" transform="translate(62, 8)">
              {/* Outer Flame Glow */}
              <circle r="12" fill="url(#sparkGlow)" className="anim-spark-outer-glow" />
              {/* Fire Sparks Rays */}
              <path
                d="M -6 -6 L 6 6 M 6 -6 L -6 6 M 0 -8 L 0 8 M -8 0 L 8 0"
                stroke="#fbbf24"
                strokeWidth="2"
                strokeLinecap="round"
                className="anim-spark-rays"
              />
              {/* Bright Core */}
              <circle r="3" fill="#ffffff" className="spark-core" />
            </g>

            {/* BOMB CAP / COLLAR */}
            <rect x="40" y="28" width="20" height="8" rx="2" fill="url(#bombCapGrad)" stroke="#0f172a" strokeWidth="1.5" />

            {/* SPHERICAL METALLIC BOMB BODY */}
            <circle cx="50" cy="72" r="38" fill="url(#bombBodyGrad)" stroke="#0f172a" strokeWidth="2.5" />

            {/* CURVED SPECULAR HIGHLIGHT */}
            <path
              d="M 28 50 A 28 28 0 0 1 65 44"
              fill="none"
              stroke="#94a3b8"
              strokeWidth="3.5"
              strokeLinecap="round"
              opacity="0.55"
            />
            <circle cx="34" cy="56" r="3" fill="#cbd5e1" opacity="0.7" />

            {/* DANGER SYMBOL (Cartoon skull/flame emblem overlay) */}
            <path
              d="M 50 64 L 54 74 L 46 74 Z M 50 77 A 1.5 1.5 0 1 1 50 80"
              fill="#f59e0b"
              stroke="#b45309"
              strokeWidth="1"
              opacity="0.8"
            />
          </g>
        </svg>
      </div>
    </>
  );
}

export default Bomb;
