"use client";

import { ColorPicker } from "@/components/dashboard/design/color-picker";
import { Input } from "@/components/ui/input";
import { type DesignState, useDesignStore } from "@/store/design-store";

interface ColorEntry {
  label: string;
  key: keyof DesignState;
}

const colorEntries: ColorEntry[] = [
  { label: "Background", key: "wallpaperColor" },
  { label: "Buttons", key: "buttonColor" },
  { label: "Button text", key: "buttonTextColor" },
  { label: "Title", key: "titleColor" },
  { label: "Page text", key: "pageTextColor" },
  { label: "Bio", key: "bioColor" },
];

export function ColorsTab() {
  const { state, setState } = useDesignStore();

  function handleColorChange(key: keyof DesignState, value: string) {
    setState({ [key]: value } as Parameters<typeof setState>[0]);
  }

  return (
    <div className="space-y-4">
      {colorEntries.map((entry) => {
        const value = state[entry.key] as string;

        return (
          <div key={entry.key} className="space-y-2">
            <span className="block text-sm font-semibold">{entry.label}</span>

            <div className="flex items-center gap-3 rounded-2xl border bg-card/50 p-3">
              <ColorPicker
                value={value}
                onChange={(color) => handleColorChange(entry.key, color)}
                label={`Pick ${entry.label.toLowerCase()} color`}
              />

              <Input
                value={value}
                onChange={(e) => handleColorChange(entry.key, e.target.value)}
                placeholder="#FFFFFF"
                className="h-10 flex-1 font-mono text-sm"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
