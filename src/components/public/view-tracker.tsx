"use client";

import { useEffect, useState } from "react";

interface ViewTrackerProps {
  username: string;
}

export function ViewTracker({ username }: ViewTrackerProps) {
  const [tracked, setTracked] = useState(false);

  useEffect(() => {
    if (tracked) return;

    async function trackView() {
      try {
        const res = await fetch(`/api/view/${username}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            referrer: typeof document !== "undefined" ? document.referrer : "",
          }),
        });
        if (res.ok) {
          setTracked(true);
        }
      } catch (error) {
        console.error("Failed to track view:", error);
      }
    }

    // Small delay to ensure page rendering has completed and to filter out instant bounces
    const timer = setTimeout(() => {
      trackView();
    }, 500);

    return () => clearTimeout(timer);
  }, [username, tracked]);

  return null;
}
