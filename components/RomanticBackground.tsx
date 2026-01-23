"use client";
import { useEffect, useState } from "react";

export default function RomanticBackground() {
  // Use state to avoid hydration mismatch
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Generate 20 random particles
  const particles = Array.from({ length: 20 }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    size: `${Math.random() * 20 + 10}px`,
    duration: `${Math.random() * 10 + 10}s`,
    delay: `${Math.random() * 5}s`,
    opacity: Math.random() * 0.5 + 0.1,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            animationDuration: p.duration,
            animationDelay: p.delay,
            opacity: p.opacity,
            // Randomly make some hearts (using CSS clip-path could be added, but circles work well for bokeh)
            backgroundColor: p.id % 2 === 0 ? '#ffb7b2' : '#e2f0cb',
            boxShadow: "0 0 20px rgba(255,255,255,0.5)"
          }}
        />
      ))}
    </div>
  );
}