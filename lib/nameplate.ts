// Draws the optional name plate: a white band pinned to the bottom of the
// square canvas, with the customer's name centered inside it. This single
// function is called both by the live preview (on a small overlay canvas)
// and by the final PNG export (on the real 1080x1080 output canvas), so
// the two are guaranteed to render identically - same font, same sizing
// math, same centering - just at different scales.

export type NameCase = "upper" | "natural";

export const DEFAULT_NAME_CASE: NameCase = "upper";

// Height of the reserved white band, in the same 1080px space as the
// final export. The live preview scales this down proportionally.
export const NAME_BAND_HEIGHT = 130;

const FONT_FAMILY = "Arial, Helvetica, sans-serif";

/** ALL CAPS, or "Capitalize Each Word" with the rest lowercased. */
export function formatName(rawName: string, nameCase: NameCase): string {
  const trimmed = rawName.trim();
  if (!trimmed) return "";

  if (nameCase === "upper") {
    return trimmed.toUpperCase();
  }

  return trimmed
    .split(" ")
    .map((word) => (word.length === 0 ? word : word[0].toUpperCase() + word.slice(1).toLowerCase()))
    .join(" ");
}

/**
 * Draws the white name band into `ctx` at (x, y) with the given
 * width/height, in whatever units `ctx`'s canvas is using - pass real
 * output pixels for the export, or scaled-down preview pixels for the
 * on-screen canvas. The band is always drawn (even with no name, per the
 * "stays blank, not hidden" requirement); text is only drawn if `rawName`
 * has non-whitespace content.
 */
export function drawNameplate(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  rawName: string,
  nameCase: NameCase
): void {
  ctx.save();

  // The white band itself - always present, per spec, whether or not a
  // name has been entered.
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(x, y, width, height);

  const text = formatName(rawName, nameCase);
  if (text) {
    // Padding and font bounds are expressed as fractions of the band's own
    // size, so this function works the same at preview scale and at full
    // 1080px export scale without needing separate tuning.
    const paddingX = width * 0.06;
    const maxTextWidth = width - paddingX * 2;
    const maxFontSize = height * 0.5;
    const minFontSize = Math.max(height * 0.14, 6);

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#000000";

    let fontSize = maxFontSize;
    ctx.font = `bold ${fontSize}px ${FONT_FAMILY}`;
    let measuredWidth = ctx.measureText(text).width;

    while (measuredWidth > maxTextWidth && fontSize > minFontSize) {
      fontSize -= 1;
      ctx.font = `bold ${fontSize}px ${FONT_FAMILY}`;
      measuredWidth = ctx.measureText(text).width;
    }

    ctx.fillText(text, x + width / 2, y + height / 2);
  }

  ctx.restore();
}
