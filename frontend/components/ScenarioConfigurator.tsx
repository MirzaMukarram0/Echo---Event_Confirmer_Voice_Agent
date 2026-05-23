"use client";

import type { ScenarioField } from "../lib/types";

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
    <div className="space-y-4 rounded-xl border border-ops-border/50 bg-ops-surface/30 p-4">
      <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-ops-accent mb-2">
        Scenario Parameters
      </h3>
      <div className="grid gap-4">
        {fields.map((field) => (
          <div key={field.key} className="space-y-1.5 relative group">
            <label
              htmlFor={`config-${field.key}`}
              className="text-[10px] uppercase tracking-[0.2em] text-ops-muted transition-colors group-focus-within:text-ops-accent"
            >
              {field.label} {field.required && <span className="text-ops-accent">*</span>}
            </label>
            <div className="relative">
              <input
                id={`config-${field.key}`}
                type={field.type === "phone" ? "tel" : field.type === "date" ? "date" : "text"}
                value={values[field.key] || ""}
                onChange={(e) => onChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                className={`glass-input w-full rounded-lg px-4 py-3 text-sm text-ops-text outline-none placeholder:text-ops-muted/40 ${field.type === "date" ? "date-input" : ""}`}
              />
              {/* Subtle accent line on focus */}
              <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-ops-accent transition-all duration-300 group-focus-within:w-full" />
            </div>
            {field.placeholder && (
              <p className="text-[10px] text-ops-muted/70 pt-1">{field.placeholder}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
