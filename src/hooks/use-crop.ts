"use client";

import { useCallback, useState } from "react";
import { type Area } from "react-easy-crop";

export type CropShape = "round" | "rect";

export interface CropConfig {
  aspect: number;
  cropShape: CropShape;
  outputWidth: number;
  outputHeight: number;
}

export interface CropResult {
  blob: Blob;
  url: string;
}

// ─── Canvas helper ────────────────────────────────────────────────────────────

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.setAttribute("crossOrigin", "anonymous");
    img.src = src;
  });
}

export async function getCroppedBlob(
  imageSrc: string,
  pixelCrop: Area,
  rotation: number,
  flipH: boolean,
  outputWidth: number,
  outputHeight: number,
): Promise<Blob> {
  const image = await loadImage(imageSrc);

  // The Cropper preview is CSS-flipped (scaleX(-1)) when flipH is true.
  // react-easy-crop always reports pixelCrop in the original image space,
  // so for a flipped preview we need to mirror the x-coordinate when sampling.
  const srcX = flipH
    ? image.naturalWidth - pixelCrop.x - pixelCrop.width
    : pixelCrop.x;

  let source: HTMLCanvasElement | HTMLImageElement = image;

  if (rotation !== 0) {
    // Build a rotated copy at native size then sample from it
    const rotated = document.createElement("canvas");
    rotated.width = image.naturalWidth;
    rotated.height = image.naturalHeight;
    const rCtx = rotated.getContext("2d")!;
    rCtx.save();
    rCtx.translate(rotated.width / 2, rotated.height / 2);
    rCtx.rotate((rotation * Math.PI) / 180);
    rCtx.translate(-rotated.width / 2, -rotated.height / 2);
    rCtx.drawImage(image, 0, 0);
    rCtx.restore();
    source = rotated;
  }

  const canvas = document.createElement("canvas");
  canvas.width = outputWidth;
  canvas.height = outputHeight;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (flipH) {
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
  }

  ctx.drawImage(
    source,
    srcX,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    canvas.width,
    canvas.height,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob ? resolve(blob) : reject(new Error("Canvas toBlob failed")),
      "image/jpeg",
      0.9,
    );
  });
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useCrop() {
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const reset = useCallback(() => {
    if (cropSrc) URL.revokeObjectURL(cropSrc);
    setCropSrc(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setFlipH(false);
    setCroppedAreaPixels(null);
  }, [cropSrc]);

  const loadFile = useCallback(
    (file: File, maxBytes: number): boolean => {
      if (!file.type.startsWith("image/")) return false;
      if (file.size > maxBytes) return false;
      reset();
      setCropSrc(URL.createObjectURL(file));
      return true;
    },
    [reset],
  );

  const getCropped = useCallback(
    async (outputWidth: number, outputHeight: number): Promise<Blob | null> => {
      if (!cropSrc || !croppedAreaPixels) return null;
      return getCroppedBlob(
        cropSrc,
        croppedAreaPixels,
        rotation,
        flipH,
        outputWidth,
        outputHeight,
      );
    },
    [cropSrc, croppedAreaPixels, rotation, flipH],
  );

  const rotate = () => setRotation((r) => (r + 90) % 360);
  const toggleFlip = () => setFlipH((f) => !f);

  return {
    // State (read-only for consumers)
    cropSrc,
    crop,
    zoom,
    rotation,
    flipH,
    isReady: !!cropSrc,

    // Setters consumed by <Cropper />
    setCrop,
    setZoom,
    onCropComplete,

    // Actions
    loadFile,
    getCropped,
    reset,
    rotate,
    toggleFlip,
  };
}
