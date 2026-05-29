"use client";

import { ColorPicker } from "@/components/dashboard/design/color-picker";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useDesignStore } from "@/store/design-store";

const buttonStyles = [
  { id: "solid", name: "Solid" },
  { id: "glass", name: "Glass" },
  { id: "outline", name: "Outline" },
];

const cornerOptions = [
  { id: "square", name: "Square", radius: "0px" },
  { id: "round", name: "Round", radius: "4px" },
  { id: "rounder", name: "Rounder", radius: "8px" },
  { id: "full", name: "Full", radius: "16px" },
];

const shadowOptions = [
  { id: "none", name: "None" },
  { id: "soft", name: "Soft" },
  { id: "strong", name: "Strong" },
  { id: "hard", name: "Hard" },
];

export function ButtonsTab() {
  const { state, setState } = useDesignStore();

  const isSolidButton = state.buttonStyle === "solid";

  function handleButtonStyleChange(styleId: string) {
    setState({
      buttonStyle: styleId,
      ...(styleId !== "solid" ? { buttonShadow: "none" } : {}),
    });
  }

  function getPreviewClass(styleId: string) {
    switch (styleId) {
      case "glass":
        return "bg-white/45 border border-white/80 backdrop-blur-md";
      case "outline":
        return "bg-transparent border border-white/80";
      default:
        return "bg-white";
    }
  }

  return (
    <div className="space-y-8">
      {/* Button style */}
      <div className="space-y-3">
        <span className="block text-sm font-semibold">Button style</span>

        <div className="grid grid-cols-3 gap-3">
          {buttonStyles.map((style) => (
            <button
              key={style.id}
              type="button"
              onClick={() => handleButtonStyleChange(style.id)}
              className={cn(
                "rounded-2xl border bg-card p-1 transition-all",
                "hover:border-foreground/50",
                state.buttonStyle === style.id
                  ? "border-foreground"
                  : "border-border",
              )}
            >
              <div className="relative flex h-14 items-center justify-center rounded-xl bg-muted-foreground/35">
                <div
                  className={cn(
                    "h-7 w-20 rounded-full",
                    getPreviewClass(style.id),
                  )}
                />
              </div>

              <div className="py-2 text-sm font-medium text-foreground">
                {style.name}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Corner roundness */}
      <div className="space-y-3">
        <span className="block text-sm font-semibold">Corner roundness</span>

        <div className="grid grid-cols-4 gap-2">
          {cornerOptions.map((corner) => (
            <button
              key={corner.id}
              type="button"
              onClick={() => setState({ buttonCorner: corner.id })}
              className={cn(
                "flex h-12 items-center justify-center rounded-2xl border bg-card transition-all",
                "hover:border-foreground/50",
                state.buttonCorner === corner.id
                  ? "border-foreground"
                  : "border-border",
              )}
              aria-label={corner.name}
            >
              <div
                className={cn(
                  "h-5 w-5 border-l-2 border-t-2",
                  state.buttonCorner === corner.id
                    ? "border-foreground"
                    : "border-muted-foreground",
                )}
                style={{ borderTopLeftRadius: corner.radius }}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Button shadow - Solid only */}
      {isSolidButton && (
        <div className="space-y-3">
          <span className="block text-sm font-semibold">Button shadow</span>

          <div className="grid grid-cols-4 gap-2">
            {shadowOptions.map((shadow) => (
              <button
                key={shadow.id}
                type="button"
                onClick={() => setState({ buttonShadow: shadow.id })}
                className={cn(
                  "h-12 rounded-2xl border bg-card px-4 text-sm font-medium transition-all",
                  "hover:border-foreground/50",
                  state.buttonShadow === shadow.id
                    ? "border-foreground text-foreground"
                    : "border-border text-muted-foreground",
                )}
              >
                {shadow.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Button color */}
      <div className="space-y-3">
        <span className="block text-sm font-semibold">Button color</span>

        <div className="flex items-center gap-3 rounded-2xl border bg-card/50 p-3">
          <ColorPicker
            value={state.buttonColor}
            onChange={(value) => setState({ buttonColor: value })}
            label="Pick button color"
          />

          <Input
            value={state.buttonColor}
            onChange={(e) => setState({ buttonColor: e.target.value })}
            placeholder="#FFFFFF"
            className="h-10 flex-1 font-mono text-sm"
          />
        </div>
      </div>

      {/* Button text color */}
      <div className="space-y-3">
        <span className="block text-sm font-semibold">Button text color</span>

        <div className="flex items-center gap-3 rounded-2xl border bg-card/50 p-3">
          <ColorPicker
            value={state.buttonTextColor}
            onChange={(value) => setState({ buttonTextColor: value })}
            label="Pick button text color"
          />

          <Input
            value={state.buttonTextColor}
            onChange={(e) => setState({ buttonTextColor: e.target.value })}
            placeholder="#000000"
            className="h-10 flex-1 font-mono text-sm"
          />
        </div>
      </div>
    </div>
  );
}
