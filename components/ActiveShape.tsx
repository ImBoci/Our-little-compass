"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import { useFrame } from "@react-three/fiber";
import { MeshDistortMaterial, Float } from "@react-three/drei";
import * as THREE from "three";

type ShapeConfig = {
  scale: number;
  color: string;
  distort: number;
  speed: number;
  geometry: "icosahedron" | "torus" | "cone" | "sphere" | "octahedron";
};

const configs: Record<string, ShapeConfig> = {
  "/":          { scale: 1.5, color: "#fb7185", distort: 0.5, speed: 2,   geometry: "icosahedron" },
  "/cook":      { scale: 1.2, color: "#f43f5e", distort: 0.4, speed: 2.5, geometry: "torus" },
  "/date":      { scale: 1.4, color: "#a855f7", distort: 0.3, speed: 1.8, geometry: "cone" },
  "/memories":  { scale: 1.3, color: "#fbbf24", distort: 0.6, speed: 3,   geometry: "sphere" },
  "/milestones":{ scale: 1.3, color: "#34d399", distort: 0.4, speed: 2,   geometry: "octahedron" },
  "/settings":  { scale: 1.1, color: "#818cf8", distort: 0.3, speed: 1.5, geometry: "sphere" },
  "/shop":      { scale: 1.2, color: "#10b981", distort: 0.35,speed: 2,   geometry: "torus" },
};

const fallback: ShapeConfig = configs["/"];

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
  const targetColor = useMemo(() => new THREE.Color(config.color), [config.color]);
  const currentColor = useRef(new THREE.Color(config.color));

  useFrame((_state, delta) => {
    if (!meshRef.current) return;

    meshRef.current.rotation.x += delta * 0.2;
    meshRef.current.rotation.y += delta * 0.3;

    // Scroll-driven rotation on Z
    const targetRotZ = scrollProgress * Math.PI * 0.5;
    meshRef.current.rotation.z = THREE.MathUtils.lerp(meshRef.current.rotation.z, targetRotZ, 0.05);

    // Smooth scale transition (scroll expands slightly)
    const scrollScale = config.scale + scrollProgress * 0.3;
    const s = meshRef.current.scale.x;
    const newS = THREE.MathUtils.lerp(s, scrollScale, 0.04);
    meshRef.current.scale.setScalar(newS);

    // Smooth color transition
    if (materialRef.current) {
      currentColor.current.lerp(targetColor, 0.03);
      materialRef.current.color.copy(currentColor.current);
    }
  });

  return (
    <Float speed={config.speed} rotationIntensity={1} floatIntensity={1}>
      <mesh ref={meshRef} scale={config.scale}>
        {config.geometry === "icosahedron" && <icosahedronGeometry args={[1.5, 0]} />}
        {config.geometry === "torus" && <torusGeometry args={[1, 0.4, 16, 100]} />}
        {config.geometry === "cone" && <coneGeometry args={[1, 2, 32]} />}
        {config.geometry === "sphere" && <sphereGeometry args={[1.2, 32, 32]} />}
        {config.geometry === "octahedron" && <octahedronGeometry args={[1.3, 0]} />}

        <MeshDistortMaterial
          ref={materialRef}
          color={config.color}
          speed={config.speed}
          distort={config.distort}
          roughness={0.2}
          metalness={0.1}
          transparent
          opacity={0.7}
        />
      </mesh>
    </Float>
  );
}
