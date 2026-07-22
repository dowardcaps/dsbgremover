"use client";

import { useCallback, useState } from "react";
import Cropper, { Area } from "react-easy-crop";
import { getCroppedPng, PixelCrop } from "@/lib/cropImage";

const BG_REMOVE_API_URL =
  process.env.NEXT_PUBLIC_BG_REMOVE_API_URL || "http://localhost:8000/remove-bg";

// Matches the manual Photoshop workflow: 1080x1080 document, 50% guides
const OUTPUT_SIZE = 1080;

type Stage = "upload" | "removing" | "editing" | "error";

export default function PhotoEditor() {
  const [stage, setStage] = useState<Stage>("upload");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [bgRemovedSrc, setBgRemovedSrc] = useState<string | null>(null);

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<PixelCrop | null>(null);

  const [downloading, setDownloading] = useState(false);

  const handleFileSelect = async (file: File) => {
    setOriginalFile(file);
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
      setBgRemovedSrc(url);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
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

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPx: Area) => {
    setCroppedAreaPixels(croppedAreaPx);
  }, []);

  const handleDownload = async () => {
    if (!bgRemovedSrc || !croppedAreaPixels) return;
    setDownloading(true);
    try {
      const blob = await getCroppedPng(bgRemovedSrc, croppedAreaPixels, OUTPUT_SIZE);
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
    setBgRemovedSrc(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setErrorMessage("");
    setStage("upload");
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold">Rush ID - Background Remover</h1>
        <p className="text-sm text-neutral-400">
          Upload a photo, remove the background, then drag / zoom to center the subject on a
          1080&times;1080 canvas.
        </p>
      </header>

      {stage === "upload" && (
        <div
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          className="flex h-64 flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-neutral-600 bg-neutral-900 text-neutral-400 transition hover:border-guide hover:text-guide"
        >
          <p>Drag & drop a photo here, or</p>
          <label className="cursor-pointer rounded bg-guide px-4 py-2 font-medium text-neutral-900">
            Choose File
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={onFileInputChange}
            />
          </label>
        </div>
      )}

      {stage === "removing" && (
        <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-lg bg-neutral-900 text-neutral-300">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-guide border-t-transparent" />
          <p>Removing background...</p>
        </div>
      )}

      {stage === "error" && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg bg-neutral-900 p-6 text-center">
          <p className="text-red-400">{errorMessage}</p>
          <button
            onClick={handleReset}
            className="rounded bg-guide px-4 py-2 font-medium text-neutral-900"
          >
            Try Again
          </button>
        </div>
      )}

      {stage === "editing" && bgRemovedSrc && (
        <>
          {/* Checkerboard backdrop so transparency is visible, like Photoshop */}
          <div
            className="relative mx-auto h-[420px] w-[420px] overflow-hidden rounded"
            style={{
              backgroundImage:
                "linear-gradient(45deg, #333 25%, transparent 25%), linear-gradient(-45deg, #333 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #333 75%), linear-gradient(-45deg, transparent 75%, #333 75%)",
              backgroundSize: "20px 20px",
              backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
              backgroundColor: "#1e1e1e",
            }}
          >
            <Cropper
              image={bgRemovedSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropSize={{ width: 420, height: 420 }}
              showGrid={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              objectFit="contain"
            />

            {/* 50% center guides, matching the Photoshop manual workflow */}
            <div className="pointer-events-none absolute inset-0 z-10">
              <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-guide/70" />
              <div className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-guide/70" />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-neutral-400">Zoom</label>
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="accent-guide"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex-1 rounded bg-guide px-4 py-3 font-medium text-neutral-900 disabled:opacity-50"
            >
              {downloading ? "Exporting..." : `Download PNG (${OUTPUT_SIZE}x${OUTPUT_SIZE})`}
            </button>
            <button
              onClick={handleReset}
              className="rounded border border-neutral-600 px-4 py-3 font-medium text-neutral-300"
            >
              Start Over
            </button>
          </div>
        </>
      )}
    </div>
  );
}
