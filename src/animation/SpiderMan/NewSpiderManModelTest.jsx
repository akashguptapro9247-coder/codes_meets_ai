"use client";

import React, { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF, Line } from "@react-three/drei";
import * as THREE from "three";
import spidermanModelUrl from "./assets/spiderman-new.glb?url";

useGLTF.preload(spidermanModelUrl);

// =============================================================
// SHOOTING WEB 3D IMPLEMENTATION
// =============================================================
function ShootingWebLine({ leftHandBoneRef, targetPoint }) {
  const { camera, gl } = useThree();
  const lineRef = useRef(null);
  const startTimeRef = useRef(0);

  useEffect(() => {
    startTimeRef.current = performance.now();
  }, []);

  useFrame(() => {
    const leftHandBone = leftHandBoneRef.current;
    if (!leftHandBone || !targetPoint || !lineRef.current) return;
    
    // 1. Get start position (live left hand world position)
    const startPos = new THREE.Vector3();
    leftHandBone.getWorldPosition(startPos);
    
    // 2. Unproject targetPoint from screen to 3D plane
    const rect = gl.domElement.getBoundingClientRect();
    const ndcX = ((targetPoint.x - rect.left) / rect.width) * 2 - 1;
    const ndcY = -((targetPoint.y - rect.top) / rect.height) * 2 + 1;
    
    // Unproject to the hanging web's exact depth (Z = 0.4)
    const targetDepth = 0.4;
    const endPos = new THREE.Vector3(ndcX, ndcY, 0.5);
    endPos.unproject(camera);
    endPos.sub(camera.position).normalize();
    const distance = (targetDepth - camera.position.z) / endPos.z;
    const hitPos = new THREE.Vector3().copy(camera.position).add(endPos.multiplyScalar(distance));
    
    // 3. Animate length over 400ms to match the SHOOTING phase duration
    const elapsed = performance.now() - startTimeRef.current;
    const progress = Math.min(elapsed / 400, 1.0);
    
    const currentEndPos = new THREE.Vector3().lerpVectors(startPos, hitPos, progress);
    
    // 4. Update line geometry points
    lineRef.current.geometry.setPositions([
      startPos.x, startPos.y, startPos.z,
      currentEndPos.x, currentEndPos.y, currentEndPos.z
    ]);
  });

  return (
    <Line
      ref={lineRef}
      points={[[0, 0, 0], [0, 0, 0]]} // updated dynamically in useFrame
      color="white"
      lineWidth={2.7}
      opacity={0.8}
      transparent
    />
  );
}

// =============================================================
// 1. SPIDER-MAN POSE CONFIGURATION
// These are finalized LOCAL bone Euler rotations in radians.
// DO NOT OVERWRITE THESE VALUES with temporary animations.
// =============================================================
export const SPIDERMAN_POSE_CONFIG = {
  rightArm: {
    shoulder: { x: 1.3788, y: -0.5411, z: 2.7576 },
    bicep:    { x: 1.2741, y: -0.5411, z: 0.1222 },
    elbow:    { x: 1.0647, y: 1.9199,  z: 0.2967 },
    forearm:  { x: 0.0175, y: 0.0175,  z: 0.1047 },
    hand:     { x: -0.0524, y: -0.6109, z: -0.9599 },
  },
  leftArm: {
    shoulder: { x: 1.5184, y: -0.4189, z: -1.1694 }, // 87°, -24°, -67°
    bicep:    { x: 0.3491, y: 0.0175,  z: 0.1222 },  // 20°, 1°, 7°
    elbow:    { x: 3.1416, y: 0.7505,  z: 1.7802 },  // 180°, 43°, 102°
    forearm:  { x: 0.0000, y: 1.6232,  z: 0.1745 },  // 0°, 93°, 10°
    hand:     { x: 0.4887, y: -0.2967, z: 1.1345 },  // 28°, -17°, 65°
  },
  rightLeg: {
    hip:  { x: -1.7104, y: 0.0175, z: 0.9948 },
    leg:  { x: 0.6458,  y: 1.6755, z: 0.0175 },
    knee: { x: 2.3562,  y: 0.0000, z: 0.0000 },
    shin: { x: 0.0000,  y: 0.0000, z: 0.0000 },
    foot: { x: -0.8727, y: 0.0000, z: 0.0000 },
    toe:  { x: 0.0000,  y: 0.0000, z: 0.0000 },
  },
  leftLeg: {
    hip:  { x: -1.8500, y: -0.3840, z: -0.1920 },
    leg:  { x: 0.0000,  y: 0.2094,  z: -1.0123 },
    knee: { x: 2.4958,  y: 0.1222,  z: 0.6981 },
    shin: { x: 0.0000,  y: 0.3665,  z: -0.2443 },
    foot: { x: -1.0647, y: 0.0000,  z: 0.0000 },
    toe:  { x: 0.0000,  y: 0.0000,  z: 0.0000 },
  }
};

