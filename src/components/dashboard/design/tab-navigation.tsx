"use client";

import { cn } from "@/lib/utils";

interface TabItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface TabNavigationProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function TabNavigation({
  tabs,
  activeTab,
  onTabChange,
}: TabNavigationProps) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pb-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium transition-all shrink-0 min-w-[60px]",
            activeTab === tab.id
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          <span className="text-base">{tab.icon}</span>
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
