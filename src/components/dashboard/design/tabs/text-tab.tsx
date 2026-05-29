"use client";

import { ColorPicker } from "@/components/dashboard/design/color-picker";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useDesignStore } from "@/store/design-store";

const fontOptions = [
  { id: "inter", name: "Inter" },
  { id: "public-sans", name: "Public Sans" },
];

export function TextTab() {
  const { state, setState } = useDesignStore();

  return (
    <div className="space-y-5">
      {/* Page font */}
      <div className="space-y-3">
        <span className="block text-sm font-semibold">Page font</span>

        <Select
          value={state.pageFontFamily}
          onValueChange={(v) => setState({ pageFontFamily: v })}
        >
          <SelectTrigger className="!h-12 min-h-12 w-full rounded-2xl">
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
      </div>

      {/* Page text color */}
      <div className="space-y-3">
        <span className="block text-sm font-semibold">Page text color</span>

        <div className="flex items-center gap-3 rounded-2xl border bg-card/50 p-3">
          <ColorPicker
            value={state.pageTextColor}
            onChange={(value) => setState({ pageTextColor: value })}
            label="Pick page text color"
          />

          <Input
            value={state.pageTextColor}
            onChange={(e) => setState({ pageTextColor: e.target.value })}
            placeholder="#EAEAEA"
            className="h-10 flex-1 font-mono text-sm"
          />
        </div>
      </div>

      {/* Alternative title font toggle */}
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

      {/* Title color */}
      <div className="space-y-3">
        <span className="block text-sm font-semibold">Title color</span>

        <div className="flex items-center gap-3 rounded-2xl border bg-card/50 p-3">
          <ColorPicker
            value={state.titleColor}
            onChange={(value) => setState({ titleColor: value })}
            label="Pick title color"
          />

          <Input
            value={state.titleColor}
            onChange={(e) => setState({ titleColor: e.target.value })}
            placeholder="#FFFFFF"
            className="h-10 flex-1 font-mono text-sm"
          />
        </div>
      </div>

      {/* Bio color */}
      <div className="space-y-3">
        <span className="block text-sm font-semibold">Bio color</span>

        <div className="flex items-center gap-3 rounded-2xl border bg-card/50 p-3">
          <ColorPicker
            value={state.bioColor}
            onChange={(value) => setState({ bioColor: value })}
            label="Pick bio color"
          />

          <Input
            value={state.bioColor}
            onChange={(e) => setState({ bioColor: e.target.value })}
            placeholder="#AAAAAA"
            className="h-10 flex-1 font-mono text-sm"
          />
        </div>
      </div>
    </div>
  );
}
