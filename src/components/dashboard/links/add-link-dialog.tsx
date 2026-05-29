"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { Link } from "@/hooks/use-links";

const linkSchema = z.object({
  title: z.string().min(1, "Title is required"),
  url: z.string().url("Invalid URL"),
  icon: z.string().optional(),
  color: z.string().optional(),
  type: z.string().optional(),
});

type LinkFormValues = z.infer<typeof linkSchema>;

interface AddLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Partial<Link>) => void;
  editLink?: Link | null;
}

export function AddLinkDialog({
  open,
  onOpenChange,
  onSubmit,
  editLink,
}: AddLinkDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LinkFormValues>({
    resolver: zodResolver(linkSchema),
    defaultValues: {
      title: "",
      url: "",
      icon: "",
      color: "",
      type: "url",
    },
  });

  useEffect(() => {
    if (editLink) {
      reset({
        title: editLink.title,
        url: editLink.url,
        icon: editLink.icon ?? "",
        color: editLink.color ?? "",
        type: editLink.type,
      });
    } else {
      reset({
        title: "",
        url: "",
        icon: "",
        color: "",
        type: "url",
      });
    }
  }, [editLink, reset]);

  function onFormSubmit(data: LinkFormValues) {
    try {
      onSubmit(data);
      reset();
      onOpenChange(false);
    } catch {
      toast.error("Failed to save link");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-heading">
            {editLink ? "Edit Link" : "Add New Link"}
          </DialogTitle>
          <DialogDescription className="font-sans">
            {editLink
              ? "Make changes to your link below."
              : "Create a new link to share with your visitors."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="title" className="font-heading">
                Title
              </FieldLabel>
              <Input
                id="title"
                placeholder="My Website"
                {...register("title")}
                className="font-sans"
              />
              {errors.title && (
                <p className="text-sm text-destructive font-sans">
                  {errors.title.message}
                </p>
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="url" className="font-heading">
                URL
              </FieldLabel>
              <Input
                id="url"
                type="url"
                placeholder="https://example.com"
                {...register("url")}
                className="font-sans"
              />
              {errors.url && (
                <p className="text-sm text-destructive font-sans">
                  {errors.url.message}
                </p>
              )}
            </Field>
          </FieldGroup>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="font-heading"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="font-heading"
            >
              {isSubmitting
                ? "Saving..."
                : editLink
                  ? "Save Changes"
                  : "Create Link"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
