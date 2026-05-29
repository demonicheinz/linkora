"use client";

import {
  ArrowDownIcon,
  ArrowUpIcon,
  CaretLeftIcon,
  CircleHalfIcon,
  DropIcon,
  GridNineIcon,
  ImageIcon,
  MoonIcon,
  PencilSimpleIcon,
  PlusIcon,
  ProhibitIcon,
  SunIcon,
  TrashIcon,
  VideoCameraIcon,
  XIcon,
} from "@phosphor-icons/react";
import { useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { toast } from "sonner";
import { CropEditor } from "@/components/crop/crop-editor";
import { DropZone } from "@/components/crop/drop-zone";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useCrop } from "@/hooks/use-crop";
import { useUpload } from "@/hooks/use-upload";
import { cn } from "@/lib/utils";
import { useDesignStore } from "@/store/design-store";

// ─── Constants ────────────────────────────────────────────────────────────────

const wallpaperStyles = [
  { id: "fill", name: "Fill" },
  { id: "gradient", name: "Gradient" },
  { id: "blur", name: "Blur" },
  { id: "pattern", name: "Pattern" },
  { id: "image", name: "Image" },
  { id: "video", name: "Video" },
];

const directionOptions = [
  {
    id: "linear-bottom",
    name: "Linear up",
    icon: <ArrowUpIcon className="h-5 w-5" />,
  },
  {
    id: "linear-top",
    name: "Linear down",
    icon: <ArrowDownIcon className="h-5 w-5" />,
  },
  {
    id: "radial",
    name: "Radial",
    icon: (
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="12" cy="12" r="2" fill="currentColor" />
      </svg>
    ),
  },
];

const preMadeGradients = [
  {
    name: "Sunset Glow",
    value: "linear-gradient(135deg, #f6d365 0%, #fda085 100%)",
  },
  {
    name: "Ocean Breeze",
    value: "linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)",
  },
  {
    name: "Cotton Candy",
    value: "linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)",
  },
  {
    name: "Fresh Lavender",
    value: "linear-gradient(135deg, #cfd9df 0%, #e2ebf0 100%)",
  },
  {
    name: "Deep Space",
    value: "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)",
  },
  {
    name: "Neon Rose",
    value: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  },
];

const patternTypes = [
  { id: "grid", name: "Grid" },
  { id: "morph", name: "Morph" },
  { id: "organic", name: "Organic" },
  { id: "matrix", name: "Matrix" },
];

