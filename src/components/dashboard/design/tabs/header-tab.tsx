"use client";

import {
  CaretLeftIcon,
  PencilSimpleIcon,
  PlusIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { CropEditor } from "@/components/crop/crop-editor";
import { DropZone } from "@/components/crop/drop-zone";
import { getShapeStyle } from "@/components/public/profile-header";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useCrop } from "@/hooks/use-crop";
import { useUpload } from "@/hooks/use-upload";
import { cn } from "@/lib/utils";
import { useDesignStore } from "@/store/design-store";

const fontOptions = [
  { id: "inter", name: "Inter" },
  { id: "public-sans", name: "Public Sans" },
];

const getLayoutPreview = (layoutId: string, avatarUrl: string | null) => {
  const avatarEl = avatarUrl ? (
    <Image src={avatarUrl} alt="" fill sizes="48px" className="object-cover" />
  ) : (
    <div className="w-full h-full bg-red-500/80" />
  );

  switch (layoutId) {
    case "classic":
      return (
        <div className="w-full h-full bg-neutral-100 dark:bg-neutral-900/50 flex flex-col items-center justify-center p-2 relative gap-1 select-none pointer-events-none">
          <div className="w-6 h-6 rounded-full overflow-hidden border border-white/10 shadow-sm shrink-0 bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center">
            {avatarEl}
          </div>
          <div className="w-8 h-0.75 bg-foreground/20 rounded-full shrink-0" />
          <div className="w-12 h-0.75 bg-foreground/10 rounded-full shrink-0" />
          <div className="w-10 h-0.75 bg-foreground/10 rounded-full shrink-0" />
        </div>
      );
    case "hero":
      return (
        <div className="w-full h-full bg-neutral-100 dark:bg-neutral-900/50 flex flex-col items-center p-0 relative select-none pointer-events-none">
          <div className="w-full h-11 shrink-0 relative overflow-hidden bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center">
            {avatarEl}
          </div>
          <div className="w-8 h-0.75 bg-foreground/20 rounded-full mt-3 shrink-0 animate-pulse" />
          <div className="w-12 h-0.75 bg-foreground/10 rounded-full mt-1 shrink-0" />
        </div>
      );
    case "banner":
      return (
        <div className="w-full h-full bg-neutral-100 dark:bg-neutral-900/50 flex flex-col items-center p-0 relative select-none pointer-events-none">
          <div className="w-full h-7 bg-red-500/60 shrink-0 relative overflow-hidden" />
          <div className="w-6 h-6 rounded-full overflow-hidden border border-neutral-100 dark:border-neutral-900 shadow-sm bg-neutral-200 dark:bg-neutral-800 absolute top-4 left-1/2 -translate-x-1/2 flex items-center justify-center">
            {avatarEl}
          </div>
          <div className="w-8 h-0.75 bg-foreground/20 rounded-full mt-4 shrink-0" />
          <div className="w-12 h-0.75 bg-foreground/10 rounded-full mt-1 shrink-0" />
        </div>
      );
    case "shape":
      return (
        <div className="w-full h-full bg-neutral-100 dark:bg-neutral-900/50 flex flex-col items-center justify-center p-2 relative gap-1 select-none pointer-events-none">
          <div
            className="w-6 h-6 overflow-hidden border border-white/10 shadow-sm shrink-0 bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center"
            style={getShapeStyle("flower")}
          >
            {avatarEl}
          </div>
          <div className="w-8 h-0.75 bg-foreground/20 rounded-full shrink-0" />
          <div className="w-12 h-0.75 bg-foreground/10 rounded-full shrink-0" />
          <div className="w-10 h-0.75 bg-foreground/10 rounded-full shrink-0" />
        </div>
      );
    default:
      return null;
  }
};

const headerLayouts = [
  {
    id: "classic",
    name: "Classic",
    description: "Centered avatar with name below",
  },
  {
    id: "hero",
    name: "Hero",
    description: "Immersive profile cover at the top",
  },
  {
    id: "banner",
    name: "Banner",
    description: "Wide banner with overlay text",
  },
  {
    id: "shape",
    name: "Shape",
    description: "Shaped avatar with decorative frame",
  },
];

