"use client";

import { useQuery } from "@tanstack/react-query";

interface DailyClick {
  date: string;
  desktop: number;
  mobile: number;
}

interface LinkStat {
  id: string;
  title: string;
  url: string;
  isActive: boolean;
  totalClicks: number;
  periodClicks: number;
}

interface AnalyticsData {
  dailyClicks: DailyClick[];
  dailyViews: DailyClick[];
  linkStats: LinkStat[];
}

async function fetchAnalytics(range: string): Promise<AnalyticsData> {
  const res = await fetch(`/api/analytics?range=${range}`);
  if (!res.ok) throw new Error("Failed to fetch analytics");
  return res.json();
}

export function useAnalytics(range = "Last 28 days") {
  return useQuery({
    queryKey: ["analytics", range],
    queryFn: () => fetchAnalytics(range),
  });
}
