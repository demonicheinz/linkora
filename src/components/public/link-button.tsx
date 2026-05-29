"use client";

import { ThumbnailIcon } from "@/components/dashboard/links/thumbnail-icon";
import { LinkMoreMenu } from "@/components/public/link-more-menu";
import { cn } from "@/lib/utils";

interface LinkButtonProps {
  title: string;
  url: string;
  icon?: string | null;
  color?: string | null;
  onClickTracking: () => void;
  buttonStyle?: string;
  buttonCorner?: string;
  buttonColor?: string;
  buttonTextColor?: string;
  buttonShadow?: string;
  buttonShadowColor?: string;
}

function getButtonRadius(corner?: string) {
  switch (corner) {
    case "square":
      return "0px";
    case "round":
      return "4px";
    case "rounder":
      return "8px";
    case "full":
      return "9999px";
    default:
      return "4px";
  }
}

function getButtonShadow(shadow?: string, shadowColor?: string) {
  const c = shadowColor || "#000000";
  switch (shadow) {
    case "soft":
      return `0 4px 14px ${c}33`;
    case "strong":
      return `0 6px 20px ${c}66`;
    case "hard":
      return `4px 4px 0px ${c}`;
    default:
      return "none";
  }
}

export function LinkButton({
  title,
  url,
  icon,
  color,
  onClickTracking,
  buttonStyle = "solid",
  buttonCorner = "round",
  buttonColor = "#2A2A2A",
  buttonTextColor = "#EAEAEA",
  buttonShadow = "none",
  buttonShadowColor = "#000000",
}: LinkButtonProps) {
  const bgColor = color || buttonColor;
  const borderRadius = getButtonRadius(buttonCorner);
  const boxShadow = getButtonShadow(buttonShadow, buttonShadowColor);

  function getStyle(): React.CSSProperties {
    const base: React.CSSProperties = {
      borderRadius,
      boxShadow,
      color: buttonTextColor,
    };

    switch (buttonStyle) {
      case "glass":
        return {
          ...base,
          backgroundColor: `${bgColor}66`,
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: `1px solid ${bgColor}44`,
        };
      case "outline":
        return {
          ...base,
          backgroundColor: "transparent",
          border: `2px solid ${bgColor}`,
        };
      default: // solid
        return {
          ...base,
          backgroundColor: bgColor,
        };
    }
  }

  return (
    <div
      className={cn(
        "flex items-stretch relative transition-all duration-200 select-none w-full h-16",
        "hover:scale-[1.01] active:scale-[0.99]",
      )}
      style={{
        borderRadius,
        ...getStyle(),
      }}
    >
      {/* Main clickable area structured as 3 parts for perfect text centering */}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClickTracking}
        className="flex items-center flex-1 min-w-0 text-inherit decoration-transparent"
      >
        {/* Left Side: Thumbnail/Icon space (always exactly 64px/w-16 wide to match right side for perfect centering) */}
        <div className="w-16 flex items-center justify-center shrink-0">
          {icon && (
            <div
              className="w-10 h-10 overflow-hidden relative shrink-0 flex items-center justify-center"
              style={{
                borderRadius: buttonCorner === "full" ? "9999px" : borderRadius,
              }}
            >
              <ThumbnailIcon
                icon={icon}
                className="w-full h-full object-cover"
                fill={false}
              />
            </div>
          )}
        </div>

        {/* Center: Title (Perfectly centered because left & right columns are exactly the same width) */}
        <span className="flex-1 text-center font-bold text-sm tracking-wide truncate px-2">
          {title}
        </span>

        {/* Dummy Right Space inside the link to balance the left thumbnail space for perfect centering */}
        <div className="w-16 shrink-0 pointer-events-none" />
      </a>

      {/* Actual Clickable More Menu (absolute positioned over the dummy right space) */}
      {/* biome-ignore lint/a11y/noStaticElementInteractions: Click Handlers prevent default */}
      <div
        className="absolute right-0 top-0 bottom-0 w-16 z-10 flex items-center justify-center"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onKeyDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <LinkMoreMenu url={url} title={title} />
      </div>
    </div>
  );
}
