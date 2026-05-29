"use client";

import { PaintBrushIcon, Shuffle } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { useDesignStore } from "@/store/design-store";

const customizableThemes = [
  {
    id: "custom",
    name: "Custom",
    icon: PaintBrushIcon,
    preview: { bg: "#0A0A0A", text: "#EAEAEA", accent: "#6366f1" },
  },
  {
    id: "agate",
    name: "Agate",
    preview: { bg: "#1a1a2e", text: "#e0e0e0", accent: "#e94560" },
    values: {
      wallpaperColor: "#1a1a2e",
      pageTextColor: "#e0e0e0",
      titleColor: "#ffffff",
      buttonColor: "#e94560",
      buttonTextColor: "#ffffff",
    },
  },
  {
    id: "air",
    name: "Air",
    preview: { bg: "#f0f4f8", text: "#2d3748", accent: "#4299e1" },
    values: {
      wallpaperColor: "#f0f4f8",
      pageTextColor: "#2d3748",
      titleColor: "#1a202c",
      buttonColor: "#4299e1",
      buttonTextColor: "#ffffff",
    },
  },
  {
    id: "astrid",
    name: "Astrid",
    preview: { bg: "#0d0d0d", text: "#f5f5f5", accent: "#ff6b6b" },
    values: {
      wallpaperColor: "#0d0d0d",
      pageTextColor: "#f5f5f5",
      titleColor: "#ffffff",
      buttonColor: "#ff6b6b",
      buttonTextColor: "#ffffff",
    },
  },
  {
    id: "bloom",
    name: "Bloom",
    preview: { bg: "#fdf2f8", text: "#831843", accent: "#ec4899" },
    values: {
      wallpaperColor: "#fdf2f8",
      pageTextColor: "#831843",
      titleColor: "#9d174d",
      buttonColor: "#ec4899",
      buttonTextColor: "#ffffff",
    },
  },
  {
    id: "midnight",
    name: "Midnight",
    preview: { bg: "#111827", text: "#d1d5db", accent: "#8b5cf6" },
    values: {
      wallpaperColor: "#111827",
      pageTextColor: "#d1d5db",
      titleColor: "#f9fafb",
      buttonColor: "#8b5cf6",
      buttonTextColor: "#ffffff",
    },
  },
  {
    id: "sage",
    name: "Sage",
    preview: { bg: "#f0fdf4", text: "#166534", accent: "#22c55e" },
    values: {
      wallpaperColor: "#f0fdf4",
      pageTextColor: "#166534",
      titleColor: "#14532d",
      buttonColor: "#22c55e",
      buttonTextColor: "#ffffff",
    },
  },
  {
    id: "ember",
    name: "Ember",
    preview: { bg: "#1c1917", text: "#fcd34d", accent: "#f97316" },
    values: {
      wallpaperColor: "#1c1917",
      pageTextColor: "#fcd34d",
      titleColor: "#fbbf24",
      buttonColor: "#f97316",
      buttonTextColor: "#1c1917",
    },
  },
];

export function ThemeTab() {
  const { state, setState } = useDesignStore();

  function applyTheme(values: Record<string, unknown>) {
    setState({
      wallpaperStyle: "fill",
      ...values,
    } as Parameters<typeof setState>[0]);
  }

  function handleShuffle() {
    const themes = customizableThemes.filter((t) => t.id !== "custom");
    const random = themes[Math.floor(Math.random() * themes.length)];
    if (random?.values) {
      applyTheme(random.values);
      setState({ theme: random.id });
    }
  }

  return (
    <div className="space-y-3">
      {/* Shuffle */}
      <button
        type="button"
        onClick={handleShuffle}
        className="flex items-center gap-2 w-full p-3 rounded-lg border bg-card hover:bg-muted transition-colors text-sm font-medium cursor-pointer"
      >
        <Shuffle className="h-4 w-4" />
        Shuffle
      </button>

      {/* Theme grid */}
      <div className="grid grid-cols-4 gap-2">
        {customizableThemes.map((theme) => (
          <button
            key={theme.id}
            type="button"
            onClick={() => {
              if (theme.values) {
                applyTheme(theme.values);
              }
              setState({ theme: theme.id });
            }}
            className={cn(
              "flex flex-col items-center gap-1.5 p-2 rounded-lg border-2 transition-all cursor-pointer",
              state.theme === theme.id
                ? "border-primary bg-primary/5"
                : "border-transparent hover:border-border",
            )}
          >
            <div
              className="w-full aspect-square rounded-md flex items-center justify-center text-lg font-bold"
              style={{
                backgroundColor: theme.preview.bg,
                color: theme.preview.text,
              }}
            >
              {theme.icon ? <theme.icon className="h-5 w-5" /> : "Aa"}
            </div>
            <span className="text-[10px] text-muted-foreground truncate w-full text-center">
              {theme.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
