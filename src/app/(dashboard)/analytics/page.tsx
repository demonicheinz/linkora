"use client";

import {
  ArrowSquareOutIcon,
  CaretLeftIcon,
  CaretRightIcon,
  InfoIcon,
} from "@phosphor-icons/react";
import * as React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAnalytics } from "@/hooks/use-analytics";
import { useIsMobile } from "@/hooks/use-mobile";

// --- HELPERS FOR CLIENT-SIDE DATA PADDING & AGGREGATION ---

const getDatesRange = (
  period: "Last 7 days" | "Last 28 days" | "Last 90 days",
) => {
  const days =
    period === "Last 7 days" ? 7 : period === "Last 28 days" ? 28 : 90;
  const dates: string[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    dates.push(`${yyyy}-${mm}-${dd}`);
  }
  return dates;
};

const padDailyData = (
  dates: string[],
  dailyClicks: { date: string; desktop: number; mobile: number }[] = [],
  dailyViews: { date: string; desktop: number; mobile: number }[] = [],
) => {
  const clicksMap = new Map(
    dailyClicks.map((c) => [c.date, Number(c.desktop) + Number(c.mobile)]),
  );
  const viewsMap = new Map(
    dailyViews.map((v) => [v.date, Number(v.desktop) + Number(v.mobile)]),
  );

  return dates.map((dateStr) => {
    const clicks = clicksMap.get(dateStr) || 0;
    const views = viewsMap.get(dateStr) || 0;
    return {
      dateStr,
      clicks,
      views,
    };
  });
};

const aggregateData = (
  paddedData: { dateStr: string; clicks: number; views: number }[],
  interval: "daily" | "4day" | "weekly" | "monthly",
) => {
  if (interval === "daily") {
    return paddedData.map((d) => {
      const dateObj = new Date(d.dateStr);
      const label = dateObj.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      return {
        label,
        dateKey: d.dateStr,
        clicks: d.clicks,
        views: d.views,
        ctr: d.views > 0 ? (d.clicks / d.views) * 100 : 0,
      };
    });
  }

  if (interval === "4day") {
    const results = [];
    for (let i = 0; i < paddedData.length; i += 4) {
      const chunk = paddedData.slice(i, i + 4);
      const clicks = chunk.reduce((sum, item) => sum + item.clicks, 0);
      const views = chunk.reduce((sum, item) => sum + item.views, 0);
      const startDate = new Date(chunk[0].dateStr);
      const label = startDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      results.push({
        label,
        dateKey: chunk[0].dateStr,
        clicks,
        views,
        ctr: views > 0 ? (clicks / views) * 100 : 0,
      });
    }
    return results;
  }

  if (interval === "weekly") {
    const results = [];
    for (let i = 0; i < paddedData.length; i += 7) {
      const chunk = paddedData.slice(i, i + 7);
      const clicks = chunk.reduce((sum, item) => sum + item.clicks, 0);
      const views = chunk.reduce((sum, item) => sum + item.views, 0);
      const startDate = new Date(chunk[0].dateStr);
      const label = `W${Math.floor(i / 7) + 1} (${startDate.toLocaleDateString(
        "en-US",
        {
          month: "short",
          day: "numeric",
        },
      )})`;
      results.push({
        label,
        dateKey: chunk[0].dateStr,
        clicks,
        views,
        ctr: views > 0 ? (clicks / views) * 100 : 0,
      });
    }
    return results;
  }

  if (interval === "monthly") {
    const groups: {
      [key: string]: { clicks: number; views: number; dateKey: string };
    } = {};
    paddedData.forEach((item) => {
      const dateObj = new Date(item.dateStr);
      const monthLabel = dateObj.toLocaleDateString("en-US", {
        month: "short",
      });
      if (!groups[monthLabel]) {
        groups[monthLabel] = { clicks: 0, views: 0, dateKey: item.dateStr };
      }
      groups[monthLabel].clicks += item.clicks;
      groups[monthLabel].views += item.views;
    });

    return Object.entries(groups).map(([label, val]) => ({
      label,
      dateKey: val.dateKey,
      clicks: val.clicks,
      views: val.views,
      ctr: val.views > 0 ? (val.clicks / val.views) * 100 : 0,
    }));
  }

  return [];
};

