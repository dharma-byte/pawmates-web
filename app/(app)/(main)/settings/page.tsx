import { Suspense } from "react";
import type { Metadata } from "next";
import { SettingsView } from "@/components/settings/settings-view";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    // Reads ?tab= from the URL, which is request-time data.
    <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
      <SettingsView />
    </Suspense>
  );
}
