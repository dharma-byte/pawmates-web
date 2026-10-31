import { Suspense } from "react";
import type { Metadata } from "next";
import { LostReportView } from "@/components/lost/lost-report-view";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = { title: "Lost dog" };

export default function LostReportPage() {
  return (
    // LostReportView reads the report id from the URL, which is request-time data.
    <Suspense fallback={<Skeleton className="h-96 w-full rounded-2xl" />}>
      <LostReportView />
    </Suspense>
  );
}
