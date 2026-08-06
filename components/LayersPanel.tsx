"use client";

import { RefObject } from "react";
import { LayerKey } from "@/lib/editorTypes";

interface LayersPanelProps {
  activeLayer: LayerKey;
  setActiveLayer: (layer: LayerKey) => void;

  originalSrc: string | null;
  showOriginalLayer: boolean;
  setShowOriginalLayer: (updater: (prev: boolean) => boolean) => void;
  originalLayerOpacity: number;
  setOriginalLayerOpacity: (value: number) => void;

  bgRemovedSrc: string | null;
  showOutputLayer: boolean;
  setShowOutputLayer: (updater: (prev: boolean) => boolean) => void;
  outputLayerOpacity: number;
  setOutputLayerOpacity: (value: number) => void;

  bgColor: string | null;
  showBackgroundLayer: boolean;
  setShowBackgroundLayer: (updater: (prev: boolean) => boolean) => void;

  geminiSrc: string | null;
  showGeminiLayer: boolean;
  setShowGeminiLayer: (updater: (prev: boolean) => boolean) => void;
  geminiLayerOpacity: number;
  setGeminiLayerOpacity: (value: number) => void;
  geminiInputRef: RefObject<HTMLInputElement>;
  onGeminiFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveGeminiLayer: () => void;
}

const EYE = "\u{1F441}\uFE0F";

