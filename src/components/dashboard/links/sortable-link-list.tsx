"use client";

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useState } from "react";
import { AddLinkDialog } from "@/components/dashboard/links/add-link-dialog";
import { LinkCard } from "@/components/dashboard/links/link-card";
import { type Link, useLinks } from "@/hooks/use-links";

export function SortableLinkList() {
  const { links, isLoading, createLink, updateLink, deleteLink, reorderLinks } =
    useLinks();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<Link | null>(null);
  const [localLinks, setLocalLinks] = useState<Link[]>([]);
  const [isLocalOrder, setIsLocalOrder] = useState(false);
  const [activePanel, setActivePanel] = useState<{
    linkId: string;
    type: "delete" | "thumbnail" | "analytics";
  } | null>(null);

  // Use local order during drag, otherwise use server links
  const displayLinks = isLocalOrder ? localLinks : links;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = links.findIndex((l) => l.id === active.id);
      const newIndex = links.findIndex((l) => l.id === over.id);

      // Optimistic update — apply locally immediately
      const newLinks = arrayMove([...links], oldIndex, newIndex);
      setLocalLinks(newLinks);
      setIsLocalOrder(true);

      // Persist to server
      reorderLinks(
        newLinks.map((l) => l.id),
        {
          onSuccess: () => {
            setIsLocalOrder(false);
          },
          onError: () => {
            setIsLocalOrder(false);
          },
        },
      );
    }
  }

  function handleDelete(id: string) {
    if (confirm("Are you sure you want to delete this link?")) {
      deleteLink(id);
    }
  }

  function handleToggleActive(id: string, isActive: boolean) {
    updateLink({ id, data: { isActive } });
  }

  function handlePanelToggle(
    linkId: string,
    type: "delete" | "thumbnail" | "analytics",
  ) {
    setActivePanel({ linkId, type });
  }

  function handlePanelClose() {
    setActivePanel(null);
  }

  function handleSubmit(data: Partial<Link>) {
    if (editingLink) {
      updateLink({ id: editingLink.id, data });
    } else {
      createLink(data);
    }
    setEditingLink(null);
  }

  function handleDialogClose(open: boolean) {
    setDialogOpen(open);
    if (!open) {
      setEditingLink(null);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis]}
      >
        <SortableContext
          items={displayLinks.map((l) => l.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {displayLinks.map((link) => (
              <LinkCard
                key={link.id}
                link={link}
                onDelete={handleDelete}
                onToggleActive={handleToggleActive}
                activePanel={activePanel}
                onPanelToggle={handlePanelToggle}
                onPanelClose={handlePanelClose}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {links.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p className="font-heading text-lg">No links yet</p>
          <p className="font-sans text-sm mt-1">
            Create your first link to get started
          </p>
        </div>
      )}

      <AddLinkDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        onSubmit={handleSubmit}
        editLink={editingLink}
      />
    </>
  );
}
