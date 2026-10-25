"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { BadgeCheck, CalendarDays, MapPin, PawPrint, Pencil, UserRound } from "lucide-react";
import { connectionKeys, fetchMyConnections } from "@/lib/api/connections";
import { fetchMe, meKey } from "@/lib/api/me";
import { ageFrom, fetchProfileByUsername, memberSince, profileKeys } from "@/lib/api/profiles";
import { SniffDialog, type SniffTarget } from "@/components/discover/sniff-dialog";
import { ConnectionAction } from "@/components/pets/connection-action";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MemberActions } from "./member-actions";
import { NotAvailable } from "./not-available";

export function OwnerProfile() {
  const { username } = useParams<{ username: string }>();
  const [sniffing, setSniffing] = useState<SniffTarget | null>(null);
  const { data: me } = useQuery({ queryKey: meKey, queryFn: fetchMe });
  const { data: connections } = useQuery({ queryKey: connectionKeys.mine, queryFn: fetchMyConnections });
  const { data: profile, isPending, error } = useQuery({
    queryKey: profileKeys.byUsername(username),
    queryFn: () => fetchProfileByUsername(username),
  });

  if (isPending) return <Skeleton className="h-96 w-full rounded-xl" />;
  if (error) return <p className="text-destructive">{error.message}</p>;
  if (!profile) return <NotAvailable what="profile" />;

  const isMe = me?.id === profile.id;
  const name = profile.full_name ?? profile.username ?? "Pawmates member";
  const state = connections?.get(profile.id) ?? "none";
  const firstPet = profile.pets[0];

  return (
    <div className="grid gap-8">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <Avatar className="size-24">
          {profile.avatar_url && <AvatarImage src={profile.avatar_url} alt={name} />}
          <AvatarFallback className="text-2xl">{name[0] ?? <UserRound />}</AvatarFallback>
        </Avatar>
        <div className="grid flex-1 gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold">{name}</h1>
            {profile.verification_status === "verified" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-teal">
                <BadgeCheck className="size-3.5" aria-hidden /> Verified
              </span>
            )}
          </div>
          <p className="text-muted-foreground">@{profile.username}</p>
          <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            {profile.show_area && profile.area_name && (
              <li className="flex items-center gap-1">
                <MapPin className="size-4" aria-hidden /> {profile.area_name}
              </li>
            )}
            <li className="flex items-center gap-1">
              <CalendarDays className="size-4" aria-hidden /> Member since {memberSince(profile.created_at)}
            </li>
          </ul>
          {profile.bio && <p className="max-w-prose">{profile.bio}</p>}
        </div>

        <div className="flex gap-2 sm:flex-col sm:items-end">
          {isMe ? (
            <Link href="/settings" className={buttonVariants({ variant: "outline" })}>
              <Pencil aria-hidden /> Edit profile
            </Link>
          ) : (
            <>
              {firstPet && (
                <ConnectionAction
                  ownerId={profile.id}
                  state={state}
                  canSniff={!!me?.pets.length}
                  onSniff={() =>
                    setSniffing({ pet_id: firstPet.id, name: firstPet.name, owner_id: profile.id, owner_username: profile.username })
                  }
                  className=""
                />
              )}
              <MemberActions userId={profile.id} name={name} />
            </>
          )}
        </div>
      </section>

      <section aria-labelledby="pets-heading" className="grid gap-4">
        <h2 id="pets-heading" className="text-lg font-bold">
          {isMe ? "Your pets" : `${name.split(" ")[0]}'s pets`}
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {profile.pets.map((pet) => (
            <li key={pet.id}>
              <Link href={`/pets/${pet.id}`} className="block overflow-hidden rounded-xl border transition-shadow hover:shadow-md">
                <div className="relative aspect-4/3 bg-muted">
                  {pet.photos[0] ? (
                    <Image src={pet.photos[0]} alt={pet.name} fill sizes="(min-width: 640px) 33vw, 100vw" className="object-cover" />
                  ) : (
                    <PawPrint className="absolute inset-0 m-auto size-10 text-muted-foreground" aria-hidden />
                  )}
                </div>
                <div className="p-3">
                  <p className="font-semibold">{pet.name}</p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {[pet.breed ?? pet.species, ageFrom(pet.birth_date)].filter(Boolean).join(" · ")}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {sniffing && me && (
        <SniffDialog pet={sniffing} myPets={me.pets} open onOpenChange={(open) => !open && setSniffing(null)} />
      )}
    </div>
  );
}
