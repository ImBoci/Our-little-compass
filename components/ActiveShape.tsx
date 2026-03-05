"use client";

import { useRef, useMemo, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

type ModelConfig = {
  file: string;
  scale: number;
  position: [number, number, number];
  rotation: [number, number, number];
};

const MODEL_CONFIG: Record<string, ModelConfig> = {
  "/":           { file: "Heart.glb",     scale: 4.5, position: [0, 0, 0],    rotation: [0, 0, 0] },
  "/cook":       { file: "Food.glb",      scale: 8,   position: [0, -1, 0],   rotation: [0, 0, 0] },
  "/date":       { file: "Explorer.glb",  scale: 1.5, position: [0, -1.5, 0], rotation: [0, -Math.PI / 4, 0] },
  "/milestones": { file: "Cat.glb",       scale: 2.0, position: [0, -1, 0],   rotation: [0, 0, 0] },
  "/memories":   { file: "Polaroids.glb", scale: 4,   position: [0, 0, 0],    rotation: [Math.PI / 2, Math.PI / 2, 0] },
};

const DEFAULT_CONFIG = MODEL_CONFIG["/"];

function modelPath(file: string) {
  return `/models/${encodeURIComponent(file)}`;
}

function Model({ config }: { config: ModelConfig }) {
  const { scene } = useGLTF(modelPath(config.file));
  const cloned = useMemo(() => scene.clone(), [scene]);
  return <primitive object={cloned} />;
}

export default function ActiveShape() {
  const pathname = usePathname();
  const scaleRef = useRef<THREE.Group>(null!);
  const interactiveRef = useRef<THREE.Group>(null!);

  // Gyroscope tracking
  const tilt = useRef({ x: 0, y: 0 });
  const hasGyro = useRef(false);

  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma && e.beta && (e.gamma !== 0 || e.beta !== 0)) {
        hasGyro.current = true;
        tilt.current = {
          x: THREE.MathUtils.clamp(e.beta / 45, -1, 1),
          y: THREE.MathUtils.clamp(e.gamma / 45, -1, 1),
        };
      }
    };
    window.addEventListener("deviceorientation", handleOrientation, true);
    return () => window.removeEventListener("deviceorientation", handleOrientation, true);
  }, []);

  const config = MODEL_CONFIG[pathname] || DEFAULT_CONFIG;

  useFrame((state) => {
    // Level 1: Smooth scale animation on route change
    if (scaleRef.current) {
      const s = scaleRef.current.scale.x;
      const newS = THREE.MathUtils.lerp(s, config.scale, 0.06);
      scaleRef.current.scale.setScalar(newS);
    }

    // Level 2: Mouse/Gyro rotation + breathing
    if (interactiveRef.current) {
      let pointerX = state.pointer.x;
      let pointerY = state.pointer.y;

      if (hasGyro.current) {
        pointerX = tilt.current.y;
        pointerY = -tilt.current.x;
      }

      const targetRotX = -pointerY * 0.5;
      const targetRotY = pointerX * 0.5;
      const breath = Math.sin(state.clock.elapsedTime * 0.8) * 0.1;

      interactiveRef.current.rotation.x = THREE.MathUtils.lerp(interactiveRef.current.rotation.x, targetRotX, 0.1);
      interactiveRef.current.rotation.y = THREE.MathUtils.lerp(interactiveRef.current.rotation.y, targetRotY, 0.1);
      interactiveRef.current.position.y = THREE.MathUtils.lerp(interactiveRef.current.position.y, breath, 0.1);
    }
  });

  return (
    // Level 1: Scale animation (route change)
    <group ref={scaleRef} scale={config.scale}>
      {/* Level 2: Mouse/Gyro interaction + breathing */}
      <group ref={interactiveRef}>
        {/* Level 3: Static model offset (position + rotation) */}
        <group position={config.position} rotation={config.rotation}>
          <Model config={config} />
        </group>
      </group>
    </group>
  );
}

Object.values(MODEL_CONFIG).forEach((c) => useGLTF.preload(modelPath(c.file)));
