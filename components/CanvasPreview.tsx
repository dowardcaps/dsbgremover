"use client";

import Cropper from "react-easy-crop";
import { Area } from "react-easy-crop";
import { LayerKey, Transform, LAYER_LABEL } from "@/lib/types";
import { HANDLE_RADIUS, OUTPUT_SIZE } from "@/lib/constants";
import { PixelCrop } from "@/lib/cropImage";
import { useRotateHandle } from "@/hooks/useRotateHandle";
import { useDownload } from "@/hooks/useDownload";
import { ATTIRE, Gender } from "@/lib/attire";
import { EnhanceSettings } from "@/lib/enhance";
import { BodyCrop } from "@/components/BodyCropPanel";

interface Props {
  bgRemovedSrc: string | null;
  originalSrc: string | null;
  geminiSrc: string | null;
  activeLayer: LayerKey;
  outputTransform: Transform;
  originalTransform: Transform;
  geminiTransform: Transform;
  setTransform: (layer: LayerKey, next: Partial<Transform>) => void;
  onCropComplete: (area: Area, pixels: Area) => void;
  croppedAreaPixels: PixelCrop | null;
  bgColor: string | null;
  brightness: number;
  contrast: number;
  showOriginalLayer: boolean;
  originalLayerOpacity: number;
  showOutputLayer: boolean;
  outputLayerOpacity: number;
  showBackgroundLayer: boolean;
  showGeminiLayer: boolean;
  geminiLayerOpacity: number;
  originalFileName: string | undefined;
  attireGender: Gender;
  attireId: string | null;
  attireOffsetY: number;
  attireOpacity: number;
  attireScaleX: number;
  attireScaleY: number;
  bodyCrop: BodyCrop;
  enhance: EnhanceSettings;
  onReset: () => void;
  onError: (msg: string) => void;
}

