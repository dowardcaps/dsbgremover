"use client";

import { RefObject, useEffect, useRef } from "react";
import Cropper from "react-easy-crop";
import { Area } from "react-easy-crop";
import { CANVAS_SIZE, HANDLE_RADIUS, LAYER_LABELS, LayerKey, NameCase, Transform } from "@/lib/editorTypes";
import { NAME_BAND_HEIGHT, drawNameplate } from "@/lib/nameplate";

interface EditorCanvasProps {
  canvasRef: RefObject<HTMLDivElement>;

  bgColor: string | null;
  showBackgroundLayer: boolean;

  bgRemovedSrc: string;
  outputTransform: Transform;
  showOutputLayer: boolean;
  outputLayerOpacity: number;
  brightness: number;
  contrast: number;
  onCropComplete: (croppedArea: Area, croppedAreaPixels: Area) => void;

  originalSrc: string | null;
  originalTransform: Transform;
  showOriginalLayer: boolean;
  originalLayerOpacity: number;

  geminiSrc: string | null;
  geminiTransform: Transform;
  showGeminiLayer: boolean;
  geminiLayerOpacity: number;

  activeLayer: LayerKey;
  setTransform: (layer: LayerKey, next: Partial<Transform>) => void;
  activeRotation: number;

  isRotating: boolean;
  onRotateHandlePointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;

  name: string;
  nameCase: NameCase;
  showNameplate: boolean;
}

