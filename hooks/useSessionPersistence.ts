"use client";

import { useEffect, useState } from "react";
import { LayerKey, Transform } from "@/lib/types";
import { DEFAULT_TRANSFORM } from "@/lib/constants";
import { Gender } from "@/lib/attire";
import {
  StoredSession,
  getSession,
  saveSession,
} from "@/lib/sessionStore";

export interface SessionState {
  originalFile: File | null;
  originalSrc: string | null;
  bgRemovedBlob: Blob | null;
  bgRemovedSrc: string | null;
  geminiFile: File | null;
  geminiSrc: string | null;
  originalTransform: Transform;
  outputTransform: Transform;
  geminiTransform: Transform;
  activeLayer: LayerKey;
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
  attireGender: Gender;
  attireId: string | null;
}

export function useSessionPersistence(
  sessionId: string,
  state: SessionState & { stage: string },
  setters: {
    setOriginalFile: (f: File | null) => void;
    setOriginalSrc: (s: string | null) => void;
    setBgRemovedBlob: (b: Blob | null) => void;
    setBgRemovedSrc: (s: string | null) => void;
    setGeminiFile: (f: File | null) => void;
    setGeminiSrc: (s: string | null) => void;
    setOriginalTransform: (t: Transform) => void;
    setOutputTransform: (t: Transform) => void;
    setGeminiTransform: (t: Transform) => void;
    setActiveLayer: (l: LayerKey) => void;
    setBgColor: (c: string | null) => void;
    setBrightness: (n: number) => void;
    setContrast: (n: number) => void;
    setShowOriginalLayer: (v: boolean) => void;
    setOriginalLayerOpacity: (n: number) => void;
    setShowOutputLayer: (v: boolean) => void;
    setOutputLayerOpacity: (n: number) => void;
    setShowBackgroundLayer: (v: boolean) => void;
    setShowGeminiLayer: (v: boolean) => void;
    setGeminiLayerOpacity: (n: number) => void;
    setAttireGender: (g: Gender) => void;
    setAttireId: (id: string | null) => void;
    setStage: (s: "upload" | "editing") => void;
  }
): boolean {
  const [isHydrated, setIsHydrated] = useState(false);

  // Restore once on mount
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
          setters.setOriginalFile(file);
          setters.setOriginalSrc(URL.createObjectURL(saved.originalBlob));
        }
        if (saved.bgRemovedBlob) {
          setters.setBgRemovedBlob(saved.bgRemovedBlob);
          setters.setBgRemovedSrc(URL.createObjectURL(saved.bgRemovedBlob));
        }
        if (saved.geminiBlob) {
          const file = new File([saved.geminiBlob], "gemini-comparison", {
            type: saved.geminiBlob.type,
          });
          setters.setGeminiFile(file);
          setters.setGeminiSrc(URL.createObjectURL(saved.geminiBlob));
        }
        setters.setOriginalTransform(saved.originalTransform);
        setters.setOutputTransform(saved.outputTransform);
        setters.setGeminiTransform(saved.geminiTransform);
        setters.setActiveLayer(saved.activeLayer);
        setters.setBgColor(saved.bgColor);
        setters.setBrightness(saved.brightness);
        setters.setContrast(saved.contrast);
        setters.setShowOriginalLayer(saved.showOriginalLayer);
        setters.setOriginalLayerOpacity(saved.originalLayerOpacity);
        setters.setShowOutputLayer(saved.showOutputLayer);
        setters.setOutputLayerOpacity(saved.outputLayerOpacity);
        setters.setShowBackgroundLayer(saved.showBackgroundLayer);
        setters.setShowGeminiLayer(saved.showGeminiLayer);
        setters.setGeminiLayerOpacity(saved.geminiLayerOpacity);
        setters.setAttireGender(saved.attireGender ?? "male");
        setters.setAttireId(saved.attireId ?? null);
        setters.setStage(saved.bgRemovedBlob ? "editing" : "upload");
      }
      setIsHydrated(true);
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  // Autosave on state change, debounced
  useEffect(() => {
    if (!isHydrated) return;
    const timeout = setTimeout(() => {
      const record: StoredSession = {
        id: sessionId,
        stage: state.stage === "editing" ? "editing" : "upload",
        originalBlob: state.originalFile,
        originalFileName: state.originalFile?.name ?? null,
        bgRemovedBlob: state.bgRemovedBlob,
        geminiBlob: state.geminiFile,
        originalTransform: state.originalTransform,
        outputTransform: state.outputTransform,
        geminiTransform: state.geminiTransform,
        activeLayer: state.activeLayer,
        bgColor: state.bgColor,
        brightness: state.brightness,
        contrast: state.contrast,
        showOriginalLayer: state.showOriginalLayer,
        originalLayerOpacity: state.originalLayerOpacity,
        showOutputLayer: state.showOutputLayer,
        outputLayerOpacity: state.outputLayerOpacity,
        showBackgroundLayer: state.showBackgroundLayer,
        showGeminiLayer: state.showGeminiLayer,
        geminiLayerOpacity: state.geminiLayerOpacity,
        attireGender: state.attireGender,
        attireId: state.attireId,
        updatedAt: Date.now(),
      };
      saveSession(record);
    }, 400);
    return () => clearTimeout(timeout);
  }, [
    isHydrated,
    sessionId,
    state.stage,
    state.originalFile,
    state.bgRemovedBlob,
    state.geminiFile,
    state.originalTransform,
    state.outputTransform,
    state.geminiTransform,
    state.activeLayer,
    state.bgColor,
    state.brightness,
    state.contrast,
    state.showOriginalLayer,
    state.originalLayerOpacity,
    state.showOutputLayer,
    state.outputLayerOpacity,
    state.showBackgroundLayer,
    state.showGeminiLayer,
    state.geminiLayerOpacity,
    state.attireGender,
    state.attireId,
  ]);

  return isHydrated;
}
