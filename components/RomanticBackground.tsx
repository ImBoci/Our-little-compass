"use client";
import { useEffect, useState } from "react";
import { Heart, Star } from "lucide-react";

interface RomanticBackgroundProps {
  mode: "day" | "night";
}

type Particle = {
  id: number;
  left: string;
  size: number;
  duration: string;
  delay: string;
};

export default function RomanticBackground({ mode }: RomanticBackgroundProps) {
  const [mounted, setMounted] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  useEffect(() => {
    if (!mounted) return;
    const count = mode === "night" ? 70 : 50;
    const nextParticles = Array.from({ length: count }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      size: Math.random() * (mode === "night" ? 10 : 20) + (mode === "night" ? 6 : 10),
      duration: `${Math.random() * 9 + 6}s`,
      delay: `${Math.random() * 5}s`,
    }));
    setParticles(nextParticles);
  }, [mode, mounted]);

  const backgroundStyle =
    mode === "night"
      ? "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)"
      : "linear-gradient(135deg, #fdc2d6 0%, #cbcbff 50%, #caf4fa 100%)";

  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
      <div className="absolute inset-0" style={{ background: backgroundStyle }} />
      {particles.map((particle) => (
        <div
          key={particle.id}
          className={mode === "night" ? "floating-star" : "floating-heart"}
          style={{
            left: particle.left,
            width: particle.size,
            height: particle.size,
            animationDuration: particle.duration,
            animationDelay: particle.delay,
          }}
        >
          {mode === "night" ? (
            <Star fill="currentColor" size={particle.size} />
          ) : (
            <Heart fill="currentColor" size={particle.size} />
          )}
        </div>
      ))}
    </div>
  );
}