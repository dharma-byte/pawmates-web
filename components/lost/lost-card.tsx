"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Eye, MapPin, PawPrint } from "lucide-react";
import { cn } from "cn";
import type { LostSummary } from "@/lib/api/lost";
import { timeAgo } from "@/lib/utils/dates";

export function LostCard({ report, compact = false }: { report: LostSummary; compact?: boolean }) {
  const [now] = useState(() => Date.now());
  const found = report.status === "found";
  const closed = report.status === "closed";

  return (
    <article className="relative flex gap-3 overflow-hidden rounded-2xl border bg-card p-3">
      <span className={cn("relative shrink-0 overflow-hidden rounded-xl bg-muted", compact ? "size-16" : "size-24")}>
        {report.photo ? (
          <Image src={report.photo} alt="" fill sizes="96px" className={cn("object-cover", (found || closed) && "grayscale-[40%]")} />
        ) : (
          <PawPrint className="absolute inset-0 m-auto size-8 text-teal" aria-hidden />
        )}
      </span>
      <div className="grid min-w-0 flex-1 content-start gap-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate font-heading font-semibold">
            <Link href={`/lost/${report.id}`} className="after:absolute after:inset-0 hover:underline">
              {report.pet_name}
            </Link>
            {report.breed && <span className="font-sans text-sm font-normal text-muted-foreground"> · {report.breed}</span>}
          </h3>
          <span
            className={cn(
              "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold",
              found ? "bg-teal text-white" : closed ? "bg-muted" : "bg-coral text-white",
            )}
          >
            {found ? "Found 🎉" : closed ? "Closed" : report.mine ? "Your dog" : "Lost"}
          </span>
        </div>
        <p className="flex items-start gap-1.5 text-sm text-muted-foreground">
          <MapPin className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          <span className="line-clamp-2">
            {found ? `Found ${timeAgo(report.found_at ?? report.created_at, now)}` : `Last seen ${timeAgo(report.last_seen_at, now)}`} near{" "}
            {report.last_seen_place}
            {report.distance_km != null && !report.mine && ` · ~${report.distance_km} km away`}
          </span>
        </p>
        {!compact && report.description && <p className="line-clamp-2 text-sm">{report.description}</p>}
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Eye className="size-3.5" aria-hidden /> {report.sightings} sighting{report.sightings === 1 ? "" : "s"}
        </p>
      </div>
    </article>
  );
}
