"use client";

import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { CalendarHeart, Compass, PawPrint } from "lucide-react";
import { discoverKeys, fetchNearbyPets } from "@/lib/api/discover";
import { fetchMe, firstName, meKey } from "@/lib/api/me";
import { PetCard } from "@/components/pets/pet-card";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function HomeFeed() {
  const { data: me } = useQuery({ queryKey: meKey, queryFn: fetchMe });
  const myPetId = me?.pets[0]?.id;
  const nearbyArgs = { radius_km: 10, page_size: 6, my_pet_id: myPetId };
  const nearby = useQuery({
    queryKey: discoverKeys.nearby(nearbyArgs),
    queryFn: () => fetchNearbyPets(nearbyArgs),
    enabled: !!me,
  });

  return (
    <div className="grid gap-10">
      <section className="grid gap-1">
        {me ? (
          <h1 className="text-2xl font-bold sm:text-3xl">Hi {firstName(me.full_name)} 👋</h1>
        ) : (
          <Skeleton className="h-9 w-48" />
        )}
        <p className="text-muted-foreground">
          {me?.area_name ? `Here's what's happening around ${me.area_name}.` : "Here's what's happening near you."}
        </p>
      </section>

      {me && me.pets.length > 0 && (
        <section aria-labelledby="my-pets" className="grid gap-3">
          <h2 id="my-pets" className="text-lg font-bold">
            Your pets
          </h2>
          <ul className="flex gap-3 overflow-x-auto pb-1">
            {me.pets.map((pet) => (
              <li key={pet.id} className="flex shrink-0 items-center gap-3 rounded-full border py-1.5 pr-4 pl-1.5">
                <span className="relative size-10 overflow-hidden rounded-full bg-muted">
                  {pet.photos[0] ? (
                    <Image src={pet.photos[0]} alt="" fill sizes="40px" className="object-cover" />
                  ) : (
                    <PawPrint className="absolute inset-0 m-auto size-5 text-muted-foreground" aria-hidden />
                  )}
                </span>
                <span className="text-sm font-medium">{pet.name}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="nearby" className="grid gap-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 id="nearby" className="text-lg font-bold">
              Pets near you
            </h2>
            {me?.pets[0] && (
              <p className="text-sm text-muted-foreground">Match scores are for {me.pets[0].name}.</p>
            )}
          </div>
          <Link href="/discover" className={buttonVariants({ variant: "ghost", size: "sm" })}>
            See all
          </Link>
        </div>

        {nearby.isPending && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }, (_, i) => (
              <Skeleton key={i} className="aspect-4/3 w-full rounded-xl" />
            ))}
          </div>
        )}

        {nearby.error && <p className="text-sm text-destructive">{nearby.error.message}</p>}

        {nearby.data?.length === 0 && (
          <div className="grid gap-3 rounded-xl border border-dashed p-8 text-center">
            <Compass className="mx-auto size-8 text-teal" aria-hidden />
            <p className="font-medium">No verified pets within 10 km yet</p>
            <p className="text-sm text-muted-foreground">
              Pawmates is just getting started in your area. Invite a friend and their pet!
            </p>
          </div>
        )}

        {nearby.data && nearby.data.length > 0 && (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {nearby.data.map((pet) => (
              <li key={pet.pet_id}>
                <PetCard pet={pet} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="events" className="grid gap-3">
        <h2 id="events" className="text-lg font-bold">
          Upcoming events
        </h2>
        <div className="flex items-center gap-3 rounded-xl bg-secondary p-4 text-sm text-secondary-foreground">
          <CalendarHeart className="size-6 shrink-0 text-coral" aria-hidden />
          Groups, playdates and events are coming soon.
        </div>
      </section>
    </div>
  );
}
