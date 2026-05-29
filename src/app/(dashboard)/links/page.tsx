"use client";

import {
  ArchiveIcon,
  CaretRightIcon,
  FolderIcon,
  PlusIcon,
  ShareNetworkIcon,
} from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AddLinkDialog } from "@/components/dashboard/links/add-link-dialog";
import { SortableLinkList } from "@/components/dashboard/links/sortable-link-list";
import { PreviewPanel } from "@/components/dashboard/preview-panel";
import { ProfileEditor } from "@/components/dashboard/profile-editor";
import { Button } from "@/components/ui/button";
import { type Link, useLinks } from "@/hooks/use-links";

interface UserData {
  username: string;
  name: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  bannerUrl: string | null;
  avatarShape: string;
  wallpaperStyle: string;
  wallpaperColor: string;
  wallpaperGradient: string;
  gradientDirection: string;
  gradientNoise: boolean;
  wallpaperPattern: string;
  wallpaperImageUrl: string | null;
  wallpaperVideoUrl: string | null;
  videoCropX: number | null;
  videoCropY: number | null;
  videoCropWidth: number | null;
  videoCropHeight: number | null;
  wallpaperBlur: number;
  imageEffect: string;
  imageTint: number;
  videoTint: number;
  buttonStyle: string;
  buttonCorner: string;
  buttonColor: string;
  buttonTextColor: string;
  buttonShadow: string;
  buttonShadowColor: string;
  pageFontFamily: string;
  pageTextColor: string;
  altTitleFont: boolean;
  titleFontFamily: string;
  titleColor: string;
  bioColor: string;
  headerLayout: string;
  hideFooter: boolean;
  customFooterText: string | null;
  customFooterUrl: string | null;
}

async function fetchUser(): Promise<UserData> {
  const res = await fetch("/api/user/me");
  if (!res.ok) throw new Error("Failed to fetch user");
  return res.json();
}

export default function LinksPage() {
  const { links, createLink } = useLinks();
  const { data: user } = useQuery({
    queryKey: ["user-me"],
    queryFn: fetchUser,
  });
  const [dialogOpen, setDialogOpen] = useState(false);

  const [domain, setDomain] = useState("");

  useEffect(() => {
    setDomain(window.location.host);
  }, []);

  function handleSubmit(data: Partial<Link>) {
    createLink(data);
  }

  const activeLinks = links.filter((l) => l.isActive);

  return (
    <div className="flex-1 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_420px] overflow-hidden h-full bg-background">
      {/* Editor Panel Column */}
      <div className="flex-1 flex flex-col overflow-y-auto h-full px-4 py-6 md:px-8 md:py-8 border-r">
        {/* Constrained & Centered Container */}
        <div className="w-full max-w-[640px] mx-auto flex flex-col gap-6">
          {/* Profile Editor */}
          <ProfileEditor />

          {/* Action Controls */}
          <div className="space-y-4">
            <Button
              onClick={() => setDialogOpen(true)}
              size="lg"
              className="w-full font-heading text-base font-bold h-12 rounded-full shadow-md transition-all bg-primary hover:bg-primary/95 text-primary-foreground"
            >
              <PlusIcon className="size-5 mr-1.5" />
              Add
            </Button>

            <div className="flex items-center justify-between gap-4">
              <Button
                variant="outline"
                className="font-heading text-sm rounded-full py-5.5 border-dashed border-border/80 hover:bg-muted transition-colors"
                onClick={() =>
                  toast.info("Add collection feature coming soon!")
                }
              >
                <FolderIcon className="size-4 mr-2" />
                Add collection
              </Button>
              <Button
                variant="ghost"
                className="font-heading text-sm text-muted-foreground hover:text-foreground hover:bg-transparent"
                onClick={() =>
                  toast.info("Add collection feature coming soon!")
                }
              >
                <ArchiveIcon className="size-4 mr-2" />
                View archive
                <CaretRightIcon className="size-3 ml-1" />
              </Button>
            </div>
          </div>

          {/* Links List */}
          <div className="space-y-4 pb-12">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-lg font-semibold">Your Links</h2>
              <span className="text-xs text-muted-foreground">
                Drag and drop to reorder
              </span>
            </div>
            <SortableLinkList />
          </div>
        </div>
      </div>

      {/* Mobile Preview Column */}
      <div className="hidden lg:flex flex-col items-center justify-center bg-muted/5 p-6 overflow-hidden h-full shrink-0">
        <div className="w-full max-w-[320px] h-full flex flex-col justify-center">
          {/* Linktree style top browser bar */}
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(
                `${window.location.origin}/${user?.username || ""}`,
              );
              toast.success("URL copied to clipboard!");
            }}
            className="group grid w-full grid-cols-[24px_1fr_24px] items-center bg-card border rounded-full px-4 py-2 mb-4 shadow-xs transition-all hover:bg-muted/60 hover:border-muted-foreground/30 active:scale-[0.99] cursor-pointer"
            title="Copy Link"
          >
            <span aria-hidden="true" />

            <span className="text-xs font-mono text-muted-foreground font-semi-bold truncate text-center transition-colors group-hover:text-foreground">
              {domain || "linkora.id"}/{user?.username || "username"}
            </span>

            <ShareNetworkIcon className="size-4 justify-self-end text-muted-foreground transition-colors group-hover:text-foreground" />
          </button>

          <div className="flex-1 overflow-hidden h-full">
            <PreviewPanel
              username={user?.username || ""}
              name={user?.displayName || user?.name}
              bio={user?.bio || undefined}
              avatarUrl={user?.avatarUrl}
              links={activeLinks}
              wallpaperStyle={user?.wallpaperStyle}
              wallpaperColor={user?.wallpaperColor}
              wallpaperGradient={user?.wallpaperGradient}
              buttonStyle={user?.buttonStyle}
              buttonCorner={user?.buttonCorner}
              buttonColor={user?.buttonColor}
              buttonTextColor={user?.buttonTextColor}
              buttonShadow={user?.buttonShadow}
              buttonShadowColor={user?.buttonShadowColor}
              pageFontFamily={user?.pageFontFamily}
              pageTextColor={user?.pageTextColor}
              titleColor={user?.titleColor}
              bioColor={user?.bioColor}
              headerLayout={user?.headerLayout}
              hideFooter={user?.hideFooter}
              customFooterText={user?.customFooterText}
              customFooterUrl={user?.customFooterUrl}
              wallpaperImageUrl={user?.wallpaperImageUrl}
              wallpaperVideoUrl={user?.wallpaperVideoUrl}
              gradientNoise={user?.gradientNoise}
              wallpaperBlur={user?.wallpaperBlur}
              videoCropX={user?.videoCropX}
              videoCropY={user?.videoCropY}
              videoCropWidth={user?.videoCropWidth}
              videoCropHeight={user?.videoCropHeight}
              imageEffect={user?.imageEffect}
              imageTint={user?.imageTint}
              videoTint={user?.videoTint}
              bannerUrl={user?.bannerUrl}
              avatarShape={user?.avatarShape}
            />
          </div>
        </div>
      </div>

      <AddLinkDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        editLink={null}
      />
    </div>
  );
}
