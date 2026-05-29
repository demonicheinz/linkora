"use client";

import { UploadSimpleIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface DropZoneProps {
  /** Text shown on the button (e.g. "Upload Foto Profil" / "Ganti Banner") */
  label: string;
  /** Small hint shown below (e.g. "400×400px (1:1)") */
  hint: string;
  /** Called when a valid file is dropped or selected */
  onFile: (file: File) => void;
  className?: string;
}

export function DropZone({ label, hint, onFile, className }: DropZoneProps) {
  function openPicker() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) onFile(file);
    };
    input.click();
  }

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: file picker opened by click
    // biome-ignore lint/a11y/noStaticElementInteractions: file picker opened by click
    <div
      className={cn(
        "w-full border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-2xl p-8 text-center hover:border-primary transition-colors cursor-pointer flex flex-col items-center gap-4 bg-neutral-50 dark:bg-neutral-950/20",
        className,
      )}
      onClick={openPicker}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file?.type.startsWith("image/")) onFile(file);
      }}
    >
      <UploadSimpleIcon className="h-10 w-10 text-neutral-400 animate-bounce" />
      <div className="space-y-1">
        <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
          {label}
        </p>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          or drag &amp; drop file
        </p>
      </div>
      <p className="text-xs text-neutral-400">Recommendation: {hint}</p>
    </div>
  );
}