const effects = [
  { id: "none", name: "None", icon: <ProhibitIcon className="h-5 w-5" /> },
  { id: "mono", name: "Mono", icon: <CircleHalfIcon className="h-5 w-5" /> },
  { id: "blur", name: "Blur", icon: <DropIcon className="h-5 w-5" /> },
  {
    id: "halftone",
    name: "Halftone",
    icon: <GridNineIcon className="h-5 w-5" />,
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function WallpaperTab() {
  const { state, setState } = useDesignStore();
  const queryClient = useQueryClient();
  const { uploadWithProgress, isUploading } = useUpload();

  const [isCustomGradient, setIsCustomGradient] = useState(true);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false);

  // Video upload states
  const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null);
  const [videoPreviewSrc, setVideoPreviewSrc] = useState<string | null>(null);
  const [videoProgress, setVideoProgress] = useState(0);
  const [isVideoUploading, setIsVideoUploading] = useState(false);

  // Video Crop State
  const [videoCrop, setVideoCrop] = useState({ x: 0, y: 0 });
  const [videoZoom, setVideoZoom] = useState(1);
  const [videoCropArea, setVideoCropArea] = useState<Area | null>(null);

  // Wallpaper image crop hook — 9:16 aspect for phone wallpaper
  const wallpaperCrop = useCrop();

  // ── Style icon renderer
  const renderStyleIcon = (styleId: string) => {
    switch (styleId) {
      case "fill":
        return <div className="w-5 h-5 rounded-md bg-foreground/80" />;
      case "gradient":
        return (
          <div className="w-5 h-5 rounded-md bg-gradient-to-br from-indigo-500 to-purple-500" />
        );
      case "blur":
        return (
          <div className="w-5 h-5 rounded-md bg-indigo-500/30 border border-indigo-400/40 backdrop-blur-xs" />
        );
      case "pattern":
        return (
          <div className="grid grid-cols-2 gap-0.5 w-5 h-5 opacity-80">
            <div className="border border-foreground/30 rounded-xs" />
            <div className="border border-foreground/30 rounded-xs" />
            <div className="border border-foreground/30 rounded-xs" />
            <div className="border border-foreground/30 rounded-xs" />
          </div>
        );
      case "image":
        if (state.wallpaperImageUrl) {
          return (
            <Image
              src={state.wallpaperImageUrl}
              alt=""
              fill
              sizes="20px"
              unoptimized={
                state.wallpaperImageUrl.startsWith("blob:") ||
                state.wallpaperImageUrl.startsWith("data:")
              }
              className="object-cover rounded-md"
            />
          );
        }
        return (
          <ImageIcon className="h-5 w-5 text-foreground/80" weight="bold" />
        );
      case "video":
        if (state.wallpaperVideoUrl) {
          return (
            <video
              src={state.wallpaperVideoUrl}
              className="w-full h-full object-cover rounded-md"
              muted
              playsInline
            />
          );
        }
        return (
          <VideoCameraIcon
            className="h-5 w-5 text-foreground/80"
            weight="bold"
          />
        );
      default:
        return null;
    }
  };

  // ── Wallpaper image upload
  function handleWallpaperFile(file: File) {
    if (file.size > 50 * 1024 * 1024) {
      toast.error("File terlalu besar. Maks 50MB");
      return;
    }
    wallpaperCrop.loadFile(file, 50 * 1024 * 1024);
  }

  async function handleWallpaperUpload() {
    // Wallpaper: 9:16 portrait → 1080×1920
    const blob = await wallpaperCrop.getCropped(1080, 1920);
    if (!blob) return;

    try {
      const file = new File([blob], "wallpaper.jpg", { type: "image/jpeg" });
      const result = await uploadWithProgress(file, "background");
      setState({ wallpaperImageUrl: result.url });
      toast.success("Wallpaper image updated successfully!");
      setIsImageDialogOpen(false);
      wallpaperCrop.reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    }
  }

  // ── Video upload
  const handleVideoFileSelect = (file: File) => {
    setSelectedVideoFile(file);
    const url = URL.createObjectURL(file);
    setVideoPreviewSrc(url);
  };

  const handleVideoUpload = async () => {
    if (!selectedVideoFile) return;

    setIsVideoUploading(true);
    setVideoProgress(0);

    try {
      const presignRes = await fetch("/api/upload/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileType: "background-video",
          contentType: selectedVideoFile.type,
          size: selectedVideoFile.size,
        }),
      });

      if (!presignRes.ok) {
        const err = await presignRes.json();
        throw new Error(err.error || "Failed to get upload URL");
      }

      const { presignedUrl, publicUrl, key } = await presignRes.json();

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            setVideoProgress(Math.round((e.loaded / e.total) * 100));
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`Upload failed: status ${xhr.status}`));
          }
        };

        xhr.onerror = () => reject(new Error("Upload failed"));
        xhr.ontimeout = () => reject(new Error("Upload timed out"));

        xhr.open("PUT", presignedUrl);
        xhr.setRequestHeader("Content-Type", selectedVideoFile.type);
        xhr.timeout = 180000;
        xhr.send(selectedVideoFile);
      });

      const confirmRes = await fetch("/api/upload/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, field: "background-video" }),
      });

      if (!confirmRes.ok) {
        const err = await confirmRes.json();
        throw new Error(err.error || "Failed to confirm upload");
      }

      setState({
        wallpaperVideoUrl: publicUrl,
        videoCropX: videoCropArea?.x ?? 0,
        videoCropY: videoCropArea?.y ?? 0,
        videoCropWidth: videoCropArea?.width ?? 100,
        videoCropHeight: videoCropArea?.height ?? 100,
      });
      toast.success("Wallpaper video uploaded successfully!");
      setIsVideoDialogOpen(false);
      setVideoPreviewSrc(null);
      setSelectedVideoFile(null);
      setVideoCrop({ x: 0, y: 0 });
      setVideoZoom(1);
      setVideoCropArea(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsVideoUploading(false);
    }
  };

  // ─── Shared color input ───────────────────────────────────────────────────
  function ColorInput({
    label,
    value,
    onChange,
    placeholder,
  }: {
    label?: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
  }) {
    return (
      <div className="space-y-3">
        {label && <span className="text-sm font-semibold block">{label}</span>}
        <div className="flex items-center gap-3 p-3 rounded-2xl border bg-card/50">
          <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-800 shrink-0">
            <input
              type="color"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="absolute inset-0 w-full h-full p-0 border-0 cursor-pointer opacity-0 z-10"
            />
            <div
              className="w-full h-full rounded-lg"
              style={{ backgroundColor: value }}
            />
          </div>
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder ?? "#0A0A0A"}
            className="font-mono text-sm h-10 flex-1"
          />
        </div>
      </div>
    );
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Wallpaper Style selector */}
      <div className="space-y-3">
        <span className="text-sm font-semibold block mb-2">
          Wallpaper style
        </span>
        <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none w-full">
          {wallpaperStyles.map((style) => (
            <button
              key={style.id}
              type="button"
              onClick={() => {
                const resetData: Partial<typeof state> = {
                  wallpaperStyle: style.id,
                };
                if (style.id === "image") {
                  resetData.wallpaperVideoUrl = null;
                } else if (style.id === "video") {
                  resetData.wallpaperImageUrl = null;
                } else {
                  resetData.wallpaperImageUrl = null;
                  resetData.wallpaperVideoUrl = null;
                }
                setState(resetData);
              }}
              className={cn(
                "flex flex-col items-center gap-1.5 p-2 rounded-2xl border-2 transition-all relative shrink-0 min-w-[76px]",
                state.wallpaperStyle === style.id
                  ? "border-primary bg-primary/5"
                  : "border-transparent hover:border-border bg-muted/50",
              )}
            >
              <div className="w-12 h-12 rounded-xl bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center overflow-hidden shrink-0 relative border border-neutral-300/20">
                {renderStyleIcon(style.id)}
              </div>
              <span className="text-[10px] font-semibold text-muted-foreground">
                {style.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Fill ─────────────────────────────────────────────────────────── */}
      {state.wallpaperStyle === "fill" && (
        <ColorInput
          label="Background color"
          value={state.wallpaperColor}
          onChange={(v) => setState({ wallpaperColor: v })}
        />
      )}

      {/* ── Gradient ─────────────────────────────────────────────────────── */}
      {state.wallpaperStyle === "gradient" && (
        <div className="space-y-5 animate-in fade-in slide-in-from-top-4 duration-300">
          {/* Tab switcher */}
          <div className="space-y-3">
            <span className="text-sm font-semibold block">Gradient style</span>
            <div className="flex gap-2.5">
              {(["Custom", "Pre-made"] as const).map((tab) => {
                const isActive = (tab === "Custom") === isCustomGradient;
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setIsCustomGradient(tab === "Custom")}
                    className={cn(
                      "flex-1 py-3 px-4 rounded-2xl border text-sm font-bold transition-all cursor-pointer text-center",
                      isActive
                        ? "border-neutral-900 dark:border-neutral-100 bg-card text-foreground shadow-xs"
                        : "border-transparent bg-neutral-100 dark:bg-neutral-900 text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>
          </div>

          {isCustomGradient ? (
            <div className="space-y-5 animate-in fade-in duration-200">
              <ColorInput
                label="Gradient color"
                value={state.wallpaperColor}
                onChange={(v) => setState({ wallpaperColor: v })}
                placeholder="#ECEEF1"
              />

              <div className="space-y-3">
                <span className="text-sm font-semibold block">
                  Gradient direction
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {directionOptions.map((dir) => {
                    const isActive = state.gradientDirection === dir.id;
                    return (
                      <div
                        key={dir.id}
                        className="flex flex-col items-center gap-1.5"
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setState({ gradientDirection: dir.id })
                          }
                          className={cn(
                            "w-full h-12 rounded-2xl border transition-all flex items-center justify-center cursor-pointer",
                            isActive
                              ? "border-neutral-900 dark:border-neutral-100 bg-card text-foreground shadow-xs"
                              : "border-transparent bg-neutral-100 dark:bg-neutral-900 text-muted-foreground hover:text-foreground",
                          )}
                          aria-label={dir.name}
                        >
                          {dir.icon}
                        </button>
                        <span className="text-[10px] font-semibold text-muted-foreground">
                          {dir.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3 animate-in fade-in duration-200">
              <span className="text-sm font-semibold block">
                Select a theme
              </span>
              <div className="grid grid-cols-2 gap-2">
                {preMadeGradients.map((swatch) => {
                  const isActive = state.wallpaperGradient === swatch.value;
                  return (
                    <button
                      key={swatch.name}
                      type="button"
                      onClick={() => {
                        setState({
                          wallpaperGradient: swatch.value,
                          wallpaperColor:
                            swatch.value.match(/#[0-9a-fA-F]{6}/)?.[0] ||
                            "#667eea",
                        });
                      }}
                      className={cn(
                        "flex flex-col gap-2 p-2.5 rounded-2xl border transition-all cursor-pointer text-left bg-card",
                        isActive
                          ? "border-neutral-900 dark:border-neutral-100 shadow-xs"
                          : "border-transparent hover:border-border",
                      )}
                    >
                      <div
                        className="w-full h-12 rounded-xl border border-black/5 dark:border-white/5 shadow-inner"
                        style={{ background: swatch.value }}
                      />
                      <span className="text-[10px] font-bold text-foreground px-1">
                        {swatch.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Noise */}
          <div className="flex items-center justify-between py-2 border-t border-neutral-100 dark:border-neutral-800/60 pt-4">
            <div className="space-y-0.5">
              <span className="text-sm font-semibold block">Noise</span>
              <p className="text-xs text-muted-foreground leading-normal">
                Add a subtle grain texture
              </p>
            </div>
            <Switch
              checked={state.gradientNoise}
              onCheckedChange={(checked) =>
                setState({ gradientNoise: checked })
              }
            />
          </div>
        </div>
      )}

      {/* ── Blur ─────────────────────────────────────────────────────────── */}
      {state.wallpaperStyle === "blur" && (
        <div className="space-y-3">
          <span className="text-sm font-semibold block">Blur intensity</span>
          <Slider
            min={0}
            max={50}
            step={5}
            value={[state.wallpaperBlur]}
            onValueChange={(val) => setState({ wallpaperBlur: val[0] })}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>None</span>
            <span>{state.wallpaperBlur}px</span>
            <span>Max</span>
          </div>
          <ColorInput
            label="Base color"
            value={state.wallpaperColor}
            onChange={(v) => setState({ wallpaperColor: v })}
          />
        </div>
      )}

      {/* ── Pattern ──────────────────────────────────────────────────────── */}
      {state.wallpaperStyle === "pattern" && (
        <div className="space-y-4">
          <div className="space-y-3">
            <span className="text-sm font-semibold block">Pattern type</span>
            <div className="grid grid-cols-2 gap-2">
              {patternTypes.map((pattern) => (
                <button
                  key={pattern.id}
                  type="button"
                  onClick={() => setState({ wallpaperPattern: pattern.id })}
                  className={cn(
                    "py-3 px-4 text-sm font-medium rounded-xl border-2 transition-all",
                    state.wallpaperPattern === pattern.id
                      ? "border-primary bg-primary/5 text-foreground"
                      : "border-transparent bg-muted/50 text-muted-foreground hover:border-border",
                  )}
                >
                  {pattern.name}
                </button>
              ))}
            </div>
          </div>
          <ColorInput
            label="Base color"
            value={state.wallpaperColor}
            onChange={(v) => setState({ wallpaperColor: v })}
          />
        </div>
      )}

      {/* ── Image ────────────────────────────────────────────────────────── */}
      {state.wallpaperStyle === "image" && (
        <div className="space-y-5 animate-in fade-in slide-in-from-top-4 duration-300">
          {/* Preview + button */}
          <div className="space-y-3">
            <span className="text-sm font-semibold block">
              Background image
            </span>
            <div className="flex items-center gap-4 py-1">
              <div className="w-18 h-18 rounded-full overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 shrink-0 shadow-xs relative">
                {state.wallpaperImageUrl ? (
                  <Image
                    src={state.wallpaperImageUrl}
                    alt="Background"
                    fill
                    sizes="72px"
                    unoptimized={
                      state.wallpaperImageUrl.startsWith("blob:") ||
                      state.wallpaperImageUrl.startsWith("data:")
                    }
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <ImageIcon className="h-6 w-6" />
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2.5">
                <Button
                  variant="default"
                  type="button"
                  onClick={() => setIsImageDialogOpen(true)}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold shadow-xs transition-colors h-11 cursor-pointer"
                >
                  {state.wallpaperImageUrl ? (
                    <>
                      <PencilSimpleIcon className="h-5 w-5" weight="bold" />
                      Edit
                    </>
                  ) : (
                    <>
                      <PlusIcon className="h-5 w-5" weight="bold" />
                      Add
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Effect */}
          <div className="space-y-3">
            <span className="text-sm font-semibold block">Effect</span>
            <div className="grid grid-cols-4 gap-2">
              {effects.map((effect) => {
                const isActive = (state.imageEffect || "none") === effect.id;
                return (
                  <button
                    key={effect.id}
                    type="button"
                    onClick={() => setState({ imageEffect: effect.id })}
                    className={cn(
                      "flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all bg-card/40 cursor-pointer",
                      isActive
                        ? "border-primary bg-primary/5 text-foreground"
                        : "border-transparent hover:border-border text-muted-foreground",
                    )}
                  >
                    <div className="h-5 flex items-center justify-center shrink-0">
                      {effect.icon}
                    </div>
                    <span className="text-[10px] font-semibold">
                      {effect.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tint */}
          <div className="space-y-3">
            <span className="text-sm font-semibold block">Tint</span>
            <p className="text-xs text-muted-foreground leading-normal">
              Improves text visibility and helps make your content more
              accessible
            </p>
            <div className="flex items-center gap-3 py-2 select-none">
              <MoonIcon className="h-5 w-5 text-muted-foreground shrink-0" />
              <Slider
                min={0}
                max={100}
                step={5}
                value={[state.imageTint]}
                onValueChange={(val) => setState({ imageTint: val[0] })}
                className="cursor-pointer"
              />
              <SunIcon className="h-5 w-5 text-muted-foreground shrink-0" />
            </div>
          </div>

          {/* Noise */}
          <div className="flex items-center justify-between py-2 border-t border-neutral-100 dark:border-neutral-800/60 pt-4">
            <div className="space-y-0.5">
              <span className="text-sm font-semibold block">Noise</span>
              <p className="text-xs text-muted-foreground leading-normal">
                Add a subtle grain texture
              </p>
            </div>
            <Switch
              checked={state.gradientNoise}
              onCheckedChange={(checked) =>
                setState({ gradientNoise: checked })
              }
            />
          </div>
        </div>
      )}

      {/* ── Video ────────────────────────────────────────────────────────── */}
      {state.wallpaperStyle === "video" && (
        <div className="space-y-5 animate-in fade-in slide-in-from-top-4 duration-300">
          {/* Preview + button */}
          <div className="space-y-3">
            <span className="text-sm font-semibold block">
              Background video
            </span>
            <div className="flex items-center gap-4 py-1">
              <div className="w-18 h-18 rounded-full overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 shrink-0 shadow-xs relative flex items-center justify-center">
                {state.wallpaperVideoUrl ? (
                  <video
                    src={state.wallpaperVideoUrl}
                    className="w-full h-full object-cover"
                    muted
                    playsInline
                    autoPlay
                    loop
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <VideoCameraIcon className="h-6 w-6" />
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2.5">
                <Button
                  variant="default"
                  type="button"
                  onClick={() => setIsVideoDialogOpen(true)}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold shadow-xs transition-colors h-11 cursor-pointer"
                >
                  {state.wallpaperVideoUrl ? (
                    <>
                      <PencilSimpleIcon className="h-5 w-5" weight="bold" />
                      Edit
                    </>
                  ) : (
                    <>
                      <PlusIcon className="h-5 w-5" weight="bold" />
                      Add
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Tint */}
          <div className="space-y-3">
            <span className="text-sm font-semibold block">Tint</span>
            <p className="text-xs text-muted-foreground leading-normal">
              Improves text visibility and helps make your content more
              accessible
            </p>
            <div className="flex items-center gap-3 py-2 select-none">
              <MoonIcon className="h-5 w-5 text-muted-foreground shrink-0" />
              <Slider
                min={0}
                max={100}
                step={1}
                value={[state.videoTint]}
                onValueChange={(val) => setState({ videoTint: val[0] })}
              />
              <SunIcon className="h-5 w-5 text-muted-foreground shrink-0" />
            </div>
          </div>
        </div>
      )}

      {/* ── Image Dialog ─────────────────────────────────────────────────── */}
      <Dialog
        open={isImageDialogOpen}
        onOpenChange={(open) => {
          if (!open) wallpaperCrop.reset();
          setIsImageDialogOpen(open);
        }}
      >
        <DialogContent className="max-w-[400px] rounded-[24px] p-6 bg-white text-black dark:bg-neutral-900 dark:text-white border-none shadow-2xl select-none flex flex-col items-center [&>button]:hidden">
          {/* Header row */}
          <div className="w-full flex items-center justify-between">
            {wallpaperCrop.isReady ? (
              <button
                type="button"
                onClick={wallpaperCrop.reset}
                className="p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors cursor-pointer"
              >
                <CaretLeftIcon className="h-6 w-6" weight="bold" />
              </button>
            ) : (
              <div className="w-8" />
            )}
            <DialogTitle className="text-center font-bold text-lg tracking-wide">
              Upload image
            </DialogTitle>
            <button
              type="button"
              onClick={() => {
                setIsImageDialogOpen(false);
                wallpaperCrop.reset();
              }}
              className="p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors cursor-pointer"
            >
              <XIcon className="h-5 w-5" weight="bold" />
            </button>
          </div>

          {!wallpaperCrop.isReady ? (
            <div className="w-full flex flex-col gap-4">
              <DropZone
                label="Upload Wallpaper"
                hint="1080×1920px (9:16)"
                onFile={handleWallpaperFile}
                className="w-full"
              />

              {state.wallpaperImageUrl && (
                <Button
                  variant="destructive"
                  type="button"
                  onClick={() => {
                    setState({ wallpaperImageUrl: null });
                    setIsImageDialogOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-6 rounded-2xl cursor-pointer"
                >
                  <TrashIcon className="h-5 w-5" weight="bold" />
                  Remove Current Wallpaper Image
                </Button>
              )}
            </div>
          ) : (
            <div className="w-full flex flex-col gap-4">
              {/* 9:16 aspect for wallpaper */}
              <CropEditor
                cropHook={wallpaperCrop}
                aspect={9 / 16}
                cropShape="rect"
                canvasHeight={360}
                showToolbar
                onChangePicture={wallpaperCrop.reset}
              />
              <button
                type="button"
                onClick={handleWallpaperUpload}
                disabled={isUploading}
                className="w-full py-3.5 px-4 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm shadow-md transition-all active:scale-[0.99] disabled:opacity-50 flex items-center justify-center cursor-pointer"
              >
                {isUploading ? "Uploading..." : "Upload"}
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Video Dialog ─────────────────────────────────────────────────── */}
      <Dialog
        open={isVideoDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setVideoPreviewSrc(null);
            setSelectedVideoFile(null);
          }
          setIsVideoDialogOpen(open);
        }}
      >
        <DialogContent className="max-w-[400px] rounded-[24px] p-6 bg-white text-black dark:bg-neutral-900 dark:text-white border-none shadow-2xl select-none flex flex-col items-center [&>button]:hidden">
          <div className="w-full flex items-center justify-between">
            {videoPreviewSrc ? (
              <button
                type="button"
                onClick={() => {
                  setVideoPreviewSrc(null);
                  setSelectedVideoFile(null);
                }}
                className="p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors cursor-pointer"
              >
                <CaretLeftIcon className="h-6 w-6" weight="bold" />
              </button>
            ) : (
              <div className="w-8" />
            )}
            <DialogTitle className="text-center font-bold text-lg tracking-wide">
              Upload video
            </DialogTitle>
            <button
              type="button"
              onClick={() => {
                setIsVideoDialogOpen(false);
                setVideoPreviewSrc(null);
                setSelectedVideoFile(null);
              }}
              className="p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors cursor-pointer"
            >
              <XIcon className="h-5 w-5" weight="bold" />
            </button>
          </div>

          {!videoPreviewSrc ? (
            <div className="w-full flex flex-col gap-4">
              {/* biome-ignore lint/a11y/useKeyWithClickEvents: file picker */}
              {/* biome-ignore lint/a11y/noStaticElementInteractions: file picker */}
              <div
                className="w-full border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-2xl p-8 text-center hover:border-primary transition-colors cursor-pointer flex flex-col items-center gap-4 bg-neutral-50 dark:bg-neutral-950/20"
                onClick={() => {
                  const input = document.createElement("input");
                  input.type = "file";
                  input.accept = "video/mp4";
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) handleVideoFileSelect(file);
                  };
                  input.click();
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files?.[0];
                  if (file && file.type === "video/mp4") {
                    handleVideoFileSelect(file);
                  }
                }}
              >
                <VideoCameraIcon className="h-10 w-10 text-neutral-400 animate-pulse" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                    Upload Wallpaper Video
                  </p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    or drag &amp; drop file
                  </p>
                </div>
                <p className="text-xs text-neutral-400">
                  Recommendation: .mp4 format
                </p>
              </div>

              {state.wallpaperVideoUrl && (
                <Button
                  variant="destructive"
                  type="button"
                  onClick={() => {
                    setState({ wallpaperVideoUrl: null });
                    setIsVideoDialogOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-6 rounded-2xl cursor-pointer"
                >
                  <TrashIcon className="h-5 w-5" weight="bold" />
                  Remove Current Wallpaper Video
                </Button>
              )}
            </div>
          ) : (
            <div className="w-full flex flex-col gap-4">
              {/* Video preview with Cropper */}
              <div className="relative w-full h-[400px] bg-neutral-950 overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800">
                <Cropper
                  video={videoPreviewSrc}
                  crop={videoCrop}
                  zoom={videoZoom}
                  aspect={9 / 16}
                  onCropChange={setVideoCrop}
                  onZoomChange={setVideoZoom}
                  onCropComplete={(_croppedArea, croppedAreaPixels) =>
                    setVideoCropArea(_croppedArea)
                  }
                  showGrid
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
                  value={[videoZoom]}
                  onValueChange={(val) => setVideoZoom(val[0])}
                  className="flex-1 cursor-pointer"
                />
                <span className="text-xs text-neutral-400 font-mono w-8 text-right">
                  {videoZoom.toFixed(1)}×
                </span>
              </div>

              {isVideoUploading ? (
                <div className="w-full space-y-2">
                  <div className="flex justify-between text-xs font-semibold text-neutral-500">
                    <span>Uploading...</span>
                    <span>{videoProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${videoProgress}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex">
                  <button
                    type="button"
                    onClick={handleVideoUpload}
                    className="flex-1 py-3.5 px-4 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm shadow-md transition-all active:scale-[0.99] flex items-center justify-center cursor-pointer"
                  >
                    Upload
                  </button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
