"use client";

import React from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function PageHeader({
  title,
  description,
  action,
}: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-6 select-none border-b border-v-border pb-4">
      <div>
        <h2 className="text-lg font-semibold text-v-white mb-1 font-sans">
          {title}
        </h2>
        {description && (
          <p className="text-xs text-v-sub font-mono">{description}</p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}
