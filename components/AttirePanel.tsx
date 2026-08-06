"use client";

import { useState } from "react";
import { Gender, ATTIRE, ATTIRE_CATEGORIES } from "@/lib/attire";
import BodyCropPanel, { BodyCrop, DEFAULT_BODY_CROP } from "@/components/BodyCropPanel";

interface Props {
  gender: Gender;
  setGender: (g: Gender) => void;
  attireId: string | null;
  setAttireId: (id: string | null) => void;
  attireOffsetY: number;
  setAttireOffsetY: (n: number) => void;
  attireOpacity: number;
  setAttireOpacity: (n: number) => void;
  attireScaleX: number;
  setAttireScaleX: (n: number) => void;
  attireScaleY: number;
  setAttireScaleY: (n: number) => void;
  bodyCrop: BodyCrop;
  setBodyCrop: (c: BodyCrop) => void;
  bgRemovedSrc: string | null;
}

export default function AttirePanel({
  gender, setGender,
  attireId, setAttireId,
  attireOffsetY, setAttireOffsetY,
  attireOpacity, setAttireOpacity,
  attireScaleX, setAttireScaleX,
  attireScaleY, setAttireScaleY,
  bodyCrop, setBodyCrop,
  bgRemovedSrc,
}: Props) {
  const [activeCategory, setActiveCategory] = useState<"Corporate" | "Casual">("Corporate");

  const resetFit = () => {
    setAttireOffsetY(0);
    setAttireScaleX(1);
    setAttireScaleY(1);
    setBodyCrop(DEFAULT_BODY_CROP);
  };

  const handleGenderChange = (g: Gender) => {
    setGender(g);
    setActiveCategory("Corporate");
    setAttireId(null);
    resetFit();
  };

  const handleAttireSelect = (id: string) => {
    setAttireId(id === attireId ? null : id);
    resetFit();
  };

  const options = ATTIRE[gender].filter((a) => a.category === activeCategory);
  const selectedLabel = ATTIRE[gender].find((a) => a.id === attireId)?.label;

  return (
    <div className="overflow-hidden rounded-md border border-border bg-surface shadow-panel">

      {/* Header */}
      <div className="border-b border-border px-3 py-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted">Attire</span>
      </div>

      {/* Gender toggle */}
      <div className="flex gap-1 border-b border-border p-2">
        {(["male", "female"] as Gender[]).map((g) => (
          <button key={g} type="button" onClick={() => handleGenderChange(g)}
            className={`flex-1 rounded py-1.5 text-xs font-medium transition ${
              gender === g ? "bg-guide text-white shadow-btn" : "bg-paper text-muted hover:text-ink"
            }`}
          >
            {g === "male" ? "♂  Male" : "♀  Female"}
          </button>
        ))}
      </div>

      {/* Category tabs */}
      <div className="flex border-b border-border">
        {ATTIRE_CATEGORIES[gender].map((cat) => (
          <button key={cat} type="button" onClick={() => setActiveCategory(cat)}
            className={`flex-1 py-2 text-xs font-medium transition ${
              activeCategory === cat ? "border-b-2 border-guide text-guide" : "text-muted hover:text-ink"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Attire grid */}
      <div className="grid grid-cols-3 gap-2 p-3">
        <button type="button"
          onClick={() => { setAttireId(null); resetFit(); }}
          className={`flex flex-col items-center gap-1 rounded border p-1.5 transition ${
            attireId === null
              ? "border-guide bg-guide/10 text-guide"
              : "border-border bg-paper text-muted hover:border-ink/30 hover:text-ink"
          }`}
        >
          <div className="flex h-14 w-full items-center justify-center rounded bg-border/30 text-lg">✕</div>
          <span className="text-[10px] font-medium">None</span>
        </button>

        {options.map((option) => (
          <button key={option.id} type="button" onClick={() => handleAttireSelect(option.id)}
            className={`flex flex-col items-center gap-1 rounded border p-1.5 transition ${
              attireId === option.id ? "border-guide bg-guide/10" : "border-border bg-paper hover:border-ink/30"
            }`}
          >
            <div className="relative h-14 w-full overflow-hidden rounded bg-border/20">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={option.overlay} alt={option.label} className="h-full w-full object-cover object-top" />
            </div>
            <span className={`text-[10px] font-medium leading-tight ${attireId === option.id ? "text-guide" : "text-muted"}`}>
              {option.label}
            </span>
          </button>
        ))}
      </div>

      {/* Fit controls — only when attire selected */}
      {attireId && (
        <div className="flex flex-col gap-4 border-t border-border p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">Fit Adjustment</p>

          {/* Body Crop */}
          {bgRemovedSrc && (
            <>
              <BodyCropPanel src={bgRemovedSrc} crop={bodyCrop} setCrop={setBodyCrop} />
              <div className="h-px bg-border" />
            </>
          )}

          {/* Width warp */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted">Width (shoulder fit)</span>
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted">{attireScaleX.toFixed(2)}×</span>
                {attireScaleX !== 1 && (
                  <button type="button" onClick={() => setAttireScaleX(1)} className="text-[10px] text-muted hover:text-guide">reset</button>
                )}
              </div>
            </div>
            <input type="range" min={0.5} max={1.5} step={0.01} value={attireScaleX}
              onChange={(e) => setAttireScaleX(Number(e.target.value))} className="w-full accent-guide" />
            <div className="flex justify-between text-[10px] text-muted/60"><span>◀ Narrow</span><span>Wide ▶</span></div>
          </div>

          {/* Height warp */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted">Height (torso fit)</span>
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted">{attireScaleY.toFixed(2)}×</span>
                {attireScaleY !== 1 && (
                  <button type="button" onClick={() => setAttireScaleY(1)} className="text-[10px] text-muted hover:text-guide">reset</button>
                )}
              </div>
            </div>
            <input type="range" min={0.5} max={1.5} step={0.01} value={attireScaleY}
              onChange={(e) => setAttireScaleY(Number(e.target.value))} className="w-full accent-guide" />
            <div className="flex justify-between text-[10px] text-muted/60"><span>▲ Compress</span><span>Stretch ▼</span></div>
          </div>

          {/* Vertical position */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted">Position (up / down)</span>
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted">{attireOffsetY > 0 ? "+" : ""}{attireOffsetY}px</span>
                {attireOffsetY !== 0 && (
                  <button type="button" onClick={() => setAttireOffsetY(0)} className="text-[10px] text-muted hover:text-guide">reset</button>
                )}
              </div>
            </div>
            <input type="range" min={-150} max={150} step={1} value={attireOffsetY}
              onChange={(e) => setAttireOffsetY(Number(e.target.value))} className="w-full accent-guide" />
            <div className="flex justify-between text-[10px] text-muted/60"><span>▲ Up</span><span>▼ Down</span></div>
          </div>

          {/* Opacity */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted">Opacity</span>
              <span className="text-xs text-muted">{attireOpacity}%</span>
            </div>
            <input type="range" min={10} max={100} step={1} value={attireOpacity}
              onChange={(e) => setAttireOpacity(Number(e.target.value))} className="w-full accent-guide" />
          </div>

          <p className="text-xs text-muted">
            Selected: <span className="font-medium text-guide">{selectedLabel}</span>
          </p>
        </div>
      )}
    </div>
  );
}