export default function EditorCanvas({
  canvasRef,
  bgColor,
  showBackgroundLayer,
  bgRemovedSrc,
  outputTransform,
  showOutputLayer,
  outputLayerOpacity,
  brightness,
  contrast,
  onCropComplete,
  originalSrc,
  originalTransform,
  showOriginalLayer,
  originalLayerOpacity,
  geminiSrc,
  geminiTransform,
  showGeminiLayer,
  geminiLayerOpacity,
  activeLayer,
  setTransform,
  activeRotation,
  isRotating,
  onRotateHandlePointerDown,
  name,
  nameCase,
  showNameplate,
}: EditorCanvasProps) {
  const nameplateCanvasRef = useRef<HTMLCanvasElement>(null);

  // Preview band height, scaled down from the real 1080px export size to
  // this component's 420px preview canvas - same ratio, so what you see
  // here lines up with the downloaded PNG.
  const previewBandHeight = Math.round((NAME_BAND_HEIGHT / 1080) * CANVAS_SIZE);

  useEffect(() => {
    const canvas = nameplateCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!showNameplate) return;
    // Same drawNameplate function used for the real export - just called
    // at preview scale, so sizing/centering math is identical either way.
    drawNameplate(ctx, 0, 0, canvas.width, canvas.height, name, nameCase);
  }, [name, nameCase, previewBandHeight, showNameplate]);

  return (
    <div
      ref={canvasRef}
      className="relative mx-auto h-[420px] w-[420px] overflow-visible border-2 border-guide"
      style={{
        backgroundImage:
          "linear-gradient(45deg, #333 25%, transparent 25%), linear-gradient(-45deg, #333 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #333 75%), linear-gradient(-45deg, transparent 75%, #333 75%)",
        backgroundSize: "20px 20px",
        backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
        backgroundColor: "#1e1e1e",
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: bgColor ?? "transparent",
          opacity: showBackgroundLayer ? 1 : 0,
        }}
      />

      {/* AI background-removed layer - the one that gets exported */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{
          filter: `brightness(${brightness}%) contrast(${contrast}%)`,
          opacity: showOutputLayer ? outputLayerOpacity / 100 : 0,
          pointerEvents: activeLayer === "output" ? "auto" : "none",
        }}
      >
        <Cropper
          image={bgRemovedSrc}
          crop={outputTransform.crop}
          zoom={outputTransform.zoom}
          rotation={outputTransform.rotation}
          aspect={1}
          cropSize={{ width: 420, height: 420 }}
          showGrid={false}
          onCropChange={(c) => setTransform("output", { crop: c })}
          onZoomChange={(z) => setTransform("output", { zoom: z })}
          onRotationChange={(r) => setTransform("output", { rotation: r })}
          onCropComplete={onCropComplete}
          objectFit="contain"
        />
      </div>

      {/* Original photo overlay - independent crop/zoom/rotation,
          only interactive when selected as the active layer */}
      {originalSrc && (
        <div
          className="absolute inset-0 overflow-hidden"
          style={{
            opacity: showOriginalLayer ? originalLayerOpacity / 100 : 0,
            pointerEvents: activeLayer === "original" ? "auto" : "none",
          }}
        >
          <Cropper
            image={originalSrc}
            crop={originalTransform.crop}
            zoom={originalTransform.zoom}
            rotation={originalTransform.rotation}
            aspect={1}
            cropSize={{ width: 420, height: 420 }}
            showGrid={false}
            onCropChange={(c) => setTransform("original", { crop: c })}
            onZoomChange={(z) => setTransform("original", { zoom: z })}
            onRotationChange={(r) => setTransform("original", { rotation: r })}
            objectFit="contain"
          />
        </div>
      )}

      {/* Gemini-enhanced comparison overlay - independent
          crop/zoom/rotation, same interactivity rule as above */}
      {geminiSrc && (
        <div
          className="absolute inset-0 overflow-hidden"
          style={{
            opacity: showGeminiLayer ? geminiLayerOpacity / 100 : 0,
            pointerEvents: activeLayer === "gemini" ? "auto" : "none",
          }}
        >
          <Cropper
            image={geminiSrc}
            crop={geminiTransform.crop}
            zoom={geminiTransform.zoom}
            rotation={geminiTransform.rotation}
            aspect={1}
            cropSize={{ width: 420, height: 420 }}
            showGrid={false}
            onCropChange={(c) => setTransform("gemini", { crop: c })}
            onZoomChange={(z) => setTransform("gemini", { zoom: z })}
            onRotationChange={(r) => setTransform("gemini", { rotation: r })}
            objectFit="contain"
          />
        </div>
      )}

      {/* Name plate - white band pinned to the bottom of the canvas,
          rendered with the exact same drawing routine as the final export
          so the preview always matches the download. Always present (per
          spec the band stays blank rather than disappearing), sits above
          the photo layers, non-interactive so it never blocks dragging. */}
      <canvas
        ref={nameplateCanvasRef}
        width={CANVAS_SIZE}
        height={previewBandHeight}
        className="pointer-events-none absolute bottom-0 left-0 z-10"
        style={{ width: CANVAS_SIZE, height: previewBandHeight }}
      />

      {/* 50% center guides, matching the Photoshop manual workflow */}
      <div className="pointer-events-none absolute inset-0 z-10">
        <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-guide/70" />
        <div className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-guide/70" />
      </div>

      {/* Faint ring showing the drag path for the rotate handle */}
      <div
        className="pointer-events-none absolute rounded-full border border-dashed border-neutral-300/50"
        style={{
          width: HANDLE_RADIUS * 2,
          height: HANDLE_RADIUS * 2,
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />

      {/* Line from center to the handle, rotates live - tracks
          whichever layer is currently active */}
      <div
        className="pointer-events-none absolute bg-guide/60"
        style={{
          width: 2,
          height: HANDLE_RADIUS,
          left: "50%",
          top: "50%",
          transformOrigin: "top center",
          transform: `translateX(-50%) rotate(${activeRotation}deg)`,
        }}
      />

      {/* Draggable rotate handle - grab and drag around the canvas
          to rotate whichever layer is currently selected */}
      <div
        onPointerDown={onRotateHandlePointerDown}
        title={`Drag to rotate: ${LAYER_LABELS[activeLayer]}`}
        className={`absolute z-20 flex h-9 w-9 items-center justify-center rounded-full border-2 border-guide bg-white text-guide shadow-lg transition-transform ${
          isRotating ? "cursor-grabbing scale-110" : "cursor-grab hover:scale-105"
        }`}
        style={{
          left: "50%",
          top: "50%",
          transform: `translate(-50%, -50%) rotate(${activeRotation}deg) translateY(-${HANDLE_RADIUS}px)`,
          touchAction: "none",
        }}
      >
        <span className="text-base leading-none" style={{ transform: `rotate(${-activeRotation}deg)` }}>
          &#8635;
        </span>
      </div>
    </div>
  );
}
