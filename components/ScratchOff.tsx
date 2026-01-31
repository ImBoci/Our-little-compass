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
  fogColor = "#e2e8f0",
}: ScratchOffProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const drawFog = () => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = fogColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle noise texture
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < imageData.data.length; i += 4) {
      const noise = Math.floor(Math.random() * 12) - 6;
      imageData.data[i] = Math.min(255, Math.max(0, imageData.data[i] + noise));
      imageData.data[i + 1] = Math.min(255, Math.max(0, imageData.data[i + 1] + noise));
      imageData.data[i + 2] = Math.min(255, Math.max(0, imageData.data[i + 2] + noise));
    }
    ctx.putImageData(imageData, 0, 0);
  };

  const clearAtPoint = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, 24, 0, Math.PI * 2);
    ctx.fill();
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
    clearAtPoint(event.clientX - rect.left, event.clientY - rect.top);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || isDone) return;
    const rect = (event.target as HTMLCanvasElement).getBoundingClientRect();
    clearAtPoint(event.clientX - rect.left, event.clientY - rect.top);
  };

  const handlePointerUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const cleared = getClearedPercent();
    if (cleared >= 0.4) {
      setIsDone(true);
      onComplete?.();
    }
  };

  useEffect(() => {
    if (isDone) return;
    drawFog();
  }, []);

  useEffect(() => {
    if (isResetting) {
      setIsDone(false);
      drawFog();
    }
  }, [isResetting]);

  if (isDone) return null;

  return (
    <div ref={containerRef} className="absolute inset-0 rounded-3xl overflow-hidden">
      <canvas
        ref={canvasRef}
        className="w-full h-full rounded-3xl"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      />
    </div>
  );
}
