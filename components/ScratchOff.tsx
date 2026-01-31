"use client";
import { useEffect, useRef, useState } from "react";

type ScratchOffProps = {
  isResetting?: boolean;
  onComplete?: () => void;
  fogColor?: string;
};

export default function ScratchOff({
  isResetting,
  onComplete,
  fogColor,
}: ScratchOffProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  const drawFog = () => {
    if (typeof window === "undefined") return;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const isDark =
      typeof document !== "undefined" &&
      document.documentElement.classList.contains("dark");
    const baseColor = fogColor || (isDark ? "#1e293b" : "#e2e8f0");

    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1.0;
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Dither noise so the reveal stays fully hidden.
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = isDark ? "#334155" : "#cbd5e1";
    const dots = 4000;
    for (let i = 0; i < dots; i += 1) {
      const x = Math.floor(Math.random() * canvas.width);
      const y = Math.floor(Math.random() * canvas.height);
      ctx.fillRect(x, y, 1, 1);
    }

    ctx.globalAlpha = 1.0;
    ctx.fillStyle = isDark ? "#f8fafc" : "#475569";
    ctx.font = "700 18px var(--font-playfair, serif)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Scratch to see our adventure", canvas.width / 2, canvas.height / 2);
    ctx.globalAlpha = 1.0;
  };

  const clearAtPoint = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineWidth = 50;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    const lastPoint = lastPointRef.current;
    ctx.beginPath();
    if (lastPoint) {
      ctx.moveTo(lastPoint.x, lastPoint.y);
    } else {
      ctx.moveTo(x, y);
    }
    ctx.lineTo(x, y);
    ctx.stroke();
    lastPointRef.current = { x, y };
  };

  const getClearedPercent = () => {
    const canvas = canvasRef.current;
    if (!canvas) return 0;
    const ctx = canvas.getContext("2d");
    if (!ctx) return 0;
    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let cleared = 0;
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] === 0) cleared += 1;
    }
    return cleared / (data.length / 4);
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (isDone) return;
    event.preventDefault();
    setIsDrawing(true);
    const rect = (event.target as HTMLCanvasElement).getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    lastPointRef.current = { x, y };
    clearAtPoint(x, y);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || isDone) return;
    event.preventDefault();
    const rect = (event.target as HTMLCanvasElement).getBoundingClientRect();
    clearAtPoint(event.clientX - rect.left, event.clientY - rect.top);
  };

  const handlePointerUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    lastPointRef.current = null;
    const cleared = getClearedPercent();
    if (cleared >= 0.4) {
      setIsFading(true);
      setTimeout(() => {
        setIsDone(true);
        onComplete?.();
      }, 160);
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isDone) return;
    drawFog();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isResetting) {
      setIsFading(false);
      setIsDone(false);
      drawFog();
    }
  }, [isResetting]);

  if (isDone) return null;

  return (
    <div ref={containerRef} className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-auto">
      <canvas
        ref={canvasRef}
        className={`w-full h-full rounded-3xl transition-opacity duration-150 ${isFading ? "opacity-0" : "opacity-100"}`}
        style={{ touchAction: "none" }}
        onTouchStart={(event) => event.preventDefault()}
        onTouchMove={(event) => event.preventDefault()}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      />
    </div>
  );
}
