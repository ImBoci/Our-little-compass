"use client";

import { useRef, useMemo, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useFrame } from "@react-three/fiber";
import { MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

type ShapeConfig = {
  scale: number;
  color: string;
  distort: number;
  geometry: "heart" | "knot" | "diamond" | "gem" | "sphere" | "torus";
};

const configs: Record<string, ShapeConfig> = {
  "/":           { scale: 1.0,  color: "#fb7185", distort: 0.4, geometry: "heart" },
  "/cook":       { scale: 1.2,  color: "#f43f5e", distort: 0.3, geometry: "knot" },
  "/date":       { scale: 1.4,  color: "#a855f7", distort: 0.2, geometry: "diamond" },
  "/memories":   { scale: 1.3,  color: "#fbbf24", distort: 0.5, geometry: "sphere" },
  "/milestones": { scale: 1.3,  color: "#fbbf24", distort: 0.4, geometry: "gem" },
  "/settings":   { scale: 1.1,  color: "#818cf8", distort: 0.3, geometry: "sphere" },
  "/shop":       { scale: 1.2,  color: "#10b981", distort: 0.3, geometry: "torus" },
};

const fallback: ShapeConfig = configs["/"];

function makeHeartGeometry() {
  const shape = new THREE.Shape();
  const x = 0, y = 0;
  shape.moveTo(x + 0.5, y + 0.5);
  shape.bezierCurveTo(x + 0.5, y + 0.5, x + 0.4, y, x, y);
  shape.bezierCurveTo(x - 0.6, y, x - 0.6, y + 0.7, x - 0.6, y + 0.7);
  shape.bezierCurveTo(x - 0.6, y + 1.1, x - 0.2, y + 1.54, x + 0.5, y + 1.9);
  shape.bezierCurveTo(x + 1.2, y + 1.54, x + 1.6, y + 1.1, x + 1.6, y + 0.7);
  shape.bezierCurveTo(x + 1.6, y + 0.7, x + 1.6, y, x + 1.0, y);
  shape.bezierCurveTo(x + 0.7, y, x + 0.5, y + 0.5, x + 0.5, y + 0.5);

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.4,
    bevelEnabled: true,
    bevelSegments: 2,
    steps: 2,
    bevelSize: 0.1,
    bevelThickness: 0.1,
  });
  geo.center();
  return geo;
}

export default function ActiveShape() {
  const pathname = usePathname();
  const meshRef = useRef<THREE.Mesh>(null!);
  const materialRef = useRef<any>(null!);

  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const max = document.body.scrollHeight - window.innerHeight;
      if (max <= 0) { setScrollProgress(0); return; }
      setScrollProgress(Math.min(window.scrollY / max, 1));
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const config = configs[pathname] || fallback;
  const isHeart = config.geometry === "heart";
  const heartGeo = useMemo(() => makeHeartGeometry(), []);
  const targetColor = useMemo(() => new THREE.Color(config.color), [config.color]);
  const currentColor = useRef(new THREE.Color(config.color));

  // Base rotation offsets so the heart faces forward (flipped upright)
  const baseRotX = isHeart ? Math.PI : 0;
  const baseRotZ = isHeart ? Math.PI : 0;

  useFrame((state) => {
    if (!meshRef.current) return;

    const time = state.clock.elapsedTime;

    // Mouse follow — stronger multiplier (0.8) for obvious effect
    const targetRotX = baseRotX + state.pointer.y * 0.8;
    const targetRotY = state.pointer.x * 0.8;

    // Floating bob on Y position
    const floatY = Math.sin(time * 0.5) * 0.2;
    // Gentle breathing twist
    const breathTwist = Math.sin(time * 0.3) * 0.1;

    // Smooth lerp — 0.1 factor for weighted/glassy feel
    meshRef.current.rotation.x = THREE.MathUtils.lerp(
      meshRef.current.rotation.x,
      targetRotX + breathTwist,
      0.1
    );
    meshRef.current.rotation.y = THREE.MathUtils.lerp(
      meshRef.current.rotation.y,
      targetRotY + breathTwist,
      0.1
    );
    meshRef.current.position.y = THREE.MathUtils.lerp(
      meshRef.current.position.y,
      floatY,
      0.1
    );

    // Scroll: Z rotation + scale expansion
    const targetRotZ = baseRotZ + scrollProgress * Math.PI * 0.5;
    meshRef.current.rotation.z = THREE.MathUtils.lerp(meshRef.current.rotation.z, targetRotZ, 0.05);

    const scrollScale = config.scale + scrollProgress * 0.3;
    const newS = THREE.MathUtils.lerp(meshRef.current.scale.x, scrollScale, 0.04);
    meshRef.current.scale.setScalar(newS);

    // Smooth color morph between routes
    if (materialRef.current) {
      currentColor.current.lerp(targetColor, 0.03);
      materialRef.current.color.copy(currentColor.current);
    }
  });

  return (
    <mesh ref={meshRef} scale={config.scale}>
      {config.geometry === "heart" && <primitive object={heartGeo} attach="geometry" />}
      {config.geometry === "knot" && <torusKnotGeometry args={[0.6, 0.2, 100, 16]} />}
      {config.geometry === "diamond" && <octahedronGeometry args={[1.2, 0]} />}
      {config.geometry === "gem" && <icosahedronGeometry args={[1.2, 0]} />}
      {config.geometry === "sphere" && <sphereGeometry args={[1.2, 32, 32]} />}
      {config.geometry === "torus" && <torusGeometry args={[0.8, 0.3, 16, 100]} />}

      <MeshDistortMaterial
        ref={materialRef}
        color={config.color}
        speed={2}
        distort={config.distort}
        roughness={0.1}
        metalness={0.1}
        transparent
        opacity={0.7}
      />
    </mesh>
  );
}
