"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { useState } from "react";
import { ClickTracker } from "@/components/public/click-tracker";
import { LinkButton } from "@/components/public/link-button";
import { ProfileHeader } from "@/components/public/profile-header";
import { QRCodeDisplay } from "@/components/public/qr-code-display";
import { ShareButton } from "@/components/public/share-button";
import { ViewTracker } from "@/components/public/view-tracker";
import { cn } from "@/lib/utils";

interface PublicPageClientProps {
  username: string;
  name: string;
  bio: string | null;
  avatarUrl: string | null;
  bannerUrl: string | null;
  links: Array<{
    id: string;
    title: string;
    url: string;
    icon: string | null;
    color: string | null;
    isActive: boolean;
  }>;
  // Design fields
  displayName: string | null;
  headerLayout: string;
  avatarShape?: string;
  wallpaperStyle: string;
  wallpaperColor: string;
  wallpaperGradient: string;
  gradientDirection: string;
  gradientNoise: boolean;
  wallpaperPattern: string;
  wallpaperImageUrl: string | null;
  wallpaperVideoUrl?: string | null;
  videoCropX?: number | null;
  videoCropY?: number | null;
  videoCropWidth?: number | null;
  videoCropHeight?: number | null;
  wallpaperBlur: number;
  imageEffect?: string;
  imageTint?: number;
  videoTint?: number;
  pageFontFamily: string;
  pageTextColor: string;
  titleColor: string;
  bioColor: string;
  buttonStyle: string;
  buttonShadow: string;
  buttonCorner: string;
  buttonColor: string;
  buttonTextColor: string;
  buttonShadowColor: string;
  hideFooter: boolean;
  customFooterText?: string | null;
  customFooterUrl?: string | null;
}

function getBackgroundStyle(props: PublicPageClientProps): React.CSSProperties {
  switch (props.wallpaperStyle) {
    case "gradient":
      return { background: props.wallpaperGradient };
    case "blur":
      return {
        backgroundColor: props.wallpaperColor,
      };
    case "pattern":
      return {
        backgroundColor: props.wallpaperColor,
        backgroundImage: getPatternCSS(props.wallpaperPattern),
      };
    case "image":
    case "video":
      return {
        backgroundColor: props.wallpaperColor,
      };
    case "fill":
    default:
      return { backgroundColor: props.wallpaperColor };
  }
}

