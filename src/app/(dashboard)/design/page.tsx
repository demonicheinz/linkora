"use client";

import {
  ArrowArcLeftIcon,
  ArrowArcRightIcon,
  AsteriskIcon,
  ShareNetworkIcon,
  TextAaIcon,
  UserIcon,
  XIcon,
} from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ButtonsTab } from "@/components/dashboard/design/tabs/buttons-tab";
import { ColorsTab } from "@/components/dashboard/design/tabs/colors-tab";
import { FooterTab } from "@/components/dashboard/design/tabs/footer-tab";
import { HeaderTab } from "@/components/dashboard/design/tabs/header-tab";
import { TextTab } from "@/components/dashboard/design/tabs/text-tab";
import { ThemeTab } from "@/components/dashboard/design/tabs/theme-tab";
import { WallpaperTab } from "@/components/dashboard/design/tabs/wallpaper-tab";
import { PreviewPanel } from "@/components/dashboard/preview-panel";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useLinks } from "@/hooks/use-links";
import { cn } from "@/lib/utils";
import { type DesignState, useDesignStore } from "@/store/design-store";

interface UserData extends DesignState {
  name: string;
  username: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
}

async function fetchUser(): Promise<UserData> {
  const res = await fetch("/api/user/me");
  if (!res.ok) throw new Error("Failed to fetch user");
  return res.json();
}

async function updateUser(data: Partial<DesignState>) {
  const res = await fetch("/api/user/me", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to update");
  }
  return res.json();
}

const tabs = [
  { id: "theme", label: "Theme", hash: "#theme" },
  { id: "header", label: "Header", hash: "#header" },
  { id: "wallpaper", label: "Wallpaper", hash: "#wallpaper" },
  { id: "text", label: "Text", hash: "#text" },
  { id: "buttons", label: "Buttons", hash: "#button" },
  { id: "colors", label: "Colors", hash: "#colors" },
  { id: "footer", label: "Footer", hash: "#footer" },
] as const;

// High-fidelity vertical and bottom tab menu icons exactly replicating the screenshots
const customIcons: Record<string, React.ReactNode> = {
  theme: (
    <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center font-bold text-xs shrink-0 select-none border border-neutral-300 dark:border-neutral-700">
      <TextAaIcon className="h-5 w-5" weight="bold" />
    </div>
  ),
  header: (
    <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 flex items-center justify-center text-neutral-500 shrink-0 select-none">
      <UserIcon className="h-7 w-7" weight="bold" />
    </div>
  ),
  wallpaper: (
    <div className="w-8 h-8 rounded-lg bg-black border border-neutral-700 shrink-0 select-none" />
  ),
  text: (
    <div className="w-8 h-8 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-black dark:text-white flex items-center justify-center font-semibold text-xs shrink-0 select-none">
      <TextAaIcon className="h-5 w-5" weight="bold" />
    </div>
  ),
  buttons: (
    <div className="w-8 h-8 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 flex items-center justify-center p-1.5 shrink-0 select-none">
      <div className="w-full h-full rounded-sm bg-black dark:bg-white" />
    </div>
  ),
  colors: (
    <div className="w-8 h-8 rounded-full border border-neutral-300 dark:border-neutral-700 overflow-hidden flex shrink-0 select-none">
      <div className="w-1/2 h-full bg-white dark:bg-neutral-800" />
      <div className="w-1/2 h-full bg-black dark:bg-white" />
    </div>
  ),
  footer: (
    <div className="w-8 h-8 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 flex items-center justify-center text-neutral-800 dark:text-white font-bold text-sm shrink-0 select-none">
      <AsteriskIcon className="h-5 w-5" weight="bold" />
    </div>
  ),
};

