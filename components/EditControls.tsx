"use client";

import { LayerKey, Transform, LAYER_LABEL } from "@/lib/types";

interface Props {
  activeLayer: LayerKey;
  activeTransform: Transform;
  setTransform: (layer: LayerKey, next: Partial<Transform>) => void;
  bgColor: string | null;
  setBgColor: (c: string | null) => void;
  brightness: number;
  setBrightness: (n: number) => void;
  contrast: number;
  setContrast: (n: number) => void;
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs font-semibold uppercase tracking-wider text-muted">
      {children}
    </span>
  );
}

function Section({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col gap-2">{children}</div>;
}

export default function EditControls({
  activeLayer, activeTransform, setTransform,
  bgColor, setBgColor,
  brightness, setBrightness,
  contrast, setContrast,
}: Props) {
  const rotate = (delta: number) => {
    const next = (((activeTransform.rotation + delta + 180) % 360) + 360) % 360 - 180;
    setTransform(activeLayer, { rotation: next });
  };

  return (
    <div className="flex flex-col gap-4 rounded-md border border-border bg-surface p-4 shadow-panel">

      {/* Zoom */}
      <Section>
        <div className="flex items-center justify-between">
          <Label>Zoom</Label>
          <span className="text-xs text-muted">{LAYER_LABEL[activeLayer]}</span>
        </div>
        <input
          type="range" min={1} max={3} step={0.01}
          value={activeTransform.zoom}
          onChange={(e) => setTransform(activeLayer, { zoom: Number(e.target.value) })}
          className="w-full accent-guide"
        />
      </Section>

      {/* Rotate */}
      <Section>
        <div className="flex items-center justify-between">
          <Label>Rotate</Label>
          <span className="text-xs text-muted">{activeTransform.rotation}°</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button" onClick={() => rotate(-90)}
            className="rounded border border-border bg-paper px-3 py-1.5 text-xs text-ink transition hover:border-guide hover:text-guide"
          >
            ↺ 90°
          </button>
          <button
            type="button" onClick={() => rotate(90)}
            className="rounded border border-border bg-paper px-3 py-1.5 text-xs text-ink transition hover:border-guide hover:text-guide"
          >
            90° ↻
          </button>
          {activeTransform.rotation !== 0 && (
            <button
              type="button" onClick={() => setTransform(activeLayer, { rotation: 0 })}
              className="rounded border border-border bg-paper px-3 py-1.5 text-xs text-muted transition hover:border-guide hover:text-guide"
            >
              Reset
            </button>
          )}
        </div>
      </Section>

      {/* Background */}
      <Section>
        <div className="flex items-center justify-between">
          <Label>Background</Label>
          {bgColor && (
            <button type="button" onClick={() => setBgColor(null)} className="text-xs text-muted hover:text-guide">
              Clear
            </button>
          )}
        </div>
        <div className="flex items-center gap-2.5">
          <input
            type="color"
            value={bgColor ?? "#ffffff"}
            onChange={(e) => setBgColor(e.target.value)}
            className="h-8 w-10 cursor-pointer rounded border border-border bg-transparent p-0.5"
          />
          <div className="flex gap-1.5">
            {["#ffffff", "#1e3a8a", "#dc2626", "#f5f5f4"].map((p) => (
              <button
                key={p} type="button" onClick={() => setBgColor(p)}
                className={`h-6 w-6 rounded-full border-2 transition ${bgColor === p ? "border-guide" : "border-border"}`}
                style={{ backgroundColor: p }}
              />
            ))}
          </div>
          <span className="text-xs text-muted">{bgColor ?? "None"}</span>
        </div>
      </Section>

      {/* Brightness */}
      <Section>
        <div className="flex items-center justify-between">
          <Label>Brightness</Label>
          <span className="text-xs text-muted">{brightness}%</span>
        </div>
        <input
          type="range" min={50} max={150} step={1} value={brightness}
          onChange={(e) => setBrightness(Number(e.target.value))}
          className="w-full accent-guide"
        />
      </Section>

      {/* Contrast */}
      <Section>
        <div className="flex items-center justify-between">
          <Label>Contrast</Label>
          <span className="text-xs text-muted">{contrast}%</span>
        </div>
        <input
          type="range" min={50} max={150} step={1} value={contrast}
          onChange={(e) => setContrast(Number(e.target.value))}
          className="w-full accent-guide"
        />
        {(brightness !== 100 || contrast !== 100) && (
          <button
            type="button"
            onClick={() => { setBrightness(100); setContrast(100); }}
            className="self-start text-xs text-muted hover:text-guide"
          >
            Reset adjustments
          </button>
        )}
      </Section>

    </div>
  );
}
