"use client";

import type { ScenarioField } from "@/lib/types";

interface ScenarioConfiguratorProps {
  fields: ScenarioField[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
}

export default function ScenarioConfigurator({
  fields,
  values,
  onChange,
}: ScenarioConfiguratorProps) {
  if (!fields.length) {
    return null;
  }

  return (
    <div className="space-y-4 rounded-lg border border-ops-border/60 bg-ops-elevated/40 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs uppercase tracking-[0.3em] text-ops-muted">
          Scenario Details
        </h3>
        <span className="text-[10px] uppercase tracking-[0.2em] text-ops-muted">
          {fields.filter((field) => field.required).length} required
        </span>
      </div>
      <div className="space-y-3">
        {fields.map((field) => {
          const inputType = field.type === "date" ? "date" : field.type === "phone" ? "tel" : "text";
          return (
            <div key={field.key} className="space-y-2">
              <label className="text-xs uppercase tracking-[0.25em] text-ops-muted">
                {field.label}
              </label>
              <input
                type={inputType}
                value={values[field.key] ?? ""}
                onChange={(event) => onChange(field.key, event.target.value)}
                placeholder={field.placeholder}
                className="w-full rounded-md border border-ops-border bg-ops-elevated px-4 py-3 text-sm text-ops-text outline-none transition focus:border-ops-accent"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
