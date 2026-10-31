"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PartyPopper, Radar, ShieldCheck } from "lucide-react";
import { fetchLostNearby, lostKeys } from "@/lib/api/lost";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { LostCard } from "./lost-card";
import { ReportLostDialog } from "./report-lost-dialog";

// Lost & Found: dogs missing near me, my own reports, and happy endings.
export function LostView() {
  const [reporting, setReporting] = useState(false);
  const { data, isPending, error } = useQuery({ queryKey: lostKeys.nearby, queryFn: fetchLostNearby });

  const mine = (data ?? []).filter((r) => r.mine && r.status === "lost");
  const lost = (data ?? []).filter((r) => !r.mine && r.status === "lost");
  const found = (data ?? []).filter((r) => r.status === "found");

  return (
    <div className="grid gap-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="grid gap-1">
          <h1 className="text-2xl font-bold">Lost & Found</h1>
          <p className="text-muted-foreground">Help bring dogs home. Members within a few km are alerted the moment a dog goes missing.</p>
        </div>
        <Button onClick={() => setReporting(true)} className="bg-coral text-white hover:bg-coral/90">
          <Radar aria-hidden /> Report my dog lost
        </Button>
      </div>

      {isPending && <Skeleton className="h-40 rounded-2xl" />}
      {error && <p className="text-destructive">{error.message}</p>}

      {mine.length > 0 && <Section title="Your lost dog" reports={mine} />}

      {data && (
        <section className="grid gap-3" aria-labelledby="lost-nearby">
          <h2 id="lost-nearby" className="font-heading text-lg font-semibold">Missing near you</h2>
          {lost.length === 0 ? (
            <p className="flex items-center gap-2 rounded-2xl border border-dashed bg-card/60 p-6 text-sm text-muted-foreground">
              <ShieldCheck className="size-5 shrink-0 text-teal" aria-hidden />
              No dogs reported missing near you right now. If one goes missing, you&apos;ll get an alert in the bell.
            </p>
          ) : (
            <ul className="grid gap-3 md:grid-cols-2">
              {lost.map((report) => (
                <li key={report.id}>
                  <LostCard report={report} />
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {found.length > 0 && (
        <section className="grid gap-3" aria-labelledby="lost-found">
          <h2 id="lost-found" className="flex items-center gap-2 font-heading text-lg font-semibold">
            <PartyPopper className="size-5 text-orange" aria-hidden /> Back home
          </h2>
          <ul className="grid gap-3 md:grid-cols-2">
            {found.map((report) => (
              <li key={report.id}>
                <LostCard report={report} compact />
              </li>
            ))}
          </ul>
        </section>
      )}

      {reporting && <ReportLostDialog onClose={() => setReporting(false)} />}
    </div>
  );
}

function Section({ title, reports }: { title: string; reports: Parameters<typeof LostCard>[0]["report"][] }) {
  return (
    <section className="grid gap-3">
      <h2 className="font-heading text-lg font-semibold">{title}</h2>
      <ul className="grid gap-3 md:grid-cols-2">
        {reports.map((report) => (
          <li key={report.id}>
            <LostCard report={report} />
          </li>
        ))}
      </ul>
    </section>
  );
}
