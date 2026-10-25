"use client";

import { useEffect, useMemo } from "react";
import Image from "next/image";
import { ImagePlus, X } from "lucide-react";

export type PhotoItem = { kind: "existing"; url: string } | { kind: "new"; file: File };

// Up to `max` photos: already-uploaded URLs plus newly chosen files.
// The first photo is the main one shown on cards.
export function PhotoGrid({
  items,
  onChange,
  max = 6,
  label,
}: {
  items: PhotoItem[];
  onChange: (items: PhotoItem[]) => void;
  max?: number;
  label: string;
}) {
  const previews = useMemo(
    () => items.map((item) => (item.kind === "existing" ? item.url : URL.createObjectURL(item.file))),
    [items],
  );
  useEffect(
    () => () => {
      previews.forEach((url, i) => items[i]?.kind === "new" && URL.revokeObjectURL(url));
    },
    [previews, items],
  );

  return (
    <div className="grid gap-2">
      <ul className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {items.map((item, index) => (
          <li key={item.kind === "existing" ? item.url : `${item.file.name}-${index}`} className="relative aspect-square overflow-hidden rounded-lg bg-muted">
            <Image src={previews[index]} alt={`${label} ${index + 1}`} fill unoptimized className="object-cover" />
            {index === 0 && (
              <span className="absolute bottom-1 left-1 rounded bg-background/90 px-1.5 text-[10px] font-medium">Main</span>
            )}
            <button
              type="button"
              aria-label={`Remove photo ${index + 1}`}
              onClick={() => onChange(items.filter((_, i) => i !== index))}
              className="absolute top-1 right-1 rounded-full bg-background/90 p-1 hover:bg-background"
            >
              <X className="size-3.5" />
            </button>
          </li>
        ))}
        {items.length < max && (
          <li>
            <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-input text-xs text-muted-foreground hover:bg-muted">
              <ImagePlus className="size-5" aria-hidden />
              Add
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="sr-only"
                onChange={(event) => {
                  const files = Array.from(event.target.files ?? []).slice(0, max - items.length);
                  event.target.value = "";
                  onChange([...items, ...files.map((file) => ({ kind: "new" as const, file }))]);
                }}
              />
            </label>
          </li>
        )}
      </ul>
      <p className="text-xs text-muted-foreground">
        {items.length}/{max} photos. The first one is shown on cards.
      </p>
    </div>
  );
}
