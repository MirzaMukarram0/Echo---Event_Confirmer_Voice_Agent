"use client";

interface StatCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
  indicator?: "live" | "up" | "down" | "neutral";
}

export default function StatCard({
  label,
  value,
  sublabel,
  indicator,
}: StatCardProps) {
  return (
    <div className="bg-ob-surface border border-ob-border rounded-md p-4 flex flex-col justify-between">
      <div>
        <span className="text-[10px] font-mono uppercase tracking-widest text-ob-muted">
          {label}
        </span>
        <div className="flex items-center gap-2 mt-1.5">
          {indicator === "live" && (
            <span className="w-2 h-2 rounded-full bg-status-live animate-pulse-dot" />
          )}
          <span className="text-xl font-mono font-semibold text-ob-text tracking-tight">
            {value}
          </span>
        </div>
      </div>
      {sublabel && (
        <span className="text-[10px] text-ob-faint font-mono mt-2 block">
          {sublabel}
        </span>
      )}
    </div>
  );
}
