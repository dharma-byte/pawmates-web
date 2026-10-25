"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { BadgeCheck, Heart, MapPin, PawPrint, Pencil, Syringe, ThumbsDown } from "lucide-react";
import { cn } from "cn";
import { connectionKeys, fetchMyConnections } from "@/lib/api/connections";
import { fetchMe, meKey } from "@/lib/api/me";
import { ageFrom, fetchCompatibility, fetchPet, profileKeys } from "@/lib/api/profiles";
import { ENERGY_LEVELS, GENDERS, PLAY_STYLES, SIZES, SPECIES, TEMPERAMENTS, type Option } from "@/lib/constants/pets";
import { SniffDialog } from "@/components/discover/sniff-dialog";
import { ConnectionAction } from "@/components/pets/connection-action";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MemberActions } from "./member-actions";
import { NotAvailable } from "./not-available";

const labelOf = <T extends string>(options: Option<T>[], value: T | null) =>
  options.find((o) => o.value === value)?.label;

const yesNo = (value: boolean | null) => (value === true ? "Yes" : value === false ? "No" : null);

export function PetProfile() {
  const { id } = useParams<{ id: string }>();
  const [photoIndex, setPhotoIndex] = useState(0);
  const [sniffOpen, setSniffOpen] = useState(false);
  const { data: me } = useQuery({ queryKey: meKey, queryFn: fetchMe });
  const { data: connections } = useQuery({ queryKey: connectionKeys.mine, queryFn: fetchMyConnections });
  const { data: pet, isPending, error } = useQuery({ queryKey: profileKeys.pet(id), queryFn: () => fetchPet(id) });

  const myPetId = me?.pets[0]?.id;
  const isMine = !!me && pet?.owner_id === me.id;
  const { data: compatibility } = useQuery({
    queryKey: profileKeys.compatibility(myPetId ?? "", id),
    queryFn: () => fetchCompatibility(myPetId!, id),
    enabled: !!myPetId && !!pet && !isMine,
  });

  if (isPending) return <Skeleton className="h-[70dvh] w-full rounded-xl" />;
  if (error) return <p className="text-destructive">{error.message}</p>;
  if (!pet || !pet.owner) return <NotAvailable what="pet" />;

  const owner = pet.owner;
  const ownerName = owner.full_name ?? owner.username ?? "Owner";
  const photos = pet.photos.length ? pet.photos : [];

  const facts = [
    { label: "Species", value: labelOf(SPECIES, pet.species) },
    { label: "Breed", value: pet.breed },
    { label: "Age", value: ageFrom(pet.birth_date) },
    { label: "Gender", value: labelOf(GENDERS, pet.gender) },
    { label: "Size", value: labelOf(SIZES, pet.size) },
    { label: "Weight", value: pet.weight_kg ? `${pet.weight_kg} kg` : null },
    { label: "Energy", value: labelOf(ENERGY_LEVELS, pet.energy) },
    { label: "Play style", value: labelOf(PLAY_STYLES, pet.play_style) },
    { label: "With other pets", value: labelOf(TEMPERAMENTS, pet.temperament) },
    { label: "Good with kids", value: yesNo(pet.good_with_kids) },
    { label: "Good with cats", value: yesNo(pet.good_with_cats) },
    { label: "Good with small dogs", value: yesNo(pet.good_with_small_dogs) },
    { label: "Neutered / spayed", value: yesNo(pet.neutered) },
  ].filter((fact) => fact.value);

  return (
    <div className="grid gap-8 lg:grid-cols-[3fr_2fr]">
      <section className="grid gap-3" aria-label={`${pet.name}'s photos`}>
        <div className="relative aspect-square overflow-hidden rounded-xl bg-muted sm:aspect-4/3">
          {photos[photoIndex] ? (
            <Image src={photos[photoIndex]} alt={`${pet.name}, photo ${photoIndex + 1}`} fill sizes="(min-width: 1024px) 60vw, 100vw" className="object-cover" preload />
          ) : (
            <PawPrint className="absolute inset-0 m-auto size-16 text-muted-foreground" aria-hidden />
          )}
        </div>
        {photos.length > 1 && (
          <ul className="flex gap-2 overflow-x-auto">
            {photos.map((url, index) => (
              <li key={url}>
                <button
                  type="button"
                  onClick={() => setPhotoIndex(index)}
                  aria-label={`Show photo ${index + 1}`}
                  aria-current={index === photoIndex}
                  className={cn("relative block size-16 overflow-hidden rounded-lg ring-offset-2", index === photoIndex && "ring-2 ring-primary")}
                >
                  <Image src={url} alt="" fill sizes="64px" className="object-cover" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="grid content-start gap-6">
        <div className="grid gap-2">
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-3xl font-bold">{pet.name}</h1>
            {compatibility != null && (
              <span className="shrink-0 rounded-full bg-accent px-3 py-1 text-sm font-semibold text-accent-foreground">
                {compatibility}% match with {me?.pets[0]?.name}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {pet.vaccinated && (
              <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-teal">
                <Syringe className="size-3.5" aria-hidden />
                Vaccinated{pet.vaccinated_on ? ` (${new Date(pet.vaccinated_on).toLocaleDateString(undefined, { month: "short", year: "numeric" })})` : ""}
              </span>
            )}
            {owner.verification_status === "verified" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-teal">
                <BadgeCheck className="size-3.5" aria-hidden /> Verified owner
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isMine ? (
            <Link href="/settings?tab=pets" className={buttonVariants({ variant: "outline" })}>
              <Pencil aria-hidden /> Edit {pet.name}
            </Link>
          ) : (
            <>
              <ConnectionAction
                ownerId={owner.id}
                state={connections?.get(owner.id) ?? "none"}
                canSniff={!!me?.pets.length}
                onSniff={() => setSniffOpen(true)}
                className="flex-1"
              />
              <MemberActions userId={owner.id} name={ownerName} petId={pet.id} />
            </>
          )}
        </div>

        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-xl border p-4 text-sm">
          {facts.map((fact) => (
            <div key={fact.label}>
              <dt className="text-muted-foreground">{fact.label}</dt>
              <dd className="font-medium capitalize">{fact.value}</dd>
            </div>
          ))}
        </dl>

        {(pet.likes.length > 0 || pet.dislikes.length > 0) && (
          <div className="grid gap-3">
            <TagList icon={Heart} label="Likes" tags={pet.likes} className="bg-accent text-accent-foreground" />
            <TagList icon={ThumbsDown} label="Dislikes" tags={pet.dislikes} className="bg-muted" />
          </div>
        )}

        {(pet.allergies || pet.special_needs) && (
          <div className="grid gap-1 rounded-xl bg-muted p-4 text-sm">
            {pet.allergies && <p><span className="font-medium">Allergies:</span> {pet.allergies}</p>}
            {pet.special_needs && <p><span className="font-medium">Special needs:</span> {pet.special_needs}</p>}
          </div>
        )}

        <Link href={`/u/${owner.username}`} className="flex items-center gap-3 rounded-xl border p-3 transition-colors hover:bg-muted">
          <Avatar size="lg">
            {owner.avatar_url && <AvatarImage src={owner.avatar_url} alt="" />}
            <AvatarFallback>{ownerName[0]}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate font-medium">{isMine ? "You" : ownerName}</p>
            {owner.show_area && owner.area_name && (
              <p className="flex items-center gap-1 truncate text-sm text-muted-foreground">
                <MapPin className="size-3.5" aria-hidden /> {owner.area_name}
              </p>
            )}
          </div>
        </Link>
      </section>

      {sniffOpen && me && (
        <SniffDialog
          pet={{ pet_id: pet.id, name: pet.name, owner_id: owner.id, owner_username: owner.username }}
          myPets={me.pets}
          open
          onOpenChange={setSniffOpen}
        />
      )}
    </div>
  );
}

function TagList({
  icon: Icon,
  label,
  tags,
  className,
}: {
  icon: typeof Heart;
  label: string;
  tags: string[];
  className: string;
}) {
  if (tags.length === 0) return null;
  return (
    <div className="grid gap-1.5">
      <span className="flex items-center gap-1 text-sm font-medium">
        <Icon className="size-4 text-coral" aria-hidden /> {label}
      </span>
      <ul className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <li key={tag} className={cn("rounded-full px-2.5 py-1 text-sm", className)}>
            {tag}
          </li>
        ))}
      </ul>
    </div>
  );
}
