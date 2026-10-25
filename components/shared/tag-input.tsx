"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";

// Short tags like "fetch" or "loud noises". Enter or comma adds one.
export function TagInput({
  id,
  value,
  onChange,
  placeholder,
  max = 15,
}: {
  id: string;
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  max?: number;
}) {
  const [draft, setDraft] = useState("");

  function add() {
    const tag = draft.trim().toLowerCase().slice(0, 30);
    setDraft("");
    if (!tag || value.includes(tag) || value.length >= max) return;
    onChange([...value, tag]);
  }

  return (
    <div className="grid gap-2">
      {value.length > 0 && (
        <ul className="flex flex-wrap gap-1.5">
          {value.map((tag) => (
            <li key={tag} className="inline-flex items-center gap-1 rounded-full bg-secondary py-1 pr-1 pl-2.5 text-sm text-secondary-foreground">
              {tag}
              <button
                type="button"
                aria-label={`Remove ${tag}`}
                onClick={() => onChange(value.filter((t) => t !== tag))}
                className="rounded-full p-0.5 hover:bg-background"
              >
                <X className="size-3" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <Input
        id={id}
        value={draft}
        placeholder={value.length >= max ? `Up to ${max} tags` : placeholder}
        disabled={value.length >= max}
        className="h-10"
        onChange={(event) => setDraft(event.target.value.replace(",", ""))}
        onBlur={add}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === ",") {
            event.preventDefault();
            add();
          }
        }}
      />
    </div>
  );
}
