"use client";

import { ShareNetworkIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ShareButtonProps {
  url: string;
  title?: string;
  themeColor?: string;
}

export function ShareButton({
  url,
  title = "Check this out!",
  themeColor = "#000000",
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // User cancelled share
      }
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleShare}
      className={cn(
        "rounded-full transition-all active:scale-95 hover:opacity-80",
        "backdrop-blur-md shadow-sm border",
      )}
      style={{
        color: themeColor,
        backgroundColor: `color-mix(in srgb, ${themeColor} 10%, transparent)`,
        borderColor: `color-mix(in srgb, ${themeColor} 20%, transparent)`,
      }}
      title={copied ? "Copied!" : "Share"}
    >
      <ShareNetworkIcon
        className="h-5 w-5"
        weight={copied ? "fill" : "regular"}
      />
    </Button>
  );
}
