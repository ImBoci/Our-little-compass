"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

function HeartGeometry() {
  return useMemo(() => {
    const shape = new THREE.Shape();
    const x = 0, y = 0;
    shape.moveTo(x, y + 0.5);
    shape.bezierCurveTo(x, y + 0.5, x - 0.5, y, x - 0.5, y);
    shape.bezierCurveTo(x - 0.5, y - 0.35, x, y - 0.6, x, y - 0.9);
    shape.bezierCurveTo(x, y - 0.6, x + 0.5, y - 0.35, x + 0.5, y);
    shape.bezierCurveTo(x + 0.5, y, x, y + 0.5, x, y + 0.5);

    const extrudeSettings = {
      depth: 0.4,
      bevelEnabled: true,
      bevelSegments: 3,
      bevelSize: 0.08,
      bevelThickness: 0.08,
      curveSegments: 12,
    };

    const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geo.center();
    return geo;
  }, []);
}

function FloatingHeart() {
  const mesh = useRef<THREE.Mesh>(null!);
  const { mouse } = useThree();
  const geometry = HeartGeometry();

  useFrame((_state, delta) => {
    if (!mesh.current) return;
    mesh.current.rotation.y += 0.3 * delta;

    const targetX = mouse.y * 0.15;
    const targetZ = -mouse.x * 0.15;
    mesh.current.rotation.x = THREE.MathUtils.lerp(mesh.current.rotation.x, targetX, 0.05);
    mesh.current.rotation.z = THREE.MathUtils.lerp(mesh.current.rotation.z, targetZ, 0.05);

    mesh.current.position.y = Math.sin(Date.now() * 0.001) * 0.08;
  });

  return (
    <mesh ref={mesh} geometry={geometry} scale={2.2}>
      <meshPhysicalMaterial
        color="#fb7185"
        transmission={0.9}
        roughness={0.2}
        thickness={2}
        ior={1.5}
        transparent
        opacity={0.6}
        envMapIntensity={1}
      />
    </mesh>
  );
}

export default function Scene3D() {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0, 4], fov: 45 }}
      gl={{ alpha: true, antialias: true, powerPreference: "default" }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.6} />
      <spotLight position={[5, 5, 5]} intensity={0.8} angle={0.4} penumbra={1} />
      <spotLight position={[-5, -3, 3]} intensity={0.3} color="#c084fc" />
      <FloatingHeart />
    </Canvas>
  );
}
