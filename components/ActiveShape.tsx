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

  useFrame((state) => {
    if (!meshRef.current) return;

    // Mouse/pointer follow (-1 to 1 range, * 0.5 to limit twist)
    const targetRotX = -state.pointer.y * 0.5;
    const targetRotY = state.pointer.x * 0.5;

    // Breathing idle motion so it feels alive when pointer is still
    const breathing = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;

    // Smooth lerp toward pointer target + breathing offset
    meshRef.current.rotation.x = THREE.MathUtils.lerp(
      meshRef.current.rotation.x,
      targetRotX + breathing,
      0.1
    );
    meshRef.current.rotation.y = THREE.MathUtils.lerp(
      meshRef.current.rotation.y,
      targetRotY + breathing,
      0.1
    );

    // Scroll-driven Z rotation
    const targetRotZ = scrollProgress * Math.PI * 0.5;
    meshRef.current.rotation.z = THREE.MathUtils.lerp(meshRef.current.rotation.z, targetRotZ, 0.05);

    // Smooth scale transition (route target + scroll expansion)
    const scrollScale = config.scale + scrollProgress * 0.3;
    const newS = THREE.MathUtils.lerp(meshRef.current.scale.x, scrollScale, 0.04);
    meshRef.current.scale.setScalar(newS);

    // Smooth color transition between routes
    if (materialRef.current) {
      currentColor.current.lerp(targetColor, 0.03);
      materialRef.current.color.copy(currentColor.current);
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh ref={meshRef} scale={config.scale}>
        {config.geometry === "icosahedron" && <icosahedronGeometry args={[1.5, 0]} />}
        {config.geometry === "torus" && <torusGeometry args={[0.8, 0.3, 16, 100]} />}
        {config.geometry === "cone" && <coneGeometry args={[1, 2, 32]} />}
        {config.geometry === "sphere" && <sphereGeometry args={[1.2, 32, 32]} />}
        {config.geometry === "octahedron" && <octahedronGeometry args={[1.3, 0]} />}

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
    </Float>
  );
}
