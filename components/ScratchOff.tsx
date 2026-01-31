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
  fogColor = "#f8fafc",
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
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 0.9;
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, fogColor);
    gradient.addColorStop(1, "#e2e8f0");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1;

    // Subtle noise texture
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < imageData.data.length; i += 4) {
      const noise = Math.floor(Math.random() * 12) - 6;
      imageData.data[i] = Math.min(255, Math.max(0, imageData.data[i] + noise));
      imageData.data[i + 1] = Math.min(255, Math.max(0, imageData.data[i + 1] + noise));
      imageData.data[i + 2] = Math.min(255, Math.max(0, imageData.data[i + 2] + noise));
    }
    ctx.putImageData(imageData, 0, 0);

    ctx.globalAlpha = 0.8;
    ctx.fillStyle = "#64748b";
    ctx.font = "600 16px var(--font-playfair, serif)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Scratch to reveal...", canvas.width / 2, canvas.height / 2);
    ctx.globalAlpha = 1;
  };

  const clearAtPoint = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineWidth = 40;
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
    setIsDrawing(true);
    const rect = (event.target as HTMLCanvasElement).getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    lastPointRef.current = { x, y };
    clearAtPoint(x, y);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || isDone) return;
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
      }, 300);
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
        className={`w-full h-full rounded-3xl transition-opacity duration-300 ${isFading ? "opacity-0" : "opacity-100"}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      />
    </div>
  );
}
