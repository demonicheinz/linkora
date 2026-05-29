"use client";

import { useQuery } from "@tanstack/react-query";

interface DailyClick {
  date: string;
  desktop: number;
  mobile: number;
}

interface LinkAnalyticsData {
  dailyClicks: DailyClick[];
  topLocations: { country: string; clicks: number }[];
  topReferrers: { referrer: string; clicks: number }[];
  devices: { device: string; clicks: number }[];
}

async function fetchLinkAnalytics(
  linkId: string,
  range: string,
): Promise<LinkAnalyticsData> {
  let r = "7d";
  if (range === "Last 30 days" || range === "30d") r = "30d";
  else if (range === "Last 90 days" || range === "90d") r = "90d";

  const res = await fetch(`/api/links/${linkId}/analytics?range=${r}`);
  if (!res.ok) throw new Error("Failed to fetch link analytics");
  return res.json();
}

export function useLinkAnalytics(linkId: string, range = "7d") {
  return useQuery({
    queryKey: ["link-analytics", linkId, range],
    queryFn: () => fetchLinkAnalytics(linkId, range),
    enabled: !!linkId,
  });
}
