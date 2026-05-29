"use client";

import { useEffect, useState } from "react";

interface ClickTrackerProps {
  linkId: string;
  onTracked: () => void;
}

export function ClickTracker({ linkId, onTracked }: ClickTrackerProps) {
  const [tracked, setTracked] = useState(false);

  useEffect(() => {
    if (tracked) return;

    async function trackClick() {
      try {
        const res = await fetch(`/api/click/${linkId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });
        if (res.ok) {
          setTracked(true);
          onTracked();
        }
      } catch (error) {
        console.error("Failed to track click:", error);
      }
    }

    trackClick();
  }, [linkId, onTracked, tracked]);

  return null;
}
