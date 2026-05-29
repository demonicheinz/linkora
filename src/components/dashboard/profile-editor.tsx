"use client";

import {
  CameraIcon,
  EnvelopeIcon,
  InstagramLogoIcon,
  PlusIcon,
  TiktokLogoIcon,
  YoutubeLogoIcon,
} from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { MediaUploader } from "@/components/shared/media-uploader";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface UserProfile {
  name: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
}

async function fetchUser(): Promise<UserProfile> {
  const res = await fetch("/api/user/me");
  if (!res.ok) throw new Error("Failed to fetch user");
  return res.json();
}

async function updateUser(data: Partial<UserProfile>) {
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

export function ProfileEditor() {
  const queryClient = useQueryClient();
  const { data: user } = useQuery({
    queryKey: ["user-me"],
    queryFn: fetchUser,
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [tempDisplayName, setTempDisplayName] = useState("");
  const [tempBio, setTempBio] = useState("");
  const [focusTarget, setFocusTarget] = useState<"title" | "bio">("title");

  const mutation = useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-me"] });
      toast.success("Profile updated!");
      setDialogOpen(false);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  function handleSaveProfile() {
    mutation.mutate({
      displayName: tempDisplayName.trim() || null,
      bio: tempBio.trim() || null,
    });
  }

  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);

  function handleOpenDialog(target: "title" | "bio") {
    setTempDisplayName(user?.displayName || user?.name || "");
    setTempBio(user?.bio || "");
    setFocusTarget(target);
    setDialogOpen(true);
  }

  return (
    <div className="flex flex-row items-center gap-5 py-2 w-full text-left justify-start select-none bg-transparent">
      {/* Avatar Container (Left Side) */}
      <div className="relative group shrink-0  select-none">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center text-3xl font-heading overflow-hidden border-2 border-border shadow-xs group-hover:border-primary/50 transition-colors">
          {user?.avatarUrl ? (
            <Image
              src={user.avatarUrl}
              alt="Avatar"
              width={80}
              height={80}
              className="w-full h-full object-cover"
              unoptimized={user.avatarUrl.startsWith("https://")}
            />
          ) : (
            <span className="text-muted-foreground font-bold">
              {(user?.displayName || user?.name || "A").charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => setIsAvatarDialogOpen(true)}
          className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          title="Change avatar"
        >
          <CameraIcon className="h-5 w-5 text-white" />
        </button>
      </div>

      {/* Stack: Title, Bio, Social Icons (Right Side) */}
      <div className="flex-1 flex flex-col gap-1 items-start min-w-0">
        {/* Title / Display Name Button */}
        <button
          type="button"
          onClick={() => handleOpenDialog("title")}
          className="font-bold text-base text-foreground/90 hover:text-foreground truncate max-w-full tracking-tight select-none hover:underline cursor-pointer text-left focus:outline-hidden"
        >
          {user?.displayName || user?.name || "Title"}
        </button>

        {/* Bio text Button */}
        <button
          type="button"
          onClick={() => handleOpenDialog("bio")}
          className="text-xs text-muted-foreground/80 hover:text-foreground truncate max-w-full leading-normal select-none hover:underline cursor-pointer text-left focus:outline-hidden"
        >
          {user?.bio || "Bio"}
        </button>

        {/* Quick Brand Social Icons with overlapping Plus Badges (Screenshot 1 alignment) */}
        <div className="flex items-center gap-2.5 mt-1 select-none">
          {/* Instagram Button */}
          <div className="relative shrink-0 group">
            <button
              type="button"
              onClick={() => toast.info("Add Instagram link coming soon!")}
              className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground transition-all"
              title="Add Instagram"
            >
              <InstagramLogoIcon className="h-4.5 w-4.5" weight="bold" />
            </button>

            <div className="absolute top-0 right-0.5 w-3.5 h-3.5 bg-background border border-border/80 flex items-center justify-center text-[8px] font-bold text-muted-foreground rounded-full shadow-xs pointer-events-none select-none transition-all group-hover:bg-muted group-hover:text-foreground group-hover:border-muted-foreground/10">
              +
            </div>
          </div>

          {/* TikTok Button */}
          <div className="relative shrink-0 group">
            <button
              type="button"
              onClick={() => toast.info("Add TikTok link coming soon!")}
              className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground transition-all"
              title="Add TikTok"
            >
              <TiktokLogoIcon className="h-4.25 w-4.25" weight="fill" />
            </button>

            <div className="absolute top-0 right-0.5 w-3.5 h-3.5 bg-background border border-border/80 flex items-center justify-center text-[8px] font-bold text-muted-foreground rounded-full shadow-xs pointer-events-none select-none transition-all group-hover:bg-muted group-hover:text-foreground group-hover:border-muted-foreground/10">
              +
            </div>
          </div>

          {/* YouTube Button */}
          <div className="relative shrink-0 group">
            <button
              type="button"
              onClick={() => toast.info("Add YouTube link coming soon!")}
              className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground transition-all"
              title="Add YouTube"
            >
              <YoutubeLogoIcon className="h-4.25 w-4.25" weight="fill" />
            </button>

            <div className="absolute top-0 right-0.5 w-3.5 h-3.5 bg-background border border-border/80 flex items-center justify-center text-[8px] font-bold text-muted-foreground rounded-full shadow-xs pointer-events-none select-none transition-all group-hover:bg-muted group-hover:text-foreground group-hover:border-muted-foreground/10">
              +
            </div>
          </div>

          {/* Envelope Mail Button */}
          <div className="relative shrink-0 group">
            <button
              type="button"
              onClick={() => toast.info("Add Email contact coming soon!")}
              className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground transition-all"
              title="Add Email"
            >
              <EnvelopeIcon className="h-4.25 w-4.25" weight="fill" />
            </button>

            <div className="absolute top-0 right-0.5 w-3.5 h-3.5 bg-background border border-border/80 flex items-center justify-center text-[8px] font-bold text-muted-foreground rounded-full shadow-xs pointer-events-none select-none transition-all group-hover:bg-muted group-hover:text-foreground group-hover:border-muted-foreground/10">
              +
            </div>
          </div>

          {/* Standalone Circular Gray Button */}
          <button
            type="button"
            onClick={() => toast.info("Add other platforms coming soon!")}
            className="w-8 h-8 rounded-full border border-dashed border-muted-foreground/30 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-muted-foreground/60 hover:bg-muted transition-all  shrink-0"
            title="Add more"
          >
            <PlusIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Stylized Modal Dialog for Editing Profile Title & Bio (Screenshot 2 replication) */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-[480px] rounded-[24px] p-6 gap-6 bg-white text-black border-none shadow-2xl [&>button]:text-black/60 [&>button]:hover:text-black focus:outline-hidden [&>button]:focus:outline-hidden [&>button]:focus:ring-0 select-none">
          {/* Header */}
          <DialogHeader className="flex flex-col items-center justify-center">
            <DialogTitle className="text-center font-bold text-lg text-black tracking-wide">
              Title and bio
            </DialogTitle>
          </DialogHeader>

          {/* Dialog Main Content */}
          <div className="flex flex-col gap-4 mt-2">
            {/* Title Card-Style Input Box */}
            <div className="flex flex-col gap-1">
              <div className="bg-[#f6f7f5] rounded-[16px] p-4 flex flex-col gap-1 w-full border border-transparent focus-within:border-black transition-all">
                <label
                  htmlFor="profile-title"
                  className="text-[10px] font-bold text-neutral-400 select-none uppercase tracking-wider"
                >
                  Title
                </label>
                <input
                  ref={(el) => {
                    if (focusTarget === "title") {
                      el?.focus();
                    }
                  }}
                  id="profile-title"
                  type="text"
                  value={tempDisplayName}
                  onChange={(e) => setTempDisplayName(e.target.value)}
                  className="w-full bg-transparent border-none p-0 text-[14px] font-bold text-black focus:outline-hidden focus:ring-0"
                  maxLength={30}
                  placeholder="Title"
                />
              </div>
              <div className="text-right text-[11px] font-bold text-neutral-400 select-none mr-2">
                {tempDisplayName.length} / 30
              </div>
            </div>

            {/* Bio Card-Style Textarea Box */}
            <div className="flex flex-col gap-1">
              <div className="bg-[#f6f7f5] rounded-[16px] p-4 flex flex-col gap-1 w-full border border-transparent focus-within:border-black transition-all">
                <label
                  htmlFor="profile-bio"
                  className="text-[10px] font-bold text-neutral-400 select-none uppercase tracking-wider"
                >
                  Bio
                </label>
                <textarea
                  ref={(el) => {
                    if (focusTarget === "bio") {
                      el?.focus();
                    }
                  }}
                  id="profile-bio"
                  value={tempBio}
                  onChange={(e) => setTempBio(e.target.value)}
                  className="w-full bg-transparent border-none p-0 text-[14px] font-medium text-black focus:outline-hidden focus:ring-0 resize-none h-20"
                  maxLength={160}
                  placeholder="Bio"
                />
              </div>
              <div className="text-right text-[11px] font-bold text-neutral-400 select-none mr-2">
                {tempBio.length} / 160
              </div>
            </div>
          </div>

          {/* Dialog Save Button (using primary theme colors to follow color rule) */}
          <button
            type="button"
            onClick={handleSaveProfile}
            disabled={mutation.isPending}
            className="w-full py-4.5 rounded-full bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-sm tracking-wide shadow-xs active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {mutation.isPending ? "Saving..." : "Save"}
          </button>
        </DialogContent>
      </Dialog>

      <Dialog open={isAvatarDialogOpen} onOpenChange={setIsAvatarDialogOpen}>
        <DialogContent className="max-w-[400px] rounded-[24px] p-6 bg-white text-black dark:bg-neutral-900 dark:text-white border-none shadow-2xl [&>button]:text-black/60 dark:[&>button]:text-white/60 [&>button]:hover:text-black dark:[&>button]:hover:text-white focus:outline-hidden [&>button]:focus:outline-hidden [&>button]:focus:ring-0 [&>button]:top-5 [&>button]:right-5 select-none flex flex-col items-center">
          <MediaUploader
            type="avatar"
            currentUrl={user?.avatarUrl}
            dialogTitle="Upload Profile Image"
            onSuccess={(_url) => {
              queryClient.invalidateQueries({ queryKey: ["user-me"] });
              toast.success("Profile image updated successfully");
              setIsAvatarDialogOpen(false);
            }}
            onRemove={
              user?.avatarUrl
                ? async () => {
                    const res = await fetch("/api/user/me", {
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ avatarUrl: null }),
                    });
                    if (!res.ok) throw new Error("Failed to remove avatar");
                    queryClient.invalidateQueries({ queryKey: ["user-me"] });
                    toast.success("Profile image removed successfully");
                    setIsAvatarDialogOpen(false);
                  }
                : undefined
            }
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
