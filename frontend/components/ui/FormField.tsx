"use client";

import React from "react";

interface FormFieldProps {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}

export default function FormField({
  label,
  required,
  hint,
  children,
}: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="block text-xs font-medium text-v-text select-none">
        {label}
        {required && <span className="text-v-red ml-1">*</span>}
      </label>
      {children}
      {hint && (
        <p className="text-[11px] text-v-muted font-normal select-none mt-0.5">
          {hint}
        </p>
      )}
    </div>
  );
}
