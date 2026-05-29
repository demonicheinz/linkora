"use client";

import { ArrowClockwiseIcon, FlipHorizontalIcon } from "@phosphor-icons/react";
import Cropper from "react-easy-crop";
import { Slider } from "@/components/ui/slider";
import { useCrop } from "@/hooks/use-crop";
import { cn } from "@/lib/utils";

interface CropEditorProps {
  /** The hook instance returned by useCrop() */
  cropHook: ReturnType<typeof useCrop>;
  /** Aspect ratio for the crop window (e.g. 1, 3/1, 16/9) */
  aspect: number;
  /** Shape of the crop area */
  cropShape?: "round" | "rect";
  /** Height of the editor canvas in px (default 320) */
  canvasHeight?: number;
  /** If false, hide rotate / flip toolbar (default true) */
  showToolbar?: boolean;
  /** Called when the user clicks "Change photo" */
  onChangePicture?: () => void;
}

export function CropEditor({
  cropHook,
  aspect,
  cropShape = "rect",
  canvasHeight = 320,
  showToolbar = true,
  onChangePicture,
}: CropEditorProps) {
  const {
    cropSrc,
    crop,
    zoom,
    rotation,
    flipH,
    setCrop,
    setZoom,
    onCropComplete,
    rotate,
    toggleFlip,
  } = cropHook;

  if (!cropSrc) return null;

  return (
    <div className="w-full flex flex-col gap-3">
      <div
        className="relative w-full bg-neutral-950 overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800"
        style={{ height: canvasHeight }}
      >
        <Cropper
          image={cropSrc}
          crop={crop}
          zoom={zoom}
          rotation={rotation}
          aspect={aspect}
          cropShape={cropShape}
          showGrid
          onCropChange={setCrop}
          onCropComplete={onCropComplete}
          onZoomChange={setZoom}
          transform={
            flipH
              ? `translate(${crop.x}px, ${crop.y}px) rotate(${rotation}deg) scale(${zoom}) scaleX(-1)`
              : undefined
          }
        />
      </div>

      {/* Zoom slider */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-neutral-500 font-bold w-8 shrink-0">
          Zoom
        </span>
        <Slider
          min={1}
          max={3}
          step={0.05}
          value={[zoom]}
          onValueChange={(val) => setZoom(val[0])}
          className="flex-1 cursor-pointer"
        />
        <span className="text-xs text-neutral-400 font-mono w-8 text-right">
          {zoom.toFixed(1)}×
        </span>
      </div>

      {/* Toolbar */}
      {showToolbar && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={rotate}
            title="Rotate 90°"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition cursor-pointer"
          >
            <ArrowClockwiseIcon className="w-4 h-4" />
            Rotate
          </button>

          <button
            type="button"
            onClick={toggleFlip}
            title="Flip horizontal"
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs transition cursor-pointer",
              flipH
                ? "border-primary text-primary bg-primary/10"
                : "border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800",
            )}
          >
            <FlipHorizontalIcon className="w-4 h-4" />
            Mirror
          </button>

          {onChangePicture && (
            <>
              <div className="flex-1" />
              <button
                type="button"
                onClick={onChangePicture}
                className="text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition underline underline-offset-2 cursor-pointer"
              >
                Change photo
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
