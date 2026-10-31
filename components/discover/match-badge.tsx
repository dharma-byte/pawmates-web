"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSharedQuery } from "@/hooks/use-shared-query";
import { Info } from "lucide-react";
import { cn } from "cn";
import { fetchMatchBreakdown, matchKeys } from "@/lib/api/discover";
import { fetchMe, meKey } from "@/lib/api/me";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";

const PARTS = [
  { key: "size", label: "Size" },
  { key: "energy", label: "Energy" },
  { key: "play_style", label: "Play style" },
  { key: "temperament", label: "Temperament" },
] as const;

// "96% match" that opens "Why this match?". The breakdown loads only when opened.
export function MatchBadge({
  petId,
  petName,
  score,
  className,
}: {
  petId: string;
  petName: string;
  score: number;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const { data: me } = useSharedQuery({ queryKey: meKey, queryFn: fetchMe });
  const myPet = me?.pets[0];
  const breakdown = useQuery({
    queryKey: matchKeys.breakdown(myPet?.id ?? "", petId),
    queryFn: () => fetchMatchBreakdown(myPet!.id, petId),
    enabled: open && !!myPet,
    staleTime: 5 * 60 * 1000,
  });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        aria-label={`${score}% match. Why this match?`}
        className={cn(
          "inline-flex items-center gap-1 rounded-full bg-background/95 px-2.5 py-1 text-xs font-semibold text-primary shadow-sm outline-none hover:bg-background focus-visible:ring-3 focus-visible:ring-ring/50",
          className,
        )}
      >
        {score}% match <Info className="size-3.5" aria-hidden />
      </PopoverTrigger>
      <PopoverContent className="w-72" align="end">
        <div className="grid gap-3">
          <p className="font-heading font-semibold">
            Why {myPet?.name ?? "your pet"} + {petName} = {score}%
          </p>
          {breakdown.isPending && <Skeleton className="h-28 w-full" />}
          {breakdown.data && (
            <>
              <ul className="grid gap-2.5">
                {PARTS.map(({ key, label }) => {
                  const part = breakdown.data![key];
                  return (
                    <li key={key} className="grid gap-1">
                      <div className="flex justify-between text-sm">
                        <span>{label}</span>
                        <span className="text-muted-foreground">
                          {part.points}/{part.max}
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full bg-teal" style={{ width: `${(part.points / part.max) * 100}%` }} />
                      </div>
                    </li>
                  );
                })}
              </ul>
              {breakdown.data.notes.length > 0 && (
                <ul className="grid gap-1 rounded-lg bg-accent p-2 text-xs text-accent-foreground">
                  {breakdown.data.notes.map((note) => (
                    <li key={note}>• {note}</li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
