"use client";

import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import ActiveShape from "./ActiveShape";

export default function Scene3D() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6] }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
      eventSource={typeof window !== "undefined" ? document.body : undefined}
      eventPrefix="client"
    >
      <ambientLight intensity={0.5} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={1} color="#c084fc" />
      <ActiveShape />
      <Environment preset="city" />
    </Canvas>
  );
}
