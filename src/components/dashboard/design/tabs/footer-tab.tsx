"use client";

import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useDesignStore } from "@/store/design-store";

export function FooterTab() {
  const { state, setState } = useDesignStore();

  const footerDisabled = state.hideFooter;

  return (
    <div className="space-y-5">
      {/* Hide footer */}
      <div className="flex items-center justify-between rounded-2xl border bg-card/50 p-4">
        <div className="pr-4">
          <span className="block text-sm font-semibold">
            Hide Linkora footer
          </span>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Hide the footer text at the bottom of your page.
          </p>
        </div>

        <Switch
          checked={state.hideFooter}
          onCheckedChange={(checked) => setState({ hideFooter: checked })}
          aria-label="Toggle footer visibility"
        />
      </div>

      {/* Custom footer text */}
      <div className={cn("space-y-3", footerDisabled && "opacity-50")}>
        <span className="block text-sm font-semibold">Footer text</span>

        <div className="rounded-2xl border bg-card/50 p-3">
          <Input
            value={state.customFooterText}
            onChange={(e) => setState({ customFooterText: e.target.value })}
            placeholder="Buat Linkora-mu"
            disabled={footerDisabled}
            className="h-10 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
          />
        </div>
      </div>

      {/* Custom footer URL */}
      <div className={cn("space-y-3", footerDisabled && "opacity-50")}>
        <span className="block text-sm font-semibold">Footer link</span>

        <div className="rounded-2xl border bg-card/50 p-3">
          <Input
            value={state.customFooterUrl}
            onChange={(e) => setState({ customFooterUrl: e.target.value })}
            placeholder="https://linkora.id"
            disabled={footerDisabled}
            className="h-10 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
          />
        </div>
      </div>
    </div>
  );
}
