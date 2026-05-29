import { nanoid } from "nanoid";
import { useCallback, useState } from "react";

type MediaType =
  | "avatar"
  | "banner"
  | "thumbnail"
  | "logo"
  | "icon"
  | "background"
  | "background-video";

interface UploadResult {
  url: string;
  key: string;
}

const ALLOWED_TYPES: Record<MediaType, string[]> = {
  avatar: ["image/jpeg", "image/png", "image/webp"],
  banner: ["image/jpeg", "image/png"],
  thumbnail: ["image/jpeg", "image/png", "image/webp"],
  logo: ["image/png", "image/svg+xml", "image/webp"],
  icon: ["image/png", "image/svg+xml"],
  background: ["image/jpeg", "image/png", "image/webp"],
  "background-video": ["video/mp4"],
};

const MAX_SIZES: Record<MediaType, number> = {
  avatar: 10 * 1024 * 1024, // 10MB
  banner: 15 * 1024 * 1024, // 15MB
  thumbnail: 10 * 1024 * 1024, // 10MB
  logo: 10 * 1024 * 1024, // 10MB
  icon: 5 * 1024 * 1024, // 5MB
  background: 50 * 1024 * 1024, // 50MB
  "background-video": 100 * 1024 * 1024, // 100MB
};

export function useUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadWithProgress = useCallback(
    async (file: File, fileType: MediaType): Promise<UploadResult> => {
      if (!ALLOWED_TYPES[fileType].includes(file.type)) {
        throw new Error(
          `Invalid file type. Allowed: ${ALLOWED_TYPES[fileType].join(", ")}`,
        );
      }

      if (file.size > MAX_SIZES[fileType]) {
        throw new Error(
          `File too large. Max: ${MAX_SIZES[fileType] / 1024 / 1024}MB`,
        );
      }

      setIsUploading(true);
      setProgress(0);

      try {
        // Step 1: Get presigned URL
        const presignRes = await fetch("/api/upload/presign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileType,
            contentType: file.type,
            size: file.size,
          }),
        });

        if (!presignRes.ok) {
          const err = await presignRes.json();
          throw new Error(err.error || "Failed to get upload URL");
        }

        const { presignedUrl, publicUrl, key } = await presignRes.json();

        // Step 2: Upload directly to R2 with progress tracking
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();

          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              setProgress(Math.round((e.loaded / e.total) * 100));
            }
          };

          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve();
            } else {
              reject(new Error(`Upload failed with status ${xhr.status}`));
            }
          };

          xhr.onerror = () => reject(new Error("Upload failed"));
          xhr.ontimeout = () => reject(new Error("Upload timed out"));

          xhr.open("PUT", presignedUrl);
          xhr.setRequestHeader("Content-Type", file.type);
          xhr.timeout = 60000; // 60s timeout
          xhr.send(file);
        });

        // Step 3: Confirm upload
        const confirmRes = await fetch("/api/upload/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key, field: fileType }),
        });

        if (!confirmRes.ok) {
          const err = await confirmRes.json();
          throw new Error(err.error || "Failed to confirm upload");
        }

        setProgress(100);
        return { url: publicUrl, key };
      } finally {
        setIsUploading(false);
      }
    },
    [],
  );

  return {
    uploadWithProgress,
    isUploading,
    progress,
  };
}

export function generateKey(userId: string, type: string): string {
  return `${userId}/${type}/${nanoid()}`;
}
