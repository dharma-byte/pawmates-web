"use client";

import { useEffect, useId, useMemo } from "react";
import Image from "next/image";
import { Camera, ImagePlus } from "lucide-react";
import { cn } from "cn";

// Photo input with a preview. The file is compressed later, on upload.
export function ImagePicker({
  file,
  onChange,
  existingUrl,
  label,
  shape = "square",
  invalid,
}: {
  file: File | null;
  onChange: (file: File | null) => void;
  existingUrl?: string | null;
  label: string;
  shape?: "circle" | "square";
  invalid?: boolean;
}) {
  const inputId = useId();
  const preview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  // Free the previous preview's memory when the file changes or on unmount.
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const src = preview ?? existingUrl ?? null;

  return (
    <div className="flex items-center gap-4">
      <label
        htmlFor={inputId}
        className={cn(
          "relative flex size-24 shrink-0 cursor-pointer items-center justify-center overflow-hidden border-2 border-dashed bg-muted transition-colors hover:bg-secondary",
          shape === "circle" ? "rounded-full" : "rounded-xl",
          invalid ? "border-destructive" : "border-input",
        )}
      >
        {src ? (
          <Image src={src} alt={label} fill unoptimized className="object-cover" />
        ) : (
          <ImagePlus className="size-7 text-muted-foreground" aria-hidden />
        )}
      </label>
      <div className="grid gap-1 text-sm">
        <label
          htmlFor={inputId}
          className="inline-flex cursor-pointer items-center gap-1.5 font-medium text-primary underline-offset-4 hover:underline"
        >
          <Camera className="size-4" aria-hidden />
          {src ? "Change photo" : label}
        </label>
        <span className="text-muted-foreground">JPG, PNG or WebP. We shrink it for you.</span>
      </div>
      <input
        id={inputId}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={(event) => onChange(event.target.files?.[0] ?? null)}
      />
    </div>
  );
}
