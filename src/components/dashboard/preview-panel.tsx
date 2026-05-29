"use client";

import { DotsThreeVerticalIcon } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { ThumbnailIcon } from "@/components/dashboard/links/thumbnail-icon";
import { getShapeStyle } from "@/components/public/profile-header";
import { cn } from "@/lib/utils";

interface PreviewPanelProps {
  username: string;
  name?: string;
  bio?: string;
  avatarUrl?: string | null;
  bannerUrl?: string | null;
  links?: Array<{
    id: string;
    title: string;
    url: string;
    icon?: string | null;
    isActive: boolean;
    isPinned: boolean;
  }>;
  wallpaperStyle?: string;
  wallpaperColor?: string;
  wallpaperGradient?: string;
  headerLayout?: string;
  buttonStyle?: string;
  buttonCorner?: string;
  buttonColor?: string;
  buttonTextColor?: string;
  buttonShadow?: string;
  buttonShadowColor?: string;
  pageFontFamily?: string;
  pageTextColor?: string;
  titleColor?: string;
  bioColor?: string;
  hideFooter?: boolean;
  customFooterText?: string | null;
  customFooterUrl?: string | null;
  wallpaperImageUrl?: string | null;
  wallpaperVideoUrl?: string | null;
  videoCropX?: number | null;
  videoCropY?: number | null;
  videoCropWidth?: number | null;
  videoCropHeight?: number | null;
  gradientNoise?: boolean;
  wallpaperBlur?: number;
  wallpaperPattern?: string;
  imageEffect?: string;
  imageTint?: number;
  videoTint?: number;
  avatarShape?: string;
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
  const color = shadowColor || "#000000";
  switch (shadow) {
    case "soft":
      return `0 4px 14px ${color}22`;
    case "strong":
      return `0 6px 20px ${color}44`;
    case "hard":
      return `4px 4px 0px ${color}`;
    default:
      return "none";
  }
}

function getButtonStyles(
  style?: string,
  buttonColor?: string,
  buttonTextColor?: string,
  shadow?: string,
  shadowColor?: string,
) {
  const base: React.CSSProperties = {
    boxShadow: getButtonShadow(shadow, shadowColor),
    color: buttonTextColor || "#FFFFFF",
  };

  switch (style) {
    case "glass":
      return {
        ...base,
        backgroundColor: `${buttonColor || "#1E1E1E"}aa`,
        backdropFilter: "blur(16px)",
        border: `1px solid ${buttonColor || "#FFFFFF"}15`,
      };
    case "outline":
      return {
        ...base,
        backgroundColor: "transparent",
        border: `2px solid ${buttonColor || "#FFFFFF"}`,
      };
    default:
      return {
        ...base,
        backgroundColor: buttonColor || "#1E1E1E",
      };
  }
}

function getPatternCSS(pattern?: string): string {
  switch (pattern) {
    case "grid":
      return "linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px)";
    case "morph":
      return "radial-gradient(circle at 20% 50%, rgba(255,255,255,.05) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(255,255,255,.05) 0%, transparent 50%)";
    case "organic":
      return "radial-gradient(ellipse at 10% 20%, rgba(255,255,255,.04) 0%, transparent 50%), radial-gradient(ellipse at 90% 80%, rgba(255,255,255,.04) 0%, transparent 50%)";
    case "matrix":
      return "linear-gradient(rgba(255,255,255,.02) 2px, transparent 2px), linear-gradient(90deg, rgba(255,255,255,.02) 2px, transparent 2px)";
    default:
      return "";
  }
}

function getBackgroundStyle(props: PreviewPanelProps): React.CSSProperties {
  const style = props.wallpaperStyle;
  if (style === "gradient" && props.wallpaperGradient) {
    return { background: props.wallpaperGradient };
  }
  if (style === "pattern") {
    return {
      backgroundColor: props.wallpaperColor || "#0C0C0C",
      backgroundImage: getPatternCSS(props.wallpaperPattern),
      backgroundSize: "40px 40px",
    };
  }
  if (style === "image" || style === "video" || style === "blur") {
    return { backgroundColor: "transparent" };
  }
  return {
    backgroundColor: props.wallpaperColor || "#0C0C0C",
  };
}

