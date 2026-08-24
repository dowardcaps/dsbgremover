"use client";

import { useSessionEditor } from "@/hooks/useSessionEditor";
import { LAYER_LABELS, OUTPUT_SIZE } from "@/lib/editorTypes";
import EditorCanvas from "@/components/EditorCanvas";
import LayersPanel from "@/components/LayersPanel";
import EditorControls from "@/components/EditorControls";

interface SessionEditorProps {
  sessionId: string;
  onThumbnailChange?: (thumbnail: string | null) => void;
}

export default function SessionEditor({ sessionId, onThumbnailChange }: SessionEditorProps) {
  const editor = useSessionEditor({ sessionId, onThumbnailChange });

  return (
    <div className="flex flex-col gap-6">
      {editor.stage === "upload" && (
        <div
          onDrop={editor.onDrop}
          onDragOver={(e) => e.preventDefault()}
          className="mx-auto flex h-64 w-full max-w-xl flex-col items-center justify-center gap-3 border-2 border-dashed border-[#c7d9f0] bg-white text-slate-400 transition hover:border-guide hover:text-guide"
        >
          <p>Drag & drop a photo here, or</p>
          <label className="cursor-pointer bg-guide px-4 py-2 font-medium text-white hover:bg-[#1e4080] transition">
            Choose File
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={editor.onFileInputChange}
            />
          </label>
        </div>
      )}

      {editor.stage === "removing" && (
        <div className="mx-auto flex h-64 w-full max-w-xl flex-col items-center justify-center gap-3 bg-white text-ink">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-guide border-t-transparent" />
          <p>Removing background...</p>
        </div>
      )}

      {editor.stage === "error" && (
        <div className="mx-auto flex w-full max-w-xl flex-col items-center justify-center gap-3 bg-white p-6 text-center">
          <p className="text-red-500">{editor.errorMessage}</p>
          <button onClick={editor.handleReset} className="bg-guide px-4 py-2 font-medium text-white hover:bg-[#1e4080] transition">
            Try Again
          </button>
        </div>
      )}

      {editor.stage === "editing" && editor.bgRemovedSrc && (
        <div className="flex flex-col items-start gap-6 lg:flex-row">
          {/* LEFT SIDE - preview canvas */}
          <div className="flex w-full flex-col items-center gap-2 lg:sticky lg:top-6 lg:w-auto">
            <EditorCanvas
              canvasRef={editor.canvasRef}
              bgColor={editor.bgColor}
              showBackgroundLayer={editor.showBackgroundLayer}
              bgRemovedSrc={editor.bgRemovedSrc}
              outputTransform={editor.getTransform("output")}
              showOutputLayer={editor.showOutputLayer}
              outputLayerOpacity={editor.outputLayerOpacity}
              brightness={editor.brightness}
              contrast={editor.contrast}
              onCropComplete={editor.onCropComplete}
              originalSrc={editor.originalSrc}
              originalTransform={editor.getTransform("original")}
              showOriginalLayer={editor.showOriginalLayer}
              originalLayerOpacity={editor.originalLayerOpacity}
              geminiSrc={editor.geminiSrc}
              geminiTransform={editor.getTransform("gemini")}
              showGeminiLayer={editor.showGeminiLayer}
              geminiLayerOpacity={editor.geminiLayerOpacity}
              activeLayer={editor.activeLayer}
              setTransform={editor.setTransform}
              activeRotation={editor.activeTransform.rotation}
              isRotating={editor.isRotating}
              onRotateHandlePointerDown={editor.handleRotateHandlePointerDown}
              name={editor.name}
              nameCase={editor.nameCase}
            />

            <p className="text-xs text-slate-400">
              Editing: <span className="text-guide">{LAYER_LABELS[editor.activeLayer]}</span>
            </p>

            <div className="flex gap-3">
              <button
                onClick={editor.handleDownload}
                disabled={editor.downloading}
                className="bg-guide px-4 py-3 font-medium text-white disabled:opacity-50 hover:bg-[#1e4080] transition"
              >
                {editor.downloading
                  ? "Exporting..."
                  : `Download PNG (${OUTPUT_SIZE}x${OUTPUT_SIZE})`}
              </button>
              <button
                onClick={editor.handleReset}
                className="border border-[#c7d9f0] px-4 py-3 font-medium text-ink hover:border-guide hover:text-guide transition"
              >
                Start Over
              </button>
            </div>
          </div>

          {/* RIGHT SIDE - layers panel and all editing controls */}
          <div className="flex w-full flex-col gap-6 lg:max-w-sm">
            <LayersPanel
              activeLayer={editor.activeLayer}
              setActiveLayer={editor.setActiveLayer}
              originalSrc={editor.originalSrc}
              showOriginalLayer={editor.showOriginalLayer}
              setShowOriginalLayer={editor.setShowOriginalLayer}
              originalLayerOpacity={editor.originalLayerOpacity}
              setOriginalLayerOpacity={editor.setOriginalLayerOpacity}
              bgRemovedSrc={editor.bgRemovedSrc}
              showOutputLayer={editor.showOutputLayer}
              setShowOutputLayer={editor.setShowOutputLayer}
              outputLayerOpacity={editor.outputLayerOpacity}
              setOutputLayerOpacity={editor.setOutputLayerOpacity}
              bgColor={editor.bgColor}
              showBackgroundLayer={editor.showBackgroundLayer}
              setShowBackgroundLayer={editor.setShowBackgroundLayer}
              geminiSrc={editor.geminiSrc}
              showGeminiLayer={editor.showGeminiLayer}
              setShowGeminiLayer={editor.setShowGeminiLayer}
              geminiLayerOpacity={editor.geminiLayerOpacity}
              setGeminiLayerOpacity={editor.setGeminiLayerOpacity}
              geminiInputRef={editor.geminiInputRef}
              onGeminiFileChange={editor.onGeminiFileChange}
              onRemoveGeminiLayer={editor.removeGeminiLayer}
            />

            <EditorControls
              activeLayer={editor.activeLayer}
              activeTransform={editor.activeTransform}
              setTransform={editor.setTransform}
              rotateActiveLayer90={editor.rotateActiveLayer90}
              resetActiveLayerRotation={editor.resetActiveLayerRotation}
              bgColor={editor.bgColor}
              setBgColor={editor.setBgColor}
              brightness={editor.brightness}
              setBrightness={editor.setBrightness}
              contrast={editor.contrast}
              setContrast={editor.setContrast}
              resetBrightnessContrast={editor.resetBrightnessContrast}
              name={editor.name}
              setName={editor.setName}
              nameCase={editor.nameCase}
              setNameCase={editor.setNameCase}
            />
          </div>
        </div>
      )}
    </div>
  );
}
