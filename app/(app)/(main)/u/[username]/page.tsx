import { Suspense } from "react";
import type { Metadata } from "next";
import { OwnerProfile } from "@/components/profile/owner-profile";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = { title: "Profile" };

export default function ProfilePage() {
  return (
    // Reads the username from the URL, which is request-time data.
    <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
      <OwnerProfile />
    </Suspense>
  );
}
