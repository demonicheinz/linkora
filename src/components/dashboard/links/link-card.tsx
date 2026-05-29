"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ArchiveIcon,
  ArrowSquareOutIcon,
  ArrowsSplitIcon,
  ArrowUpIcon,
  ChartBarIcon,
  ClockIcon,
  DotsSixVerticalIcon,
  ImageIcon,
  LayoutIcon,
  LockIcon,
  PencilSimpleIcon,
  ShareNetworkIcon,
  StarIcon,
  TrashIcon,
  XIcon,
} from "@phosphor-icons/react";
import * as React from "react";
import { useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { toast } from "sonner";
import { ThumbnailIcon } from "@/components/dashboard/links/thumbnail-icon";
import { ThumbnailPicker } from "@/components/dashboard/links/thumbnail-picker";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useLinkAnalytics } from "@/hooks/use-link-analytics";
import { type Link, useLinks } from "@/hooks/use-links";
import { cn } from "@/lib/utils";

interface LinkCardProps {
  link: Link;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, isActive: boolean) => void;
  activePanel: {
    linkId: string;
    type: "delete" | "thumbnail" | "analytics";
  } | null;
  onPanelToggle: (
    linkId: string,
    type: "delete" | "thumbnail" | "analytics",
  ) => void;
  onPanelClose: () => void;
}

