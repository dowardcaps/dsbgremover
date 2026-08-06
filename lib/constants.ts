export const BG_REMOVE_API_URL =
  process.env.NEXT_PUBLIC_BG_REMOVE_API_URL || "http://localhost:8000/remove-bg";

export const OUTPUT_SIZE = 1080;
export const CANVAS_SIZE = 420;
export const HANDLE_RADIUS = CANVAS_SIZE / 2 + 30;

export const DEFAULT_TRANSFORM = { crop: { x: 0, y: 0 }, zoom: 1, rotation: 0 };
