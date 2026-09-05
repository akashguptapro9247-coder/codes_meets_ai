import React from 'react';

function Explosion({ animPhase }) {
  const showExplosion = animPhase === 'explosion' || animPhase === 'jumbling' || animPhase === 'cleanup';

  if (!showExplosion) return null;

  return (
    <>
      <style>{`
        /* ── EXPLOSION CONTAINER ────────────────────────────────────────────────────── */
        .anim-explosion-container {
          position: absolute;
          top: var(--impact-y, 40%);
          left: var(--impact-x, 50%);
          transform: translate(-50%, -50%);
          width: 450px;
          height: 450px;
          z-index: 1005;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
          transition: opacity 0.5s ease-out;
        }

        .anim-explosion-container.cleanup {
          opacity: 0;
        }

        /* Layer 1: Bright Central Hot Flash */
        .anim-explosion-flash {
          position: absolute;
          width: 20px;
          height: 20px;
          border-radius: 45% 55% 60% 40% / 50% 40% 60% 50%;
          background: radial-gradient(circle, #ffffff 0%, #fef08a 30%, rgba(254, 240, 138, 0) 100%);
          animation: animExplosionFlash 0.3s ease-out forwards;
        }

        @keyframes animExplosionFlash {
          0% { transform: scale(0.2); opacity: 1; }
          50% { transform: scale(14); opacity: 0.95; }
          100% { transform: scale(18); opacity: 0; }
        }

        /* Layer 2: Intense Hot Center Core */
        .anim-fireball-core {
          position: absolute;
          width: 40px;
          height: 35px;
          border-radius: 42% 58% 65% 35% / 55% 45% 55% 45%;
          background: radial-gradient(circle at 45% 45%, #ffffff 0%, #fef08a 35%, #f97316 75%, rgba(220, 38, 38, 0) 100%);
          box-shadow: 0 0 35px #fef08a, 0 0 70px #f97316;
          animation: animFireballCoreBurst 0.6s cubic-bezier(0.1, 0.9, 0.2, 1) forwards;
        }

        @keyframes animFireballCoreBurst {
          0% { transform: scale(0.2); opacity: 1; }
          40% { transform: scale(4.2); opacity: 1; }
          100% { transform: scale(6); opacity: 0; }
        }

        /* Layer 3: Organic Multi-Blob Fireball Mass */
        .anim-flame-blob {
          position: absolute;
          background: radial-gradient(circle at 42% 42%, #fff7ed 0%, #fef08a 25%, #ea580c 60%, #991b1b 85%, rgba(153, 27, 27, 0) 100%);
          box-shadow: inset 0 0 24px #fef08a;
          will-change: transform, opacity;
        }

        .anim-flame-blob.blob-1 {
          width: 130px; height: 95px;
          border-radius: 45% 55% 65% 35% / 55% 45% 55% 45%;
          animation: animBlobExpand1 0.75s ease-out forwards;
        }
        .anim-flame-blob.blob-2 {
          width: 140px; height: 85px;
          border-radius: 65% 35% 45% 55% / 40% 60% 40% 60%;
          animation: animBlobExpand2 0.78s ease-out forwards;
        }
        .anim-flame-blob.blob-3 {
          width: 110px; height: 115px;
          border-radius: 35% 65% 55% 45% / 60% 40% 60% 40%;
          animation: animBlobExpand3 0.72s ease-out forwards;
        }
        .anim-flame-blob.blob-4 {
          width: 125px; height: 90px;
          border-radius: 55% 45% 35% 65% / 45% 55% 65% 35%;
          animation: animBlobExpand4 0.8s ease-out forwards;
        }
        .anim-flame-blob.blob-5 {
          width: 100px; height: 120px;
          border-radius: 50% 50% 60% 40% / 35% 65% 45% 55%;
          animation: animBlobExpand5 0.76s ease-out forwards;
        }

        @keyframes animBlobExpand1 {
          0% { transform: translate(-50%, -50%) scale(0.1); opacity: 1; }
          50% { transform: translate(-120px, -70px) scale(1.6); opacity: 0.95; }
          100% { transform: translate(-170px, -100px) scale(2.1); opacity: 0; }
        }
        @keyframes animBlobExpand2 {
          0% { transform: translate(-50%, -50%) scale(0.1); opacity: 1; }
          50% { transform: translate(110px, -60px) scale(1.7); opacity: 0.95; }
          100% { transform: translate(165px, -90px) scale(2.2); opacity: 0; }
        }
        @keyframes animBlobExpand3 {
          0% { transform: translate(-50%, -50%) scale(0.1); opacity: 1; }
          50% { transform: translate(-80px, 80px) scale(1.5); opacity: 0.95; }
          100% { transform: translate(-120px, 120px) scale(1.95); opacity: 0; }
        }
        @keyframes animBlobExpand4 {
          0% { transform: translate(-50%, -50%) scale(0.1); opacity: 1; }
          50% { transform: translate(95px, 75px) scale(1.65); opacity: 0.95; }
          100% { transform: translate(140px, 110px) scale(2.1); opacity: 0; }
        }
        @keyframes animBlobExpand5 {
          0% { transform: translate(-50%, -50%) scale(0.1); opacity: 1; }
          50% { transform: translate(0px, -110px) scale(1.7); opacity: 0.95; }
          100% { transform: translate(0px, -155px) scale(2.2); opacity: 0; }
        }

        /* Outer Asymmetric Flame Tongues & Spikes */
        .anim-flame-frag {
          position: absolute;
          background: radial-gradient(circle at 35% 35%, #fef08a 0%, #f97316 45%, rgba(185, 28, 28, 0) 100%);
          border-radius: 35% 65% 30% 70% / 70% 30% 65% 35%;
          will-change: transform, opacity;
        }
        .anim-flame-frag.frag-1 { width: 45px; height: 35px; animation: animFragFly1 0.68s ease-out forwards; }
        .anim-flame-frag.frag-2 { width: 35px; height: 50px; animation: animFragFly2 0.74s ease-out forwards; }
        .anim-flame-frag.frag-3 { width: 50px; height: 32px; animation: animFragFly3 0.64s ease-out forwards; }
        .anim-flame-frag.frag-4 { width: 38px; height: 44px; animation: animFragFly4 0.76s ease-out forwards; }
        .anim-flame-frag.frag-5 { width: 48px; height: 36px; animation: animFragFly5 0.7s ease-out forwards; }
        .anim-flame-frag.frag-6 { width: 36px; height: 48px; animation: animFragFly6 0.78s ease-out forwards; }
        .anim-flame-frag.frag-7 { width: 42px; height: 38px; animation: animFragFly7 0.66s ease-out forwards; }
        .anim-flame-frag.frag-8 { width: 40px; height: 46px; animation: animFragFly8 0.72s ease-out forwards; }

        @keyframes animFragFly1 { 0% { transform: translate(-50%, -50%) scale(0.2); opacity: 1; } 100% { transform: translate(-180px, -100px) scale(1.6) rotate(60deg); opacity: 0; } }
        @keyframes animFragFly2 { 0% { transform: translate(-50%, -50%) scale(0.2); opacity: 1; } 100% { transform: translate(190px, -90px) scale(1.5) rotate(-50deg); opacity: 0; } }
        @keyframes animFragFly3 { 0% { transform: translate(-50%, -50%) scale(0.2); opacity: 1; } 100% { transform: translate(-140px, 140px) scale(1.4) rotate(40deg); opacity: 0; } }
        @keyframes animFragFly4 { 0% { transform: translate(-50%, -50%) scale(0.2); opacity: 1; } 100% { transform: translate(150px, 130px) scale(1.7) rotate(-65deg); opacity: 0; } }
        @keyframes animFragFly5 { 0% { transform: translate(-50%, -50%) scale(0.2); opacity: 1; } 100% { transform: translate(0px, -180px) scale(1.5) rotate(15deg); opacity: 0; } }
        @keyframes animFragFly6 { 0% { transform: translate(-50%, -50%) scale(0.2); opacity: 1; } 100% { transform: translate(0px, 170px) scale(1.6) rotate(-25deg); opacity: 0; } }
        @keyframes animFragFly7 { 0% { transform: translate(-50%, -50%) scale(0.2); opacity: 1; } 100% { transform: translate(-195px, -10px) scale(1.5) rotate(75deg); opacity: 0; } }
        @keyframes animFragFly8 { 0% { transform: translate(-50%, -50%) scale(0.2); opacity: 1; } 100% { transform: translate(200px, -10px) scale(1.6) rotate(-80deg); opacity: 0; } }

        /* Layer 3: Oval Flattened Perspective Shockwave Ring */
        .anim-explosion-shockwave {
          position: absolute;
          width: 25px; height: 25px;
          border-radius: 45% 55% 48% 52% / 52% 48% 55% 45%;
          border: 4px solid #f97316;
          box-shadow: 0 0 24px #f97316, inset 0 0 16px rgba(249, 115, 22, 0.5);
          animation: animExplosionShockwave 0.85s ease-out forwards;
        }
        @keyframes animExplosionShockwave {
          0% { transform: translate(-50%, -50%) scaleY(0.75) scale(0.2); opacity: 1; border-width: 6px; }
          100% { transform: translate(-50%, -50%) scaleY(0.75) scale(16); opacity: 0; border-width: 1px; border-color: rgba(249, 115, 22, 0); }
        }

        /* Layer 6: Multi-Puff Irregular Smoke Cloud (slow expanding, lingering) */
        .anim-smoke-cloud-layer {
          position: absolute; width: 100%; height: 100%; pointer-events: none;
        }
        .anim-smoke-puff {
          position: absolute; top: 50%; left: 50%;
          background: radial-gradient(circle at 45% 45%, rgba(120, 53, 15, 0.75) 0%, rgba(30, 41, 59, 0.8) 55%, rgba(15, 23, 42, 0) 100%);
          will-change: transform, opacity;
        }
        .anim-smoke-puff.puff-1 { width: 110px; height: 85px; border-radius: 65% 35% 60% 40% / 40% 60% 35% 65%; animation: animSmokePuff1 1.4s ease-out forwards; }
        .anim-smoke-puff.puff-2 { width: 120px; height: 90px; border-radius: 40% 60% 35% 65% / 65% 35% 60% 40%; animation: animSmokePuff2 1.45s ease-out forwards; }
        .anim-smoke-puff.puff-3 { width: 95px; height: 110px; border-radius: 55% 45% 65% 35% / 45% 55% 35% 65%; animation: animSmokePuff3 1.35s ease-out forwards; }
        .anim-smoke-puff.puff-4 { width: 115px; height: 80px; border-radius: 35% 65% 45% 55% / 55% 45% 65% 35%; animation: animSmokePuff4 1.5s ease-out forwards; }
        .anim-smoke-puff.puff-5 { width: 100px; height: 100px; border-radius: 60% 40% 50% 50% / 50% 50% 40% 60%; animation: animSmokePuff5 1.4s ease-out forwards; }

        @keyframes animSmokePuff1 { 0% { transform: translate(-50%, -50%) scale(0.2) rotate(0deg); opacity: 0.85; } 45% { opacity: 0.75; } 100% { transform: translate(-140px, -80px) scale(2.4) rotate(25deg); opacity: 0; } }
        @keyframes animSmokePuff2 { 0% { transform: translate(-50%, -50%) scale(0.2) rotate(0deg); opacity: 0.85; } 45% { opacity: 0.75; } 100% { transform: translate(145px, -70px) scale(2.5) rotate(-30deg); opacity: 0; } }
        @keyframes animSmokePuff3 { 0% { transform: translate(-50%, -50%) scale(0.2) rotate(0deg); opacity: 0.85; } 45% { opacity: 0.7; } 100% { transform: translate(-95px, 95px) scale(2.2) rotate(20deg); opacity: 0; } }
        @keyframes animSmokePuff4 { 0% { transform: translate(-50%, -50%) scale(0.2) rotate(0deg); opacity: 0.85; } 45% { opacity: 0.7; } 100% { transform: translate(110px, 90px) scale(2.3) rotate(-20deg); opacity: 0; } }
        @keyframes animSmokePuff5 { 0% { transform: translate(-50%, -50%) scale(0.2) rotate(0deg); opacity: 0.9; } 45% { opacity: 0.8; } 100% { transform: translate(0px, -135px) scale(2.6) rotate(15deg); opacity: 0; } }

        /* Flying Spark Particles */
        .anim-explosion-sparks { position: absolute; width: 100%; height: 100%; }
        .anim-spark-p { position: absolute; top: 50%; left: 50%; width: 6px; height: 6px; border-radius: 50%; background: #fef08a; box-shadow: 0 0 8px #f97316; }
        .anim-spark-p.p1 { animation: animSparkFly1 0.7s ease-out forwards; }
        .anim-spark-p.p2 { animation: animSparkFly2 0.75s ease-out forwards; }
        .anim-spark-p.p3 { animation: animSparkFly3 0.65s ease-out forwards; }
        .anim-spark-p.p4 { animation: animSparkFly4 0.8s ease-out forwards; }
        .anim-spark-p.p5 { animation: animSparkFly5 0.7s ease-out forwards; }
        .anim-spark-p.p6 { animation: animSparkFly6 0.85s ease-out forwards; }
        @keyframes animSparkFly1 { 100% { transform: translate(-140px, -110px) scale(0.2); opacity: 0; } }
        @keyframes animSparkFly2 { 100% { transform: translate(150px, -90px) scale(0.2); opacity: 0; } }
        @keyframes animSparkFly3 { 100% { transform: translate(-120px, 120px) scale(0.2); opacity: 0; } }
        @keyframes animSparkFly4 { 100% { transform: translate(130px, 130px) scale(0.2); opacity: 0; } }
        @keyframes animSparkFly5 { 100% { transform: translate(0px, -160px) scale(0.2); opacity: 0; } }
        @keyframes animSparkFly6 { 100% { transform: translate(0px, 150px) scale(0.2); opacity: 0; } }
      `}</style>
      
      <div className={`anim-explosion-container ${animPhase}`}>
        {/* Layer 1: Central hot flash */}
        <div className="anim-explosion-flash" />

        {/* Layer 2: Fireball core */}
        <div className="anim-fireball-core" />

        {/* Layer 3: Organic blob fireball mass */}
        <div className="anim-flame-blob blob-1" />
        <div className="anim-flame-blob blob-2" />
        <div className="anim-flame-blob blob-3" />
        <div className="anim-flame-blob blob-4" />
        <div className="anim-flame-blob blob-5" />

        {/* Layer 4: Outer flame tongues */}
        <span className="anim-flame-frag frag-1" />
        <span className="anim-flame-frag frag-2" />
        <span className="anim-flame-frag frag-3" />
        <span className="anim-flame-frag frag-4" />
        <span className="anim-flame-frag frag-5" />
        <span className="anim-flame-frag frag-6" />
        <span className="anim-flame-frag frag-7" />
        <span className="anim-flame-frag frag-8" />

        {/* Layer 5: Oval shockwave ring */}
        <div className="anim-explosion-shockwave" />

        {/* Layer 6: Lingering smoke puffs */}
        <div className="anim-smoke-cloud-layer">
          <span className="anim-smoke-puff puff-1" />
          <span className="anim-smoke-puff puff-2" />
          <span className="anim-smoke-puff puff-3" />
          <span className="anim-smoke-puff puff-4" />
          <span className="anim-smoke-puff puff-5" />
        </div>

        {/* Layer 7: Flying spark particles */}
        <div className="anim-explosion-sparks">
          <span className="anim-spark-p p1" />
          <span className="anim-spark-p p2" />
          <span className="anim-spark-p p3" />
          <span className="anim-spark-p p4" />
          <span className="anim-spark-p p5" />
          <span className="anim-spark-p p6" />
        </div>
      </div>
    </>
  );
}

export default Explosion;