async function fetchUser() {
  const res = await fetch("/api/user/me");
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

export function HeaderTab() {
  const queryClient = useQueryClient();
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);
  const [isBannerDialogOpen, setIsBannerDialogOpen] = useState(false);
  const { state, setState } = useDesignStore();
  const { data: user } = useQuery({
    queryKey: ["user-me"],
    queryFn: fetchUser,
  });

  const headerLayout = state.headerLayout || "classic";

  // One hook per crop context
  const avatarCrop = useCrop();
  const bannerCrop = useCrop();

  const { uploadWithProgress, isUploading } = useUpload();

  // ── Avatar upload
  async function handleAvatarUpload() {
    const blob = await avatarCrop.getCropped(400, 400);
    if (!blob) return;

    try {
      const file = new File([blob], "avatar.jpg", { type: "image/jpeg" });
      const result = await uploadWithProgress(file, "avatar");
      const res = await fetch("/api/user/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarUrl: result.url }),
      });
      if (!res.ok) throw new Error("Failed to save avatar URL");
      queryClient.invalidateQueries({ queryKey: ["user-me"] });
      toast.success("Profile image updated successfully");
      setIsAvatarDialogOpen(false);
      avatarCrop.reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    }
  }

  // ── Banner upload
  async function handleBannerUpload() {
    const blob = await bannerCrop.getCropped(1200, 400);
    if (!blob) return;

    try {
      const file = new File([blob], "banner.jpg", { type: "image/jpeg" });
      const result = await uploadWithProgress(file, "banner");
      setState({ bannerUrl: result.url });
      toast.success("Banner image updated successfully");
      setIsBannerDialogOpen(false);
      bannerCrop.reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    }
  }

  function handleAvatarFile(file: File) {
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File terlalu besar. Maks 10MB");
      return;
    }
    avatarCrop.loadFile(file, 10 * 1024 * 1024);
  }

  function handleBannerFile(file: File) {
    if (file.size > 15 * 1024 * 1024) {
      toast.error("File terlalu besar. Maks 15MB");
      return;
    }
    bannerCrop.loadFile(file, 15 * 1024 * 1024);
  }

  return (
    <div className="space-y-5">
      {/* Layout */}
      <div className="space-y-3">
        <span className="text-sm font-semibold block mb-2">Layout</span>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {headerLayouts.map((layout) => (
            <button
              key={layout.id}
              type="button"
              onClick={() => setState({ headerLayout: layout.id })}
              className={cn(
                "flex flex-col items-center gap-1.5 shrink-0 p-2 rounded-xl border-2 transition-all min-w-[72px]",
                headerLayout === layout.id
                  ? "border-primary bg-primary/5"
                  : "border-transparent hover:border-border bg-muted/50",
              )}
            >
              {/* Layout preview thumbnail */}
              <div className="w-20 h-24 rounded-lg overflow-hidden border border-border/40 shrink-0 bg-muted/40">
                {getLayoutPreview(layout.id, user?.avatarUrl || null)}
              </div>
              <span className="text-[10px] font-medium text-muted-foreground">
                {layout.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Shape Selector Section */}
      {headerLayout === "shape" && (
        <div className="space-y-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <span className="text-sm font-semibold block">Shape</span>
          <div className="grid grid-cols-4 gap-2">
            {[
              { id: "flower", name: "Flower" },
              { id: "oval", name: "Oval" },
              { id: "rounded", name: "Rounded" },
              { id: "burst", name: "Burst" },
            ].map((shape) => {
              const isActive = (state.avatarShape || "flower") === shape.id;
              return (
                <button
                  key={shape.id}
                  type="button"
                  onClick={() => setState({ avatarShape: shape.id })}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all cursor-pointer bg-card/40 hover:bg-card/60 select-none",
                    isActive
                      ? "border-primary bg-primary/5"
                      : "border-transparent hover:border-border/60",
                  )}
                >
                  {/* Miniature shape element */}
                  <div
                    className={cn(
                      "w-12 h-8 bg-neutral-400 dark:bg-neutral-600 transition-colors shrink-0",
                      isActive
                        ? "bg-primary"
                        : "bg-neutral-400 dark:bg-neutral-600",
                    )}
                    style={getShapeStyle(shape.id)}
                  />
                  <span className="text-[10px] font-semibold text-foreground/80">
                    {shape.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Profile Image */}
      <div className="space-y-3">
        <span className="text-sm font-semibold">Profile Image</span>
        <div className="flex items-center gap-4 py-1">
          <div className="w-18 h-18 rounded-full overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 shrink-0 shadow-xs relative">
            {user?.avatarUrl ? (
              <Image
                src={user.avatarUrl}
                alt="Profile"
                fill
                sizes="72px"
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xl font-bold text-muted-foreground bg-neutral-100 dark:bg-neutral-900">
                {(user?.name || "A").charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2.5">
            {user?.avatarUrl ? (
              <Button
                variant="default"
                type="button"
                onClick={() => setIsAvatarDialogOpen(true)}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold shadow-xs transition-colors h-11 cursor-pointer"
              >
                <PencilSimpleIcon className="h-5 w-5" weight="bold" />
                Edit
              </Button>
            ) : (
              <Button
                variant="default"
                type="button"
                onClick={() => setIsAvatarDialogOpen(true)}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold shadow-xs transition-colors h-11 cursor-pointer"
              >
                <PlusIcon className="h-5 w-5" weight="bold" />
                Add
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Banner Image Settings */}
      {headerLayout === "banner" && (
        <div className="space-y-3 animate-in fade-in duration-300">
          <span className="text-sm font-semibold block">Banner Image</span>
          <div className="flex items-center gap-4 py-1">
            <div className="w-24 h-14 rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 shrink-0 shadow-xs relative">
              {state.bannerUrl ? (
                <Image
                  src={state.bannerUrl}
                  alt="Banner"
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-xs flex items-center justify-center text-muted-foreground">
                  <span className="text-[8px] uppercase tracking-widest opacity-35 font-bold font-mono">
                    None
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2.5">
              {state.bannerUrl ? (
                <Button
                  variant="default"
                  type="button"
                  onClick={() => setIsBannerDialogOpen(true)}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold shadow-xs transition-colors h-11 cursor-pointer"
                >
                  <PencilSimpleIcon className="h-5 w-5" weight="bold" />
                  Edit
                </Button>
              ) : (
                <Button
                  variant="default"
                  type="button"
                  onClick={() => setIsBannerDialogOpen(true)}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold shadow-xs transition-colors h-11 cursor-pointer"
                >
                  <PlusIcon className="h-5 w-5" weight="bold" />
                  Add
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Title */}
      <div className="space-y-3">
        <span className="text-sm font-semibold block mb-2">Title</span>
        <Input
          type="text"
          value={state.displayName}
          onChange={(e) => setState({ displayName: e.target.value })}
          placeholder="Title"
          className="h-12 px-4 rounded-2xl border-neutral-200 dark:border-neutral-800"
          maxLength={30}
        />
      </div>

      {/* Alternative title font */}
      <div className="space-y-2">
        <div className="flex items-center justify-between h-12 min-h-12">
          <div>
            <span className="block text-sm font-semibold">
              Alternative title font
            </span>

            <p className="text-xs text-muted-foreground">
              Matches page font by default
            </p>
          </div>

          <Switch
            checked={state.altTitleFont}
            onCheckedChange={(checked) => setState({ altTitleFont: checked })}
            aria-label="Toggle alternative title font"
          />
        </div>

        {state.altTitleFont && (
          <Select
            value={state.titleFontFamily}
            onValueChange={(v) => setState({ titleFontFamily: v })}
          >
            <SelectTrigger className="h-12 w-full rounded-2xl">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              {fontOptions.map((font) => (
                <SelectItem key={font.id} value={font.id}>
                  {font.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Title font color */}
      <div className="space-y-3">
        <span className="text-sm font-semibold block mb-2">
          Title font color
        </span>
        <div className="flex items-center gap-3 p-3 rounded-2xl border bg-card/50">
          <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-800 shrink-0">
            <input
              type="color"
              value={state.titleColor}
              onChange={(e) => setState({ titleColor: e.target.value })}
              className="absolute inset-0 w-full h-full p-0 border-0 cursor-pointer opacity-0"
            />
            <div
              className="w-full h-full rounded-lg"
              style={{ backgroundColor: state.titleColor }}
            />
          </div>
          <Input
            value={state.titleColor}
            onChange={(e) => setState({ titleColor: e.target.value })}
            placeholder="#FFFFFF"
            className="font-mono text-sm h-10 flex-1"
          />
        </div>
      </div>

      {/* ── Avatar Dialog */}
      <Dialog
        open={isAvatarDialogOpen}
        onOpenChange={(open) => {
          if (!open) avatarCrop.reset();
          setIsAvatarDialogOpen(open);
        }}
      >
        <DialogContent className="max-w-[400px] rounded-[24px] p-6 bg-white text-black dark:bg-neutral-900 dark:text-white border-none shadow-2xl select-none flex flex-col items-center [&>button]:text-black/60 dark:[&>button]:text-white/60 [&>button]:hover:text-black dark:[&>button]:hover:text-white focus:outline-hidden [&>button]:focus:outline-hidden [&>button]:focus:ring-0 [&>button]:top-5 [&>button]:right-5">
          <div className="w-full flex items-center justify-between">
            {avatarCrop.isReady ? (
              <button
                type="button"
                onClick={avatarCrop.reset}
                className="p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors cursor-pointer"
              >
                <CaretLeftIcon className="h-6 w-6" weight="bold" />
              </button>
            ) : (
              <div className="w-8" />
            )}
            <DialogTitle className="text-center font-bold text-lg tracking-wide">
              Upload profile image
            </DialogTitle>
            <div className="w-8" />
          </div>

          {!avatarCrop.isReady ? (
            <>
              <DropZone
                label="Upload Foto Profil"
                hint="400×400px (1:1)"
                onFile={handleAvatarFile}
                className="w-full"
              />

              {user?.avatarUrl && (
                <Button
                  variant="destructive"
                  type="button"
                  onClick={async () => {
                    try {
                      const res = await fetch("/api/user/me", {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ avatarUrl: null }),
                      });
                      if (!res.ok) throw new Error("Failed to remove avatar");
                      queryClient.invalidateQueries({ queryKey: ["user-me"] });
                      toast.success("Profile image removed successfully");
                      setIsAvatarDialogOpen(false);
                    } catch (_err) {
                      toast.error("Failed to remove avatar");
                    }
                  }}
                  className="w-full mt-4 flex items-center justify-center gap-2 py-6 rounded-2xl cursor-pointer"
                >
                  <TrashIcon className="h-5 w-5" weight="bold" />
                  Remove Current Profile Image
                </Button>
              )}
            </>
          ) : (
            <div className="w-full flex flex-col gap-4">
              <CropEditor
                cropHook={avatarCrop}
                aspect={1}
                cropShape="round"
                canvasHeight={320}
                showToolbar
                onChangePicture={avatarCrop.reset}
              />
              <button
                type="button"
                onClick={handleAvatarUpload}
                disabled={isUploading}
                className="w-full py-3.5 px-4 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm shadow-md transition-all active:scale-[0.99] disabled:opacity-50 flex items-center justify-center cursor-pointer"
              >
                {isUploading ? "Uploading..." : "Upload"}
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Banner Dialog */}
      <Dialog
        open={isBannerDialogOpen}
        onOpenChange={(open) => {
          if (!open) bannerCrop.reset();
          setIsBannerDialogOpen(open);
        }}
      >
        <DialogContent className="max-w-[400px] rounded-[24px] p-6 bg-white text-black dark:bg-neutral-900 dark:text-white border-none shadow-2xl select-none flex flex-col items-center [&>button]:text-black/60 dark:[&>button]:text-white/60 [&>button]:hover:text-black dark:[&>button]:hover:text-white focus:outline-hidden [&>button]:focus:outline-hidden [&>button]:focus:ring-0 [&>button]:top-5 [&>button]:right-5">
          <div className="w-full flex items-center justify-between">
            {bannerCrop.isReady ? (
              <button
                type="button"
                onClick={bannerCrop.reset}
                className="p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors cursor-pointer"
              >
                <CaretLeftIcon className="h-6 w-6" weight="bold" />
              </button>
            ) : (
              <div className="w-8" />
            )}
            <DialogTitle className="text-center font-bold text-lg tracking-wide">
              Upload banner image
            </DialogTitle>
            <div className="w-8" />
          </div>

          {!bannerCrop.isReady ? (
            <DropZone
              label="Upload Banner"
              hint="1200×400px (3:1)"
              onFile={handleBannerFile}
              className="w-full"
            />
          ) : (
            <div className="w-full flex flex-col gap-4">
              <CropEditor
                cropHook={bannerCrop}
                aspect={3}
                cropShape="rect"
                canvasHeight={220}
                showToolbar
                onChangePicture={bannerCrop.reset}
              />
              <button
                type="button"
                onClick={handleBannerUpload}
                disabled={isUploading}
                className="w-full py-3.5 px-4 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm shadow-md transition-all active:scale-[0.99] disabled:opacity-50 flex items-center justify-center cursor-pointer"
              >
                {isUploading ? "Uploading..." : "Upload"}
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
