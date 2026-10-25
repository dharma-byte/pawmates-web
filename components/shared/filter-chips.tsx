"use client";

import { cn } from "cn";
import type { Option } from "@/lib/constants/pets";

// Multi-select chips for filters. An empty selection means "any".
export function FilterChips<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: Option<T>[];
  value: T[];
  onChange: (value: T[]) => void;
}) {
  const toggle = (option: T) =>
    onChange(value.includes(option) ? value.filter((v) => v !== option) : [...value, option]);

  return (
    <fieldset className="grid gap-2">
      <legend className="mb-2 text-sm font-medium">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const selected = value.includes(option.value);
          return (
            <button
              key={option.value}
              type="button"
              role="checkbox"
              aria-checked={selected}
              onClick={() => toggle(option.value)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                selected
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-input bg-background hover:bg-muted",
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
