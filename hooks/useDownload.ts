"use client";

import { useState } from "react";
import { getCroppedPng, PixelCrop } from "@/lib/cropImage";
import { OUTPUT_SIZE, CANVAS_SIZE } from "@/lib/constants";
import { EnhanceSettings, bakeEnhance } from "@/lib/enhance";
import { BodyCrop } from "@/components/BodyCropPanel";

interface DownloadOptions {
  bgRemovedSrc: string | null;
  croppedAreaPixels: PixelCrop | null;
  rotation: number;
  bgColor: string | null;
  brightness: number;
  contrast: number;
  originalFileName: string | undefined;
  attireOverlay: string | null;
  attireOffsetY: number;
  attireOpacity: number;
  attireScaleX: number;
  attireScaleY: number;
  bodyCrop: BodyCrop;
  enhance: EnhanceSettings;
  onError: (msg: string) => void;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export function useDownload({
  bgRemovedSrc, croppedAreaPixels, rotation,
  bgColor, brightness, contrast,
  originalFileName,
  attireOverlay, attireOffsetY, attireOpacity, attireScaleX, attireScaleY,
  bodyCrop,
  enhance,
  onError,
}: DownloadOptions) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!bgRemovedSrc || !croppedAreaPixels) return;
    setDownloading(true);
    try {
      // 1. Render cropped photo
      const photoBlob = await getCroppedPng(bgRemovedSrc, croppedAreaPixels, OUTPUT_SIZE, rotation, {
        backgroundColor: bgColor,
        brightness,
        contrast,
      });

      const canvas = document.createElement("canvas");
      canvas.width = OUTPUT_SIZE;
      canvas.height = OUTPUT_SIZE;
      const ctx = canvas.getContext("2d")!;

      // 2. Draw photo with bodyCrop clip
      const photoImg = await loadImage(URL.createObjectURL(photoBlob));
      const clipX      = (bodyCrop.left   / 100) * OUTPUT_SIZE;
      const clipY      = (bodyCrop.top    / 100) * OUTPUT_SIZE;
      const clipWidth  = OUTPUT_SIZE - ((bodyCrop.left + bodyCrop.right)   / 100) * OUTPUT_SIZE;
      const clipHeight = OUTPUT_SIZE - ((bodyCrop.top  + bodyCrop.bottom)  / 100) * OUTPUT_SIZE;

      ctx.save();
      ctx.beginPath();
      ctx.rect(clipX, clipY, clipWidth, clipHeight);
      ctx.clip();
      ctx.drawImage(photoImg, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
      ctx.restore();

      // 3. Bake enhance gradient overlays
      bakeEnhance(ctx, OUTPUT_SIZE, enhance, brightness, contrast);

      // 4. Draw attire with warp + offset
      if (attireOverlay) {
        const scale = OUTPUT_SIZE / CANVAS_SIZE;
        const scaledOffsetY = attireOffsetY * scale;
        const attireImg = await loadImage(attireOverlay);
        ctx.save();
        ctx.globalAlpha = attireOpacity / 100;
        ctx.translate(OUTPUT_SIZE / 2, 0);
        ctx.scale(attireScaleX, attireScaleY);
        ctx.translate(-OUTPUT_SIZE / 2, 0);
        ctx.drawImage(attireImg, 0, scaledOffsetY, OUTPUT_SIZE, OUTPUT_SIZE);
        ctx.restore();
      }

      const finalBlob = await new Promise<Blob>((resolve, reject) =>
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Export failed"))), "image/png")
      );

      triggerDownload(finalBlob, originalFileName);
    } catch {
      onError("Could not export the image. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  return { downloading, handleDownload };
}

function triggerDownload(blob: Blob, originalFileName: string | undefined) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${originalFileName?.replace(/\.[^/.]+$/, "") ?? "rush-id-photo"}-1080x1080.png`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
