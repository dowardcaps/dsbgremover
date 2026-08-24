"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Area } from "react-easy-crop";
import { getCroppedPng, PixelCrop } from "@/lib/cropImage";
import {
  StoredSession,
  deleteSession,
  getSession,
  saveSession,
} from "@/lib/sessionStore";
import {
  BG_REMOVE_API_URL,
  DEFAULT_NAME_CASE,
  DEFAULT_TRANSFORM,
  LayerKey,
  NameCase,
  OUTPUT_SIZE,
  Stage,
  Transform,
} from "@/lib/editorTypes";

interface UseSessionEditorArgs {
  sessionId: string;
  onThumbnailChange?: (thumbnail: string | null) => void;
}

/**
 * All the state, persistence, and interaction logic for a single customer's
 * background-removal session: upload, layers, crop/zoom/rotate per layer,
 * background color, brightness/contrast, and export. Components stay
 * presentation-only and just render whatever this hook returns.
 */
export function useSessionEditor({ sessionId, onThumbnailChange }: UseSessionEditorArgs) {
  const [stage, setStage] = useState<Stage>("upload");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalSrc, setOriginalSrc] = useState<string | null>(null);
  const [bgRemovedSrc, setBgRemovedSrc] = useState<string | null>(null);
  // Raw blobs alongside the object URLs above - object URLs die on refresh,
  // so these are what actually get written to IndexedDB.
  const [bgRemovedBlob, setBgRemovedBlob] = useState<Blob | null>(null);
  const [geminiFile, setGeminiFile] = useState<File | null>(null);

  // True once we've finished checking IndexedDB for a saved session, so the
  // autosave effect below never fires with default/empty state and
  // clobbers a real saved session before we've had a chance to restore it.
  const [isHydrated, setIsHydrated] = useState(false);

  // Independent transform per layer
  const [originalTransform, setOriginalTransform] = useState<Transform>(DEFAULT_TRANSFORM);
  const [outputTransform, setOutputTransform] = useState<Transform>(DEFAULT_TRANSFORM);
  const [geminiTransform, setGeminiTransform] = useState<Transform>(DEFAULT_TRANSFORM);

  // Which layer the Zoom/Rotate controls currently act on - like selecting
  // a layer in Photoshop before using the Move/Transform tool.
  const [activeLayer, setActiveLayer] = useState<LayerKey>("output");

  const [croppedAreaPixels, setCroppedAreaPixels] = useState<PixelCrop | null>(null);
  const [isRotating, setIsRotating] = useState(false);

  const [bgColor, setBgColor] = useState<string | null>(null); // null = transparent
  const [brightness, setBrightness] = useState(100); // percent, 100 = normal
  const [contrast, setContrast] = useState(100); // percent, 100 = normal

  // Optional nameplate text shown in the white band at the bottom of the
  // 1080x1080 canvas. Blank by default - the band stays blank, not hidden.
  const [name, setName] = useState("");
  const [nameCase, setNameCase] = useState<NameCase>(DEFAULT_NAME_CASE);

  // Layers panel - lets you toggle visibility & opacity to compare the
  // AI output against the original photo before trusting the result.
  const [showOriginalLayer, setShowOriginalLayer] = useState(false);
  const [originalLayerOpacity, setOriginalLayerOpacity] = useState(50);
  const [showOutputLayer, setShowOutputLayer] = useState(true);
  const [outputLayerOpacity, setOutputLayerOpacity] = useState(100);
  const [showBackgroundLayer, setShowBackgroundLayer] = useState(true);

  const [geminiSrc, setGeminiSrc] = useState<string | null>(null);
  const [showGeminiLayer, setShowGeminiLayer] = useState(true);
  const [geminiLayerOpacity, setGeminiLayerOpacity] = useState(50);

  const [downloading, setDownloading] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);
  const geminiInputRef = useRef<HTMLInputElement>(null);

  // Helpers to get/set the transform for whichever layer is active
  const getTransform = useCallback(
    (layer: LayerKey): Transform => {
      if (layer === "original") return originalTransform;
      if (layer === "gemini") return geminiTransform;
      return outputTransform;
    },
    [originalTransform, geminiTransform, outputTransform]
  );

  const setTransform = useCallback((layer: LayerKey, next: Partial<Transform>) => {
    const setter =
      layer === "original"
        ? setOriginalTransform
        : layer === "gemini"
        ? setGeminiTransform
        : setOutputTransform;
    setter((prev) => ({ ...prev, ...next }));
  }, []);

  const activeTransform = getTransform(activeLayer);

  // Let the parent tab bar show a thumbnail for this session
  useEffect(() => {
    onThumbnailChange?.(bgRemovedSrc || originalSrc || null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bgRemovedSrc, originalSrc]);

  // Restore this tab's progress from IndexedDB once, on mount.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const saved = await getSession(sessionId);
      if (cancelled) return;

      if (saved) {
        if (saved.originalBlob) {
          const file = new File(
            [saved.originalBlob],
            saved.originalFileName || "original",
            { type: saved.originalBlob.type }
          );
          setOriginalFile(file);
          setOriginalSrc(URL.createObjectURL(saved.originalBlob));
        }
        if (saved.bgRemovedBlob) {
          setBgRemovedBlob(saved.bgRemovedBlob);
          setBgRemovedSrc(URL.createObjectURL(saved.bgRemovedBlob));
        }
        if (saved.geminiBlob) {
          const file = new File([saved.geminiBlob], "gemini-comparison", {
            type: saved.geminiBlob.type,
          });
          setGeminiFile(file);
          setGeminiSrc(URL.createObjectURL(saved.geminiBlob));
        }
        setOriginalTransform(saved.originalTransform);
        setOutputTransform(saved.outputTransform);
        setGeminiTransform(saved.geminiTransform);
        setActiveLayer(saved.activeLayer);
        setBgColor(saved.bgColor);
        setBrightness(saved.brightness);
        setContrast(saved.contrast);
        setShowOriginalLayer(saved.showOriginalLayer);
        setOriginalLayerOpacity(saved.originalLayerOpacity);
        setShowOutputLayer(saved.showOutputLayer);
        setOutputLayerOpacity(saved.outputLayerOpacity);
        setShowBackgroundLayer(saved.showBackgroundLayer);
        setShowGeminiLayer(saved.showGeminiLayer);
        setGeminiLayerOpacity(saved.geminiLayerOpacity);
        // Optional chaining: sessions saved before the name feature shipped
        // won't have these fields, so fall back to blank/default.
        setName(saved.name ?? "");
        setNameCase(saved.nameCase ?? DEFAULT_NAME_CASE);
        // A photo mid-upload when the tab closed has no bg-removed result
        // to resume into, so send it back to the upload screen rather than
        // a stuck "removing" or stale "error" state.
        setStage(saved.bgRemovedBlob ? "editing" : "upload");
      }
      setIsHydrated(true);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  // Autosave this tab's progress to IndexedDB, debounced so continuous
  // drags (crop/zoom/rotate) don't write on every pixel of movement.
  useEffect(() => {
    if (!isHydrated) return;

    const timeout = setTimeout(() => {
      const record: StoredSession = {
        id: sessionId,
        stage: stage === "editing" ? "editing" : "upload",
        originalBlob: originalFile,
        originalFileName: originalFile?.name ?? null,
        bgRemovedBlob,
        geminiBlob: geminiFile,
        originalTransform,
        outputTransform,
        geminiTransform,
        activeLayer,
        bgColor,
        brightness,
        contrast,
        showOriginalLayer,
        originalLayerOpacity,
        showOutputLayer,
        outputLayerOpacity,
        showBackgroundLayer,
        showGeminiLayer,
        geminiLayerOpacity,
        name,
        nameCase,
        updatedAt: Date.now(),
      };
      saveSession(record);
    }, 400);

    return () => clearTimeout(timeout);
  }, [
    isHydrated,
    sessionId,
    stage,
    originalFile,
    bgRemovedBlob,
    geminiFile,
    originalTransform,
    outputTransform,
    geminiTransform,
    activeLayer,
    bgColor,
    brightness,
    contrast,
    showOriginalLayer,
    originalLayerOpacity,
    showOutputLayer,
    outputLayerOpacity,
    showBackgroundLayer,
    showGeminiLayer,
    geminiLayerOpacity,
    name,
    nameCase,
  ]);

  const handleFileSelect = async (file: File) => {
    setOriginalFile(file);
    setOriginalSrc(URL.createObjectURL(file));
    setStage("removing");
    setErrorMessage("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(BG_REMOVE_API_URL, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.detail || `Request failed (${res.status})`);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setBgRemovedBlob(blob);
      setBgRemovedSrc(url);
      setOriginalTransform(DEFAULT_TRANSFORM);
      setOutputTransform(DEFAULT_TRANSFORM);
      setGeminiTransform(DEFAULT_TRANSFORM);
      setActiveLayer("output");
      setBgColor(null);
      setBrightness(100);
      setContrast(100);
      setShowOriginalLayer(false);
      setOriginalLayerOpacity(50);
      setShowOutputLayer(true);
      setOutputLayerOpacity(100);
      setShowBackgroundLayer(true);
      setGeminiSrc(null);
      setShowGeminiLayer(true);
      setGeminiLayerOpacity(50);
      setName("");
      setNameCase(DEFAULT_NAME_CASE);
      setStage("editing");
    } catch (err) {
      console.error(err);
      setErrorMessage(
        err instanceof Error ? err.message : "Background removal failed. Please try again."
      );
      setStage("error");
    }
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const onGeminiFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setGeminiFile(file);
    setGeminiSrc(URL.createObjectURL(file));
    setGeminiTransform(DEFAULT_TRANSFORM);
    setShowGeminiLayer(true);
    setGeminiLayerOpacity(50);
    e.target.value = ""; // allow re-selecting the same file later
  };

  const removeGeminiLayer = () => {
    setGeminiFile(null);
    setGeminiSrc(null);
    if (activeLayer === "gemini") setActiveLayer("output");
  };

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPx: Area) => {
    setCroppedAreaPixels(croppedAreaPx);
  }, []);

  // Computes the angle (in degrees, 0 = straight up) between the canvas
  // center and the given pointer position.
  const angleFromCenter = useCallback(
    (clientX: number, clientY: number): number => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return activeTransform.rotation;
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = clientX - centerX;
      const dy = clientY - centerY;
      const degrees = Math.atan2(dx, -dy) * (180 / Math.PI);
      return Math.round(degrees);
    },
    [activeTransform.rotation]
  );

  const handleRotateHandlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setIsRotating(true);
  };

  useEffect(() => {
    if (!isRotating) return;

    const handlePointerMove = (e: PointerEvent) => {
      let degrees = angleFromCenter(e.clientX, e.clientY);
      // Normalize into -180..180 so it matches the export math
      if (degrees > 180) degrees -= 360;
      if (degrees < -180) degrees += 360;
      setTransform(activeLayer, { rotation: degrees });
    };

    const handlePointerUp = () => setIsRotating(false);

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [isRotating, activeLayer, angleFromCenter, setTransform]);

  // 90-degree quick-rotate, kept normalized to -180..180 to match the
  // drag-handle math and the export math in cropImage.ts.
  const rotateActiveLayer90 = (direction: "ccw" | "cw") => {
    const delta = direction === "ccw" ? -90 : 90;
    setTransform(activeLayer, {
      rotation: (((activeTransform.rotation + delta + 180) % 360) + 360) % 360 - 180,
    });
  };

  const resetActiveLayerRotation = () => {
    setTransform(activeLayer, { rotation: 0 });
  };

  const resetBrightnessContrast = () => {
    setBrightness(100);
    setContrast(100);
  };

  const handleDownload = async () => {
    if (!bgRemovedSrc || !croppedAreaPixels) return;
    setDownloading(true);
    try {
      const blob = await getCroppedPng(
        bgRemovedSrc,
        croppedAreaPixels,
        OUTPUT_SIZE,
        outputTransform.rotation,
        {
          backgroundColor: bgColor,
          brightness,
          contrast,
          name,
          nameCase,
        }
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const baseName = originalFile?.name.replace(/\.[^/.]+$/, "") || "rush-id-photo";
      a.download = `${baseName}-1080x1080.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      setErrorMessage("Could not export the image. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const handleReset = () => {
    setOriginalFile(null);
    setOriginalSrc(null);
    setBgRemovedSrc(null);
    setBgRemovedBlob(null);
    setOriginalTransform(DEFAULT_TRANSFORM);
    setOutputTransform(DEFAULT_TRANSFORM);
    setGeminiTransform(DEFAULT_TRANSFORM);
    setActiveLayer("output");
    setBgColor(null);
    setBrightness(100);
    setContrast(100);
    setShowOriginalLayer(false);
    setOriginalLayerOpacity(50);
    setShowOutputLayer(true);
    setOutputLayerOpacity(100);
    setShowBackgroundLayer(true);
    setGeminiSrc(null);
    setGeminiFile(null);
    setShowGeminiLayer(true);
    setGeminiLayerOpacity(50);
    setName("");
    setNameCase(DEFAULT_NAME_CASE);
    setCroppedAreaPixels(null);
    setErrorMessage("");
    setStage("upload");
    deleteSession(sessionId);
  };

  return {
    // status
    stage,
    errorMessage,
    downloading,

    // images
    originalSrc,
    bgRemovedSrc,
    geminiSrc,

    // per-layer transform
    activeLayer,
    setActiveLayer,
    getTransform,
    setTransform,
    activeTransform,
    rotateActiveLayer90,
    resetActiveLayerRotation,

    // layers panel visibility/opacity
    showOriginalLayer,
    setShowOriginalLayer,
    originalLayerOpacity,
    setOriginalLayerOpacity,
    showOutputLayer,
    setShowOutputLayer,
    outputLayerOpacity,
    setOutputLayerOpacity,
    showBackgroundLayer,
    setShowBackgroundLayer,
    showGeminiLayer,
    setShowGeminiLayer,
    geminiLayerOpacity,
    setGeminiLayerOpacity,

    // background / brightness / contrast
    bgColor,
    setBgColor,
    brightness,
    setBrightness,
    contrast,
    setContrast,
    resetBrightnessContrast,

    // optional nameplate text
    name,
    setName,
    nameCase,
    setNameCase,

    // rotate-handle drag state
    isRotating,

    // refs
    canvasRef,
    geminiInputRef,

    // handlers
    onDrop,
    onFileInputChange,
    onGeminiFileChange,
    removeGeminiLayer,
    onCropComplete,
    handleRotateHandlePointerDown,
    handleDownload,
    handleReset,
  };
}

export type SessionEditorState = ReturnType<typeof useSessionEditor>;
