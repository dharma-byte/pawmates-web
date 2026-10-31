import Image from "next/image";
import { PawPrint } from "lucide-react";
import { cn } from "cn";

const TONES = {
  peach: "bg-coral/25",
  mint: "bg-teal/25",
  sky: "bg-sky-400/20",
  sun: "bg-orange/25",
} as const;

// Pet card for marketing pages: a real photo (public domain / CC0, see
// public/pets/CREDITS.md) or, without one, a tinted panel with a paw.
export function PetTile({
  name,
  detail,
  tone,
  photo,
  className,
}: {
  name: string;
  detail: string;
  tone: keyof typeof TONES;
  photo?: string;
  className?: string;
}) {
  return (
    <div className={cn("relative flex flex-col justify-end overflow-hidden rounded-3xl p-3 shadow-lg", TONES[tone], className)}>
      {photo ? (
        <>
          <Image src={photo} alt="" fill sizes="(min-width: 1024px) 280px, 45vw" className="object-cover" />
          <span className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-black/45 to-transparent" />
        </>
      ) : (
        <PawPrint className="absolute top-1/2 left-1/2 size-16 -translate-x-1/2 -translate-y-1/2 text-white/15" aria-hidden />
      )}
      <span className="relative self-start rounded-full bg-background px-3 py-1 text-sm font-semibold shadow-sm">
        {name} <span className="font-normal text-muted-foreground">· {detail}</span>
      </span>
    </div>
  );
}
