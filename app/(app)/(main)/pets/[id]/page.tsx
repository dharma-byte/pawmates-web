import { Suspense } from "react";
import type { Metadata } from "next";
import { PetProfile } from "@/components/profile/pet-profile";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = { title: "Pet" };

export default function PetPage() {
  return (
    // Reads the pet id from the URL, which is request-time data.
    <Suspense fallback={<Skeleton className="h-[70dvh] w-full rounded-xl" />}>
      <PetProfile />
    </Suspense>
  );
}
