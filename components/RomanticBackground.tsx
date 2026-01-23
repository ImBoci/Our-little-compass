"use client";
import { useEffect, useState } from "react";
import { Heart } from "lucide-react";

export default function RomanticBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Generate 50 particles for a denser effect
  const hearts = Array.from({ length: 50 }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    size: Math.random() * 20 + 10, // 10px to 30px
    // Faster speed: Random between 6s and 15s
    duration: `${Math.random() * 9 + 6}s`,
    delay: `${Math.random() * 5}s`,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
      {hearts.map((heart) => (
        <div
          key={heart.id}
          className="floating-heart"
          style={{
            left: heart.left,
            width: heart.size,
            height: heart.size,
            animationDuration: heart.duration,
            animationDelay: heart.delay,
          }}
        >
          <Heart fill="currentColor" size={heart.size} />
        </div>
      ))}
    </div>
  );
}