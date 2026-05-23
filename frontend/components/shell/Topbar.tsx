"use client";

import { useNavigation } from "../../lib/navigation";
import { useEffect, useState } from "react";

export default function Topbar() {
  const { activeView } = useNavigation();
  const [isServerOnline, setIsServerOnline] = useState(true);

  // Poll server health endpoint
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch("/api/health");
        setIsServerOnline(res.ok);
      } catch {
        setIsServerOnline(false);
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  const getPageTitle = () => {
    if (activeView === "overview") return "Overview";
    if (activeView === "monitor") return "Live Monitor";
    if (activeView === "logs") return "Logs";
    if (activeView === "settings") return "Settings";
    if (activeView.startsWith("scenario/")) {
      const scenarioId = activeView.split("/")[1];
      return scenarioId
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    }
    return "Dashboard";
  };

  return (
    <header className="h-12 border-b border-v-border flex items-center px-6 gap-4 flex-shrink-0 select-none bg-v-base">
      {/* Page Title — Replaces Breadcrumb */}
      <h1 className="text-sm font-semibold text-v-white font-sans">
        {getPageTitle()}
      </h1>

      <div className="flex-1" />

      {/* Health Status Indicator */}
      <div className="flex items-center gap-1.5 select-none">
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            isServerOnline
              ? "bg-v-green animate-pulse-dot"
              : "bg-v-red"
          }`}
        />
        <span className="text-xs text-v-muted">
          {isServerOnline ? "Online" : "Offline"}
        </span>
      </div>

      {/* Credits Balance Block */}
      <div className="flex items-center gap-1.5 border border-v-border rounded px-2.5 py-1 select-none">
        <span className="text-xs text-v-sub font-mono">$10.00</span>
        <span className="text-xs text-v-faint">credits</span>
      </div>
    </header>
  );
}
