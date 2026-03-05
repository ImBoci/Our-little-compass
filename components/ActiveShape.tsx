"use client";

import { useRef, useMemo, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF, Center } from "@react-three/drei";
import * as THREE from "three";

type ModelConfig = {
  file: string;
  scale: number;
  position: [number, number, number];
  rotation: [number, number, number];
};

const MODEL_CONFIG: Record<string, ModelConfig> = {
  "/":           { file: "Heart.glb",     scale: 4.0, position: [0, 0, 0],    rotation: [0, 0, 0] },
  "/cook":       { file: "Food.glb",      scale: 6.0, position: [0, -0.2, 0], rotation: [0, 0, 0] },
  "/date":       { file: "Explorer.glb",  scale: 1.2, position: [0, -0.2, 0], rotation: [0, Math.PI / 2, 0] },
  "/milestones": { file: "Dingus.glb",    scale: -10.0, position: [0, -3.2, 0], rotation: [Math.PI / 4, 0, 0] },
  "/memories":   { file: "Polaroids.glb", scale: 3.5, position: [0, 0, 0],    rotation: [0, -Math.PI / 2, 0] },
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
  const { size } = useThree();

  const tilt = useRef({ x: 0, y: 0 });
  const hasGyro = useRef(false);

  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (typeof window !== "undefined" && localStorage.getItem("gyroEnabled") === "true") {
        if (e.gamma !== null && e.beta !== null) {
          hasGyro.current = true;
          // Subtract 45 so holding phone at natural ~45deg angle is "center"
          const normalizedBeta = e.beta - 45;
          tilt.current = {
            x: THREE.MathUtils.clamp(normalizedBeta / 40, -1, 1),
            y: THREE.MathUtils.clamp(e.gamma / 40, -1, 1),
          };
        }
      } else {
        hasGyro.current = false;
      }
    };
    window.addEventListener("deviceorientation", handleOrientation, true);
    return () => window.removeEventListener("deviceorientation", handleOrientation, true);
  }, []);

  const config = MODEL_CONFIG[pathname] || DEFAULT_CONFIG;

  const isMobile = size.width < 768;
  const responsiveScale = isMobile ? config.scale * 0.6 : config.scale;

  useFrame((state) => {
    // Level 1: Smooth responsive scale
    if (scaleRef.current) {
      const s = scaleRef.current.scale.x;
      const newS = THREE.MathUtils.lerp(s, responsiveScale, 0.06);
      scaleRef.current.scale.setScalar(newS);
    }

    // Level 2: Mouse/Gyro + breathing
    if (interactiveRef.current) {
      let pointerX = state.pointer.x;
      let pointerY = state.pointer.y;

      if (hasGyro.current) {
        pointerX = tilt.current.y;
        pointerY = -tilt.current.x;
      }

      const targetRotX = -pointerY * 0.4;
      const targetRotY = pointerX * 0.4;
      const breath = Math.sin(state.clock.elapsedTime * 0.8) * 0.1;

      interactiveRef.current.rotation.x = THREE.MathUtils.lerp(interactiveRef.current.rotation.x, targetRotX, 0.1);
      interactiveRef.current.rotation.y = THREE.MathUtils.lerp(interactiveRef.current.rotation.y, targetRotY, 0.1);
      interactiveRef.current.position.y = THREE.MathUtils.lerp(interactiveRef.current.position.y, breath, 0.1);
    }
  });

  return (
    <group ref={scaleRef} scale={responsiveScale}>
      <group ref={interactiveRef}>
        <group position={config.position} rotation={config.rotation}>
          <Center>
            <Model config={config} />
          </Center>
        </group>
      </group>
    </group>
  );
}

Object.values(MODEL_CONFIG).forEach((c) => useGLTF.preload(modelPath(c.file)));
