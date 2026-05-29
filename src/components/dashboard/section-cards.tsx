"use client";

import { TrendDownIcon, TrendUpIcon } from "@phosphor-icons/react";
import { animate } from "motion/react";
import { useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface SectionCardsProps {
  totalLinks: number;
  totalClicks: number;
  monthClicks: number;
  activeLinks: number;
  prevMonthClicks?: number;
  totalViews?: number;
  monthViews?: number;
  prevMonthViews?: number;
}

function calcTrend(
  current: number,
  previous: number,
): { value: string; isUp: boolean } {
  if (previous === 0) {
    return { value: current > 0 ? "+100%" : "0%", isUp: current > 0 };
  }
  const pct = ((current - previous) / previous) * 100;
  const sign = pct >= 0 ? "+" : "";
  return { value: `${sign}${pct.toFixed(1)}%`, isUp: pct >= 0 };
}

function AnimatedNumber({
  value,
  isDecimal = false,
}: {
  value: number;
  isDecimal?: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (node) {
      const controls = animate(0, value, {
        duration: 1.5,
        ease: "easeOut",
        onUpdate: (latest) => {
          node.textContent = isDecimal
            ? latest.toFixed(1)
            : Math.round(latest).toLocaleString();
        },
      });
      return () => controls.stop();
    }
  }, [value, isDecimal]);

  return (
    <span ref={ref}>
      {isDecimal ? value.toFixed(1) : value.toLocaleString()}
    </span>
  );
}

export function SectionCards({
  // totalLinks,
  totalClicks,
  monthClicks,
  // activeLinks,
  prevMonthClicks = 0,
  totalViews = 0,
  monthViews = 0,
  prevMonthViews = 0,
}: SectionCardsProps) {
  const clickTrend = calcTrend(monthClicks, prevMonthClicks);
  const _viewTrend = calcTrend(monthViews, prevMonthViews);

  const overallCtr = totalViews > 0 ? (totalClicks / totalViews) * 100 : 0;
  const _monthCtr = monthViews > 0 ? (monthClicks / monthViews) * 100 : 0;

  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      {/* 1. Total Views */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Views</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            <AnimatedNumber value={totalViews} />
          </CardTitle>
          <CardAction>
            <Badge variant="outline">All time</Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Across your public profile
          </div>
          <div className="text-muted-foreground">Lifetime page view count</div>
        </CardFooter>
      </Card>

      {/* 2. Total Clicks */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Clicks</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            <AnimatedNumber value={totalClicks} />
          </CardTitle>
          <CardAction>
            <Badge variant="outline">All time</Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Across all active links
          </div>
          <div className="text-muted-foreground">Lifetime click engagement</div>
        </CardFooter>
      </Card>

      {/* 3. Average CTR */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Average CTR</CardDescription>
          <CardTitle className="text-2xl font-semibold text-emerald-500 tabular-nums @[250px]/card:text-3xl">
            <AnimatedNumber value={overallCtr} isDecimal={true} />%
          </CardTitle>
          <CardAction>
            <Badge
              variant="outline"
              className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
            >
              Conversion Rate
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Clicks divided by page views
          </div>
          <div className="text-muted-foreground">
            Traffic conversion efficiency
          </div>
        </CardFooter>
      </Card>

      {/* 4. Monthly Performance */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>This Month Clicks</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            <AnimatedNumber value={monthClicks} />
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {clickTrend.isUp ? <TrendUpIcon /> : <TrendDownIcon />}
              {clickTrend.value}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {clickTrend.isUp ? "Trending up" : "Trending down"} this month{" "}
            {clickTrend.isUp ? (
              <TrendUpIcon className="size-4" />
            ) : (
              <TrendDownIcon className="size-4" />
            )}
          </div>
          <div className="text-muted-foreground">
            vs. {prevMonthClicks.toLocaleString()} last month
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
