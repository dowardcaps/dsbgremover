"use client";

import { LAYER_LABELS, LayerKey, NameCase, Transform } from "@/lib/editorTypes";

const BG_PRESETS = ["#ffffff", "#1e3a8a", "#dc2626", "#f5f5f4"];

interface EditorControlsProps {
  activeLayer: LayerKey;
  activeTransform: Transform;
  setTransform: (layer: LayerKey, next: Partial<Transform>) => void;
  rotateActiveLayer90: (direction: "ccw" | "cw") => void;
  resetActiveLayerRotation: () => void;

  bgColor: string | null;
  setBgColor: (color: string | null) => void;

  brightness: number;
  setBrightness: (value: number) => void;
  contrast: number;
  setContrast: (value: number) => void;
  resetBrightnessContrast: () => void;

  name: string;
  setName: (value: string) => void;
  nameCase: NameCase;
  setNameCase: (value: NameCase) => void;
}

export default function EditorControls({
  activeLayer,
  activeTransform,
  setTransform,
  rotateActiveLayer90,
  resetActiveLayerRotation,
  bgColor,
  setBgColor,
  brightness,
  setBrightness,
  contrast,
  setContrast,
  resetBrightnessContrast,
  name,
  setName,
  nameCase,
  setNameCase,
}: EditorControlsProps) {
  return (
    <>
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold uppercase tracking-wide text-slate-600">
          Zoom <span className="text-slate-400">({LAYER_LABELS[activeLayer]})</span>
        </label>
        <input
          type="range"
          min={1}
          max={3}
          step={0.01}
          value={activeTransform.zoom}
          onChange={(e) => setTransform(activeLayer, { zoom: Number(e.target.value) })}
          className="accent-guide"
        />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wide text-slate-600">
            Rotate <span className="text-slate-400">(drag the handle above)</span>
          </label>
          <span className="text-xs text-slate-400">{activeTransform.rotation}&deg;</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => rotateActiveLayer90("ccw")}
            title="Rotate 90 degrees counter-clockwise"
            className="cursor-pointer border border-[#c7d9f0] px-3 py-2 text-ink hover:border-guide hover:text-guide"
          >
            &#8630; 90&deg;
          </button>
          <button
            type="button"
            onClick={() => rotateActiveLayer90("cw")}
            title="Rotate 90 degrees clockwise"
            className="cursor-pointer border border-[#c7d9f0] px-3 py-2 text-ink hover:border-guide hover:text-guide"
          >
            90&deg; &#8631;
          </button>
          {activeTransform.rotation !== 0 && (
            <button
              type="button"
              onClick={resetActiveLayerRotation}
              title="Reset rotation"
              className="border border-[#c7d9f0] px-3 py-2 text-xs text-slate-400 hover:border-guide hover:text-guide"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wide text-slate-600">Background</label>
          {bgColor && (
            <button
              type="button"
              onClick={() => setBgColor(null)}
              className="text-xs text-slate-400 hover:text-guide"
            >
              Make transparent
            </button>
          )}
        </div>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={bgColor ?? "#ffffff"}
            onChange={(e) => setBgColor(e.target.value)}
            className="h-10 w-14 cursor-pointer border border-[#c7d9f0] bg-transparent p-1"
            title="Pick a background color"
          />
          <div className="flex flex-wrap gap-2">
            {BG_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setBgColor(preset)}
                title={preset}
                className={`h-7 w-7 rounded-full border-2 ${
                  bgColor === preset ? "border-guide" : "border-[#c7d9f0]"
                }`}
                style={{ backgroundColor: preset }}
              />
            ))}
          </div>
          <span className="text-xs text-slate-400">{bgColor ? bgColor : "Transparent"}</span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wide text-slate-600">Brightness</label>
          <span className="text-xs text-slate-400">{brightness}%</span>
        </div>
        <input
          type="range"
          min={50}
          max={150}
          step={1}
          value={brightness}
          onChange={(e) => setBrightness(Number(e.target.value))}
          className="accent-guide"
        />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wide text-slate-600">Contrast</label>
          <span className="text-xs text-slate-400">{contrast}%</span>
        </div>
        <input
          type="range"
          min={50}
          max={150}
          step={1}
          value={contrast}
          onChange={(e) => setContrast(Number(e.target.value))}
          className="accent-guide"
        />
        {(brightness !== 100 || contrast !== 100) && (
          <button
            type="button"
            onClick={resetBrightnessContrast}
            className="self-start text-xs text-slate-400 hover:text-guide"
          >
            Reset brightness/contrast
          </button>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold uppercase tracking-wide text-slate-600">
          Name <span className="text-slate-400">(optional)</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Chrizel Jane Y. Dionisio"
          className="border border-[#c7d9f0] bg-white px-3 py-2 text-sm text-ink placeholder:text-slate-400 focus:border-guide focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold uppercase tracking-wide text-slate-600">
          Capitalization
        </label>
        <div className="flex items-center gap-4 text-sm text-ink">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name="nameCase"
              checked={nameCase === "upper"}
              onChange={() => setNameCase("upper")}
              className="accent-guide"
            />
            ALL CAPS
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name="nameCase"
              checked={nameCase === "natural"}
              onChange={() => setNameCase("natural")}
              className="accent-guide"
            />
            Natural Case
          </label>
        </div>
      </div>
    </>
  );
}