export function LinkCard({
  link,
  onDelete,
  onToggleActive,
  activePanel,
  onPanelToggle,
  onPanelClose,
}: LinkCardProps) {
  const { updateLink } = useLinks();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleText, setTitleText] = useState(link.title);
  const [isEditingUrl, setIsEditingUrl] = useState(false);
  const [urlText, setUrlText] = useState(link.url);
  const isConfirmingDelete =
    activePanel?.linkId === link.id && activePanel?.type === "delete";
  const isManagingThumbnail =
    activePanel?.linkId === link.id && activePanel?.type === "thumbnail";
  const isViewingAnalytics =
    activePanel?.linkId === link.id && activePanel?.type === "analytics";
  const [dialogOpen, setDialogOpen] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  function saveTitle() {
    setIsEditingTitle(false);
    const trimmed = titleText.trim();
    if (trimmed && trimmed !== link.title) {
      updateLink({ id: link.id, data: { title: trimmed } });
    } else {
      setTitleText(link.title);
    }
  }

  function handleTitleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      saveTitle();
    } else if (e.key === "Escape") {
      setTitleText(link.title);
      setIsEditingTitle(false);
    }
  }

  function saveUrl() {
    setIsEditingUrl(false);
    const trimmed = urlText.trim();
    if (trimmed && trimmed !== link.url) {
      updateLink({ id: link.id, data: { url: trimmed } });
    } else {
      setUrlText(link.url);
    }
  }

  function handleUrlKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      saveUrl();
    } else if (e.key === "Escape") {
      setUrlText(link.url);
      setIsEditingUrl(false);
    }
  }

  // Pin / Star
  function togglePin() {
    updateLink({ id: link.id, data: { isPinned: !link.isPinned } });
  }

  // Share
  function handleShare() {
    if (navigator.share) {
      navigator
        .share({
          title: link.title,
          url: link.url,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(link.url);
      toast.success("Link URL copied to clipboard!");
    }
  }

  const clicks = link._count?.clicks ?? 0;
  const hasClicks = clicks > 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex flex-col overflow-hidden rounded-[32px] border bg-card hover:shadow-xs hover:border-border/80 transition-all w-full max-w-[640px] shadow-sm relative",
        isDragging && "opacity-50 shadow-lg z-10",
        isConfirmingDelete && "border-primary/45 shadow-md",
      )}
    >
      {/* Top Row: Main Card Contents */}
      <div className="w-full flex flex-row items-stretch pr-5 py-5">
        {/* Floating Drag Handle inside the card */}
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="w-10 flex items-center justify-center text-muted-foreground/30 hover:text-foreground/60 cursor-grab active:cursor-grabbing shrink-0 touch-none select-none transition-colors"
          aria-label="Drag to reorder"
        >
          <DotsSixVerticalIcon className="h-5 w-5" />
        </button>

        {/* Main Card Content Column */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Top Section: Thumbnail, Inputs, Share & Toggle */}
          <div className="flex items-start gap-4">
            {/* Conditional Thumbnail Box */}
            {link.icon && (
              <button
                type="button"
                onClick={() => {
                  if (isManagingThumbnail) {
                    onPanelClose();
                  } else {
                    onPanelToggle(link.id, "thumbnail");
                  }
                }}
                className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden shrink-0 border bg-muted cursor-pointer hover:opacity-80 transition-opacity focus:outline-hidden"
              >
                <ThumbnailIcon
                  icon={link.icon}
                  className="h-6 w-6 text-foreground/80"
                />
              </button>
            )}

            {/* Inline Text Editors */}
            <div className="flex-1 min-w-0 space-y-1.5 mt-0.5">
              {/* Title Editor */}
              <div className="flex items-center gap-2 group/title">
                {isEditingTitle ? (
                  <input
                    ref={(el) => el?.focus()}
                    type="text"
                    value={titleText}
                    onChange={(e) => setTitleText(e.target.value)}
                    onBlur={saveTitle}
                    onKeyDown={handleTitleKeyDown}
                    className="w-full text-[15px] font-semibold focus:outline-hidden p-0 bg-transparent border-b border-dashed border-muted-foreground/40 focus:border-solid focus:border-primary text-foreground"
                  />
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingTitle(true);
                        setTitleText(link.title);
                      }}
                      className="font-semibold text-[15px] hover:underline truncate max-w-[180px] sm:max-w-xs md:max-w-md block text-foreground/90 cursor-pointer text-left focus:outline-hidden"
                    >
                      {link.title}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingTitle(true);
                        setTitleText(link.title);
                      }}
                      className="text-muted-foreground/40 hover:text-foreground p-0.5 rounded transition-colors shrink-0 cursor-pointer"
                      aria-label="Edit title"
                    >
                      <PencilSimpleIcon className="h-3.5 w-3.5" />
                    </button>
                  </>
                )}
              </div>

              {/* URL Editor */}
              <div className="flex items-center gap-2 group/url">
                {isEditingUrl ? (
                  <input
                    ref={(el) => el?.focus()}
                    type="text"
                    value={urlText}
                    onChange={(e) => setUrlText(e.target.value)}
                    onBlur={saveUrl}
                    onKeyDown={handleUrlKeyDown}
                    className="w-full text-xs text-muted-foreground focus:outline-hidden p-0 bg-transparent font-mono border-b border-dashed border-muted-foreground/30 focus:border-solid focus:border-primary"
                  />
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingUrl(true);
                        setUrlText(link.url);
                      }}
                      className="text-xs text-muted-foreground/75 hover:underline truncate max-w-[180px] sm:max-w-xs md:max-w-md block font-mono cursor-pointer text-left focus:outline-hidden"
                    >
                      {link.url}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingUrl(true);
                        setUrlText(link.url);
                      }}
                      className="text-muted-foreground/40 hover:text-foreground p-0.5 rounded transition-colors shrink-0 cursor-pointer"
                      aria-label="Edit URL"
                    >
                      <PencilSimpleIcon className="h-3.5 w-3.5" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Right Action Switch: Share and Active Status */}
            <div className="flex items-center gap-3 shrink-0 ml-2 mt-1 select-none">
              {/* Share Button */}
              <button
                type="button"
                onClick={handleShare}
                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground/70 hover:text-foreground transition-colors cursor-pointer"
                title="Share Link"
              >
                <ShareNetworkIcon className="h-4.5 w-4.5" />
              </button>

              {/* Toggle switch */}
              <button
                type="button"
                onClick={() => onToggleActive(link.id, !link.isActive)}
                className={cn(
                  "relative inline-flex h-5.5 w-9.5 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-hidden cursor-pointer",
                  link.isActive ? "bg-green-500" : "bg-muted",
                )}
              >
                <span
                  className={cn(
                    "pointer-events-none block h-4.5 w-4.5 rounded-full bg-background shadow-xs ring-0 transition duration-200 ease-in-out",
                    link.isActive ? "translate-x-4" : "translate-x-0",
                  )}
                />
              </button>
            </div>
          </div>

          {/* Bottom Section: Utility Toolbar */}
          <div className="flex items-center justify-between text-muted-foreground/60 select-none">
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Layout Icon - Cooming Soon */}
              <button
                type="button"
                onClick={() => toast.info("Layout feature coming soon!")}
                className="p-1.5 rounded-md hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                title="Custom Layout"
              >
                <LayoutIcon className="h-4.5 w-4.5" />
              </button>

              {/* Thumbnail Image Icon */}
              <button
                type="button"
                onClick={() => {
                  if (isManagingThumbnail) {
                    onPanelClose();
                  } else {
                    onPanelToggle(link.id, "thumbnail");
                  }
                }}
                className={cn(
                  "p-1.5 rounded-md transition-colors cursor-pointer",
                  isManagingThumbnail
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "hover:bg-muted hover:text-foreground",
                )}
                title="Thumbnail"
              >
                <ImageIcon className="h-4.5 w-4.5" />
              </button>

              {/* Prioritize Icon */}
              <button
                type="button"
                onClick={togglePin}
                className={cn(
                  "p-1.5 rounded-md hover:bg-muted transition-colors cursor-pointer",
                  link.isPinned
                    ? "text-amber-500 hover:text-amber-600"
                    : "hover:text-foreground",
                )}
                title={link.isPinned ? "Unpin Link" : "Pin Link"}
              >
                <StarIcon
                  className="h-4.5 w-4.5"
                  weight={link.isPinned ? "fill" : "regular"}
                />
              </button>

              {/* Rules Icon */}
              <button
                type="button"
                onClick={() => toast.info("Rules feature coming soon!")}
                className="p-1.5 rounded-md hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                title="Rules"
              >
                <ArrowsSplitIcon className="h-4.5 w-4.5" />
              </button>

              {/* Schedule Icon */}
              <button
                type="button"
                onClick={() => toast.info("Schedule feature coming soon!")}
                className="p-1.5 rounded-md hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                title="Schedule"
              >
                <ClockIcon className="h-4.5 w-4.5" />
              </button>

              {/* Redirect Icon */}
              <button
                type="button"
                onClick={() => toast.info("Redirect feature coming soon!")}
                className="p-1.5 rounded-md hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                title="Redirect"
              >
                <ArrowSquareOutIcon className="h-4.5 w-4.5" />
              </button>

              {/* Lock/Password Icon */}
              <button
                type="button"
                onClick={() => toast.info("Lock feature coming soon!")}
                className="p-1.5 rounded-md hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                title="Lock"
              >
                <LockIcon className="h-4.5 w-4.5" />
              </button>

              {/* Purple Click Badge (Interactive) */}
              <button
                type="button"
                onClick={() => {
                  if (isViewingAnalytics) {
                    onPanelClose();
                  } else {
                    onPanelToggle(link.id, "analytics");
                  }
                }}
                className={cn(
                  "flex items-center gap-1.5 text-xs font-semibold select-none ml-2 px-2.5 py-1 rounded-full transition-all duration-200 cursor-pointer focus:outline-hidden",
                  isViewingAnalytics
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-foreground/90 hover:bg-primary/20 dark:hover:bg-primary/30",
                )}
                title="Click Analytics"
              >
                <ChartBarIcon className="h-3.5 w-3.5" />
                <span className="flex items-center gap-1">
                  {hasClicks && (
                    <ArrowUpIcon className="h-3.5 w-3.5" weight="bold" />
                  )}
                  {clicks} {clicks === 1 ? "click" : "clicks"}
                </span>
              </button>
            </div>

            {/* Trash Button - Toggles Expandable Confirmation Panel */}
            <button
              type="button"
              onClick={() => {
                if (isConfirmingDelete) {
                  onPanelClose();
                } else {
                  onPanelToggle(link.id, "delete");
                }
              }}
              className={cn(
                "p-1.5 rounded-lg transition-colors cursor-pointer select-none",
                isConfirmingDelete
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "hover:bg-destructive/10 text-muted-foreground/50 hover:text-destructive",
              )}
              title="Delete Link"
            >
              <TrashIcon className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Delete & Archive Panel (High-fidelity Smooth Transition) */}
      <div
        className={cn(
          "w-full grid transition-[grid-template-rows] duration-300 ease-in-out select-none border-t border-transparent",
          isConfirmingDelete
            ? "grid-rows-[1fr] border-border/40"
            : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden w-full flex flex-col bg-card dark:bg-neutral-900">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center px-6 py-2.5 bg-[#e2e3dd] dark:bg-neutral-800 text-sm font-bold text-foreground/80 border-b border-border/10">
            <div />
            <span>Delete</span>
            <button
              type="button"
              onClick={onPanelClose}
              className="justify-self-end p-1 rounded-md hover:bg-neutral-300/50 dark:hover:bg-neutral-700 text-muted-foreground hover:text-foreground transition-all cursor-pointer"
              aria-label="Close panel"
            >
              <XIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Panel Body (Two action columns) */}
          <div className="flex flex-row items-start justify-center py-6 px-4 md:px-8 gap-5 bg-card dark:bg-neutral-900">
            {/* Left Column: Delete Forever */}
            <div className="flex-initial shrink-0 w-[160px] flex flex-col items-center text-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onDelete(link.id);
                  onPanelClose();
                }}
                className="w-full inline-flex items-center justify-center gap-2 h-11 rounded-full border border-destructive bg-transparent hover:bg-destructive/10 font-bold text-sm text-destructive transition-all shadow-xs cursor-pointer active:scale-95"
              >
                <TrashIcon className="h-4.5 w-4.5" />
                Delete
              </button>
              <span className="text-xs text-muted-foreground/80 leading-normal max-w-[140px] font-medium">
                Delete forever.
              </span>
            </div>

            {/* Right Column: Archive */}
            <div className="flex-1 flex flex-col items-center text-center gap-2">
              <button
                type="button"
                onClick={() => {
                  toast.info("Link archived successfully!");
                  onPanelClose();
                }}
                className="w-full inline-flex items-center justify-center gap-2 h-11 rounded-full bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-sm transition-all shadow-sm cursor-pointer active:scale-95"
              >
                <ArchiveIcon className="h-4.5 w-4.5" />
                Archive
              </button>
              <span className="text-xs text-muted-foreground/80 leading-normal font-medium">
                Reduce clutter, keep your insights and restore anytime.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Analytics Panel (High-fidelity Smooth Transition) */}
      <div
        className={cn(
          "w-full grid transition-[grid-template-rows] duration-300 ease-in-out border-t border-transparent",
          isViewingAnalytics
            ? "grid-rows-[1fr] border-border/40"
            : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden w-full flex flex-col bg-card dark:bg-neutral-900">
          {isViewingAnalytics && (
            <LinkAnalyticsPanel
              linkId={link.id}
              onClose={onPanelClose}
              totalClicks={clicks}
            />
          )}
        </div>
      </div>

      {/* Expanded Thumbnail Panel (High-fidelity Smooth Transition) */}
      <div
        className={cn(
          "w-full grid transition-[grid-template-rows] duration-300 ease-in-out select-none border-t border-transparent",
          isManagingThumbnail
            ? "grid-rows-[1fr] border-border/40"
            : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden w-full flex flex-col bg-card dark:bg-neutral-900">
          {/* Panel Header Bar */}
          <div className="grid grid-cols-[1fr_auto_1fr] items-center px-6 py-2.5 bg-[#e2e3dd] dark:bg-neutral-800 text-sm font-bold text-foreground/80 border-b border-border/10">
            <div />

            <span>Add Thumbnail</span>

            <button
              type="button"
              onClick={onPanelClose}
              className="justify-self-end p-1 rounded-md hover:bg-neutral-300/50 dark:hover:bg-neutral-700 text-muted-foreground hover:text-foreground transition-all cursor-pointer"
              aria-label="Close panel"
            >
              <XIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Panel Body */}
          <div className="flex flex-col items-center justify-center py-6 px-4 md:px-8 bg-card dark:bg-neutral-900 min-h-[140px]">
            {!link.icon ? (
              /* No Thumbnail State */
              <div className="flex flex-col items-center text-center gap-3">
                <span className="text-xs text-muted-foreground/80 leading-normal font-medium">
                  Add a Thumbnail or Icon to this Link.
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setDialogOpen(true);
                  }}
                  className="inline-flex items-center justify-center h-10 px-8 rounded-full bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-sm transition-all shadow-sm cursor-pointer active:scale-95"
                >
                  Set Thumbnail
                </button>
              </div>
            ) : (
              /* With Thumbnail State */
              <div className="w-full flex flex-row items-center gap-4">
                {/* Large Preview on Left */}
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center overflow-hidden shrink-0 border bg-muted shadow-xs">
                  <ThumbnailIcon
                    icon={link.icon}
                    className="h-10 w-10 text-foreground/75"
                  />
                </div>

                {/* Stacked Vertical Buttons on Right */}
                <div className="flex-1 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setDialogOpen(true);
                    }}
                    className="w-full inline-flex items-center justify-center h-10 px-6 rounded-full bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-sm transition-all shadow-sm cursor-pointer active:scale-95"
                  >
                    Change
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      updateLink({ id: link.id, data: { icon: null } });
                      toast.success("Thumbnail removed successfully");
                    }}
                    className="w-full inline-flex items-center justify-center h-10 px-6 rounded-full border border-border bg-background hover:bg-muted font-bold text-sm text-foreground transition-all shadow-xs cursor-pointer active:scale-95"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modular Thumbnail Selection Dialog */}
      <ThumbnailPicker
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        currentIcon={link.icon}
        onSelect={(iconName) => {
          updateLink({ id: link.id, data: { icon: iconName } });
        }}
      />
    </div>
  );
}