const chartConfig = {
  views: {
    label: "Views",
    color: "var(--color-primary)",
  },
  clicks: {
    label: "Clicks",
    color: "var(--color-chart-2)",
  },
  ctr: {
    label: "Average click rate",
    color: "var(--color-chart-3)",
  },
} satisfies ChartConfig;

export default function AnalyticsPage() {
  const isMobile = useIsMobile();

  // --- CORE STATE ---
  const [viewMode, setViewMode] = React.useState<"overview" | "detail">(
    "overview",
  );

  // Overview states
  const [overviewPeriod, setOverviewPeriod] = React.useState<
    "Last 7 days" | "Last 28 days" | "Last 90 days"
  >("Last 28 days");
  const [overviewInterval, setOverviewInterval] = React.useState<
    "daily" | "weekly" | "monthly" | "4day"
  >("daily");

  // Detailed states
  const [detailedPeriod, setDetailedPeriod] = React.useState<
    "7d" | "28d" | "90d"
  >("28d");
  const [viewsClicksInterval, setViewsClicksInterval] = React.useState<
    "daily" | "weekly" | "monthly" | "4day"
  >("daily");
  const [ctrInterval, setCtrInterval] = React.useState<
    "daily" | "weekly" | "monthly" | "4day"
  >("daily");

  React.useEffect(() => {
    if (isMobile) {
      setOverviewPeriod("Last 7 days");
      setDetailedPeriod("7d");
    }
  }, [isMobile]);

  // Adjust overview interval selection based on period
  const handleOverviewPeriodChange = (val: string | null) => {
    if (!val) return;
    const period = val as "Last 7 days" | "Last 28 days" | "Last 90 days";
    setOverviewPeriod(period);
    if (period === "Last 7 days") {
      setOverviewInterval("daily");
    } else if (period === "Last 28 days") {
      setOverviewInterval("daily");
    } else if (period === "Last 90 days") {
      setOverviewInterval("4day");
    }
  };

  // Adjust detailed interval selection based on period
  const handleDetailedPeriodChange = (newPeriod: "7d" | "28d" | "90d") => {
    setDetailedPeriod(newPeriod);
    if (newPeriod === "7d") {
      setViewsClicksInterval("daily");
      setCtrInterval("daily");
    } else if (newPeriod === "28d") {
      setViewsClicksInterval("daily");
      setCtrInterval("daily");
    } else if (newPeriod === "90d") {
      setViewsClicksInterval("4day");
      setCtrInterval("4day");
    }
  };

  // Map detailedPeriod key to fetch keyword
  const detailedPeriodQueryKey = React.useMemo(() => {
    if (detailedPeriod === "7d") return "Last 7 days";
    if (detailedPeriod === "28d") return "Last 28 days";
    return "Last 90 days";
  }, [detailedPeriod]);

  // --- QUERIES ---
  const { data: overviewData, isLoading: isOverviewLoading } =
    useAnalytics(overviewPeriod);
  const { data: detailedData, isLoading: isDetailedLoading } = useAnalytics(
    detailedPeriodQueryKey,
  );

  // --- DATA PROCESSING (OVERVIEW) ---
  const processedOverviewData = React.useMemo(() => {
    if (!overviewData) return [];
    const dates = getDatesRange(overviewPeriod);
    const padded = padDailyData(
      dates,
      overviewData.dailyClicks,
      overviewData.dailyViews,
    );
    return aggregateData(padded, overviewInterval);
  }, [overviewData, overviewPeriod, overviewInterval]);

  const overviewTotalClicks = React.useMemo(() => {
    if (!overviewData?.dailyClicks) return 0;
    return overviewData.dailyClicks.reduce(
      (sum, d) => sum + Number(d.desktop) + Number(d.mobile),
      0,
    );
  }, [overviewData?.dailyClicks]);

  const overviewTotalViews = React.useMemo(() => {
    if (!overviewData?.dailyViews) return 0;
    return overviewData.dailyViews.reduce(
      (sum, d) => sum + Number(d.desktop) + Number(d.mobile),
      0,
    );
  }, [overviewData?.dailyViews]);

  const overviewCtr = React.useMemo(() => {
    if (overviewTotalViews === 0) return 0;
    return (overviewTotalClicks / overviewTotalViews) * 100;
  }, [overviewTotalClicks, overviewTotalViews]);

  // --- DATA PROCESSING (DETAILED) ---
  const processedViewsClicksDetailedData = React.useMemo(() => {
    if (!detailedData) return [];
    const dates = getDatesRange(detailedPeriodQueryKey);
    const padded = padDailyData(
      dates,
      detailedData.dailyClicks,
      detailedData.dailyViews,
    );
    return aggregateData(padded, viewsClicksInterval);
  }, [detailedData, detailedPeriodQueryKey, viewsClicksInterval]);

  const processedCtrDetailedData = React.useMemo(() => {
    if (!detailedData) return [];
    const dates = getDatesRange(detailedPeriodQueryKey);
    const padded = padDailyData(
      dates,
      detailedData.dailyClicks,
      detailedData.dailyViews,
    );
    return aggregateData(padded, ctrInterval);
  }, [detailedData, detailedPeriodQueryKey, ctrInterval]);

  const detailedTotalClicks = React.useMemo(() => {
    if (!detailedData?.dailyClicks) return 0;
    return detailedData.dailyClicks.reduce(
      (sum, d) => sum + Number(d.desktop) + Number(d.mobile),
      0,
    );
  }, [detailedData?.dailyClicks]);

  const detailedTotalViews = React.useMemo(() => {
    if (!detailedData?.dailyViews) return 0;
    return detailedData.dailyViews.reduce(
      (sum, d) => sum + Number(d.desktop) + Number(d.mobile),
      0,
    );
  }, [detailedData?.dailyViews]);

  const detailedCtr = React.useMemo(() => {
    if (detailedTotalViews === 0) return 0;
    return (detailedTotalClicks / detailedTotalViews) * 100;
  }, [detailedTotalClicks, detailedTotalViews]);

  // Get interval options for detailed cards based on active period
  const detailedIntervalOptions = React.useMemo<
    { value: "daily" | "weekly" | "monthly" | "4day"; label: string }[]
  >(() => {
    if (detailedPeriod === "7d") {
      return [{ value: "daily", label: "Daily" }];
    }
    if (detailedPeriod === "28d") {
      return [
        { value: "daily", label: "Daily" },
        { value: "weekly", label: "Weekly" },
      ];
    }
    return [
      { value: "4day", label: "Daily" },
      { value: "weekly", label: "Weekly" },
      { value: "monthly", label: "Monthly" },
    ];
  }, [detailedPeriod]);

  // Get interval options for overview card based on active period
  const overviewIntervalOptions = React.useMemo<
    { value: "daily" | "weekly" | "monthly" | "4day"; label: string }[]
  >(() => {
    if (overviewPeriod === "Last 7 days") {
      return [{ value: "daily", label: "Daily" }];
    }
    if (overviewPeriod === "Last 28 days") {
      return [
        { value: "daily", label: "Daily" },
        { value: "weekly", label: "Weekly" },
      ];
    }
    return [
      { value: "4day", label: "Daily" },
      { value: "weekly", label: "Weekly" },
      { value: "monthly", label: "Monthly" },
    ];
  }, [overviewPeriod]);

  // Interval display labels mapped for Combobox
  const overviewIntervalLabel = React.useMemo(() => {
    const found = overviewIntervalOptions.find(
      (o) => o.value === overviewInterval,
    );
    return found ? found.label : "Daily";
  }, [overviewInterval, overviewIntervalOptions]);

  const detailedViewsClicksIntervalLabel = React.useMemo(() => {
    const found = detailedIntervalOptions.find(
      (o) => o.value === viewsClicksInterval,
    );
    return found ? found.label : "Daily";
  }, [viewsClicksInterval, detailedIntervalOptions]);

  const detailedCtrIntervalLabel = React.useMemo(() => {
    const found = detailedIntervalOptions.find((o) => o.value === ctrInterval);
    return found ? found.label : "Daily";
  }, [ctrInterval, detailedIntervalOptions]);

  // --- RENDER COMPONENT ---

  if (viewMode === "detail") {
    // --- DETAILED SCREEN (DRILL DOWN) ---
    return (
      <div className="flex flex-1 flex-col gap-4 py-4 px-4 md:gap-6 md:py-6 lg:px-6 h-full overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
        {/* Detailed Header */}
        <div className="flex items-center justify-between border-b pb-4 border-border/40 shrink-0">
          <button
            type="button"
            onClick={() => setViewMode("overview")}
            className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer group"
          >
            <CaretLeftIcon className="size-5 transition-transform group-hover:-translate-x-0.5" />
            <span className="font-heading text-base font-bold">Activity</span>
          </button>

          {/* Period selector combobox */}
          <Combobox
            value={detailedPeriodQueryKey}
            onValueChange={(val) => {
              if (val === "Last 7 days") handleDetailedPeriodChange("7d");
              else if (val === "Last 28 days")
                handleDetailedPeriodChange("28d");
              else if (val === "Last 90 days")
                handleDetailedPeriodChange("90d");
            }}
          >
            <ComboboxInput
              className="w-40 bg-transparent text-sm h-8"
              readOnly
            />
            <ComboboxContent className="w-40 rounded-xl bg-popover/90 backdrop-blur-md">
              <ComboboxList>
                <ComboboxItem value="Last 7 days" className="rounded-lg">
                  Last 7 days
                </ComboboxItem>
                <ComboboxItem value="Last 28 days" className="rounded-lg">
                  Last 28 days
                </ComboboxItem>
                <ComboboxItem value="Last 90 days" className="rounded-lg">
                  Last 90 days
                </ComboboxItem>
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </div>

        {/* Detailed Dashboard Body */}
        <div className="flex-1 overflow-y-auto space-y-6 pr-1 pb-6">
          {/* CARD 1: Clicks vs Views Bar Chart */}
          <Card className="shadow-xs overflow-hidden border-border/40">
            <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-6">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-bold font-heading tabular-nums">
                    {isDetailedLoading
                      ? "-"
                      : detailedTotalViews.toLocaleString()}
                  </span>
                  <span className="text-xs text-muted-foreground font-semibold">
                    Total views
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5 border-t sm:border-t-0 sm:border-l sm:pl-6 border-border/65 pt-1 sm:pt-0">
                  <span className="text-3xl font-bold font-heading tabular-nums text-primary">
                    {isDetailedLoading
                      ? "-"
                      : detailedTotalClicks.toLocaleString()}
                  </span>
                  <span className="text-xs text-muted-foreground font-semibold">
                    Total clicks
                  </span>
                </div>
              </div>

              {/* Card level interval selection */}
              <Combobox
                value={detailedViewsClicksIntervalLabel}
                onValueChange={(val) => {
                  if (!val) return;
                  const found = detailedIntervalOptions.find(
                    (o) => o.label === val,
                  );
                  if (found) setViewsClicksInterval(found.value);
                }}
              >
                <ComboboxInput
                  className="w-32 bg-transparent text-sm h-8"
                  disabled={detailedPeriod === "7d"}
                  readOnly
                />
                <ComboboxContent className="w-32 rounded-xl bg-popover/90 backdrop-blur-md">
                  <ComboboxList>
                    {detailedIntervalOptions.map((opt) => (
                      <ComboboxItem
                        key={opt.value}
                        value={opt.label}
                        className="rounded-lg cursor-pointer"
                      >
                        {opt.label}
                      </ComboboxItem>
                    ))}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </CardHeader>
            <CardContent className="px-2 pt-2 sm:px-6 sm:pt-4">
              {isDetailedLoading ? (
                <Skeleton className="h-[250px] w-full" />
              ) : (
                <ChartContainer
                  config={chartConfig}
                  className="aspect-auto h-[250px] w-full"
                >
                  <BarChart
                    data={processedViewsClicksDetailedData}
                    barGap={3}
                    barCategoryGap="25%"
                  >
                    <CartesianGrid
                      vertical={false}
                      strokeDasharray="3 3"
                      className="stroke-muted/20"
                    />
                    <XAxis
                      dataKey="label"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      minTickGap={24}
                    />
                    <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                    <ChartTooltip
                      cursor={{ fill: "var(--foreground)", opacity: 0.05 }}
                      content={<ChartTooltipContent indicator="dot" />}
                    />
                    <Bar
                      dataKey="views"
                      fill="var(--color-primary)"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={32}
                    />
                    <Bar
                      dataKey="clicks"
                      fill="var(--color-primary)"
                      fillOpacity={0.4}
                      radius={[4, 4, 0, 0]}
                      maxBarSize={32}
                    />
                  </BarChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>

          {/* CARD 2: Average Click Rate Line Chart */}
          <Card className="shadow-xs overflow-hidden border-border/40">
            <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 pb-4">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold font-heading tabular-nums text-emerald-500">
                  {isDetailedLoading ? "-" : `${detailedCtr.toFixed(1)}%`}
                </span>
                <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
                  Average click rate
                  <InfoIcon className="size-3.5 text-muted-foreground" />
                </span>
              </div>

              {/* Card level interval selection */}
              <Combobox
                value={detailedCtrIntervalLabel}
                onValueChange={(val) => {
                  if (!val) return;
                  const found = detailedIntervalOptions.find(
                    (o) => o.label === val,
                  );
                  if (found) setCtrInterval(found.value);
                }}
              >
                <ComboboxInput
                  className="w-32 bg-transparent text-sm h-8"
                  disabled={detailedPeriod === "7d"}
                  readOnly
                />
                <ComboboxContent className="w-32 rounded-xl bg-popover/90 backdrop-blur-md">
                  <ComboboxList>
                    {detailedIntervalOptions.map((opt) => (
                      <ComboboxItem
                        key={opt.value}
                        value={opt.label}
                        className="rounded-lg cursor-pointer"
                      >
                        {opt.label}
                      </ComboboxItem>
                    ))}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </CardHeader>
            <CardContent className="px-2 pt-2 sm:px-6 sm:pt-4">
              {isDetailedLoading ? (
                <Skeleton className="h-[250px] w-full" />
              ) : (
                <ChartContainer
                  config={chartConfig}
                  className="aspect-auto h-[250px] w-full"
                >
                  <LineChart data={processedCtrDetailedData}>
                    <CartesianGrid
                      vertical={false}
                      strokeDasharray="3 3"
                      className="stroke-muted/20"
                    />
                    <XAxis
                      dataKey="label"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      minTickGap={24}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      unit="%"
                    />
                    <ChartTooltip
                      cursor={{ stroke: "var(--border)", strokeWidth: 1 }}
                      content={<ChartTooltipContent indicator="dot" />}
                    />
                    <ReferenceLine
                      y={detailedCtr}
                      stroke="var(--muted-foreground)"
                      strokeDasharray="4 4"
                      className="opacity-75"
                    />
                    <Line
                      type="monotone"
                      dataKey="ctr"
                      stroke="var(--color-chart-3)"
                      strokeWidth={3}
                      dot={{
                        stroke: "var(--color-chart-3)",
                        strokeWidth: 2,
                        r: 4,
                        fill: "var(--background)",
                      }}
                      activeDot={{
                        r: 6,
                        strokeWidth: 0,
                        fill: "var(--color-chart-3)",
                      }}
                    />
                  </LineChart>
                </ChartContainer>
              )}
              {!isDetailedLoading && (
                <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground border-t pt-4 border-border/40">
                  <InfoIcon className="size-4 shrink-0" />
                  <span>
                    The dashed line represents your average period CTR (
                    {detailedCtr.toFixed(1)}%).
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // --- OVERVIEW SCREEN (DEFAULT) ---
  return (
    <div className="flex flex-1 flex-col gap-4 py-4 px-4 md:gap-6 md:py-6 lg:px-6 h-full overflow-hidden animate-in fade-in duration-200">
      {/* Period Summaries */}
      <div className="grid grid-cols-3 gap-4 shrink-0">
        <Card className="bg-gradient-to-t from-primary/5 to-card shadow-xs border-border/45">
          <CardHeader className="py-4">
            <CardDescription className="text-xs font-semibold">
              Period Views
            </CardDescription>
            <CardTitle className="text-lg md:text-2xl font-bold font-heading tabular-nums">
              {isOverviewLoading ? "-" : overviewTotalViews.toLocaleString()}
            </CardTitle>
          </CardHeader>
        </Card>

        {/* Period Clicks */}
        <Card className="bg-gradient-to-t from-primary/5 to-card shadow-xs border-border/45">
          <CardHeader className="py-4">
            <CardDescription className="text-xs font-semibold text-primary/80">
              Period Clicks
            </CardDescription>
            <CardTitle className="text-lg md:text-2xl font-bold font-heading text-primary tabular-nums">
              {isOverviewLoading ? "-" : overviewTotalClicks.toLocaleString()}
            </CardTitle>
          </CardHeader>
        </Card>

        {/* Period CTR */}
        <Card className="bg-gradient-to-t from-primary/5 to-card shadow-xs border-border/45">
          <CardHeader className="py-4">
            <CardDescription className="text-xs font-semibold text-emerald-500/80">
              Period CTR
            </CardDescription>
            <CardTitle className="text-lg md:text-2xl font-bold font-heading text-emerald-500 tabular-nums">
              {isOverviewLoading ? "-" : `${overviewCtr.toFixed(1)}%`}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Main Views & Clicks Comparison Chart Card (CLICKABLE TO DETAILED VIEW) */}
      <Card
        onClick={() => setViewMode("detail")}
        className="@container/card shadow-xs border-border/40 cursor-pointer hover:border-primary/50 hover:shadow-md group active:scale-[0.995] transition-all duration-300 relative overflow-hidden"
      >
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 pb-4">
          <div className="flex flex-col gap-0.5">
            <CardTitle className="font-heading font-bold text-lg flex items-center gap-1 text-foreground group-hover:text-primary transition-colors">
              <span>Views & Clicks</span>
              <CaretRightIcon className="size-5" />
            </CardTitle>
            <CardDescription className="hidden @[480px]/card:block">
              Comparing traffic vs. link click activities for{" "}
              {overviewPeriod.toLowerCase()}
            </CardDescription>
          </div>
          <CardAction
            className="flex items-center gap-2 flex-wrap sm:flex-nowrap"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Main view interval selector */}
            <Combobox
              value={overviewIntervalLabel}
              onValueChange={(val) => {
                if (!val) return;
                const found = overviewIntervalOptions.find(
                  (o) => o.label === val,
                );
                if (found) setOverviewInterval(found.value);
              }}
            >
              <ComboboxInput
                className="w-32 bg-transparent text-sm h-8 bg-background/30"
                disabled={overviewPeriod === "Last 7 days"}
                readOnly
              />
              <ComboboxContent className="w-32 rounded-xl bg-popover/90 backdrop-blur-md">
                <ComboboxList>
                  {overviewIntervalOptions.map((opt) => (
                    <ComboboxItem
                      key={opt.value}
                      value={opt.label}
                      className="rounded-lg cursor-pointer"
                      data-prevent-trigger
                    >
                      {opt.label}
                    </ComboboxItem>
                  ))}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>

            {/* Global Period dropdown */}
            <Combobox
              value={overviewPeriod}
              onValueChange={handleOverviewPeriodChange}
            >
              <ComboboxInput
                className="w-40 bg-transparent text-sm h-8"
                readOnly
              />
              <ComboboxContent className="w-40 rounded-xl bg-popover/90 backdrop-blur-md">
                <ComboboxList>
                  <ComboboxItem value="Last 7 days" className="rounded-lg">
                    Last 7 days
                  </ComboboxItem>
                  <ComboboxItem value="Last 28 days" className="rounded-lg">
                    Last 28 days
                  </ComboboxItem>
                  <ComboboxItem value="Last 90 days" className="rounded-lg">
                    Last 90 days
                  </ComboboxItem>
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </CardAction>
        </CardHeader>
        <CardContent className="px-2 pt-2 sm:px-6 sm:pt-4">
          {isOverviewLoading ? (
            <Skeleton className="h-[250px] w-full" />
          ) : (
            <ChartContainer
              config={chartConfig}
              className="aspect-auto h-[250px] w-full"
            >
              <BarChart
                data={processedOverviewData}
                barGap={3}
                barCategoryGap="25%"
              >
                <CartesianGrid
                  vertical={false}
                  strokeDasharray="3 3"
                  className="stroke-muted/20"
                />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={24}
                />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip
                  cursor={{ fill: "var(--foreground)", opacity: 0.05 }}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <Bar
                  dataKey="views"
                  fill="var(--color-primary)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={28}
                />
                <Bar
                  dataKey="clicks"
                  fill="var(--color-primary)"
                  fillOpacity={0.4}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={28}
                />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
        <div className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-primary to-primary/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </Card>

      {/* Per-Link Stats Table */}
      <Card className="flex flex-1 flex-col min-h-0 shadow-xs border-border/40">
        <CardHeader className="py-4 shrink-0">
          <CardTitle className="font-heading font-bold text-lg">
            Per-Link Performance
          </CardTitle>
          <CardDescription>
            Click breakdown by link — {overviewPeriod.toLowerCase()}.{" "}
            <span className="tabular-nums font-semibold text-foreground">
              {overviewTotalClicks.toLocaleString()}
            </span>{" "}
            total clicks.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto min-h-0 pr-1 pb-4">
          {isOverviewLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : !overviewData?.linkStats?.length ? (
            <div className="text-center py-8 text-muted-foreground">
              No link data to display.
            </div>
          ) : (
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-card shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="bg-card">Link</TableHead>
                  <TableHead className="bg-card">Status</TableHead>
                  <TableHead className="text-right bg-card">
                    Period Clicks
                  </TableHead>
                  <TableHead className="text-right bg-card">
                    Total Clicks
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {overviewData.linkStats.map((link) => (
                  <TableRow key={link.id}>
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-sm">
                          {link.title}
                        </span>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 max-w-[250px] truncate"
                        >
                          {link.url}
                          <ArrowSquareOutIcon className="size-3 shrink-0" />
                        </a>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={link.isActive ? "default" : "secondary"}
                        className="text-xs rounded-full px-2"
                      >
                        {link.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right tabular-nums font-semibold">
                      {link.periodClicks.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">
                      {link.totalClicks.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
