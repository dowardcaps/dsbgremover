import { NameCase, NAME_BAND_HEIGHT, drawNameplate } from "@/lib/nameplate";

export interface PixelCrop {
  x: number;
  y: number;
  width: number;
  height: number;
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (err) => reject(err));
    image.src = url;
  });
}

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export interface EditOptions {
  backgroundColor?: string | null; // null/undefined = transparent
  brightness?: number; // percent, 100 = normal
  contrast?: number; // percent, 100 = normal
  name?: string; // optional nameplate text, blank = no text drawn
  nameCase?: NameCase; // "upper" (default) or "natural"
}

/**
 * Renders the cropped/zoomed/rotated area of `imageSrc` onto a square
 * canvas of `outputSize` px and returns it as a PNG blob. `pixelCrop` is
 * expected in the ROTATED image's coordinate space, i.e. exactly what
 * react-easy-crop's onCropComplete reports when a `rotation` prop is
 * passed to <Cropper>. If `options.backgroundColor` is set, it's filled
 * in behind the subject; otherwise the background stays transparent.
 * Brightness/contrast are applied via canvas filters to match the CSS
 * filter used for the live preview.
 */
export async function getCroppedPng(
  imageSrc: string,
  pixelCrop: PixelCrop,
  outputSize: number = 1080,
  rotation: number = 0,
  options: EditOptions = {}
): Promise<Blob> {
  const { backgroundColor = null, brightness = 100, contrast = 100, name = "", nameCase = "upper" } =
    options;
  const image = await createImage(imageSrc);
  const filterString = `brightness(${brightness}%) contrast(${contrast}%)`;

  // Step 1: draw the full source image onto an oversized canvas, rotated
  // around its own center, so we can then crop the already-rotated result.
  const radians = toRadians(rotation);
  const sin = Math.abs(Math.sin(radians));
  const cos = Math.abs(Math.cos(radians));
  const rotatedWidth = image.width * cos + image.height * sin;
  const rotatedHeight = image.width * sin + image.height * cos;

  const rotateCanvas = document.createElement("canvas");
  rotateCanvas.width = rotatedWidth;
  rotateCanvas.height = rotatedHeight;
  const rotateCtx = rotateCanvas.getContext("2d");
  if (!rotateCtx) throw new Error("Could not get canvas context");

  // Fill the background color first (if any) so it sits behind the subject
  // once we rotate/draw the (transparent-background) subject on top.
  if (backgroundColor) {
    rotateCtx.fillStyle = backgroundColor;
    rotateCtx.fillRect(0, 0, rotatedWidth, rotatedHeight);
  }

  rotateCtx.translate(rotatedWidth / 2, rotatedHeight / 2);
  rotateCtx.rotate(radians);
  rotateCtx.filter = filterString;
  rotateCtx.drawImage(image, -image.width / 2, -image.height / 2);

  // Step 2: crop the rotated canvas down to the final square output.
  const canvas = document.createElement("canvas");
  canvas.width = outputSize;
  canvas.height = outputSize;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get canvas context");

  if (backgroundColor) {
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, outputSize, outputSize);
  } else {
    ctx.clearRect(0, 0, outputSize, outputSize);
  }

  ctx.drawImage(
    rotateCanvas,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    outputSize,
    outputSize
  );

  // Optional name plate: a white band pinned to the bottom of the square,
  // drawn last so it always sits on top of the photo. Always rendered
  // (even blank) so the layout is consistent whether or not a name was
  // entered - only the text itself is conditional.
  drawNameplate(ctx, 0, outputSize - NAME_BAND_HEIGHT, outputSize, NAME_BAND_HEIGHT, name, nameCase);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Canvas export failed"));
    }, "image/png");
  });
}
