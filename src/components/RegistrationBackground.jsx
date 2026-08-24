import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

// --------------------------------------------------------------------------
// 1. GIANT AI ARENA CORE REACTOR (3D Centered behind Form)
// --------------------------------------------------------------------------
function GiantArenaCore() {
  const outerRingRef = useRef();
  const midRingRef = useRef();
  const innerRingRef = useRef();
  const coreMeshRef = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (outerRingRef.current) {
      outerRingRef.current.rotation.z = t * 0.1;
      outerRingRef.current.rotation.x = Math.sin(t * 0.15) * 0.12;
    }
    if (midRingRef.current) {
      midRingRef.current.rotation.z = -t * 0.18;
      midRingRef.current.rotation.y = t * 0.12;
    }
    if (innerRingRef.current) {
      innerRingRef.current.rotation.z = t * 0.25;
    }
    if (coreMeshRef.current) {
      coreMeshRef.current.rotation.y = t * 0.35;
      coreMeshRef.current.rotation.x = t * 0.2;
    }
  });

  return (
    <group position={[0, 0, -4.5]}>
      {/* Huge Outer Holographic Reactor Ring */}
      <mesh ref={outerRingRef}>
        <torusGeometry args={[5.2, 0.05, 16, 120]} />
        <meshBasicMaterial
          color="#00f3ff"
          transparent
          opacity={0.45}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Mid Violet Counter-Rotating Ring */}
      <mesh ref={midRingRef}>
        <torusGeometry args={[4.1, 0.04, 16, 90]} />
        <meshBasicMaterial
          color="#e026ff"
          transparent
          opacity={0.4}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Inner Fast Scanning Accelerator Ring */}
      <mesh ref={innerRingRef}>
        <torusGeometry args={[3.2, 0.03, 16, 80]} />
        <meshBasicMaterial
          color="#39ff14"
          transparent
          opacity={0.3}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Core Neural Lattice (Wireframe Icosahedron Reactor Core) */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <mesh ref={coreMeshRef}>
          <icosahedronGeometry args={[2.5, 2]} />
          <meshBasicMaterial
            wireframe
            color="#00f3ff"
            transparent
            opacity={0.18}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </Float>
    </group>
  );
}

// --------------------------------------------------------------------------
// 2. FUTURISTIC CYBERNETIC PLAYER SILHOUETTE (Subtle Background Mesh)
// --------------------------------------------------------------------------
function CyberPlayerSilhouette() {
  const silhouetteGroupRef = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (silhouetteGroupRef.current) {
      silhouetteGroupRef.current.position.y = Math.sin(t * 0.8) * 0.15 - 0.2;
    }
  });

  return (
    <group ref={silhouetteGroupRef} position={[-4.5, -0.5, -5]}>
      {/* Head Silhouette Sphere */}
      <mesh position={[0, 2.2, 0]}>
        <sphereGeometry args={[0.55, 16, 16]} />
        <meshBasicMaterial
          wireframe
          color="#00f3ff"
          transparent
          opacity={0.25}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Torso & Shoulders Silhouette */}
      <mesh position={[0, 0.8, 0]}>
        <cylinderGeometry args={[0.9, 0.6, 2.2, 8]} />
        <meshBasicMaterial
          wireframe
          color="#e026ff"
          transparent
          opacity={0.2}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

// --------------------------------------------------------------------------
// 3. FLOATING FOREGROUND & MIDGROUND PARTICLES
// --------------------------------------------------------------------------
function ArenaParticleField({ count = 280 }) {
  const pointsRef = useRef();

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const cyan = new THREE.Color('#00f3ff');
    const magenta = new THREE.Color('#e026ff');

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 35;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 22;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 28;

      const color = Math.random() > 0.5 ? cyan : magenta;
      col[i * 3] = color.r;
      col[i * 3 + 1] = color.g;
      col[i * 3 + 2] = color.b;
    }
    return [pos, col];
  }, [count]);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.025;
      pointsRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.015) * 0.03;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.16}
        vertexColors
        transparent
        opacity={0.7}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// --------------------------------------------------------------------------
// 4. MOUSE PARALLAX CAMERA RIG
// --------------------------------------------------------------------------
function ParallaxCamera({ mousePosition }) {
  useFrame((state) => {
    if (!mousePosition || !mousePosition.current) return;
    const targetX = mousePosition.current.x * 0.8;
    const targetY = mousePosition.current.y * 0.5;

    state.camera.position.x += (targetX - state.camera.position.x) * 0.04;
    state.camera.position.y += (targetY - state.camera.position.y) * 0.04;
    state.camera.lookAt(0, 0, 0);
  });

  return null;
}

// --------------------------------------------------------------------------
// MASTER REGISTRATION BACKGROUND COMPONENT
// --------------------------------------------------------------------------
export default function RegistrationBackground({ mousePosition }) {
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none' }}>
      <Canvas
        camera={{ position: [0, 0, 7.5], fov: 60 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        onCreated={({ gl }) => {
          gl.setClearColor(new THREE.Color('#030712'), 1);
        }}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} color="#00f3ff" intensity={1.5} />
        <pointLight position={[-10, -10, -5]} color="#e026ff" intensity={1.2} />
        <fog attach="fog" args={['#030712', 4, 25]} />

        <GiantArenaCore />
        <CyberPlayerSilhouette />
        <ArenaParticleField count={300} />
        <ParallaxCamera mousePosition={mousePosition} />
      </Canvas>
    </div>
  );
}
