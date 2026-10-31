"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Radar } from "lucide-react";
import { fetchLostNearby, lostKeys } from "@/lib/api/lost";
import { DashboardCard } from "@/components/home/dashboard-cards";
import { LostCard } from "./lost-card";

// Top of Home: dogs missing near me right now. Renders nothing otherwise.
export function LostAlertBanner() {
  const { data } = useQuery({ queryKey: lostKeys.nearby, queryFn: fetchLostNearby });
  const missing = (data ?? []).filter((r) => r.status === "lost" && !r.mine);
  if (missing.length === 0) return null;

  return (
    <section className="grid gap-3 rounded-2xl border border-coral/50 bg-coral/10 p-4 backdrop-blur-md" aria-labelledby="lost-alert">
      <div className="flex items-center justify-between gap-2">
        <h2 id="lost-alert" className="flex items-center gap-2 font-heading font-semibold">
          <Radar className="size-5 text-coral" aria-hidden />
          {missing.length === 1 ? "A dog is missing near you" : `${missing.length} dogs are missing near you`}
        </h2>
        <Link href="/lost" className="text-sm font-medium text-primary">See all</Link>
      </div>
      <ul className="grid gap-2">
        {missing.slice(0, 2).map((report) => (
          <li key={report.id}>
            <LostCard report={report} compact />
          </li>
        ))}
      </ul>
    </section>
  );
}

// Side column: always-there way into Lost & Found.
export function LostAndFoundCard() {
  return (
    <DashboardCard title="Lost & Found" action={<Link href="/lost" className="text-sm font-medium text-primary">Open</Link>}>
      <p className="text-sm text-muted-foreground">
        If your dog goes missing, alert verified members nearby in seconds and get sightings on a map.
      </p>
    </DashboardCard>
  );
}
