"use client";

import type { ReactNode } from "react";
import { EnhanceSettings, LightingDirection, DEFAULT_ENHANCE } from "@/lib/enhance";

interface Props {
  enhance: EnhanceSettings;
  setEnhance: (s: EnhanceSettings) => void;
}

function Label({ children }: { children: ReactNode }) {
  return <span className="text-xs font-semibold uppercase tracking-wider text-muted">{children}</span>;
}

function SliderRow({
  label, value, min = 0, max = 100, step = 1,
  onChange, hint,
}: {
  label: string; value: number; min?: number; max?: number; step?: number;
  onChange: (n: number) => void; hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-xs text-ink">{label}</span>
        <span className="text-xs text-muted">{value > 0 ? "+" : ""}{value}</span>
      </div>
      {hint && <p className="text-[10px] text-muted/70">{hint}</p>}
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-guide"
      />
    </div>
  );
}

const LIGHTING_OPTIONS: { value: LightingDirection; label: string; icon: string }[] = [
  { value: "none",  label: "None",       icon: "○" },
  { value: "soft",  label: "Soft",       icon: "◎" },
  { value: "top",   label: "Top",        icon: "↑" },
  { value: "left",  label: "Left",       icon: "←" },
  { value: "right", label: "Right",      icon: "→" },
];

const hasChanges = (e: EnhanceSettings) =>
  e.sharpen !== 0 || e.warmth !== 0 || e.skinLighten !== 0 || e.smoothSkin !== 0 ||
  e.eyeBrighten !== 0 || e.eyeBag !== 0 || e.lighting !== "none";

export default function EnhancePanel({ enhance, setEnhance }: Props) {
  const set = (key: keyof EnhanceSettings, value: number | string) =>
    setEnhance({ ...enhance, [key]: value });

  return (
    <div className="overflow-hidden rounded-md border border-border bg-surface shadow-panel">
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted">Enhance</span>
        {hasChanges(enhance) && (
          <button
            type="button"
            onClick={() => setEnhance(DEFAULT_ENHANCE)}
            className="text-[10px] text-muted hover:text-guide"
          >
            Reset all
          </button>
        )}
      </div>

      <div className="flex flex-col gap-4 p-3">

        {/* Lighting */}
        <div className="flex flex-col gap-2">
          <Label>Lighting</Label>
          <div className="grid grid-cols-5 gap-1">
            {LIGHTING_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => set("lighting", opt.value)}
                title={opt.label}
                className={`flex flex-col items-center gap-0.5 rounded border py-1.5 text-xs transition ${
                  enhance.lighting === opt.value
                    ? "border-guide bg-guide/10 text-guide"
                    : "border-border bg-paper text-muted hover:border-ink/30 hover:text-ink"
                }`}
              >
                <span className="text-base leading-none">{opt.icon}</span>
                <span className="text-[9px]">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Skin */}
        <div className="flex flex-col gap-3">
          <Label>Skin</Label>
          <SliderRow
            label="Warmth"
            value={enhance.warmth}
            min={-100} max={100}
            onChange={(v) => set("warmth", v)}
            hint="Negative = cooler, positive = warmer tone"
          />
          <SliderRow
            label="Skin Lighten"
            value={enhance.skinLighten}
            onChange={(v) => set("skinLighten", v)}
            hint="Brightens the skin tone subtly"
          />
          <SliderRow
            label="Smooth Skin"
            value={enhance.smoothSkin}
            onChange={(v) => set("smoothSkin", v)}
            hint="Softens skin texture"
          />
          <SliderRow
            label="Sharpen"
            value={enhance.sharpen}
            onChange={(v) => set("sharpen", v)}
            hint="Enhances edge definition"
          />
        </div>

        {/* Eyes */}
        <div className="flex flex-col gap-3">
          <Label>Eyes</Label>
          <SliderRow
            label="Eye Brighten"
            value={enhance.eyeBrighten}
            onChange={(v) => set("eyeBrighten", v)}
            hint="Brightens the eye area"
          />
          <SliderRow
            label="Eye Bag Reduction"
            value={enhance.eyeBag}
            onChange={(v) => set("eyeBag", v)}
            hint="Softens under-eye shadows"
          />
        </div>

      </div>
    </div>
  );
}
