// Shared types and constants for the Rush ID photo editor. Kept separate
// from components/hooks so both layers can import from one source of truth.

export const BG_REMOVE_API_URL =
  process.env.NEXT_PUBLIC_BG_REMOVE_API_URL || "http://localhost:8000/remove-bg";

// Matches the manual Photoshop workflow: 1080x1080 document, 50% guides
export const OUTPUT_SIZE = 1080;
export const CANVAS_SIZE = 420;
export const HANDLE_RADIUS = CANVAS_SIZE / 2 + 30; // sits just outside the canvas edge

export type Stage = "upload" | "removing" | "editing" | "error";

// Each layer (original photo, AI output, Gemini-enhanced comparison) has
// its own crop/zoom/rotation so adjusting one never affects the others.
export type LayerKey = "original" | "output" | "gemini";

export interface Transform {
  crop: { x: number; y: number };
  zoom: number;
  rotation: number;
}

export const DEFAULT_TRANSFORM: Transform = { crop: { x: 0, y: 0 }, zoom: 1, rotation: 0 };

export const LAYER_LABELS: Record<LayerKey, string> = {
  original: "Original Photo",
  output: "Background Removed (AI)",
  gemini: "Gemini Enhanced",
};

export interface SessionTab {
  id: string;
  thumbnail: string | null;
}
