"use client";

import {
  CopyIcon,
  DotsThreeVerticalIcon,
  ShareNetworkIcon,
} from "@phosphor-icons/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface LinkMoreMenuProps {
  url: string;
  title: string;
}

export function LinkMoreMenu({ url, title }: LinkMoreMenuProps) {
  async function handleShare(e: React.MouseEvent) {
    e.stopPropagation();
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // cancelled
      }
    } else {
      await navigator.clipboard.writeText(url);
    }
  }

  async function handleCopy(e: React.MouseEvent) {
    e.stopPropagation();
    await navigator.clipboard.writeText(url);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          className="h-8 w-8 p-1.5 flex items-center justify-center rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors shrink-0"
          aria-label="More options"
        >
          <DotsThreeVerticalIcon className="h-5 w-5" weight="bold" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="min-w-[160px] rounded-xl border border-white/20 bg-black/30 backdrop-blur-[24px] shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] ring-1 ring-white/10 p-1.5 animate-in fade-in-0 zoom-in-95"
      >
        <DropdownMenuItem
          onClick={handleShare}
          className="flex items-center gap-2.5 w-full h-auto px-3 py-2.5 text-sm text-white/90 focus:text-white focus:bg-white/10 transition-colors font-medium rounded-lg cursor-pointer"
        >
          <ShareNetworkIcon className="h-4 w-4" />
          Share link
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleCopy}
          className="flex items-center gap-2.5 w-full h-auto px-3 py-2.5 text-sm text-white/90 focus:text-white focus:bg-white/10 transition-colors font-medium rounded-lg cursor-pointer"
        >
          <CopyIcon className="h-4 w-4" />
          Copy URL
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
