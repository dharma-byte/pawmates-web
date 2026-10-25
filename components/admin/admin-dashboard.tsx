"use client";

import { useQuery } from "@tanstack/react-query";
import { ShieldAlert } from "lucide-react";
import { adminKeys, fetchAdminStats, fetchIsAdmin } from "@/lib/api/admin";
import { Skeleton } from "@/components/ui/skeleton";
import { VerificationQueue } from "./verification-queue";

// The page is only useful to admins; the data is protected by RLS and the
// admin-only RPCs either way.
export function AdminDashboard() {
  const { data: isAdmin, isPending } = useQuery({
    queryKey: adminKeys.isAdmin,
    queryFn: fetchIsAdmin,
  });

  if (isPending) return <Skeleton className="h-64 w-full rounded-xl" />;

  if (!isAdmin) {
    return (
      <div className="grid gap-3 py-16 text-center">
        <ShieldAlert className="mx-auto size-10 text-muted-foreground" aria-hidden />
        <h1 className="text-xl font-bold">Admins only</h1>
        <p className="text-muted-foreground">This page is for the Pawmates moderation team.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-8">
      <StatsRow />
      <VerificationQueue />
    </div>
  );
}

function StatsRow() {
  const { data } = useQuery({ queryKey: adminKeys.stats, queryFn: fetchAdminStats });

  const stats = [
    { label: "Members", value: data?.total_users },
    { label: "Verified", value: data?.verified_users },
    { label: "Waiting review", value: data?.pending_verifications, highlight: true },
    { label: "Open reports", value: data?.open_reports, highlight: true },
    { label: "Pets", value: data?.pets },
    { label: "Messages (7 days)", value: data?.messages_last_7_days },
  ];

  return (
    <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {stats.map(({ label, value, highlight }) => (
        <div key={label} className="rounded-xl border p-4">
          <dt className="text-xs text-muted-foreground">{label}</dt>
          <dd className={`text-2xl font-bold ${highlight && value ? "text-coral" : ""}`}>
            {value ?? "–"}
          </dd>
        </div>
      ))}
    </dl>
  );
}
