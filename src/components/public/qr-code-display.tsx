"use client";

import { QrCodeIcon } from "@phosphor-icons/react";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface QRCodeDisplayProps {
  url: string;
  fgColor?: string;
  bgColor?: string;
}

export function QRCodeDisplay({ url }: QRCodeDisplayProps) {
  const [showQR, setShowQR] = useState(false);

  function downloadPNG() {
    // Create a canvas from the SVG for PNG export
    const svgElement = document.querySelector("#qr-code-svg svg");
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new window.Image();
    img.onload = () => {
      canvas.width = 600;
      canvas.height = 600;
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, 600, 600);
      ctx.drawImage(img, 0, 0, 600, 600);
      const link = document.createElement("a");
      link.download = "qrcode.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
    img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
  }

  function downloadSVG() {
    const svgElement = document.querySelector("#qr-code-svg svg");
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const blob = new Blob([svgData], { type: "image/svg+xml" });
    const svgUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = "qrcode.svg";
    link.href = svgUrl;
    link.click();
    URL.revokeObjectURL(svgUrl);
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {showQR && (
        <div
          className={cn(
            "absolute bottom-16 right-0 mb-2",
            "p-5 rounded-2xl",
            "bg-white/95 dark:bg-gray-100",
            "backdrop-blur-xl",
            "border border-white/30 dark:border-gray-200",
            "shadow-2xl",
            "animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4",
          )}
        >
          <div className="flex flex-col items-center gap-3">
            <div id="qr-code-svg" className="p-3 rounded-xl bg-white">
              <QRCodeSVG
                value={url}
                size={150}
                bgColor="#FFFFFF"
                fgColor="#000000"
                level="M"
                marginSize={4}
              />
            </div>
            <div className="flex gap-2 w-full">
              <Button
                variant="default"
                size="sm"
                onClick={downloadPNG}
                className="flex-1 text-xs rounded-lg bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
              >
                PNG
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={downloadSVG}
                className="flex-1 text-xs rounded-lg bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
              >
                SVG
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* QR toggle button — glassmorphism */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => setShowQR(!showQR)}
        className={cn(
          "flex h-12 w-12 items-center justify-center rounded-full",
          "border backdrop-blur-xl transition-all active:scale-95",

          // Universal glass
          "bg-background/45 text-foreground shadow-lg",
          "border-border/60 hover:bg-background/65",

          // Extra depth
          "ring-1 ring-white/20 dark:ring-white/10",
        )}
        aria-label={showQR ? "Hide QR code" : "Show QR code"}
      >
        <QrCodeIcon className="h-6 w-6" weight={showQR ? "fill" : "regular"} />
      </Button>
    </div>
  );
}
