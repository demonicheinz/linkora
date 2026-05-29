"use client";

import { CaretLeftIcon, TrashIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { toast } from "sonner";
import { CropEditor } from "@/components/crop/crop-editor";
import { DropZone } from "@/components/crop/drop-zone";
import { Button } from "@/components/ui/button";
import { DialogTitle } from "@/components/ui/dialog";
import { useCrop } from "@/hooks/use-crop";
import { useUpload } from "@/hooks/use-upload";
import { cn } from "@/lib/utils";

// ─── Config ───────────────────────────────────────────────────────────────────

export type MediaType = "avatar" | "banner" | "thumbnail" | "background";

const CONFIGS: Record<
  MediaType,
  {
    aspect: number;
    cropShape: "round" | "rect";
    maxBytes: number;
    outputWidth: number;
    outputHeight: number;
    label: string;
    hint: string;
    canvasHeight: number;
  }
> = {
  avatar: {
    aspect: 1,
    cropShape: "round",
    maxBytes: 10 * 1024 * 1024,
    outputWidth: 400,
    outputHeight: 400,
    label: "Upload Foto Profil",
    hint: "400×400px (1:1)",
    canvasHeight: 320,
  },
  banner: {
    aspect: 3,
    cropShape: "rect",
    maxBytes: 15 * 1024 * 1024,
    outputWidth: 1200,
    outputHeight: 400,
    label: "Upload Banner",
    hint: "1200×400px (3:1)",
    canvasHeight: 220,
  },
  thumbnail: {
    aspect: 16 / 9,
    cropShape: "rect",
    maxBytes: 10 * 1024 * 1024,
    outputWidth: 800,
    outputHeight: 450,
    label: "Upload Thumbnail",
    hint: "800×450px (16:9)",
    canvasHeight: 260,
  },
  background: {
    aspect: 16 / 9,
    cropShape: "rect",
    maxBytes: 50 * 1024 * 1024,
    outputWidth: 1920,
    outputHeight: 1080,
    label: "Upload Background",
    hint: "1920×1080px (16:9)",
    canvasHeight: 260,
  },
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface MediaUploaderProps {
  type: MediaType;
  currentUrl?: string | null;
  onSuccess: (url: string) => void;
  onRemove?: () => Promise<void> | void;
  onBack?: () => void;
  className?: string;
  dialogTitle?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function MediaUploader({
  type,
  currentUrl,
  onSuccess,
  onRemove,
  onBack,
  className,
  dialogTitle,
}: MediaUploaderProps) {
  const cfg = CONFIGS[type];
  const cropHook = useCrop();
  const { uploadWithProgress, isUploading } = useUpload();
  const [isRemoving, setIsRemoving] = useState(false);

  function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar");
      return;
    }
    if (file.size > cfg.maxBytes) {
      toast.error(`Ukuran maks ${cfg.maxBytes / 1024 / 1024}MB`);
      return;
    }
    cropHook.loadFile(file, cfg.maxBytes);
  }

  async function handleUpload() {
    const blob = await cropHook.getCropped(cfg.outputWidth, cfg.outputHeight);
    if (!blob) return;

    try {
      const file = new File([blob], `${type}.jpg`, { type: "image/jpeg" });
      const result = await uploadWithProgress(file, type);
      onSuccess(result.url);
      cropHook.reset();
      toast.success("Berhasil diupload!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal upload");
    }
  }

  async function handleRemove() {
    if (!onRemove) return;
    setIsRemoving(true);
    try {
      await onRemove();
    } finally {
      setIsRemoving(false);
    }
  }

  return (
    <div className={cn("w-full", className)}>
      {/* Optional Dialog Header */}
      {dialogTitle && (
        <div className="w-full flex items-center justify-between mb-2">
          {cropHook.isReady || onBack ? (
            <button
              type="button"
              onClick={cropHook.isReady ? cropHook.reset : onBack}
              className="p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors cursor-pointer"
            >
              <CaretLeftIcon className="h-6 w-6" weight="bold" />
            </button>
          ) : (
            <div className="w-8" />
          )}
          <DialogTitle className="text-center font-bold text-lg tracking-wide">
            {dialogTitle}
          </DialogTitle>
          <div className="w-8" />
        </div>
      )}

      {!cropHook.isReady ? (
        <div className="w-full flex flex-col gap-3">
          <DropZone label={cfg.label} hint={cfg.hint} onFile={handleFile} />
          {currentUrl && onRemove && (
            <Button
              variant="destructive"
              type="button"
              disabled={isRemoving}
              onClick={handleRemove}
              className="w-full flex items-center justify-center gap-2 py-6 rounded-2xl cursor-pointer"
            >
              <TrashIcon className="h-5 w-5" weight="bold" />
              {isRemoving
                ? "Removing..."
                : `Remove Current ${dialogTitle ? "Image" : "Photo"}`}
            </Button>
          )}
        </div>
      ) : (
        <div className="w-full flex flex-col gap-4">
          <CropEditor
            cropHook={cropHook}
            aspect={cfg.aspect}
            cropShape={cfg.cropShape}
            canvasHeight={cfg.canvasHeight}
            showToolbar
            onChangePicture={() => {
              cropHook.reset();
            }}
          />
          {/* Action buttons */}
          <div className="flex gap-3">
            {!dialogTitle && (
              <button
                type="button"
                onClick={cropHook.reset}
                className="flex-1 py-3 px-4 rounded-full border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition cursor-pointer"
              >
                Cancel
              </button>
            )}
            <button
              type="button"
              onClick={handleUpload}
              disabled={isUploading}
              className="flex-1 py-3 px-4 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm shadow-md transition-all active:scale-[0.99] disabled:opacity-50 flex items-center justify-center cursor-pointer"
            >
              {isUploading ? "Uploading..." : "Upload"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
