"use client";

import { useEffect, useRef, useState } from "react";

export function useRotateHandle(
  currentRotation: number,
  onRotationChange: (degrees: number) => void
) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isRotating, setIsRotating] = useState(false);

  const angleFromCenter = (clientX: number, clientY: number): number => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return currentRotation;
    const dx = clientX - (rect.left + rect.width / 2);
    const dy = clientY - (rect.top + rect.height / 2);
    return Math.round(Math.atan2(dx, -dy) * (180 / Math.PI));
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setIsRotating(true);
  };

  useEffect(() => {
    if (!isRotating) return;

    const handleMove = (e: PointerEvent) => {
      let deg = angleFromCenter(e.clientX, e.clientY);
      if (deg > 180) deg -= 360;
      if (deg < -180) deg += 360;
      onRotationChange(deg);
    };

    const handleUp = () => setIsRotating(false);

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRotating]);

  return { canvasRef, isRotating, onPointerDown };
}
