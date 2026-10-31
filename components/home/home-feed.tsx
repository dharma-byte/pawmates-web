"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useSharedQuery } from "@/hooks/use-shared-query";
import { Compass, PawPrint, Share2 } from "lucide-react";
import { toast } from "sonner";
import { discoverKeys, fetchNearbyPets } from "@/lib/api/discover";
import { fetchMe, firstName, meKey } from "@/lib/api/me";
import { PetCard } from "@/components/pets/pet-card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { LostAlertBanner, LostAndFoundCard } from "@/components/lost/lost-home";
import { EventsSoon, PendingReviews, ProfileStrength, RequestsWaiting, SafetyTip, UnreadChats } from "./dashboard-cards";

function greeting() {
  const hour = new Date().getHours();
  return hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
}

// Sharing brings the next neighbour in: the native share sheet on phones,
// otherwise copy the link.
async function inviteFriend() {
  const url = window.location.origin;
  const text = "Join me on Pawmates, where pets make friends nearby 🐾";
  if (navigator.share) {
    await navigator.share({ title: "Pawmates", text, url }).catch(() => {});
    return;
  }
  await navigator.clipboard.writeText(`${text} ${url}`);
  toast.success("Invite link copied");
}

// The signed-in home: a dashboard of what needs attention and who's nearby.
// Mounted only after the member loads, so the clock is read in the browser,
// never while the page is prerendered.
function Greeting({ name }: { name: string | null }) {
  const [hello] = useState(greeting);
  return (
    <h1 className="text-2xl font-bold sm:text-3xl">
      {hello}, {firstName(name)}
    </h1>
  );
}

export function HomeFeed() {
  const { data: me } = useSharedQuery({ queryKey: meKey, queryFn: fetchMe });
  const myPet = me?.pets[0];
  const nearbyArgs = { radius_km: 10, page_size: 6, my_pet_id: myPet?.id };
  const nearby = useQuery({
    queryKey: discoverKeys.nearby(nearbyArgs),
    queryFn: () => fetchNearbyPets(nearbyArgs),
    enabled: !!me,
  });

  // Everything below reads the clock or member data, so it renders only
  // once the member is loaded (never during prerendering).
  if (!me) {
    return (
      <div className="grid gap-6">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="grid gap-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="grid gap-1">
          <Greeting name={me.full_name} />
          <p className="text-muted-foreground">
            {me.area_name ? `Here's what's happening around ${me.area_name}.` : "Here's what's happening near you."}
          </p>
        </div>
        <ul className="flex gap-2 overflow-x-auto" aria-label="Your pets">
          {me.pets.map((pet) => (
            <li key={pet.id}>
              <Link href={`/pets/${pet.id}`} className="flex items-center gap-2 rounded-full border py-1 pr-3 pl-1 hover:bg-muted">
                <span className="relative size-8 overflow-hidden rounded-full bg-muted">
                  {pet.photos[0] ? (
                    <Image src={pet.photos[0]} alt="" fill sizes="32px" className="object-cover" />
                  ) : (
                    <PawPrint className="absolute inset-0 m-auto size-4 text-muted-foreground" aria-hidden />
                  )}
                </span>
                <span className="text-sm font-medium">{pet.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="grid gap-6">
          <LostAlertBanner />
          <PendingReviews />
          <RequestsWaiting />

          <section aria-labelledby="nearby" className="grid gap-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 id="nearby" className="font-heading text-lg font-semibold">Pets near you</h2>
                {myPet && <p className="text-sm text-muted-foreground">Match scores are for {myPet.name}.</p>}
              </div>
              <Link href="/discover" className={buttonVariants({ variant: "ghost", size: "sm" })}>
                Discover more
              </Link>
            </div>

            {nearby.isPending && (
              <div className="grid gap-4 sm:grid-cols-2">
                {Array.from({ length: 2 }, (_, i) => (
                  <Skeleton key={i} className="aspect-4/3 w-full rounded-xl" />
                ))}
              </div>
            )}
            {nearby.error && <p className="text-sm text-destructive">{nearby.error.message}</p>}

            {nearby.data?.length === 0 && (
              <div className="grid justify-items-center gap-3 rounded-2xl border border-dashed p-8 text-center">
                <Compass className="size-8 text-teal" aria-hidden />
                <p className="font-medium">No verified pets within 10 km yet</p>
                <p className="max-w-sm text-sm text-muted-foreground">
                  Pawmates is just getting started in your area. Invite a pet friend, and your pets
                  will be each other&apos;s first match.
                </p>
                <Button onClick={inviteFriend}>
                  <Share2 aria-hidden /> Invite a friend
                </Button>
              </div>
            )}

            {nearby.data && nearby.data.length > 0 && (
              <ul className="grid gap-4 sm:grid-cols-2">
                {nearby.data.map((pet) => (
                  <li key={pet.pet_id}>
                    <PetCard pet={pet} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="grid gap-6" aria-label="Your activity">
          <UnreadChats />
          <ProfileStrength me={me} />
          <SafetyTip />
          <EventsSoon />
          <LostAndFoundCard />
        </aside>
      </div>
    </div>
  );
}
