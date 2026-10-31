import { PawPrint } from "lucide-react";
import { cn } from "cn";

const TONES = {
  peach: "bg-[#ffd8c9]",
  mint: "bg-[#cfeee9]",
  sky: "bg-[#dbe6f5]",
  sun: "bg-[#ffe7b8]",
} as const;

// Illustrative pet card for marketing pages. Swap the tinted panel for a real
// photo (next/image) once we have permission to use members' pet photos.
export function PetTile({
  name,
  detail,
  tone,
  className,
}: {
  name: string;
  detail: string;
  tone: keyof typeof TONES;
  className?: string;
}) {
  return (
    <div className={cn("relative flex flex-col justify-end overflow-hidden rounded-3xl p-3", TONES[tone], className)}>
      <PawPrint className="absolute top-1/2 left-1/2 size-16 -translate-x-1/2 -translate-y-1/2 text-black/10" aria-hidden />
      <span className="relative self-start rounded-full bg-background px-3 py-1 text-sm font-semibold shadow-sm">
        {name} <span className="font-normal text-muted-foreground">· {detail}</span>
      </span>
    </div>
  );
}
