import { Suspense } from "react";
import type { Metadata } from "next";
import { GroupView } from "@/components/groups/group-view";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = { title: "Group" };

export default function GroupPage() {
  return (
    // GroupView reads the group id from the URL, which is request-time data.
    <Suspense fallback={<Skeleton className="h-72 w-full rounded-2xl" />}>
      <GroupView />
    </Suspense>
  );
}
