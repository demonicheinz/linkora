import {
  CaretLeftIcon,
  CaretRightIcon,
  SquaresFourIcon,
  UploadSimpleIcon,
} from "@phosphor-icons/react";
import { useState } from "react";
import { toast } from "sonner";
import { MediaUploader } from "@/components/shared/media-uploader";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { isImageUrl, POPULAR_ICONS } from "@/lib/thumbnail-icons";

interface ThumbnailPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (icon: string | null) => void;
  currentIcon?: string | null;
}

export function ThumbnailPicker({
  open,
  onOpenChange,
  onSelect,
  currentIcon,
}: ThumbnailPickerProps) {
  const [dialogView, setDialogView] = useState<
    "options" | "upload" | "phosphor"
  >("options");
  const [iconSearchQuery, setIconSearchQuery] = useState("");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[400px] rounded-[24px] p-6 bg-white text-black dark:bg-neutral-900 dark:text-white border-none shadow-2xl [&>button]:text-black/60 dark:[&>button]:text-white/60 [&>button]:hover:text-black dark:[&>button]:hover:text-white focus:outline-hidden [&>button]:focus:outline-hidden [&>button]:focus:ring-0 [&>button]:top-5 [&>button]:right-5 select-none flex flex-col items-center">
        {/* Header for non-upload views */}
        {dialogView !== "upload" && (
          <div className="w-full flex items-center justify-between mb-2">
            {dialogView === "phosphor" ? (
              <button
                type="button"
                onClick={() => setDialogView("options")}
                className="p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors cursor-pointer"
              >
                <CaretLeftIcon className="h-6 w-6" weight="bold" />
              </button>
            ) : (
              <div className="w-8" />
            )}
            <DialogTitle className="text-center font-bold text-lg tracking-wide">
              {dialogView === "options" && "Select thumbnail image"}
              {dialogView === "phosphor" && "Choose Phosphor Icon"}
            </DialogTitle>
            <div className="w-8" />
          </div>
        )}

        {/* Dialog Views */}
        {dialogView === "options" && (
          <div className="w-full flex flex-col gap-3.5 mt-2">
            {/* Option 1: Upload your own */}
            <button
              type="button"
              onClick={() => setDialogView("upload")}
              className="w-full flex items-center justify-between p-4 rounded-2xl border border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-all cursor-pointer group text-left"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full border border-neutral-200 dark:border-neutral-700 flex items-center justify-center bg-white dark:bg-neutral-800 shadow-xs group-hover:scale-105 transition-transform">
                  <UploadSimpleIcon
                    className="h-5 w-5 text-neutral-800 dark:text-neutral-200"
                    weight="bold"
                  />
                </div>
                <span className="font-bold text-sm text-neutral-800 dark:text-neutral-100">
                  Upload your own
                </span>
              </div>
              <CaretRightIcon className="h-4 w-4 text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
            </button>

            {/* Option 2: Choose from Phosphor Icons */}
            <button
              type="button"
              onClick={() => setDialogView("phosphor")}
              className="w-full flex items-center justify-between p-4 rounded-2xl border border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-all cursor-pointer group text-left"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full border border-neutral-200 dark:border-neutral-700 flex items-center justify-center bg-white dark:bg-neutral-800 shadow-xs group-hover:scale-105 transition-transform">
                  <SquaresFourIcon
                    className="h-5 w-5 text-neutral-800 dark:text-neutral-200"
                    weight="bold"
                  />
                </div>
                <span className="font-bold text-sm text-neutral-800 dark:text-neutral-100">
                  Choose from Phosphor Icons
                </span>
              </div>
              <CaretRightIcon className="h-4 w-4 text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        )}

        {dialogView === "upload" && (
          <div className="w-full flex flex-col mt-2">
            <MediaUploader
              type="thumbnail"
              currentUrl={isImageUrl(currentIcon) ? currentIcon : undefined}
              dialogTitle="Upload custom image"
              onBack={() => setDialogView("options")}
              onSuccess={(url) => {
                onSelect(url);
                toast.success("Thumbnail uploaded successfully");
                onOpenChange(false);
              }}
              className="w-full"
            />
          </div>
        )}

        {dialogView === "phosphor" && (
          <div className="w-full flex flex-col gap-4 mt-2">
            {/* Search Box */}
            <div className="bg-[#f6f7f5] dark:bg-neutral-800 rounded-[16px] p-3 flex flex-col gap-1 w-full border border-transparent focus-within:border-black dark:focus-within:border-white transition-all">
              <input
                type="text"
                value={iconSearchQuery}
                onChange={(e) => setIconSearchQuery(e.target.value)}
                placeholder="Search icons... (e.g. instagram, link)"
                className="w-full bg-transparent border-none p-1 text-[13px] font-medium text-black dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-hidden focus:ring-0"
              />
            </div>

            {/* Icon Grid */}
            <div className="grid grid-cols-5 gap-3 max-h-[260px] overflow-y-auto pr-1">
              {POPULAR_ICONS.filter(
                (item) =>
                  item.name
                    .toLowerCase()
                    .includes(iconSearchQuery.toLowerCase()) ||
                  item.label
                    .toLowerCase()
                    .includes(iconSearchQuery.toLowerCase()),
              ).map((item) => {
                const ItemIcon = item.Icon;
                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => {
                      onSelect(item.name);
                      toast.success(`Icon ${item.label} selected successfully`);
                      onOpenChange(false);
                    }}
                    title={item.label}
                    className="aspect-square flex flex-col items-center justify-center p-2 rounded-xl border border-neutral-100 dark:border-neutral-800 hover:border-black dark:hover:border-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all cursor-pointer text-neutral-800 dark:text-neutral-200"
                  >
                    {ItemIcon && <ItemIcon className="h-6 w-6" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
