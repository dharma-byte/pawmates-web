"use client";

import { cn } from "cn";
import type { Option } from "@/lib/constants/pets";

// Single-choice group of large tappable chips (easier on phones than a dropdown).
export function ChoiceChips<T extends string>({
  id,
  options,
  value,
  onChange,
  invalid,
}: {
  id: string;
  options: Option<T>[];
  value: T | undefined;
  onChange: (value: T) => void;
  invalid?: boolean;
}) {
  return (
    <div
      id={id}
      role="radiogroup"
      aria-invalid={invalid}
      aria-describedby={invalid ? `${id}-error` : undefined}
      className="flex flex-wrap gap-2"
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.value)}
            className={cn(
              "rounded-full border px-3.5 py-2 text-sm transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              selected
                ? "border-primary bg-primary text-primary-foreground"
                : "border-input bg-background hover:bg-muted",
              invalid && !value && "border-destructive",
            )}
          >
            {option.label}
            {option.hint && (
              <span className={cn("ml-1 text-xs", selected ? "opacity-80" : "text-muted-foreground")}>
                {option.hint}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