export default function LayersPanel({
  activeLayer,
  setActiveLayer,
  originalSrc,
  showOriginalLayer,
  setShowOriginalLayer,
  originalLayerOpacity,
  setOriginalLayerOpacity,
  bgRemovedSrc,
  showOutputLayer,
  setShowOutputLayer,
  outputLayerOpacity,
  setOutputLayerOpacity,
  bgColor,
  showBackgroundLayer,
  setShowBackgroundLayer,
  geminiSrc,
  showGeminiLayer,
  setShowGeminiLayer,
  geminiLayerOpacity,
  setGeminiLayerOpacity,
  geminiInputRef,
  onGeminiFileChange,
  onRemoveGeminiLayer,
}: LayersPanelProps) {
  return (
    <div className="border border-[#c7d9f0] bg-white">
      <div className="border-b border-[#c7d9f0] bg-[#eaf1fb] px-4 py-2 text-xs font-bold uppercase tracking-wide text-guide">
        Layers <span className="normal-case text-slate-400">(click to select)</span>
      </div>
      <div className="divide-y divide-[#e0ecf8]">
        {/* Original photo layer */}
        <div
          onClick={() => setActiveLayer("original")}
          className={`flex cursor-pointer items-center gap-3 px-4 py-3 ${
            activeLayer === "original" ? "bg-guide/10" : "hover:bg-[#eaf1fb]/60"
          }`}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowOriginalLayer((v) => !v);
            }}
            title={showOriginalLayer ? "Hide layer" : "Show layer"}
            className="text-lg"
          >
            {showOriginalLayer ? EYE : <span className="inline-block w-5" />}
          </button>
          {originalSrc && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={originalSrc}
              alt="Original photo thumbnail"
              className="h-10 w-10 border border-[#c7d9f0] object-cover"
            />
          )}
          <div className="flex flex-1 flex-col gap-1">
            <span className={`text-sm ${activeLayer === "original" ? "text-guide" : "text-ink"}`}>
              Original Photo
            </span>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={originalLayerOpacity}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => setOriginalLayerOpacity(Number(e.target.value))}
              disabled={!showOriginalLayer}
              className="accent-guide disabled:opacity-30"
            />
          </div>
          <span className="w-10 text-right text-xs text-slate-400">{originalLayerOpacity}%</span>
        </div>

        {/* AI background-removed layer */}
        <div
          onClick={() => setActiveLayer("output")}
          className={`flex cursor-pointer items-center gap-3 px-4 py-3 ${
            activeLayer === "output" ? "bg-guide/10" : "hover:bg-[#eaf1fb]/60"
          }`}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowOutputLayer((v) => !v);
            }}
            title={showOutputLayer ? "Hide layer" : "Show layer"}
            className="text-lg"
          >
            {showOutputLayer ? EYE : <span className="inline-block w-5" />}
          </button>
          {bgRemovedSrc && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={bgRemovedSrc}
              alt="Background removed thumbnail"
              className="h-10 w-10 border border-[#c7d9f0] object-cover"
              style={{
                backgroundImage:
                  "linear-gradient(45deg, #333 25%, transparent 25%), linear-gradient(-45deg, #333 25%, transparent 25%)",
                backgroundSize: "6px 6px",
              }}
            />
          )}
          <div className="flex flex-1 flex-col gap-1">
            <span className={`text-sm ${activeLayer === "output" ? "text-guide" : "text-ink"}`}>
              Background Removed (AI)
            </span>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={outputLayerOpacity}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => setOutputLayerOpacity(Number(e.target.value))}
              disabled={!showOutputLayer}
              className="accent-guide disabled:opacity-30"
            />
          </div>
          <span className="w-10 text-right text-xs text-slate-400">{outputLayerOpacity}%</span>
        </div>

        {/* Background color layer - not a Cropper, so nothing to select */}
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            type="button"
            onClick={() => setShowBackgroundLayer((v) => !v)}
            title={showBackgroundLayer ? "Hide layer" : "Show layer"}
            disabled={!bgColor}
            className="text-lg disabled:opacity-30"
          >
            {showBackgroundLayer ? EYE : <span className="inline-block w-5" />}
          </button>
          <div className="h-10 w-10 border border-[#c7d9f0]" style={{ backgroundColor: bgColor ?? "transparent" }} />
          <span className="flex-1 text-sm text-ink">
            {bgColor ? "Background Color" : "Background Color (none set)"}
          </span>
        </div>

        {/* Gemini-enhanced comparison layer */}
        <div
          onClick={() => geminiSrc && setActiveLayer("gemini")}
          className={`flex items-center gap-3 px-4 py-3 ${geminiSrc ? "cursor-pointer" : ""} ${
            activeLayer === "gemini" ? "bg-guide/10" : "hover:bg-[#eaf1fb]/60"
          }`}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowGeminiLayer((v) => !v);
            }}
            title={showGeminiLayer ? "Hide layer" : "Show layer"}
            disabled={!geminiSrc}
            className="text-lg disabled:opacity-30"
          >
            {showGeminiLayer ? EYE : <span className="inline-block w-5" />}
          </button>
          {geminiSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={geminiSrc}
              alt="Gemini enhanced thumbnail"
              className="h-10 w-10 border border-[#c7d9f0] object-cover"
            />
          ) : (
            <div className="h-10 w-10 border border-dashed border-[#c7d9f0]" />
          )}
          <div className="flex flex-1 flex-col gap-1">
            <span className={`text-sm ${activeLayer === "gemini" ? "text-guide" : "text-ink"}`}>
              Gemini Enhanced
            </span>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={geminiLayerOpacity}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => setGeminiLayerOpacity(Number(e.target.value))}
              disabled={!showGeminiLayer || !geminiSrc}
              className="accent-guide disabled:opacity-30"
            />
          </div>
          {geminiSrc && (
            <span className="w-10 text-right text-xs text-slate-400">{geminiLayerOpacity}%</span>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              geminiInputRef.current?.click();
            }}
            className="border border-[#c7d9f0] px-2 py-1 text-xs text-ink hover:border-guide hover:text-guide"
          >
            {geminiSrc ? "Replace" : "Upload"}
          </button>
          {geminiSrc && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemoveGeminiLayer();
              }}
              title="Remove layer"
              className="text-xs text-neutral-500 hover:text-red-400"
            >
              &#10005;
            </button>
          )}
          <input
            ref={geminiInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={onGeminiFileChange}
          />
        </div>
      </div>
    </div>
  );
}
