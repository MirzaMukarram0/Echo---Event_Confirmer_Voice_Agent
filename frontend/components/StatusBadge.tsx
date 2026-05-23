"use client";

import type { CallStatusType } from "@/lib/types";

const statusStyles: Record<CallStatusType, string> = {
  queued: "border-ops-muted/30 bg-ops-muted/20 text-ops-muted",
  "in-progress": "border-emerald-500/30 bg-emerald-500/20 text-emerald-400",
  ended: "border-slate-500/30 bg-slate-500/20 text-slate-400",
  failed: "border-red-500/30 bg-red-500/20 text-red-400",
};

interface StatusBadgeProps {
  status: CallStatusType;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-mono uppercase tracking-[0.2em] ${
        statusStyles[status]
      }`}
    >
      {status.replace("-", " ")}
    </span>
  );
}
