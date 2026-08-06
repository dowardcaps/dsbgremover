"use client";

import { useRef, useCallback } from "react";

export interface BodyCrop {
  top: number;    // 0–100 %
  bottom: number; // 0–100 %
  left: number;   // 0–100 %
  right: number;  // 0–100 %
}

export const DEFAULT_BODY_CROP: BodyCrop = { top: 0, bottom: 0, left: 0, right: 0 };

interface Props {
  src: string;
  crop: BodyCrop;
  setCrop: (c: BodyCrop) => void;
}

type Edge = "top" | "bottom" | "left" | "right";

const PREVIEW_SIZE = 220; // px — mini preview inside the panel

export default function BodyCropPanel({ src, crop, setCrop }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef<Edge | null>(null);

  const getPercent = useCallback((e: PointerEvent): { x: number; y: number } => {
    const rect = containerRef.current!.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100)),
      y: Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100)),
    };
  }, []);

  const onPointerDown = useCallback((edge: Edge) => (e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragging.current = edge;
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current) return;
    const { x, y } = getPercent(e.nativeEvent);
    const edge = dragging.current;
    setCrop({
      ...crop,
      top:    edge === "top"    ? Math.min(y, 100 - crop.bottom - 5) : crop.top,
      bottom: edge === "bottom" ? Math.min(100 - y, 100 - crop.top - 5) : crop.bottom,
      left:   edge === "left"   ? Math.min(x, 100 - crop.right - 5) : crop.left,
      right:  edge === "right"  ? Math.min(100 - x, 100 - crop.left - 5) : crop.right,
    });
  }, [crop, setCrop, getPercent]);

  const onPointerUp = useCallback(() => { dragging.current = null; }, []);

  const hasAnyCrop = crop.top > 0 || crop.bottom > 0 || crop.left > 0 || crop.right > 0;

  // Visible area inside the preview
  const visTop    = (crop.top    / 100) * PREVIEW_SIZE;
  const visBottom = (crop.bottom / 100) * PREVIEW_SIZE;
  const visLeft   = (crop.left   / 100) * PREVIEW_SIZE;
  const visRight  = (crop.right  / 100) * PREVIEW_SIZE;

  const handleCls = "absolute z-20 flex items-center justify-center bg-guide text-white shadow-md transition hover:scale-110 select-none touch-none";

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">Body Crop</span>
        {hasAnyCrop && (
          <button
            type="button"
            onClick={() => setCrop(DEFAULT_BODY_CROP)}
            className="text-[10px] text-muted hover:text-guide"
          >
            Reset
          </button>
        )}
      </div>

      <p className="text-[10px] text-muted/70">
        Drag the green handles to crop the body frame so the collar aligns with the attire.
      </p>

      {/* Mini interactive preview */}
      <div
        ref={containerRef}
        className="relative mx-auto overflow-hidden rounded border border-border bg-border/20 cursor-crosshair"
        style={{ width: PREVIEW_SIZE, height: PREVIEW_SIZE }}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        {/* Photo */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt="Body crop preview"
          className="absolute inset-0 h-full w-full object-contain"
          draggable={false}
        />

        {/* Dimmed overlay — top */}
        <div className="pointer-events-none absolute left-0 right-0 top-0 bg-ink/40" style={{ height: visTop }} />
        {/* Dimmed overlay — bottom */}
        <div className="pointer-events-none absolute left-0 right-0 bottom-0 bg-ink/40" style={{ height: visBottom }} />
        {/* Dimmed overlay — left */}
        <div className="pointer-events-none absolute top-0 bottom-0 left-0 bg-ink/40" style={{ width: visLeft }} />
        {/* Dimmed overlay — right */}
        <div className="pointer-events-none absolute top-0 bottom-0 right-0 bg-ink/40" style={{ width: visRight }} />

        {/* Crop border */}
        <div
          className="pointer-events-none absolute border border-guide/80"
          style={{
            top: visTop, bottom: visBottom,
            left: visLeft, right: visRight,
          }}
        />

        {/* Top handle */}
        <div
          className={`${handleCls} h-4 w-8 rounded-full cursor-ns-resize`}
          style={{ top: visTop - 8, left: "50%", transform: "translateX(-50%)" }}
          onPointerDown={onPointerDown("top")}
        >
          <span className="text-[8px] leading-none">↕</span>
        </div>

        {/* Bottom handle */}
        <div
          className={`${handleCls} h-4 w-8 rounded-full cursor-ns-resize`}
          style={{ bottom: visBottom - 8, left: "50%", transform: "translateX(-50%)" }}
          onPointerDown={onPointerDown("bottom")}
        >
          <span className="text-[8px] leading-none">↕</span>
        </div>

        {/* Left handle */}
        <div
          className={`${handleCls} h-8 w-4 rounded-full cursor-ew-resize`}
          style={{ left: visLeft - 8, top: "50%", transform: "translateY(-50%)" }}
          onPointerDown={onPointerDown("left")}
        >
          <span className="text-[8px] leading-none">↔</span>
        </div>

        {/* Right handle */}
        <div
          className={`${handleCls} h-8 w-4 rounded-full cursor-ew-resize`}
          style={{ right: visRight - 8, top: "50%", transform: "translateY(-50%)" }}
          onPointerDown={onPointerDown("right")}
        >
          <span className="text-[8px] leading-none">↔</span>
        </div>
      </div>

      {/* Numeric readout */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] text-muted">
        <span>Top: <span className="text-ink">{Math.round(crop.top)}%</span></span>
        <span>Bottom: <span className="text-ink">{Math.round(crop.bottom)}%</span></span>
        <span>Left: <span className="text-ink">{Math.round(crop.left)}%</span></span>
        <span>Right: <span className="text-ink">{Math.round(crop.right)}%</span></span>
      </div>
    </div>
  );
}
