"use client";

import { useRef, useMemo } from "react";
import { usePathname } from "next/navigation";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

type ModelConfig = {
  file: string;
  scale: number;
  position: [number, number, number];
};

const MODEL_CONFIG: Record<string, ModelConfig> = {
  "/":           { file: "Heart.glb",       scale: 3.5, position: [0, 0, 0] },
  "/cook":       { file: "Food.glb",        scale: 8,   position: [0, -1, 0] },
  "/date":       { file: "Explorer.glb",    scale: 1.2, position: [0, -1.5, 0] },
  "/milestones": { file: "Tubbs.glb",       scale: 1.8, position: [0, -0.5, 0] },
  "/memories":   { file: "Polaroids.glb",   scale: 3.5, position: [0, 0, 0] },
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
  const groupRef = useRef<THREE.Group>(null!);

  const config = MODEL_CONFIG[pathname] || DEFAULT_CONFIG;

  useFrame((state) => {
    if (!groupRef.current) return;

    const time = state.clock.elapsedTime;

    const targetRotX = -state.pointer.y * 0.5;
    const targetRotY = state.pointer.x * 0.5;

    const breath = Math.sin(time * 0.8) * 0.1;

    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotX, 0.1);
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, 0.1);
    groupRef.current.position.y = THREE.MathUtils.lerp(
      groupRef.current.position.y,
      config.position[1] + breath,
      0.1
    );
  });

  return (
    <group ref={groupRef} scale={config.scale} position={[config.position[0], 0, config.position[2]]}>
      <Model config={config} />
    </group>
  );
}

// Preload all models for instant route switching
Object.values(MODEL_CONFIG).forEach((c) => useGLTF.preload(modelPath(c.file)));
