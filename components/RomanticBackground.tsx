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

  useEffect(() => {
    if (!mounted) return;
    const count = 50;
    const nextParticles = Array.from({ length: count }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      size: Math.random() * (mode === "night" ? 10 : 20) + (mode === "night" ? 6 : 10),
      duration: `${Math.random() * 12 + 8}s`,
      delay: `${Math.random() * 4}s`,
    }));
    setParticles(nextParticles);
  }, [mode, mounted]);

  const backgroundStyle =
    mode === "night"
      ? "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)"
      : "linear-gradient(135deg, #fdc2d6 0%, #cbcbff 50%, #caf4fa 100%)";

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[-10] overflow-hidden">
      <div className="absolute inset-0" style={{ background: "var(--bg-gradient)" }} />
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="particle"
          style={{
            left: particle.left,
            width: particle.size,
            height: particle.size,
            animationDuration: particle.duration,
            animationDelay: particle.delay,
            opacity: 0.6,
            color: mode === "night" ? "#fde047" : "#fb7185",
          }}
        >
          {mode === "night" ? (
            <Star fill="#fde047" size={particle.size} />
          ) : (
            <Heart fill="#fb7185" size={particle.size} />
          )}
        </div>
      ))}
    </div>
  );
}