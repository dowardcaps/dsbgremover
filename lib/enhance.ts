export type LightingDirection = "none" | "soft" | "left" | "right" | "top";

export interface EnhanceSettings {
  sharpen: number;       // 0–100
  warmth: number;        // -100 (cool) to 100 (warm)
  skinLighten: number;   // 0–100
  smoothSkin: number;    // 0–100
  eyeBrighten: number;   // 0–100
  eyeBag: number;        // 0–100
  lighting: LightingDirection;
}

export const DEFAULT_ENHANCE: EnhanceSettings = {
  sharpen: 0,
  warmth: 0,
  skinLighten: 0,
  smoothSkin: 0,
  eyeBrighten: 0,
  eyeBag: 0,
  lighting: "none",
};

/**
 * Bakes enhance overlays onto an existing canvas context at the given size.
 * Call this after drawing the photo, before drawing the attire.
 */
export function bakeEnhance(
  ctx: CanvasRenderingContext2D,
  size: number,
  enhance: EnhanceSettings,
  brightness: number,
  contrast: number
) {
  // CSS filters are already applied during getCroppedPng for brightness/contrast/sharpen/warmth.
  // Here we bake the gradient overlays (lighting, eye brighten, eye bag).

  const lightingGradients: Record<LightingDirection, [number, number, number, number] | null> = {
    none:  null,
    left:  [0, size / 2, size, size / 2],
    right: [size, size / 2, 0, size / 2],
    top:   [size / 2, 0, size / 2, size],
    soft:  null, // handled separately as radial
  };

  // Lighting
  if (enhance.lighting !== "none") {
    if (enhance.lighting === "soft") {
      const rg = ctx.createRadialGradient(size / 2, size * 0.3, 0, size / 2, size * 0.3, size * 0.7);
      rg.addColorStop(0, "rgba(255,245,220,0.35)");
      rg.addColorStop(1, "rgba(255,245,220,0)");
      ctx.fillStyle = rg;
      ctx.fillRect(0, 0, size, size);
    } else {
      const coords = lightingGradients[enhance.lighting]!;
      const lg = ctx.createLinearGradient(...coords);
      lg.addColorStop(0, "rgba(255,240,200,0.25)");
      lg.addColorStop(0.6, "rgba(255,240,200,0)");
      ctx.fillStyle = lg;
      ctx.fillRect(0, 0, size, size);
    }
  }

  // Lighten skin tone with a subtle soft-screen overlay.
  if (enhance.skinLighten > 0) {
    const alpha = enhance.skinLighten * 0.0025;
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.fillStyle = `rgba(255,255,255,${alpha})`;
    ctx.fillRect(0, 0, size, size);
    ctx.restore();
  }

  // Eye brighten — upper-middle radial
  if (enhance.eyeBrighten > 0) {
    const alpha = enhance.eyeBrighten * 0.004;
    const rg = ctx.createRadialGradient(size * 0.5, size * 0.28, 0, size * 0.5, size * 0.28, size * 0.3);
    rg.addColorStop(0, `rgba(255,255,255,${alpha})`);
    rg.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = rg;
    ctx.fillRect(0, 0, size, size);
  }

  // Eye bag reduction — warm fill just below eye area
  if (enhance.eyeBag > 0) {
    const alpha = enhance.eyeBag * 0.004;
    const rg = ctx.createRadialGradient(size * 0.5, size * 0.36, 0, size * 0.5, size * 0.36, size * 0.25);
    rg.addColorStop(0, `rgba(255,220,180,${alpha})`);
    rg.addColorStop(1, "rgba(255,220,180,0)");
    ctx.fillStyle = rg;
    ctx.fillRect(0, 0, size, size);
  }
}