export default function DesignPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useQuery({
    queryKey: ["user-me"],
    queryFn: fetchUser,
  });
  const { links } = useLinks();
  const store = useDesignStore();

  const [activeTab, setActiveTab] = useState<string>("theme");
  const [activeMobileTab, setActiveMobileTab] = useState<string | null>(null);

  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);

  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [touchCurrentY, setTouchCurrentY] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [domain, setDomain] = useState("");

  useEffect(() => {
    setDomain(window.location.host);
  }, []);

  function handleTouchStart(e: React.TouchEvent) {
    setTouchStartY(e.touches[0].clientY);
    setTouchCurrentY(e.touches[0].clientY);
    setIsDragging(true);
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (touchStartY === null) return;
    const currentY = e.touches[0].clientY;
    if (currentY > touchStartY) {
      setTouchCurrentY(currentY);
    }
  }

  function handleTouchEnd() {
    if (touchStartY !== null && touchCurrentY !== null) {
      const diffY = touchCurrentY - touchStartY;
      if (diffY > 80) {
        setActiveMobileTab(null);
      }
    }
    setTouchStartY(null);
    setTouchCurrentY(null);
    setIsDragging(false);
  }

  const dragOffset =
    isDragging && touchCurrentY !== null && touchStartY !== null
      ? Math.max(0, touchCurrentY - touchStartY)
      : 0;

  const bottomSheetStyle = {
    transform: activeMobileTab
      ? `translateY(${dragOffset}px)`
      : "translateY(100%)",
    transition: isDragging
      ? "none"
      : "transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
  };

  // Initialize store from server data
  // biome-ignore lint/correctness/useExhaustiveDependencies: Only initialize once when user data loads or when there are no unsaved changes
  useEffect(() => {
    if (user && (!store.originalState || !store.isDirty)) {
      store.initializeFromServer({
        theme: user.theme,
        headerLayout: user.headerLayout,
        wallpaperStyle: user.wallpaperStyle,
        wallpaperColor: user.wallpaperColor,
        wallpaperGradient: user.wallpaperGradient,
        gradientDirection: user.gradientDirection,
        gradientNoise: user.gradientNoise,
        wallpaperPattern: user.wallpaperPattern,
        wallpaperImageUrl: user.wallpaperImageUrl,
        wallpaperVideoUrl: user.wallpaperVideoUrl,
        videoCropX: user.videoCropX,
        videoCropY: user.videoCropY,
        videoCropWidth: user.videoCropWidth,
        videoCropHeight: user.videoCropHeight,
        wallpaperBlur: user.wallpaperBlur,
        imageEffect: user.imageEffect,
        imageTint: user.imageTint,
        videoTint: user.videoTint,
        pageFontFamily: user.pageFontFamily,
        pageTextColor: user.pageTextColor,
        altTitleFont: user.altTitleFont,
        titleFontFamily: user.titleFontFamily,
        titleColor: user.titleColor,
        bioColor: user.bioColor,
        buttonStyle: user.buttonStyle,
        buttonShadow: user.buttonShadow,
        buttonCorner: user.buttonCorner,
        buttonColor: user.buttonColor,
        buttonTextColor: user.buttonTextColor,
        buttonShadowColor: user.buttonShadowColor,
        hideFooter: user.hideFooter,
        customFooterText: user.customFooterText,
        customFooterUrl: user.customFooterUrl,
        displayName: user.displayName || user.name || "",
        bannerUrl: user.bannerUrl || null,
        avatarShape: user.avatarShape,
      });
    }
  }, [user]);

  // Synchronize hash fragment with active states
  useEffect(() => {
    function handleHashChange() {
      const hash = window.location.hash;
      if (hash) {
        const matched = tabs.find((t) => t.hash === hash);
        if (matched) {
          setActiveTab(matched.id);
          setActiveMobileTab(matched.id);
          return;
        }
      }
      // Default fallback
      setActiveTab("theme");
    }

    // Run on initial mount
    handleHashChange();

    window.addEventListener("hashchange", handleHashChange);
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  // Intercept browser page refresh/close when design has unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (store.isDirty) {
        e.preventDefault();
        e.returnValue =
          "You have unsaved changes. Are you sure you want to leave?";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [store.isDirty]);

  // Intercept all link clicks in document when design has unsaved changes
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      if (!store.isDirty) return;

      let target = e.target as HTMLElement | null;
      while (target && target.tagName !== "A") {
        target = target.parentElement;
      }

      if (target && target instanceof HTMLAnchorElement) {
        const href = target.getAttribute("href");

        // Only intercept normal navigation links (ignore hash triggers, void, etc.)
        if (href && !href.startsWith("#") && !href.startsWith("javascript:")) {
          e.preventDefault();
          setPendingUrl(href);
          setShowDiscardDialog(true);
        }
      }
    };

    document.addEventListener("click", handleAnchorClick, true);
    return () => {
      document.removeEventListener("click", handleAnchorClick, true);
    };
  }, [store.isDirty]);

  const navigateTo = (url: string) => {
    if (url.startsWith("/") || url.startsWith(window.location.origin)) {
      router.push(url);
    } else {
      window.location.href = url;
    }
  };

  const handleSaveAndNavigate = () => {
    mutation.mutate(store.getSavePayload(), {
      onSuccess: () => {
        if (pendingUrl) {
          navigateTo(pendingUrl);
          setPendingUrl(null);
        }
        setShowDiscardDialog(false);
      },
    });
  };

  // Auto-discard changes if component unmounts (e.g. user navigates away via browser back button)
  useEffect(() => {
    return () => {
      const currentStore = useDesignStore.getState();
      if (currentStore.isDirty) {
        currentStore.discardChanges();
      }
    };
  }, []);

  const handleDiscardChanges = () => {
    store.discardChanges();
    setShowDiscardDialog(false);
    if (pendingUrl) {
      navigateTo(pendingUrl);
      setPendingUrl(null);
    }
  };

  const handleKeepEditing = () => {
    setPendingUrl(null);
    setShowDiscardDialog(false);
  };

  const mutation = useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-me"] });
      store.markClean();
      toast.success("Design saved!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  function handleSave() {
    mutation.mutate(store.getSavePayload());
  }

  function handleShare() {
    const url = `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/${user?.username || ""}`;
    if (navigator.share) {
      navigator.share({ title: "My Linkora", url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Link copied!");
    }
  }

  function handleTabChange(tabId: (typeof tabs)[number]["id"]) {
    setActiveTab(tabId);
    const matched = tabs.find((t) => t.id === tabId);
    if (matched) {
      window.location.hash = matched.hash;
    }
  }

  const activeLinks = links.filter((l) => l.isActive);

  function renderTabContent(tab: string | null) {
    switch (tab) {
      case "theme":
        return <ThemeTab />;
      case "header":
        return <HeaderTab />;
      case "wallpaper":
        return <WallpaperTab />;
      case "text":
        return <TextTab />;
      case "buttons":
        return <ButtonsTab />;
      case "colors":
        return <ColorsTab />;
      case "footer":
        return <FooterTab />;
      default:
        return null;
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 h-full overflow-hidden bg-background">
      {/* UNIFIED 3-COLUMN HEADER BAR */}
      <header className="flex h-14 shrink-0 items-center border-b bg-background select-none z-30">
        {/* Desktop Header Content (md:flex, hidden on mobile) */}
        <div className="hidden md:flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
          {/* Column 1: Sidebar Toggle & Page Title */}
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mx-2 h-10" />
            <h1 className="text-base font-bold font-heading text-foreground">
              Design
            </h1>
          </div>

          {/* Column 2 & 3: Undo/Redo/Save (Only if changes) & Theme Toggle (Far Right) */}
          <div className="ml-auto flex items-center">
            {/* Center-Right (Column 2): Undo, Redo, Save */}
            {store.isDirty && (
              <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-200 mr-2">
                <button
                  type="button"
                  onClick={store.undo}
                  disabled={!store.canUndo()}
                  className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                  title="Undo"
                >
                  <ArrowArcLeftIcon className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={store.redo}
                  disabled={!store.canRedo()}
                  className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                  title="Redo"
                >
                  <ArrowArcRightIcon className="h-5 w-5" />
                </button>

                <Button
                  onClick={handleSave}
                  disabled={mutation.isPending}
                  size="sm"
                  className="bg-primary hover:bg-primary/80 text-white font-heading rounded-full px-5 font-bold cursor-pointer"
                >
                  {mutation.isPending ? "Saving..." : "Save"}
                </Button>

                <Separator orientation="vertical" className="mx-2 h-10" />
              </div>
            )}

            {/* Far-Right (Column 3): Theme Toggle */}
            <ThemeToggle />
          </div>
        </div>

        {/* Mobile Header Content (md:hidden, visible on mobile) */}
        <div className="md:hidden flex w-full items-center justify-between px-4">
          {/* Column 1: Sidebar Toggle, Separator & Back Navigation */}
          <div className="flex items-center gap-1.5">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mx-2 h-10" />
            <h1 className="text-base font-bold font-heading text-foreground">
              Design
            </h1>
          </div>

          {/* Column 2 & 3: Mobile Actions (Undo/Redo/Save if dirty) + Theme Toggle */}
          <div className="flex items-center gap-1.5">
            {store.isDirty && (
              <div className="flex items-center gap-1 animate-in fade-in slide-in-from-right-2 duration-200">
                <button
                  type="button"
                  onClick={store.undo}
                  disabled={!store.canUndo()}
                  className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                  title="Undo"
                >
                  <ArrowArcLeftIcon className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={store.redo}
                  disabled={!store.canRedo()}
                  className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                  title="Redo"
                >
                  <ArrowArcRightIcon className="h-5 w-5" />
                </button>

                <Button
                  onClick={handleSave}
                  disabled={mutation.isPending}
                  size="sm"
                  className="bg-primary hover:bg-primary/80 text-white font-heading rounded-full px-4 text-xs font-bold cursor-pointer h-8 mr-2"
                >
                  {mutation.isPending ? "Saving..." : "Save"}
                </Button>

                <Separator orientation="vertical" className="mx-2 h-10" />
              </div>
            )}

            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Workspace Area (Desktop Grid Column) */}
      <div className="hidden lg:grid flex-1 grid-cols-[minmax(0,1fr)_420px] overflow-hidden h-full">
        {/* Left Side: Desktop Editor Workspace (split into Vertical Sidebar + Form Pane) */}
        <div className="hidden lg:flex flex-1 flex-row overflow-hidden h-full border-r relative bg-background">
          {/* Desktop Vertical Menu Sidebar */}
          <div className="w-[210px] shrink-0 border-r flex flex-col gap-1 py-6 px-3 bg-background z-10 select-none">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabChange(tab.id)}
                  className={cn(
                    "flex items-center gap-3 w-full rounded-2xl px-3 py-2 text-sm font-semibold transition-all cursor-pointer text-left",
                    isActive
                      ? "bg-neutral-100 dark:bg-neutral-800 text-foreground"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                  )}
                >
                  {customIcons[tab.id]}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Desktop Active Tab Form Pane (Scrollable settings) */}
          <div className="flex-1 overflow-y-auto h-full p-8 bg-background scroll-smooth">
            <div className="w-full max-w-[640px] mx-auto flex flex-col gap-6">
              <h2 className="font-heading text-2xl font-bold capitalize select-none">
                {activeTab === "theme" ? "Themes" : activeTab}
              </h2>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                >
                  {renderTabContent(activeTab)}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Right Side: Desktop Fixed Mobile Preview Panel */}
        <div className="hidden lg:flex flex-col items-center justify-center bg-muted/5 p-6 overflow-hidden h-full border-l shrink-0">
          <div className="w-full max-w-[320px] h-full flex flex-col justify-center">
            {/* Linktree style top browser bar */}
            <button
              type="button"
              onClick={handleShare}
              className="group grid w-full grid-cols-[24px_1fr_24px] items-center bg-card border rounded-full px-4 py-2 mb-4 shadow-xs transition-all hover:bg-muted/60 hover:border-muted-foreground/30 active:scale-[0.99] cursor-pointer"
              title="Copy Link"
            >
              <span aria-hidden="true" />
              <span className="text-xs font-mono text-muted-foreground font-semibold truncate text-center transition-colors group-hover:text-foreground">
                {domain || "linkora.id"}/{user?.username || "username"}
              </span>
              <ShareNetworkIcon className="size-4 justify-self-end text-muted-foreground transition-colors group-hover:text-foreground" />
            </button>

            <div className="flex-1 overflow-hidden h-full">
              <PreviewPanel
                username={user?.username || ""}
                name={
                  store.state.displayName || user?.displayName || user?.name
                }
                bio={user?.bio || undefined}
                avatarUrl={user?.avatarUrl}
                links={activeLinks}
                wallpaperStyle={store.state.wallpaperStyle}
                wallpaperColor={store.state.wallpaperColor}
                wallpaperGradient={store.state.wallpaperGradient}
                buttonStyle={store.state.buttonStyle}
                buttonCorner={store.state.buttonCorner}
                buttonColor={store.state.buttonColor}
                buttonTextColor={store.state.buttonTextColor}
                buttonShadow={store.state.buttonShadow}
                buttonShadowColor={store.state.buttonShadowColor}
                pageFontFamily={store.state.pageFontFamily}
                pageTextColor={store.state.pageTextColor}
                titleColor={store.state.titleColor}
                bioColor={store.state.bioColor}
                headerLayout={store.state.headerLayout}
                hideFooter={store.state.hideFooter}
                customFooterText={store.state.customFooterText}
                customFooterUrl={store.state.customFooterUrl}
                wallpaperImageUrl={store.state.wallpaperImageUrl}
                wallpaperVideoUrl={store.state.wallpaperVideoUrl}
                gradientNoise={store.state.gradientNoise}
                wallpaperBlur={store.state.wallpaperBlur}
                videoCropX={store.state.videoCropX}
                videoCropY={store.state.videoCropY}
                videoCropWidth={store.state.videoCropWidth}
                videoCropHeight={store.state.videoCropHeight}
                imageEffect={store.state.imageEffect}
                imageTint={store.state.imageTint}
                videoTint={store.state.videoTint}
                bannerUrl={store.state.bannerUrl}
                avatarShape={store.state.avatarShape}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. MOBILE VIEW CONTROLLERS (visible on mobile, hidden on lg+) */}
      <div className="lg:hidden flex flex-col h-full w-full overflow-hidden relative bg-[#f6f7f5] dark:bg-neutral-950">
        {/* Mobile Central Preview Screen Area */}
        <div className="w-full flex-1 flex flex-col items-center justify-center pb-32 min-h-0 h-full relative overflow-hidden">
          <div
            className={cn(
              "w-[280px] h-[520px] max-h-full flex flex-col justify-center transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] origin-center transform",
              activeMobileTab
                ? "-translate-y-[12vh] scale-95"
                : "translate-y-0 scale-100",
            )}
          >
            <PreviewPanel
              username={user?.username || ""}
              name={store.state.displayName || user?.displayName || user?.name}
              bio={user?.bio || undefined}
              avatarUrl={user?.avatarUrl}
              links={activeLinks}
              wallpaperStyle={store.state.wallpaperStyle}
              wallpaperColor={store.state.wallpaperColor}
              wallpaperGradient={store.state.wallpaperGradient}
              buttonStyle={store.state.buttonStyle}
              buttonCorner={store.state.buttonCorner}
              buttonColor={store.state.buttonColor}
              buttonTextColor={store.state.buttonTextColor}
              buttonShadow={store.state.buttonShadow}
              buttonShadowColor={store.state.buttonShadowColor}
              pageFontFamily={store.state.pageFontFamily}
              pageTextColor={store.state.pageTextColor}
              titleColor={store.state.titleColor}
              bioColor={store.state.bioColor}
              headerLayout={store.state.headerLayout}
              hideFooter={store.state.hideFooter}
              customFooterText={store.state.customFooterText}
              customFooterUrl={store.state.customFooterUrl}
              wallpaperImageUrl={store.state.wallpaperImageUrl}
              wallpaperVideoUrl={store.state.wallpaperVideoUrl}
              gradientNoise={store.state.gradientNoise}
              wallpaperBlur={store.state.wallpaperBlur}
              videoCropX={store.state.videoCropX}
              videoCropY={store.state.videoCropY}
              videoCropWidth={store.state.videoCropWidth}
              videoCropHeight={store.state.videoCropHeight}
              imageEffect={store.state.imageEffect}
              imageTint={store.state.imageTint}
              videoTint={store.state.videoTint}
              bannerUrl={store.state.bannerUrl}
              avatarShape={store.state.avatarShape}
            />
          </div>
        </div>

        {/* Mobile Dynamic Sliding Bottom Sheet Drawer */}
        <div
          style={bottomSheetStyle}
          className={cn(
            "fixed bottom-0 left-0 right-0 bg-background rounded-t-[28px] border-t border-border/80 shadow-2xl z-40 flex flex-col select-none touch-none",
            activeMobileTab ? "h-[38vh] max-h-[38vh]" : "h-0",
          )}
        >
          {/* Drag Handle Area */}
          <div
            className="w-full py-4 cursor-grab active:cursor-grabbing shrink-0 flex items-center justify-center"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="w-14 h-1.5 bg-neutral-300 dark:bg-neutral-700 rounded-full transition-colors duration-200" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-6 pb-2 shrink-0">
            <h3 className="font-heading text-lg font-bold capitalize">
              {activeMobileTab === "theme" ? "Themes" : activeMobileTab}
            </h3>
            <button
              type="button"
              onClick={() => setActiveMobileTab(null)}
              className="p-1 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 text-muted-foreground hover:text-foreground shrink-0 cursor-pointer"
              aria-label="Close settings"
            >
              <XIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Scrollable Content inside Bottom Sheet */}
          <div className="flex-1 overflow-y-auto px-6 pb-8 min-h-0 touch-pan-y select-text">
            <AnimatePresence mode="wait">
              {activeMobileTab && (
                <motion.div
                  key={activeMobileTab}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {renderTabContent(activeMobileTab)}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Mobile sticky Bottom Navigation Tab Bar (horizonally scrollable overlay) */}
        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 h-16 bg-background border-t z-30 select-none flex items-center shadow-md transition-all duration-300 transform",
            activeMobileTab
              ? "translate-y-full opacity-0 pointer-events-none"
              : "translate-y-0 opacity-100",
          )}
        >
          <div className="flex items-center gap-1.5 px-4 overflow-x-auto whitespace-nowrap scrollbar-none w-full h-full">
            {tabs.map((tab) => {
              const isActive = activeMobileTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    if (activeMobileTab === tab.id) {
                      setActiveMobileTab(null);
                    } else {
                      setActiveMobileTab(tab.id);
                      setActiveTab(tab.id);
                    }
                  }}
                  className={cn(
                    "flex flex-col items-center justify-center min-w-[64px] px-2 h-full text-[10px] font-bold gap-1 shrink-0 transition-all cursor-pointer relative",
                    isActive
                      ? "text-primary scale-105"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <div
                    className={cn(
                      "scale-[0.85] origin-center",
                      isActive &&
                        "ring-2 ring-primary rounded-xl ring-offset-2",
                    )}
                  >
                    {customIcons[tab.id]}
                  </div>
                  <span>{tab.label}</span>
                  {tab.id === "header" && (
                    <span className="absolute top-1 right-3 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Save Changes Unsaved Warning Dialog Modal */}
      <Dialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
        <DialogContent
          className="sm:max-w-[400px] p-6 rounded-[28px] md:rounded-[28px]"
          showCloseButton={true}
        >
          <div className="flex flex-col items-center text-center px-2 py-4">
            <DialogTitle className="text-xl font-bold font-heading text-neutral-900 dark:text-white mb-2">
              Save changes?
            </DialogTitle>
            <DialogDescription className="text-[15px] text-neutral-600 dark:text-neutral-400 mb-8 max-w-[280px]">
              Once saved, they'll appear on your profile.
            </DialogDescription>

            <div className="flex flex-col gap-3 w-full">
              <button
                type="button"
                onClick={handleSaveAndNavigate}
                disabled={mutation.isPending}
                className="w-full bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 py-3.5 px-4 rounded-full font-bold text-[15px] hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-all duration-200 active:scale-[0.99] disabled:opacity-50 cursor-pointer"
              >
                {mutation.isPending ? "Saving changes..." : "Save changes"}
              </button>

              <button
                type="button"
                onClick={handleDiscardChanges}
                className="w-full border border-red-500 text-red-600 dark:text-red-500 bg-transparent py-3.5 px-4 rounded-full font-bold text-[15px] hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-200 active:scale-[0.99] cursor-pointer"
              >
                Discard changes
              </button>

              <button
                type="button"
                onClick={handleKeepEditing}
                className="w-full border border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 bg-transparent py-3.5 px-4 rounded-full font-bold text-[15px] hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-all duration-200 active:scale-[0.99] cursor-pointer"
              >
                Keep editing
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
