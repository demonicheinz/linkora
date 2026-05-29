"use client";

import { PencilSimpleIcon, PlusIcon } from "@phosphor-icons/react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { MediaUploader } from "@/components/shared/media-uploader";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  username: string;
  avatarUrl: string | null;
}

async function fetchUser(): Promise<UserProfile> {
  const res = await fetch("/api/user/me");
  if (!res.ok) throw new Error("Failed to fetch user");
  return res.json();
}

interface UpdateUserPayload extends Partial<UserProfile> {
  password?: string;
}

async function updateUser(data: UpdateUserPayload) {
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

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);
  const { data: user, isLoading } = useQuery({
    queryKey: ["user-me"],
    queryFn: fetchUser,
  });

  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name,
        username: user.username,
        email: user.email || "",
        password: "",
      });
    }
  }, [user]);

  const mutation = useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-me"] });
      setForm((prev) => ({ ...prev, password: "" }));
      toast.success("Settings updated!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const isDirty = useMemo(() => {
    if (!user) return false;
    return (
      form.name !== user.name ||
      form.username !== user.username ||
      form.email !== (user.email || "") ||
      form.password !== ""
    );
  }, [form, user]);

  function handleSave() {
    const dataToSubmit: UpdateUserPayload = {
      name: form.name,
      username: form.username,
      email: form.email,
    };
    if (form.password) {
      dataToSubmit.password = form.password;
    }
    mutation.mutate(dataToSubmit);
  }

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-4 py-4 px-4 md:gap-6 md:py-6 lg:px-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[300px]" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 py-4 px-4 md:gap-6 md:py-6 lg:px-6 overflow-y-auto h-full">
      {/* Account */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading">Account</CardTitle>
          <CardDescription>
            Manage your account credentials and profile picture.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Avatar */}
          <div className="space-y-2">
            <Label>Profile Picture</Label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-2xl font-heading overflow-hidden border">
                {user?.avatarUrl ? (
                  <Image
                    src={user.avatarUrl}
                    alt="Avatar"
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{(user?.name || "A").charAt(0).toUpperCase()}</span>
                )}
              </div>
              {user?.avatarUrl ? (
                <Button
                  variant="default"
                  type="button"
                  onClick={() => setIsAvatarDialogOpen(true)}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold shadow-xs transition-colors h-11 cursor-pointer"
                >
                  <PencilSimpleIcon className="h-5 w-5" weight="bold" />
                  Edit
                </Button>
              ) : (
                <Button
                  variant="default"
                  type="button"
                  onClick={() => setIsAvatarDialogOpen(true)}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold shadow-xs transition-colors h-11 cursor-pointer"
                >
                  <PlusIcon className="h-5 w-5" weight="bold" />
                  Add
                </Button>
              )}
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Account Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Your name"
              />
            </div>

            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="flex items-center">
                <span className="inline-flex h-9 items-center rounded-l-md border border-r-0 bg-muted px-3 text-sm text-muted-foreground select-none">
                  /
                </span>
                <Input
                  id="username"
                  value={form.username}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      username: e.target.value,
                    }))
                  }
                  placeholder="username"
                  className="rounded-l-none"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, email: e.target.value }))
                }
                placeholder="your.email@example.com"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={form.password}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, password: e.target.value }))
                }
                placeholder="Leave blank to keep current"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Public Page */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading">Public Page</CardTitle>
          <CardDescription>Your public page URL.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Public URL</Label>
            <div className="flex items-center gap-2">
              <Input
                value={`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/${user?.username || ""}`}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/${user?.username || ""}`,
                  );
                  toast.success("URL copied to clipboard!");
                }}
                className="shrink-0"
              >
                Copy
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Save Button (Only shown when changes are present) */}
      {isDirty && (
        <div className="flex justify-end pb-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <Button
            onClick={handleSave}
            disabled={mutation.isPending}
            className="font-heading"
          >
            {mutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      )}
      {/* Avatar Dialog */}
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