function getPatternCSS(pattern: string): string {
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

export function PublicPageClient(props: PublicPageClientProps) {
  const {
    username,
    name,
    bio,
    avatarUrl,
    bannerUrl,
    links,
    displayName,
    headerLayout,
    avatarShape = "flower",
    wallpaperStyle,
    wallpaperColor,
    wallpaperGradient,
    // wallpaperPattern,
    wallpaperImageUrl,
    wallpaperVideoUrl,
    videoCropX,
    videoCropY,
    videoCropWidth,
    videoCropHeight,
    wallpaperBlur,
    imageEffect = "none",
    imageTint = 10,
    videoTint = 10,
    gradientNoise = false,
    pageFontFamily,
    pageTextColor,
    titleColor,
    bioColor,
    buttonStyle,
    buttonShadow,
    buttonCorner,
    buttonColor,
    buttonTextColor,
    buttonShadowColor,
    hideFooter,
    customFooterText,
    customFooterUrl,
  } = props;

  const [clickedLinks, setClickedLinks] = useState<Set<string>>(new Set());

  const bgStyle = getBackgroundStyle(props);
  const activeLinks = links.filter((l) => l.isActive);
  const qrUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/${username}`
      : "";
  const profileName = displayName || name;
  const font =
    pageFontFamily === "public-sans"
      ? "'Public Sans', sans-serif"
      : "Inter, sans-serif";

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-0 sm:py-16 sm:px-4 relative overflow-y-auto bg-[#0A0A0A]"
      style={{ fontFamily: font }}
    >
      {/* Blurred immersive backdrop shadow on desktop */}
      {wallpaperStyle === "image" && wallpaperImageUrl && (
        <div
          className="absolute inset-0 bg-cover bg-center blur-3xl opacity-30 scale-110 pointer-events-none select-none hidden sm:block animate-fade-in"
          style={{ backgroundImage: `url(${wallpaperImageUrl})` }}
        />
      )}
      {wallpaperStyle === "gradient" && wallpaperGradient && (
        <div
          className="absolute inset-0 blur-3xl opacity-20 pointer-events-none select-none hidden sm:block"
          style={{ background: wallpaperGradient }}
        />
      )}
      {wallpaperStyle === "fill" && wallpaperColor && (
        <div
          className="absolute inset-0 opacity-15 pointer-events-none select-none hidden sm:block"
          style={{ backgroundColor: wallpaperColor }}
        />
      )}

      {/* View tracker */}
      <ViewTracker username={username} />

      {/* High-Fidelity Smartphone/Profile Centered Wrapper Card */}
      <div
        className="relative w-full min-h-screen sm:min-h-[820px] sm:max-w-[430px] sm:rounded-[40px] sm:border sm:border-white/10 sm:shadow-2xl flex flex-col justify-between p-0 pb-16 z-10"
        style={{
          ...bgStyle,
          backgroundSize:
            wallpaperStyle === "pattern" ? "40px 40px" : undefined,
        }}
      >
        {/* Background Overlays for Image / Video / Blur */}
        {(wallpaperStyle === "image" ||
          wallpaperStyle === "video" ||
          wallpaperStyle === "blur") && (
          <div
            className="absolute inset-0 -z-10 overflow-hidden pointer-events-none select-none rounded-[inherit]"
            style={{
              transform: "translateZ(0)",
              WebkitMaskImage: "-webkit-radial-gradient(white, black)",
            }}
          >
            {wallpaperStyle === "image" && wallpaperImageUrl && (
              <Image
                src={wallpaperImageUrl}
                alt="Wallpaper"
                fill
                priority
                sizes="100vw"
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

        <div className="absolute top-5 right-5 z-50 pointer-events-none">
          <div className="pointer-events-auto">
            <ShareButton
              url={qrUrl}
              title={`${profileName}'s Links`}
              themeColor={pageTextColor}
            />
          </div>
        </div>

        <motion.div
          className="w-full flex-1 flex flex-col justify-start"
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.1 } },
            hidden: {},
          }}
        >
          <motion.div
            variants={{
              hidden: { opacity: 0, scale: 0.9, y: 20 },
              visible: {
                opacity: 1,
                scale: 1,
                y: 0,
                transition: { type: "spring", stiffness: 300, damping: 20 },
              },
            }}
          >
            <ProfileHeader
              name={profileName}
              bio={bio}
              avatarUrl={avatarUrl}
              bannerUrl={bannerUrl}
              fontFamily={pageFontFamily}
              headerLayout={headerLayout}
              avatarShape={avatarShape}
              titleColor={titleColor}
              bioColor={bioColor}
              pageTextColor={pageTextColor}
              wallpaperColor={wallpaperColor}
            />
          </motion.div>

          <div className="mt-8 space-y-3 w-full px-6">
            {activeLinks.map((link) => (
              <motion.div
                key={link.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { type: "spring", stiffness: 300, damping: 24 },
                  },
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <LinkButton
                  title={link.title}
                  url={link.url}
                  icon={link.icon}
                  color={link.color}
                  onClickTracking={() =>
                    setClickedLinks((prev) => new Set(prev).add(link.id))
                  }
                  buttonStyle={buttonStyle}
                  buttonCorner={buttonCorner}
                  buttonColor={buttonColor}
                  buttonTextColor={buttonTextColor}
                  buttonShadow={buttonShadow}
                  buttonShadowColor={buttonShadowColor}
                />
                {clickedLinks.has(link.id) && (
                  <ClickTracker linkId={link.id} onTracked={() => {}} />
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Footer */}
        {!hideFooter && (
          <div className="mt-12 mb-8 text-center w-full shrink-0 px-6">
            {customFooterUrl ? (
              <a
                href={customFooterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs hover:underline transition-all"
                style={{ color: `${pageTextColor}44` }}
              >
                {customFooterText || "Buat Linkora-mu"}
              </a>
            ) : (
              <p className="text-xs" style={{ color: `${pageTextColor}44` }}>
                {customFooterText || "Buat Linkora-mu"}
              </p>
            )}
          </div>
        )}
      </div>

      <QRCodeDisplay url={qrUrl} fgColor={buttonColor} />
    </div>
  );
}