export default function CanvasPreview({
  bgRemovedSrc, originalSrc, geminiSrc,
  activeLayer, outputTransform, originalTransform, geminiTransform,
  setTransform, onCropComplete, croppedAreaPixels,
  bgColor, brightness, contrast,
  showOriginalLayer, originalLayerOpacity,
  showOutputLayer, outputLayerOpacity,
  showBackgroundLayer, showGeminiLayer, geminiLayerOpacity,
  originalFileName,
  attireGender, attireId, attireOffsetY, attireOpacity, attireScaleX, attireScaleY,
  bodyCrop,
  enhance,
  onReset, onError,
}: Props) {
  const activeTransform =
    activeLayer === "original" ? originalTransform
    : activeLayer === "gemini"  ? geminiTransform
    : outputTransform;

  const attireOverlay = attireId
    ? ATTIRE[attireGender].find((a) => a.id === attireId)?.overlay ?? null
    : null;

  const { canvasRef, isRotating, onPointerDown } = useRotateHandle(
    activeTransform.rotation,
    (deg) => setTransform(activeLayer, { rotation: deg })
  );

  const { downloading, handleDownload } = useDownload({
    bgRemovedSrc, croppedAreaPixels,
    rotation: outputTransform.rotation,
    bgColor, brightness, contrast,
    originalFileName,
    attireOverlay, attireOffsetY, attireOpacity, attireScaleX, attireScaleY,
    bodyCrop,
    enhance,
    onError,
  });

  const photoFilter = [
    `brightness(${brightness}%) contrast(${contrast}%)`,
    enhance.skinLighten > 0 ? `brightness(${100 + enhance.skinLighten * 0.15}%)` : "",
    enhance.sharpen > 0 ? `contrast(${100 + enhance.sharpen * 0.3}%)` : "",
    enhance.warmth !== 0 ? `sepia(${Math.abs(enhance.warmth) * 0.4}%) hue-rotate(${enhance.warmth > 0 ? -10 : 10}deg)` : "",
    enhance.smoothSkin > 0 ? `blur(${enhance.smoothSkin * 0.3}px)` : "",
  ].filter(Boolean).join(" ");

  const lightingGradient = (() => {
    if (enhance.lighting === "none") return null;
    const g: Record<string, string> = {
      left:  "linear-gradient(to right, rgba(255,240,200,0.25) 0%, transparent 60%)",
      right: "linear-gradient(to left, rgba(255,240,200,0.25) 0%, transparent 60%)",
      top:   "linear-gradient(to bottom, rgba(255,240,200,0.30) 0%, transparent 60%)",
      soft:  "radial-gradient(ellipse at 50% 30%, rgba(255,245,220,0.35) 0%, transparent 70%)",
    };
    return g[enhance.lighting] ?? null;
  })();

  const eyeBrightenGradient = enhance.eyeBrighten > 0
    ? `radial-gradient(ellipse 60% 20% at 50% 28%, rgba(255,255,255,${enhance.eyeBrighten * 0.004}) 0%, transparent 100%)`
    : null;

  const eyeBagGradient = enhance.eyeBag > 0
    ? `radial-gradient(ellipse 50% 12% at 50% 36%, rgba(255,220,180,${enhance.eyeBag * 0.004}) 0%, transparent 100%)`
    : null;

  const skinLightenGradient = enhance.skinLighten > 0
    ? `radial-gradient(circle at 50% 30%, rgba(255,255,255,${enhance.skinLighten * 0.0025}) 0%, transparent 70%)`
    : null;

  // clip-path from bodyCrop
  const bodyClipPath = `inset(${bodyCrop.top}% ${bodyCrop.right}% ${bodyCrop.bottom}% ${bodyCrop.left}%)`;

  return (
    <div className="flex w-full flex-col items-center gap-3 lg:sticky lg:top-6 lg:w-auto">
      <div
        ref={canvasRef}
        className="relative mx-auto h-[420px] w-[420px] overflow-visible rounded shadow-panel"
        style={{
          backgroundImage:
            "linear-gradient(45deg, #d4d0c8 25%, transparent 25%), linear-gradient(-45deg, #d4d0c8 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #d4d0c8 75%), linear-gradient(-45deg, transparent 75%, #d4d0c8 75%)",
          backgroundSize: "20px 20px",
          backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
          backgroundColor: "#e8e4dc",
        }}
      >
        {/* Background color fill */}
        <div
          className="absolute inset-0 rounded"
          style={{ backgroundColor: bgColor ?? "transparent", opacity: showBackgroundLayer ? 1 : 0 }}
        />

        {/* AI output layer — bodyCrop clip applied here */}
        <div
          className="absolute inset-0 overflow-hidden rounded"
          style={{
            filter: photoFilter,
            opacity: showOutputLayer ? outputLayerOpacity / 100 : 0,
            pointerEvents: activeLayer === "output" ? "auto" : "none",
            clipPath: bodyClipPath,
          }}
        >
          <Cropper
            image={bgRemovedSrc!}
            crop={outputTransform.crop} zoom={outputTransform.zoom} rotation={outputTransform.rotation}
            aspect={1} cropSize={{ width: 420, height: 420 }} showGrid={false}
            onCropChange={(c) => setTransform("output", { crop: c })}
            onZoomChange={(z) => setTransform("output", { zoom: z })}
            onRotationChange={(r) => setTransform("output", { rotation: r })}
            onCropComplete={onCropComplete} objectFit="contain"
          />
        </div>

        {/* Original photo overlay */}
        {originalSrc && (
          <div
            className="absolute inset-0 overflow-hidden rounded"
            style={{
              opacity: showOriginalLayer ? originalLayerOpacity / 100 : 0,
              pointerEvents: activeLayer === "original" ? "auto" : "none",
            }}
          >
            <Cropper
              image={originalSrc}
              crop={originalTransform.crop} zoom={originalTransform.zoom} rotation={originalTransform.rotation}
              aspect={1} cropSize={{ width: 420, height: 420 }} showGrid={false}
              onCropChange={(c) => setTransform("original", { crop: c })}
              onZoomChange={(z) => setTransform("original", { zoom: z })}
              onRotationChange={(r) => setTransform("original", { rotation: r })}
              objectFit="contain"
            />
          </div>
        )}

        {/* Gemini overlay */}
        {geminiSrc && (
          <div
            className="absolute inset-0 overflow-hidden rounded"
            style={{
              opacity: showGeminiLayer ? geminiLayerOpacity / 100 : 0,
              pointerEvents: activeLayer === "gemini" ? "auto" : "none",
            }}
          >
            <Cropper
              image={geminiSrc}
              crop={geminiTransform.crop} zoom={geminiTransform.zoom} rotation={geminiTransform.rotation}
              aspect={1} cropSize={{ width: 420, height: 420 }} showGrid={false}
              onCropChange={(c) => setTransform("gemini", { crop: c })}
              onZoomChange={(z) => setTransform("gemini", { zoom: z })}
              onRotationChange={(r) => setTransform("gemini", { rotation: r })}
              objectFit="contain"
            />
          </div>
        )}

        {/* Enhance overlays */}
        {lightingGradient && (
          <div className="pointer-events-none absolute inset-0 z-[4] rounded" style={{ background: lightingGradient }} />
        )}
        {skinLightenGradient && (
          <div className="pointer-events-none absolute inset-0 z-[4] rounded" style={{ background: skinLightenGradient }} />
        )}
        {eyeBrightenGradient && (
          <div className="pointer-events-none absolute inset-0 z-[4] rounded" style={{ background: eyeBrightenGradient }} />
        )}
        {eyeBagGradient && (
          <div className="pointer-events-none absolute inset-0 z-[4] rounded" style={{ background: eyeBagGradient }} />
        )}

        {/* Attire overlay */}
        {attireOverlay && (
          <div
            className="pointer-events-none absolute inset-0 z-[5] overflow-hidden rounded"
            style={{ opacity: attireOpacity / 100 }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={attireOverlay}
              alt="Attire overlay"
              className="absolute left-1/2 w-full origin-top"
              style={{
                top: `${attireOffsetY}px`,
                height: "100%",
                objectFit: "cover",
                objectPosition: "top center",
                transform: `translateX(-50%) scaleX(${attireScaleX}) scaleY(${attireScaleY})`,
              }}
            />
          </div>
        )}

        {/* 50% center guides */}
        <div className="pointer-events-none absolute inset-0 z-10">
          <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-guide/40" />
          <div className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-guide/40" />
        </div>

        {/* Rotate ring */}
        <div
          className="pointer-events-none absolute rounded-full border border-dashed border-ink/15"
          style={{ width: HANDLE_RADIUS * 2, height: HANDLE_RADIUS * 2, left: "50%", top: "50%", transform: "translate(-50%, -50%)" }}
        />

        {/* Rotate line */}
        <div
          className="pointer-events-none absolute bg-guide/50"
          style={{
            width: 1, height: HANDLE_RADIUS, left: "50%", top: "50%",
            transformOrigin: "top center",
            transform: `translateX(-50%) rotate(${activeTransform.rotation}deg)`,
          }}
        />

        {/* Rotate handle */}
        <div
          onPointerDown={onPointerDown}
          title={`Drag to rotate: ${LAYER_LABEL[activeLayer]}`}
          className={`absolute z-20 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface text-guide shadow-panel transition-transform ${
            isRotating ? "cursor-grabbing scale-110" : "cursor-grab hover:scale-105"
          }`}
          style={{
            left: "50%", top: "50%",
            transform: `translate(-50%, -50%) rotate(${activeTransform.rotation}deg) translateY(-${HANDLE_RADIUS}px)`,
            touchAction: "none",
          }}
        >
          <span className="text-sm leading-none" style={{ transform: `rotate(${-activeTransform.rotation}deg)` }}>↻</span>
        </div>
      </div>

      <p className="text-xs text-muted">
        Editing: <span className="text-guide font-medium">{LAYER_LABEL[activeLayer]}</span>
      </p>

      <div className="flex gap-2">
        <button
          onClick={handleDownload} disabled={downloading}
          className="rounded bg-guide px-4 py-2 text-sm font-medium text-white shadow-btn transition hover:opacity-90 disabled:opacity-50"
        >
          {downloading ? "Exporting…" : `Download PNG (${OUTPUT_SIZE}×${OUTPUT_SIZE})`}
        </button>
        <button
          onClick={onReset}
          className="rounded border border-border bg-surface px-4 py-2 text-sm font-medium text-ink shadow-btn transition hover:border-ink/40"
        >
          Start Over
        </button>
      </div>
    </div>
  );
}