// =============================================================
// 2. SWING ANIMATION CONFIGURATION
// Configures the continuous pendulum arc.
// =============================================================
export const SWING_CONFIG = {
  speed: 0.6,       // radians per second
  maxAngle: 0.12,   // ~7 degrees maximum swing amplitude
};

// =============================================================
// 3. HEAD TARGETING CONFIGURATION
// Configures the temporary head rotation towards clicked options.
// =============================================================
export const HEAD_TARGET_CONFIG = {
  maxAdjustment: 0.35, // ~20 degrees maximum horizontal tracking
};

// =============================================================
// 4. LEFT ARM SHOOTING CONFIGURATION
// Configures the temporary additive offsets during shooting.
// =============================================================
export const LEFT_ARM_SHOOT_CONFIG = {
  maxShoulderAdjustment: 0.50, // ~28 degrees
  maxElbowAdjustment: 0.65,    // ~37 degrees
};

// =============================================================
// 5. HANGING WEB CONFIGURATION
// Configures the static spiderweb line Spider-Man hangs from.
// =============================================================
export const HANGING_WEB_CONFIG = {
  posVertical: 2.5,
  posHorizontal: 0,
  posDepth: 0.4,
  length: 0.9,
  thickness: 2.7,
  rotX: 180,
  rotY: 0,
  rotZ: 0,
  offsetX: 0,
  offsetY: 0.05,
  offsetZ: 0,
};

// =============================================================
// 6. ENTRANCE ANIMATION CONFIGURATION
// One-time cinematic descent from above the viewport at quiz start.
// This only adds a transient offset to the existing pivot group;
// the existing baseline/final position is never altered.
// =============================================================
export const ENTRANCE_DURATION = 1600; // milliseconds

