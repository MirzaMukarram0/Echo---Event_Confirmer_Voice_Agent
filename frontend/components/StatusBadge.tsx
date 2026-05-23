"use client";

import type { CallStatusType } from "../lib/types";

interface StatusBadgeConfig {
  label: string;
  className: string;
}

const STATUS_CONFIG: Record<CallStatusType | "no-answer", StatusBadgeConfig> = {
  "in-progress": {
    label: "Live",
    className: "bg-[#052e16] text-[#22c55e] border-[#166534]",
  },
  ended: {
    label: "Ended",
    className: "bg-[#171717] text-[#737373] border-[#2a2a2a]",
  },
  failed: {
    label: "Failed",
    className: "bg-[#1c0a0a] text-[#ef4444] border-[#7f1d1d]",
  },
  queued: {
    label: "Queued",
    className: "bg-[#171717] text-[#a3a3a3] border-[#2a2a2a]",
  },
  "no-answer": {
    label: "No Answer",
    className: "bg-[#422006] text-[#eab308] border-[#713f12]",
  },
};

interface StatusBadgeProps {
  status: CallStatusType | "no-answer";
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const badge = STATUS_CONFIG[status] || {
    label: status,
    className: "bg-[#171717] text-[#737373] border-[#2a2a2a]",
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded border ${badge.className}`}
    >
      {badge.label}
    </span>
  );
}
