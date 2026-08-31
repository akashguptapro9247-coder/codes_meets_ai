"use client";

import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { NewSpiderManModelTest } from "./NewSpiderManModelTest";

// React Error Boundary for handling missing / corrupt 3D GLB assets
class GLTFErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.warn("3D Asset Loader: Unable to load GLTF character model.", error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export function SpiderManScene({ state, onHandPosChange, targetPoint }) {
  const fallbackPlaceholder = (
    <div style={{ width: '100%', maxWidth: '28rem', margin: '0 auto', padding: '24px', background: 'rgba(17,24,39,0.9)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '16px', textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
        <svg style={{ width: '48px', height: '48px', color: 'rgba(239,68,68,0.8)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#ffffff', marginBottom: '8px' }}>3D Character Asset Missing</h3>
    </div>
  );

  return (
    <>
      {/* ============ 3D CANVAS ============ */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', overflow: 'visible', pointerEvents: 'none', userSelect: 'none', zIndex: 10 }}>
        <div style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
          <GLTFErrorBoundary
            fallback={
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {fallbackPlaceholder}
              </div>
            }
          >
            <Suspense fallback={
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', fontWeight: 600, color: '#9ca3af' }}>
                Deploying web-shooter canvas...
              </div>
            }>
              <Canvas
                shadows
                camera={{ position: [0, 1.5, 5.5], fov: 45 }}
                gl={{ antialias: true, alpha: true }}
                style={{ background: "transparent", pointerEvents: "none" }}
              >
                <ambientLight intensity={0.8} />
                <directionalLight
                  position={[5, 10, 5]}
                  intensity={1.5}
                  castShadow
                  shadow-mapSize-width={1024}
                  shadow-mapSize-height={1024}
                />
                <pointLight position={[5, -5, -3]} intensity={2} color="#00ffff" />
                <pointLight position={[-5, -5, 3]} intensity={2.5} color="#ff0033" />
                <pointLight position={[0, 5, 2]} intensity={1} color="#ffffff" />

                <NewSpiderManModelTest
                  state={state}
                  onHandPosChange={onHandPosChange}
                  targetPoint={targetPoint}
                />
              </Canvas>
            </Suspense>
          </GLTFErrorBoundary>
        </div>
      </div>
    </>
  );
}