function getFontFamily(fontFamily?: string) {
  switch (fontFamily) {
    case "inter":
      return "Inter, sans-serif";
    case "public-sans":
      return "'Public Sans', sans-serif";
    default:
      return "Inter, sans-serif";
  }
}

export function PreviewPanel({
  username,
  name,
  bio,
  avatarUrl,
  links = [],
  wallpaperStyle,
  wallpaperColor,
  wallpaperGradient,
  headerLayout = "classic",
  bannerUrl = null,
  buttonStyle = "solid",
  buttonCorner = "round",
  buttonColor = "#1E1E1E",
  buttonTextColor = "#FFFFFF",
  buttonShadow = "none",
  buttonShadowColor = "#000000",
  pageFontFamily,
  pageTextColor = "#FFFFFF",
  titleColor = "#FFFFFF",
  bioColor = "#A0A0A0",
  hideFooter = false,
  customFooterText = "Buat Linkora-mu",
  customFooterUrl = "https://linkora.heinz.id",
  wallpaperImageUrl = null,
  wallpaperVideoUrl = null,
  videoCropX = null,
  videoCropY = null,
  videoCropWidth = null,
  videoCropHeight = null,
  gradientNoise = false,
  wallpaperBlur = 10,
  wallpaperPattern = "grid",
  imageEffect = "none",
  imageTint = 10,
  videoTint = 10,
  avatarShape = "flower",
}: PreviewPanelProps) {
  const bgStyle = getBackgroundStyle({
    username,
    wallpaperStyle,
    wallpaperColor,
    wallpaperGradient,
    wallpaperPattern,
  });

  const font = getFontFamily(pageFontFamily);
  const borderRadius = getButtonRadius(buttonCorner);
  const isHero = headerLayout === "hero";
  const isBanner = headerLayout === "banner";
  const avatarSize = isHero ? 72 : 64;
  const coverUrl = isHero ? avatarUrl : bannerUrl;

  return (
    <div className="flex flex-col h-full items-center justify-center w-full">
      {/* High-Fidelity iPhone Device Shell */}
      <div className="w-full aspect-[9/18.5] rounded-[3.25rem] overflow-hidden border-[10px] border-neutral-900/90 bg-black relative select-none">
        {/* Top Camera Island (Dynamic Island Look) */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-5 rounded-full bg-black z-30 flex items-center justify-end px-4">
          <div className="w-2.5 h-2.5 rounded-full bg-neutral-900/80 border border-neutral-800/40" />
        </div>

        {/* Inner Screen Mask (Forces inner border radius and clips scrolling content correctly) */}
        <div
          className="absolute inset-0 rounded-[2.625rem] overflow-hidden z-0"
          style={{
            transform: "translateZ(0)",
            WebkitMaskImage: "-webkit-radial-gradient(white, black)",
          }}
        >
          {/* Fixed Background Overlays for Image / Video / Blur */}
          {(wallpaperStyle === "image" ||
            wallpaperStyle === "video" ||
            wallpaperStyle === "blur") && (
            <div className="absolute inset-0 -z-10 pointer-events-none select-none">
              {wallpaperStyle === "image" && wallpaperImageUrl && (
                <Image
                  src={wallpaperImageUrl}
                  alt="Wallpaper"
                  fill
                  priority
                  sizes="320px"
                  unoptimized={
                    wallpaperImageUrl.startsWith("blob:") ||
                    wallpaperImageUrl.startsWith("data:")
                  }
                  className={cn(
                    "object-cover transition-all duration-300",
                    imageEffect === "mono" && "grayscale",
                    imageEffect === "blur" && "blur-md scale-105",
                    imageEffect === "halftone" &&
                      "contrast-200 saturate-50 [image-rendering:pixelated]",
                  )}
                />
              )}

              {wallpaperStyle === "video" && wallpaperVideoUrl && (
                <div className="absolute inset-0 overflow-hidden">
                  <video
                    src={wallpaperVideoUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    style={
                      videoCropWidth
                        ? {
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: `${10000 / videoCropWidth}%`,
                            height: `${10000 / (videoCropHeight || 100)}%`,
                            transform: `translate(-${videoCropX || 0}%, -${videoCropY || 0}%)`,
                            maxWidth: "none",
                            maxHeight: "none",
                          }
                        : { width: "100%", height: "100%", objectFit: "cover" }
                    }
                  />
                </div>
              )}

              {wallpaperStyle === "blur" && (
                <>
                  {/* Solid base color for blur style */}
                  <div
                    className="absolute inset-0"
                    style={{ backgroundColor: wallpaperColor || "#0C0C0C" }}
                  />
                  {/* Gorgeous ambient background underlay circles for the blur style */}
                  <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[50%] rounded-full bg-indigo-500/40 blur-[40px] animate-pulse duration-5000" />
                  <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[50%] rounded-full bg-purple-500/40 blur-[40px] animate-pulse duration-7000" />
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundColor: `${wallpaperColor || "#0C0C0C"}bf`,
                      backdropFilter: `blur(${wallpaperBlur}px)`,
                      WebkitBackdropFilter: `blur(${wallpaperBlur}px)`,
                    }}
                  />
                </>
              )}

              {/* Tint Overlay for Image & Video */}
              {wallpaperStyle === "image" && imageTint < 100 && (
                <div
                  className="absolute inset-0 bg-black transition-opacity duration-300"
                  style={{ opacity: (100 - imageTint) / 100 }}
                />
              )}
              {wallpaperStyle === "video" && videoTint < 100 && (
                <div
                  className="absolute inset-0 bg-black transition-opacity duration-300"
                  style={{ opacity: (100 - videoTint) / 100 }}
                />
              )}
            </div>
          )}

          {/* Screen Canvas (Scrolls internally) */}
          <div
            className="w-full h-full p-0 flex flex-col overflow-y-auto no-scrollbar scroll-smooth relative z-0"
            style={{
              ...bgStyle,
              fontFamily: font,
            }}
          >
            {/* Noise Overlay (restricted to gradient & image styles only to prevent leak to video/blur/etc.) */}
            {gradientNoise &&
              (wallpaperStyle === "gradient" || wallpaperStyle === "image") && (
                <div
                  className="absolute inset-0 opacity-15 pointer-events-none mix-blend-overlay bg-repeat bg-[size:128px_128px] rounded-[inherit] -z-10"
                  style={{
                    backgroundImage:
                      'url(\'data:image/svg+xml,%3Csvg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noiseFilter"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/%3E%3C/filter%3E%3Crect width="100%25" height="100%25" filter="url(%23noiseFilter)"/%3E%3C/svg%3E\')',
                  }}
                />
              )}

            {/* User Profile Info */}
            {headerLayout === "banner" || headerLayout === "hero" ? (
              <div className="w-full flex flex-col items-center text-center select-none">
                {/* Banner/Hero Header Container (Full-bleed direct child of parent rounded card) */}
                <div
                  className={cn(
                    "relative w-full shrink-0 bg-neutral-900/60",
                    headerLayout === "hero" ? "h-36" : "h-28",
                  )}
                >
                  {coverUrl ? (
                    <Image
                      src={coverUrl}
                      alt="Cover"
                      fill
                      priority
                      sizes="320px"
                      unoptimized={
                        coverUrl.startsWith("blob:") ||
                        coverUrl.startsWith("data:")
                      }
                      className="object-cover animate-fade-in animate-duration-300"
                    />
                  ) : (
                    // Premium glassmorphism fallback gradient
                    <div className="w-full h-full bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 backdrop-blur-xs flex items-center justify-center">
                      <span className="text-[8px] uppercase tracking-widest opacity-25 font-bold font-mono">
                        Header Space
                      </span>
                    </div>
                  )}

                  {/* Immersive bottom fade gradient layer dynamically matching wallpaper color */}
                  <div
                    className="absolute inset-x-0 bottom-0 h-16 pointer-events-none z-10"
                    style={{
                      background: `linear-gradient(to bottom, transparent, ${wallpaperColor || "#0C0C0C"})`,
                    }}
                  />

                  {/* Circular Overlapping Profile Avatar with Dynamic Border Ring (Banner only) */}
                  {headerLayout !== "hero" && (
                    <div
                      className={cn(
                        "absolute left-1/2 -translate-x-1/2 rounded-full overflow-hidden bg-neutral-900 shadow-xl z-20 flex items-center justify-center ring-2 ring-white/10 shrink-0",
                        "-bottom-8",
                      )}
                      style={{
                        width: avatarSize + 8,
                        height: avatarSize + 8,
                        border: `3px solid ${wallpaperColor || "#0C0C0C"}`,
                      }}
                    >
                      {avatarUrl ? (
                        <Image
                          src={avatarUrl}
                          alt={name || username}
                          width={avatarSize}
                          height={avatarSize}
                          priority
                          sizes="64px"
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center text-sm font-bold"
                          style={{ color: titleColor }}
                        >
                          {(name || username).charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Profile Details Container (Padded to clear the overlapping avatar if present) */}
                <div
                  className={cn(
                    "w-full px-5 pb-3",
                    headerLayout === "hero" ? "pt-4" : "pt-8",
                  )}
                >
                  <h2
                    className="text-base font-bold tracking-wide"
                    style={{ color: titleColor, fontFamily: font }}
                  >
                    {name || username}
                  </h2>

                  {bio && (
                    <p
                      className="mt-1 text-xs leading-relaxed max-w-[220px] mx-auto opacity-80"
                      style={{ color: bioColor }}
                    >
                      {bio}
                    </p>
                  )}
                </div>
              </div>
            ) : headerLayout === "shape" ? (
              // Shape layout (Huge Avatar, Title, Bio)
              <div className="flex flex-col items-center text-center px-6 pt-12 pb-3 shrink-0 relative z-10 w-full select-none">
                <div className="relative mb-2 w-full aspect-[1.35] shrink-0">
                  <div
                    className="relative w-full h-full flex items-center justify-center bg-white/15 shadow-xs animate-fade-in animate-duration-300"
                    style={{
                      ...getShapeStyle(avatarShape),
                    }}
                  >
                    <div
                      className="w-[calc(100%-6px)] h-[calc(100%-6px)] overflow-hidden bg-neutral-900 flex items-center justify-center relative"
                      style={{
                        ...getShapeStyle(avatarShape),
                      }}
                    >
                      {avatarUrl ? (
                        <Image
                          src={avatarUrl}
                          alt={name || username}
                          fill
                          priority
                          sizes="320px"
                          className="object-cover"
                        />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center text-6xl font-bold"
                          style={{ color: titleColor }}
                        >
                          {(name || username).charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <h2
                  className="text-2xl font-bold tracking-tight mb-2"
                  style={{ color: titleColor, fontFamily: font }}
                >
                  {name || username}
                </h2>
                {bio && (
                  <p
                    className="text-sm leading-relaxed max-w-[220px] opacity-80"
                    style={{ color: bioColor }}
                  >
                    {bio}
                  </p>
                )}
              </div>
            ) : (
              // Classic / Centered Avatar layout on iPhone mockup
              <div className="flex flex-col items-center text-center px-5 pt-12 pb-3 shrink-0 relative z-10 w-full select-none">
                <div
                  className="relative mb-3 shrink-0"
                  style={{ width: avatarSize, height: avatarSize }}
                >
                  <div className="w-full h-full rounded-full overflow-hidden bg-white/10 border-2 border-white/10 shadow-xs flex items-center justify-center animate-fade-in animate-duration-300 relative">
                    {avatarUrl ? (
                      <Image
                        src={avatarUrl}
                        alt={name || username}
                        fill
                        priority
                        sizes="96px"
                        className="object-cover"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center text-2xl font-bold"
                        style={{ color: titleColor }}
                      >
                        {(name || username).charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>

                {/* Display Name */}
                <h2
                  className="text-base font-bold tracking-wide"
                  style={{ color: titleColor, fontFamily: font }}
                >
                  {name || username}
                </h2>

                {/* User Bio */}
                {bio && (
                  <p
                    className="mt-1.5 text-xs leading-relaxed max-w-[220px] opacity-80"
                    style={{ color: bioColor }}
                  >
                    {bio}
                  </p>
                )}
              </div>
            )}

            {/* Links list & Footer inside relative content wrapper container */}
            <div className="px-5 pb-6 flex-1 flex flex-col justify-between w-full">
              {/* User Links List */}
              <div className="space-y-3 flex-1 relative z-10">
                <AnimatePresence mode="popLayout">
                  {links.length === 0 ? (
                    <motion.div
                      key="empty-state"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="py-10 text-center text-xs opacity-45"
                      style={{ color: pageTextColor }}
                    >
                      No links yet
                    </motion.div>
                  ) : (
                    links.map((link) => (
                      <motion.div
                        key={link.id}
                        layout
                        initial={{ opacity: 0, scale: 0.8, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{
                          opacity: 0,
                          scale: 0.8,
                          transition: { duration: 0.15 },
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 25,
                        }}
                      >
                        <button
                          type="button"
                          className={cn(
                            "flex items-center w-full h-12 text-sm font-semibold transition-all relative border border-transparent shadow-xs select-none",
                            "hover:scale-[1.01] active:scale-[0.99]",
                          )}
                          style={{
                            borderRadius,
                            ...getButtonStyles(
                              buttonStyle,
                              buttonColor,
                              buttonTextColor,
                              buttonShadow,
                              buttonShadowColor,
                            ),
                          }}
                        >
                          {/* Left Side: Thumbnail/Icon space (always exactly 64px/w-16 wide to match right side for perfect centering) */}
                          <div className="w-16 flex items-center justify-center shrink-0">
                            {link.icon && (
                              <div
                                className="w-10 h-10 overflow-hidden relative shrink-0 flex items-center justify-center"
                                style={{
                                  borderRadius:
                                    buttonCorner === "full"
                                      ? "9999px"
                                      : borderRadius,
                                }}
                              >
                                <ThumbnailIcon
                                  icon={link.icon}
                                  className="w-full h-full object-cover"
                                  fill={false}
                                />
                              </div>
                            )}
                          </div>

                          {/* Center: Title (Perfectly centered because left & right columns are exactly the same width) */}
                          <span className="flex-1 text-center font-bold text-xs tracking-wide truncate px-2">
                            {link.title}
                          </span>

                          {/* Right Dots Option Menu (perfectly balances the left w-16 thumbnail container) */}
                          <div className="w-16 shrink-0 flex items-center justify-center opacity-45">
                            <DotsThreeVerticalIcon className="h-4.5 w-4.5" />
                          </div>
                        </button>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>

              {/* Footer */}
              {!hideFooter && (
                <div className="mt-8 mb-4 text-center w-full shrink-0 px-6 relative z-10">
                  {customFooterUrl ? (
                    <a
                      href={customFooterUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] hover:underline transition-all"
                      style={{ color: `${pageTextColor}44` }}
                    >
                      {customFooterText || "Buat Linkora-mu"}
                    </a>
                  ) : (
                    <p
                      className="text-[11px]"
                      style={{ color: `${pageTextColor}44` }}
                    >
                      {customFooterText || "Buat Linkora-mu"}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Home Indicator Bar */}
        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-28 h-1 rounded-full bg-neutral-800/80 z-30 pointer-events-none" />
      </div>
    </div>
  );
}
