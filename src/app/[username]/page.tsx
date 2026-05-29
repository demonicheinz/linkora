import { cacheLife, cacheTag } from "next/cache";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PublicPageClient } from "@/components/public/public-page-client";
import { prisma } from "@/lib/db";

async function getPublicData(username: string) {
  "use cache";
  cacheTag("public-page");
  cacheLife("minutes");

  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      name: true,
      username: true,
      bio: true,
      avatarUrl: true,
      bannerUrl: true,

      // Profile display
      displayName: true,

      // Design
      headerLayout: true,
      avatarShape: true,
      wallpaperStyle: true,
      wallpaperColor: true,
      wallpaperGradient: true,
      gradientDirection: true,
      gradientNoise: true,
      wallpaperPattern: true,
      wallpaperImageUrl: true,
      wallpaperVideoUrl: true,
      videoCropX: true,
      videoCropY: true,
      videoCropWidth: true,
      videoCropHeight: true,
      wallpaperBlur: true,
      imageEffect: true,
      imageTint: true,
      videoTint: true,
      pageFontFamily: true,
      pageTextColor: true,
      titleColor: true,
      bioColor: true,
      buttonStyle: true,
      buttonShadow: true,
      buttonCorner: true,
      buttonColor: true,
      buttonTextColor: true,
      buttonShadowColor: true,
      hideFooter: true,
      customFooterText: true,
      customFooterUrl: true,

      links: {
        where: { isActive: true },
        orderBy: [{ isPinned: "desc" }, { order: "asc" }],
        select: {
          id: true,
          title: true,
          url: true,
          icon: true,
          color: true,
          isActive: true,
        },
      },
    },
  });

  return user;
}

// Inner server component — resolves params inside Suspense, then fetches cached data
async function PublicPageContent({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const user = await getPublicData(username);

  if (!user) {
    notFound();
  }

  return (
    <PublicPageClient
      username={user.username}
      name={user.name}
      bio={user.bio}
      avatarUrl={user.avatarUrl}
      bannerUrl={user.bannerUrl}
      links={user.links}
      displayName={user.displayName}
      headerLayout={user.headerLayout}
      avatarShape={user.avatarShape || "flower"}
      wallpaperStyle={user.wallpaperStyle}
      wallpaperColor={user.wallpaperColor}
      wallpaperGradient={user.wallpaperGradient}
      gradientDirection={user.gradientDirection}
      gradientNoise={user.gradientNoise}
      wallpaperPattern={user.wallpaperPattern}
      wallpaperImageUrl={user.wallpaperImageUrl}
      wallpaperVideoUrl={user.wallpaperVideoUrl}
      videoCropX={user.videoCropX}
      videoCropY={user.videoCropY}
      videoCropWidth={user.videoCropWidth}
      videoCropHeight={user.videoCropHeight}
      wallpaperBlur={user.wallpaperBlur}
      imageEffect={user.imageEffect}
      imageTint={user.imageTint}
      videoTint={user.videoTint}
      pageFontFamily={user.pageFontFamily}
      pageTextColor={user.pageTextColor}
      titleColor={user.titleColor}
      bioColor={user.bioColor}
      buttonStyle={user.buttonStyle}
      buttonShadow={user.buttonShadow}
      buttonCorner={user.buttonCorner}
      buttonColor={user.buttonColor}
      buttonTextColor={user.buttonTextColor}
      buttonShadowColor={user.buttonShadowColor}
      hideFooter={user.hideFooter}
      customFooterText={user.customFooterText}
      customFooterUrl={user.customFooterUrl}
    />
  );
}

// Outer page component — passes params Promise into Suspense, never awaits it here
export default function PublicPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  return (
    <Suspense fallback={null}>
      <PublicPageContent params={params} />
    </Suspense>
  );
}