// ==========================================
// SUBCOMPONENTS FOR LINK CLICK ANALYTICS
// ==========================================

interface LinkAnalyticsPanelProps {
  linkId: string;
  onClose: () => void;
  totalClicks: number;
}

const linkChartConfig = {
  clicks: {
    label: "Clicks",
  },
  desktop: {
    label: "Desktop",
    color: "var(--primary)",
  },
  mobile: {
    label: "Mobile",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

function LinkAnalyticsPanel({
  linkId,
  onClose,
  totalClicks,
}: LinkAnalyticsPanelProps) {
  const [timeRange, setTimeRange] = useState("Last 7 days");
  const [activeTab, setActiveTab] = useState<
    "insights" | "locations" | "referrers" | "devices"
  >("insights");

  const { data, isLoading } = useLinkAnalytics(linkId, timeRange);

  const { periodClicks, desktopClicks, mobileClicks } = React.useMemo(() => {
    if (!data?.dailyClicks)
      return { periodClicks: 0, desktopClicks: 0, mobileClicks: 0 };
    return data.dailyClicks.reduce(
      (acc, d) => ({
        periodClicks: acc.periodClicks + d.desktop + d.mobile,
        desktopClicks: acc.desktopClicks + d.desktop,
        mobileClicks: acc.mobileClicks + d.mobile,
      }),
      { periodClicks: 0, desktopClicks: 0, mobileClicks: 0 },
    );
  }, [data?.dailyClicks]);

  const getDateRangeString = (range: string) => {
    const end = new Date();
    const start = new Date();
    if (range === "Last 7 days" || range === "7d") {
      start.setDate(end.getDate() - 7);
    } else if (range === "Last 30 days" || range === "30d") {
      start.setDate(end.getDate() - 30);
    } else if (range === "Last 90 days" || range === "90d") {
      start.setDate(end.getDate() - 90);
    }
    const options: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
    };
    return `${start.toLocaleDateString("en-US", options)} to ${end.toLocaleDateString("en-US", options)}`;
  };

  return (
    <div className="overflow-hidden w-full flex flex-col bg-card dark:bg-neutral-900 border-t border-border/10">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center px-6 py-2.5 bg-[#e2e3dd] dark:bg-neutral-800 text-sm font-bold text-foreground/80 border-b border-border/10">
        <div />
        <span>Insights</span>
        <button
          type="button"
          onClick={onClose}
          className="justify-self-end p-1 rounded-md hover:bg-neutral-300/50 dark:hover:bg-neutral-700 text-muted-foreground hover:text-foreground transition-all cursor-pointer"
          aria-label="Close panel"
        >
          <XIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Date Range Selector Row */}
      <div className="flex items-center justify-between px-6 py-2.5 border-b border-border/10 bg-card dark:bg-neutral-900/40 text-xs select-none">
        <span className="font-semibold text-md text-foreground">
          Date range
        </span>
        <Combobox
          value={timeRange}
          onValueChange={(val) => {
            if (val) setTimeRange(val);
          }}
        >
          <ComboboxInput
            className="w-44 bg-transparent text-right font-semibold text-xs h-6 border-none cursor-pointer focus:outline-hidden text-foreground/80 hover:text-foreground p-0!"
            value={getDateRangeString(timeRange)}
            readOnly
          />
          <ComboboxContent className="w-44 rounded-xl bg-popover/95 backdrop-blur-md border shadow-lg">
            <ComboboxList>
              <ComboboxItem
                value="Last 7 days"
                className="rounded-lg text-xs py-1.5 cursor-pointer"
              >
                Last 7 days
              </ComboboxItem>
              <ComboboxItem
                value="Last 30 days"
                className="rounded-lg text-xs py-1.5 cursor-pointer"
              >
                Last 30 days
              </ComboboxItem>
              <ComboboxItem
                value="Last 90 days"
                className="rounded-lg text-xs py-1.5 cursor-pointer"
              >
                Last 90 days
              </ComboboxItem>
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-border/40 px-6 gap-5 scrollbar-none overflow-x-auto text-[11px] font-bold text-muted-foreground/75 bg-muted/10">
        {(
          [
            { id: "insights", label: "Insights" },
            { id: "locations", label: "Top Locations" },
            { id: "referrers", label: "Top Referrers" },
            { id: "devices", label: "Devices" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "py-3 border-b-2 transition-all cursor-pointer uppercase tracking-wider text-[10px] select-none focus:outline-hidden",
              activeTab === tab.id
                ? "border-primary text-primary font-extrabold"
                : "border-transparent hover:text-foreground",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Body content */}
      <div className="bg-card dark:bg-neutral-900/60 transition-colors">
        {isLoading ? (
          <div className="p-6 space-y-3">
            <Skeleton className="h-[120px] w-full rounded-2xl" />
            <div className="grid grid-cols-3 gap-2">
              <Skeleton className="h-10 w-full rounded-xl" />
              <Skeleton className="h-10 w-full rounded-xl" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          </div>
        ) : (
          <>
            {activeTab === "insights" && (
              <div className="p-4 sm:p-6 space-y-4">
                {/* Compact Recharts Area Chart */}
                <div className="w-full flex justify-center">
                  <ChartContainer
                    config={linkChartConfig}
                    className="aspect-auto h-[130px] w-full max-w-full"
                  >
                    <AreaChart data={data?.dailyClicks || []}>
                      <defs>
                        <linearGradient
                          id="fillDesktopLink"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="var(--color-desktop)"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="var(--color-desktop)"
                            stopOpacity={0.05}
                          />
                        </linearGradient>
                        <linearGradient
                          id="fillMobileLink"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="var(--color-mobile)"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="var(--color-mobile)"
                            stopOpacity={0.05}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        vertical={false}
                        strokeDasharray="3 3"
                        opacity={0.15}
                      />
                      <XAxis
                        dataKey="date"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={4}
                        minTickGap={24}
                        style={{ fontSize: "10px" }}
                        tickFormatter={(value) => {
                          const date = new Date(value);
                          return date.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          });
                        }}
                      />
                      <ChartTooltip
                        cursor={false}
                        content={
                          <ChartTooltipContent
                            labelFormatter={(value) => {
                              return new Date(value).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                },
                              );
                            }}
                            indicator="dot"
                          />
                        }
                      />
                      <Area
                        dataKey="mobile"
                        type="natural"
                        fill="url(#fillMobileLink)"
                        stroke="var(--color-mobile)"
                        stackId="link"
                      />
                      <Area
                        dataKey="desktop"
                        type="natural"
                        fill="url(#fillDesktopLink)"
                        stroke="var(--color-desktop)"
                        stackId="link"
                      />
                    </AreaChart>
                  </ChartContainer>
                </div>

                {/* Table Summary */}
                <div className="border rounded-xl overflow-hidden bg-muted/10">
                  <Table className="text-xs">
                    <TableHeader className="bg-muted/20">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="py-2 h-8 font-semibold">
                          Click breakdown
                        </TableHead>
                        <TableHead className="py-2 h-8 text-right font-semibold">
                          Lifetime
                        </TableHead>
                        <TableHead className="py-2 h-8 text-right font-semibold">
                          {timeRange}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow className="hover:bg-transparent border-border/40">
                        <TableCell className="py-2.5 font-medium flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-primary" />
                          Total clicks
                        </TableCell>
                        <TableCell className="py-2.5 text-right font-semibold">
                          {totalClicks}
                        </TableCell>
                        <TableCell className="py-2.5 text-right font-semibold text-primary">
                          {periodClicks}
                        </TableCell>
                      </TableRow>
                      <TableRow className="hover:bg-transparent border-border/40">
                        <TableCell className="py-2.5 font-medium flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[var(--color-desktop)]" />
                          On desktop
                        </TableCell>
                        <TableCell className="py-2.5 text-right text-muted-foreground">
                          -
                        </TableCell>
                        <TableCell className="py-2.5 text-right font-medium">
                          {desktopClicks}
                        </TableCell>
                      </TableRow>
                      <TableRow className="hover:bg-transparent border-0">
                        <TableCell className="py-2.5 font-medium flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[var(--color-mobile)]" />
                          On mobile/tablet
                        </TableCell>
                        <TableCell className="py-2.5 text-right text-muted-foreground">
                          -
                        </TableCell>
                        <TableCell className="py-2.5 text-right font-medium">
                          {mobileClicks}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {activeTab === "locations" && (
              <BreakdownList
                items={
                  data?.topLocations?.map((loc) => ({
                    label: loc.country,
                    clicks: loc.clicks,
                  })) || []
                }
                totalClicks={periodClicks}
                emptyMessage="No location data for this period"
              />
            )}

            {activeTab === "referrers" && (
              <BreakdownList
                items={
                  data?.topReferrers?.map((ref) => ({
                    label: ref.referrer,
                    clicks: ref.clicks,
                  })) || []
                }
                totalClicks={periodClicks}
                emptyMessage="No referral data for this period"
              />
            )}

            {activeTab === "devices" && (
              <BreakdownList
                items={
                  data?.devices?.map((dev) => {
                    const label =
                      dev.device === "desktop"
                        ? "Desktop"
                        : dev.device === "mobile"
                          ? "Mobile"
                          : dev.device
                            ? dev.device.charAt(0).toUpperCase() +
                              dev.device.slice(1)
                            : "Unknown";
                    return { label, clicks: dev.clicks };
                  }) || []
                }
                totalClicks={periodClicks}
                emptyMessage="No device data for this period"
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

interface BreakdownListProps {
  items: { label: string; clicks: number }[];
  totalClicks: number;
  emptyMessage: string;
}

function BreakdownList({
  items,
  totalClicks,
  emptyMessage,
}: BreakdownListProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-10 text-xs text-muted-foreground/80 font-medium">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-3.5 px-6 py-5 max-h-[220px] overflow-y-auto pr-2 scrollbar-thin">
      {items.map((item, index) => {
        const percent = totalClicks > 0 ? (item.clicks / totalClicks) * 100 : 0;
        return (
          <div key={item.label} className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-foreground/85 flex items-center gap-1">
                <span className="text-[10px] text-muted-foreground/60">
                  #{index + 1}
                </span>
                {item.label}
              </span>
              <span className="text-muted-foreground font-semibold text-[11px]">
                {item.clicks} {item.clicks === 1 ? "click" : "clicks"} (
                {percent.toFixed(0)}%)
              </span>
            </div>
            <div className="w-full bg-muted/65 dark:bg-muted/20 h-2 rounded-full overflow-hidden border border-border/10">
              <div
                className="bg-primary h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