export function NewSpiderManModelTest({ state, onHandPosChange, targetPoint }) {
  // state is used to conditionally render the shooting web

  const { camera, gl } = useThree();
  const groupRef = useRef(null);
  const gltf = useGLTF(spidermanModelUrl);

  // ==================== ARM BONE REFS (DO NOT TOUCH) ====================
  const rightShoulderBone = useRef(null);
  const rightBicepBone = useRef(null);
  const rightElbowBone = useRef(null);
  const rightForearmBone = useRef(null);
  const rightHandBone = useRef(null);

  const leftShoulderBone = useRef(null);
  const leftBicepBone = useRef(null);
  const leftElbowBone = useRef(null);
  const leftForearmBone = useRef(null);
  const leftHandBone = useRef(null);

  // ==================== RIGHT LEG BONE REFS ====================
  const rightHipBone = useRef(null);
  const rightLegBone = useRef(null);
  const rightKneeBone = useRef(null);
  const rightShinBone = useRef(null);
  const rightFootBone = useRef(null);
  const rightToeBone = useRef(null);

  // ==================== LEFT LEG BONE REFS ====================
  const leftHipBone = useRef(null);
  const leftLegBone = useRef(null);
  const leftKneeBone = useRef(null);
  const leftShinBone = useRef(null);
  const leftFootBone = useRef(null);
  const leftToeBone = useRef(null);

  // ==================== HEAD BONE REF ====================
  const headBone = useRef(null);
  const baseHeadRotationRef = useRef(null);

  // ==================== ENTRANCE ANIMATION REFS ====================
  // Tracks the one-time descent phase. The existing baseline is the source of truth;
  // only a transient Y offset is applied to the pivot group and then removed.
  const entranceStartRef = useRef(null);
  const entranceStartOffsetRef = useRef(0);

  // Traverse and discover bones on mount
  useEffect(() => {
    if (!gltf) return;
    const scene = gltf.scene;

    scene.traverse((child) => {
      if (child.type === "Bone") {
        const name = child.name;
        
        // ---- Right Arm ----
        if (name.startsWith("shoulderR") && !rightShoulderBone.current) rightShoulderBone.current = child;
        else if (name.startsWith("bicepR") && !rightBicepBone.current) rightBicepBone.current = child;
        else if (name.startsWith("elbowR") && !rightElbowBone.current) rightElbowBone.current = child;
        else if (name.startsWith("forearmR") && !rightForearmBone.current) rightForearmBone.current = child;
        else if (name.startsWith("handR") && !rightHandBone.current) rightHandBone.current = child;
        
        // ---- Left Arm ----
        else if (name.startsWith("shoulderL") && !leftShoulderBone.current) leftShoulderBone.current = child;
        else if (name.startsWith("bicepL") && !leftBicepBone.current) leftBicepBone.current = child;
        else if (name.startsWith("elbowL") && !leftElbowBone.current) leftElbowBone.current = child;
        else if (name.startsWith("forearmL") && !leftForearmBone.current) leftForearmBone.current = child;
        else if (name.startsWith("handL") && !leftHandBone.current) leftHandBone.current = child;

        // ---- Right Leg ----
        else if (name.startsWith("hipR") && !rightHipBone.current) rightHipBone.current = child;
        else if (name.startsWith("legR") && !rightLegBone.current) rightLegBone.current = child;
        else if (name.startsWith("kneeR") && !rightKneeBone.current) rightKneeBone.current = child;
        else if (name.startsWith("shinR") && !rightShinBone.current) rightShinBone.current = child;
        else if (name.startsWith("footR") && !rightFootBone.current) rightFootBone.current = child;
        else if (name === "toeR_058" && !rightToeBone.current) rightToeBone.current = child;
        
        // ---- Left Leg ----
        else if (name.startsWith("hipL") && !leftHipBone.current) leftHipBone.current = child;
        else if (name.startsWith("legL") && !leftLegBone.current) leftLegBone.current = child;
        else if (name.startsWith("kneeL") && !leftKneeBone.current) leftKneeBone.current = child;
        else if (name.startsWith("shinL") && !leftShinBone.current) leftShinBone.current = child;
        else if (name.startsWith("footL") && !leftFootBone.current) leftFootBone.current = child;
        else if (name === "toeL_051" && !leftToeBone.current) leftToeBone.current = child;

        // ---- Head ----
        else if (name === "head_05" && !headBone.current) {
          headBone.current = child;
          baseHeadRotationRef.current = {
            x: child.rotation.x,
            y: child.rotation.y,
            z: child.rotation.z
          };
        }
      }
    });

    // Upside-down orientation, top-center position
    scene.rotation.set(0, 0, Math.PI);
    scene.position.set(0, 2.7, 0);
    scene.scale.setScalar(1.0);
  }, [gltf]);

  // Track dynamic shoulder, elbow, and head adjustments during SHOOTING
  const shoulderOffsetRef = useRef(0);
  const elbowOffsetRef = useRef(0);
  const headOffsetRef = useRef(0);

  // Apply rotations in the render loop
  useFrame(() => {
    // =================================================================
    // 0. Calculate temporary dynamic shooting adjustments
    // =================================================================
    let targetShoulderOffset = 0;
    let targetElbowOffset = 0;
    let targetHeadOffset = 0;

    const isTargeting = (state === "SHOOTING" || state === "IMPACT") && targetPoint && headBone.current;

    if (isTargeting) {
      const rect = gl.domElement.getBoundingClientRect();
      const normalizedX = ((targetPoint.x - rect.left) / rect.width) * 2 - 1;
      
      // 1. Get live head world position to calculate accurate 3D direction
      const headPos = new THREE.Vector3();
      headBone.current.getWorldPosition(headPos);

      // 2. Get 3D world position of the clicked target (Z = 0.4 plane)
      const ndcY = -((targetPoint.y - rect.top) / rect.height) * 2 + 1;
      const endPos = new THREE.Vector3(normalizedX, ndcY, 0.5);
      endPos.unproject(camera);
      endPos.sub(camera.position).normalize();
      const distance = (0.4 - camera.position.z) / endPos.z;
      const targetWorldPos = new THREE.Vector3().copy(camera.position).add(endPos.multiplyScalar(distance));

      // 3. Calculate horizontal look angle (yaw) in the XZ plane
      const dx = targetWorldPos.x - headPos.x;
      const dz = targetWorldPos.z - headPos.z;
      
      // Invert the yaw angle so he visually aims in the correct direction (since he is upside down)
      const yawAngle = -Math.atan2(dx, dz);

      // ==================== ARM (SHOULDER + ELBOW) ADJUSTMENT ====================
      // Coordinated subtle adjustment based on the target direction
      targetShoulderOffset = Math.max(-LEFT_ARM_SHOOT_CONFIG.maxShoulderAdjustment, Math.min(LEFT_ARM_SHOOT_CONFIG.maxShoulderAdjustment, yawAngle));
      targetElbowOffset = Math.max(-LEFT_ARM_SHOOT_CONFIG.maxElbowAdjustment, Math.min(LEFT_ARM_SHOOT_CONFIG.maxElbowAdjustment, yawAngle));
      
      // ==================== HEAD LOOK-AT ADJUSTMENT ====================
      targetHeadOffset = Math.max(-HEAD_TARGET_CONFIG.maxAdjustment, Math.min(HEAD_TARGET_CONFIG.maxAdjustment, yawAngle));
    }
    
    // Smoothly interpolate current offsets toward targets (spring-like effect)
    const smoothing = isTargeting ? 0.22 : 0.40;
    shoulderOffsetRef.current += (targetShoulderOffset - shoulderOffsetRef.current) * smoothing;
    elbowOffsetRef.current += (targetElbowOffset - elbowOffsetRef.current) * smoothing;
    headOffsetRef.current += (targetHeadOffset - headOffsetRef.current) * smoothing;

    // =================================================================
    // 1. Right Arm — BASE POSE ONLY
    // =================================================================
    const rPose = SPIDERMAN_POSE_CONFIG.rightArm;
    if (rightShoulderBone.current) rightShoulderBone.current.rotation.set(rPose.shoulder.x, rPose.shoulder.y, rPose.shoulder.z);
    if (rightBicepBone.current) rightBicepBone.current.rotation.set(rPose.bicep.x, rPose.bicep.y, rPose.bicep.z);
    if (rightElbowBone.current) rightElbowBone.current.rotation.set(rPose.elbow.x, rPose.elbow.y, rPose.elbow.z);
    if (rightForearmBone.current) rightForearmBone.current.rotation.set(rPose.forearm.x, rPose.forearm.y, rPose.forearm.z);
    if (rightHandBone.current) rightHandBone.current.rotation.set(rPose.hand.x, rPose.hand.y, rPose.hand.z);

    // =================================================================
    // 2. Left Arm — BASE POSE + TEMPORARY ADJUSTMENTS
    // =================================================================
    const lPose = SPIDERMAN_POSE_CONFIG.leftArm;
    
    // Apply coordinated temporary adjustment to shoulder and elbow
    if (leftShoulderBone.current) leftShoulderBone.current.rotation.set(lPose.shoulder.x, lPose.shoulder.y, lPose.shoulder.z + shoulderOffsetRef.current);
    if (leftBicepBone.current) leftBicepBone.current.rotation.set(lPose.bicep.x, lPose.bicep.y, lPose.bicep.z);
    if (leftElbowBone.current) leftElbowBone.current.rotation.set(lPose.elbow.x, lPose.elbow.y, lPose.elbow.z + elbowOffsetRef.current);
    
    if (leftForearmBone.current) leftForearmBone.current.rotation.set(lPose.forearm.x, lPose.forearm.y, lPose.forearm.z);
    if (leftHandBone.current) leftHandBone.current.rotation.set(lPose.hand.x, lPose.hand.y, lPose.hand.z);

    // =================================================================
    // 3. Right Leg — BASE POSE ONLY
    // =================================================================
    const rlPose = SPIDERMAN_POSE_CONFIG.rightLeg;
    if (rightHipBone.current) rightHipBone.current.rotation.set(rlPose.hip.x, rlPose.hip.y, rlPose.hip.z);
    if (rightLegBone.current) rightLegBone.current.rotation.set(rlPose.leg.x, rlPose.leg.y, rlPose.leg.z);
    if (rightKneeBone.current) rightKneeBone.current.rotation.set(rlPose.knee.x, rlPose.knee.y, rlPose.knee.z);
    if (rightShinBone.current) rightShinBone.current.rotation.set(rlPose.shin.x, rlPose.shin.y, rlPose.shin.z);
    if (rightFootBone.current) rightFootBone.current.rotation.set(rlPose.foot.x, rlPose.foot.y, rlPose.foot.z);
    if (rightToeBone.current) rightToeBone.current.rotation.set(rlPose.toe.x, rlPose.toe.y, rlPose.toe.z);

    // =================================================================
    // 4. Left Leg — BASE POSE ONLY
    // =================================================================
    const llPose = SPIDERMAN_POSE_CONFIG.leftLeg;
    if (leftHipBone.current) leftHipBone.current.rotation.set(llPose.hip.x, llPose.hip.y, llPose.hip.z);
    if (leftLegBone.current) leftLegBone.current.rotation.set(llPose.leg.x, llPose.leg.y, llPose.leg.z);
    if (leftKneeBone.current) leftKneeBone.current.rotation.set(llPose.knee.x, llPose.knee.y, llPose.knee.z);
    if (leftShinBone.current) leftShinBone.current.rotation.set(llPose.shin.x, llPose.shin.y, llPose.shin.z);
    if (leftFootBone.current) leftFootBone.current.rotation.set(llPose.foot.x, llPose.foot.y, llPose.foot.z);
    if (leftToeBone.current) leftToeBone.current.rotation.set(llPose.toe.x, llPose.toe.y, llPose.toe.z);

    // =================================================================
    // 5. Head — BASE POSE + TEMPORARY ADJUSTMENT
    // =================================================================
    if (headBone.current && baseHeadRotationRef.current) {
      // Apply the dynamic horizontal adjustment to Y (yaw) or Z depending on bone orientation.
      // We will try Y first for horizontal look rotation.
      headBone.current.rotation.set(
        baseHeadRotationRef.current.x,
        baseHeadRotationRef.current.y + headOffsetRef.current,
        baseHeadRotationRef.current.z
      );
    }

    // =================================================================
    // 6. Track Left Hand World Position for Web Shooting
    // =================================================================
    if (leftHandBone.current) {
      const vector = new THREE.Vector3();
      leftHandBone.current.getWorldPosition(vector);
      
      // Project to Normalized Device Coordinates (-1 to +1)
      vector.project(camera);
      
      // Convert to screen pixels relative to the viewport
      const rect = gl.domElement.getBoundingClientRect();
      const x = rect.left + (vector.x * 0.5 + 0.5) * rect.width;
      const y = rect.top + (vector.y * -0.5 + 0.5) * rect.height;
      
      onHandPosChange({ x, y });
    }

    // =================================================================
    // 7. Continuous Pendulum Swing + One-time Entrance Descent
    // =================================================================
    if (groupRef.current) {
      const BASE_Y = HANGING_WEB_CONFIG.posVertical + HANGING_WEB_CONFIG.offsetY;

      // --- Existing swing (unchanged behavior) ---
      const time = performance.now() / 1000;
      const theta = Math.sin(time * SWING_CONFIG.speed) * SWING_CONFIG.maxAngle;

      // True pendulum rotation around the top pivot
      // We clear the horizontal position since we are now using rotation
      groupRef.current.position.x = 0;
      groupRef.current.rotation.z = theta;

      // --- Entrance offset (separate phase, applied to the pivot group only) ---
      // Starts Spider-Man completely above the viewport and eases down to the
      // existing baseline, then the offset becomes 0 and is removed.
      let entranceOffsetY = 0;
      if (state === "ENTRANCE") {
        if (entranceStartRef.current === null) {
          entranceStartRef.current = performance.now();
          // Robust "above the screen" distance derived from the live camera
          // frustum so it adapts to viewport size (no fragile hardcoded pixel).
          const perspCam = camera;
          const vFovRad = (perspCam.fov * Math.PI) / 180;
          const distance = Math.abs(perspCam.position.z); // model plane is at z = 0
          const visibleHeight = 2 * Math.tan(vFovRad / 2) * distance;
          entranceStartOffsetRef.current = visibleHeight;
        }
        const elapsed = performance.now() - entranceStartRef.current;
        const t = Math.min(elapsed / ENTRANCE_DURATION, 1);
        const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic (decelerates into place)
        entranceOffsetY = entranceStartOffsetRef.current * (1 - eased);
      } else {
        entranceStartRef.current = null;
      }

      // Final pivot Y = existing baseline + transient entrance offset (0 once finished)
      groupRef.current.position.y = BASE_Y + entranceOffsetY;
    }
  });

  return (
    <>
      {/* 
        The root group acts as the pivot for the pendulum.
        We place it at the top of the hanging web to create a true swinging arc.
      */}
      <group 
        ref={groupRef} 
        position={[0, HANGING_WEB_CONFIG.posVertical + HANGING_WEB_CONFIG.offsetY, 0]}
      >
        {/* We shift the contents DOWN by the pivot amount so Spider-Man remains exactly at his original position */}
        <group position={[0, -(HANGING_WEB_CONFIG.posVertical + HANGING_WEB_CONFIG.offsetY), 0]}>
          
          {/* HANGING WEB SYSTEM - INDEPENDENT OF BONES (DO NOT TOUCH) */}
          <group 
            position={[
              HANGING_WEB_CONFIG.posHorizontal + HANGING_WEB_CONFIG.offsetX, 
              HANGING_WEB_CONFIG.posVertical + HANGING_WEB_CONFIG.offsetY, 
              HANGING_WEB_CONFIG.posDepth + HANGING_WEB_CONFIG.offsetZ
            ]}
            rotation={[
              HANGING_WEB_CONFIG.rotX * Math.PI / 180, 
              HANGING_WEB_CONFIG.rotY * Math.PI / 180, 
              HANGING_WEB_CONFIG.rotZ * Math.PI / 180
            ]}
          >
            <Line
              points={[[0, HANGING_WEB_CONFIG.length, 0], [0, 0, 0]]}
              color="white"
              lineWidth={HANGING_WEB_CONFIG.thickness}
              opacity={0.8}
              transparent
            />
          </group>

          <primitive object={gltf.scene} />
        </group>
      </group>

      {/* SHOOTING WEB - Rendered in absolute world space outside the swinging group */}
      {state === "SHOOTING" && (
        <ShootingWebLine
          leftHandBoneRef={leftHandBone}
          targetPoint={targetPoint ?? null}
        />
      )}
    </>
  );
}
