import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

// --------------------------------------------------------------------------
// 1. Dynamic Cyber Grid Plane
// --------------------------------------------------------------------------
function CyberGridPlane() {
  const gridRef = useRef();

  useFrame((state) => {
    if (gridRef.current) {
      // Subtle forward grid movement effect
      gridRef.current.position.z = (state.clock.getElapsedTime() * 0.8) % 2;
    }
  });

  return (
    <group ref={gridRef} position={[0, -3.5, 0]} rotation={[-Math.PI / 2.5, 0, 0]}>
      <gridHelper
        args={[45, 45, '#00f3ff', '#00f3ff']}
        position={[0, 0, 0]}
      >
        <lineBasicMaterial
          attach="material"
          color="#00f3ff"
          transparent
          opacity={0.18}
          blending={THREE.AdditiveBlending}
        />
      </gridHelper>
    </group>
  );
}

// --------------------------------------------------------------------------
// 2. Optimized 3D Cyber Particle Field
// --------------------------------------------------------------------------
function ParticleField({ count = 300 }) {
  const pointsRef = useRef();

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const cyan = new THREE.Color('#00f3ff');
    const magenta = new THREE.Color('#e026ff');

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 35;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 25;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 35;

      const mixColor = Math.random() > 0.6 ? magenta : cyan;
      col[i * 3] = mixColor.r;
      col[i * 3 + 1] = mixColor.g;
      col[i * 3 + 2] = mixColor.b;
    }
    return [pos, col];
  }, [count]);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.03;
      pointsRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.02) * 0.05;
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
        size={0.12}
        vertexColors
        transparent
        opacity={0.7}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// --------------------------------------------------------------------------
// 3. Central Wireframe Cyber Geometry (AI Core Nodes)
// --------------------------------------------------------------------------
function CyberGeometries() {
  const outerRingRef = useRef();
  const innerNodeRef = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (outerRingRef.current) {
      outerRingRef.current.rotation.x = t * 0.15;
      outerRingRef.current.rotation.y = t * 0.25;
    }
    if (innerNodeRef.current) {
      innerNodeRef.current.rotation.y = -t * 0.35;
      innerNodeRef.current.rotation.z = t * 0.2;
    }
  });

  return (
    <group position={[0, 0.5, -4]}>
      {/* Outer Rotating Wireframe Icosahedron */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <mesh ref={outerRingRef}>
          <icosahedronGeometry args={[2.4, 1]} />
          <meshBasicMaterial
            wireframe
            color="#00f3ff"
            transparent
            opacity={0.15}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </Float>

      {/* Inner Glowing Magenta Core Wireframe */}
      <mesh ref={innerNodeRef}>
        <octahedronGeometry args={[1.2, 0]} />
        <meshBasicMaterial
          wireframe
          color="#e026ff"
          transparent
          opacity={0.3}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

// --------------------------------------------------------------------------
// 4. Parallax Camera & Lighting Rig
// --------------------------------------------------------------------------
function CameraRig({ mousePosition }) {
  useFrame((state) => {
    // Smooth Lerp Camera position based on mouse coordinates
    const targetX = (mousePosition.current.x * 0.8);
    const targetY = (mousePosition.current.y * 0.5);

    state.camera.position.x += (targetX - state.camera.position.x) * 0.04;
    state.camera.position.y += (targetY - state.camera.position.y) * 0.04;
    state.camera.lookAt(0, 0, 0);
  });

  return null;
}

// --------------------------------------------------------------------------
// Master Three.js Canvas Component
// --------------------------------------------------------------------------
export default function ThreeBackground({ mousePosition }) {
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none' }}>
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        onCreated={({ gl }) => {
          gl.setClearColor(new THREE.Color('#030712'), 1);
        }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} color="#00f3ff" />
        <pointLight position={[-10, -10, -5]} intensity={1.5} color="#e026ff" />
        
        {/* Subtle Atmospheric Fog */}
        <fog attach="fog" args={['#030712', 5, 25]} />

        <CyberGridPlane />
        <ParticleField count={350} />
        <CyberGeometries />
        <CameraRig mousePosition={mousePosition} />
      </Canvas>
    </div>
  );
}
