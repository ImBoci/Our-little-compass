"use client";
import { useEffect, useState } from "react";
import { Heart, Star } from "lucide-react";

export default function RomanticBackground() {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [particles, setParticles] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);

    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    checkTheme();

    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    const newParticles = Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      size: Math.random() * 20 + 10,
      duration: `${Math.random() * 9 + 6}s`,
      delay: `${Math.random() * 5}s`,
    }));
    setParticles(newParticles);

    return () => observer.disconnect();
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[-10] overflow-hidden">
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
          }}
        >
          {isDark ? (
            <Star fill="#fde047" className="text-yellow-300 opacity-70" size={p.size} />
          ) : (
            <Heart fill="#fb7185" className="text-rose-400 opacity-60" size={p.size} />
          )}
        </div>
      ))}
    </div>
  );
}
