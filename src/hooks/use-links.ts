"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface Link {
  id: string;
  title: string;
  url: string;
  icon: string | null;
  thumbnailUrl: string | null;
  color: string | null;
  type: string;
  isActive: boolean;
  isPinned: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
  _count?: { clicks: number };
}

async function fetchLinks(): Promise<Link[]> {
  const res = await fetch("/api/links");
  if (!res.ok) throw new Error("Failed to fetch links");
  return res.json();
}

async function createLink(data: Partial<Link>): Promise<Link> {
  const res = await fetch("/api/links", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to create link");
  }
  return res.json();
}

async function updateLink(id: string, data: Partial<Link>): Promise<Link> {
  const res = await fetch(`/api/links/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to update link");
  }
  return res.json();
}

async function deleteLink(id: string): Promise<void> {
  const res = await fetch(`/api/links/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to delete link");
  }
}

async function reorderLinks(orderedIds: string[]): Promise<void> {
  const res = await fetch("/api/links/reorder", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderedIds }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to reorder links");
  }
}

export function useLinks() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["links"],
    queryFn: fetchLinks,
  });

  const createMutation = useMutation({
    mutationFn: createLink,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["links"] });
      toast.success("Link created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Link> }) =>
      updateLink(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["links"] });
      toast.success("Link updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteLink,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["links"] });
      toast.success("Link deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const reorderMutation = useMutation({
    mutationFn: reorderLinks,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["links"] });
    },
    onError: (error: Error) => {
      queryClient.invalidateQueries({ queryKey: ["links"] });
      toast.error(error.message);
    },
  });

  return {
    links: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    createLink: createMutation.mutate,
    updateLink: updateMutation.mutate,
    deleteLink: deleteMutation.mutate,
    reorderLinks: reorderMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isReordering: reorderMutation.isPending,
  };
}
