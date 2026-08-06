export type Stage = "upload" | "removing" | "editing" | "error";
export type LayerKey = "original" | "output" | "gemini";
export type { Gender } from "@/lib/attire";

export interface Transform {
  crop: { x: number; y: number };
  zoom: number;
  rotation: number;
}

export const LAYER_LABEL: Record<LayerKey, string> = {
  original: "Original Photo",
  output: "Background Removed (AI)",
  gemini: "Gemini Enhanced",
};
