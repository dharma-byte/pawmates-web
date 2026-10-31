import Image from "next/image";
import Link from "next/link";
import { MapPin, PawPrint, Syringe } from "lucide-react";
import { formatAge, formatDistance, type NearbyPet } from "@/lib/api/discover";
import { MatchBadge } from "@/components/discover/match-badge";

export function PetCard({ pet, action }: { pet: NearbyPet; action?: React.ReactNode }) {
  const details = [pet.breed ?? pet.species, formatAge(pet.age_months)].filter(Boolean).join(" · ");

  return (
    <article className="overflow-hidden rounded-xl border bg-card">
      <div className="relative aspect-4/3 bg-muted">
        <Link href={`/pets/${pet.pet_id}`} tabIndex={-1} aria-hidden className="absolute inset-0">
          {pet.photo ? (
            <Image
              src={pet.photo}
              alt={`${pet.name}, ${pet.breed ?? pet.species}`}
              fill
              sizes="(min-width: 640px) 33vw, 100vw"
              className="object-cover"
            />
          ) : (
            <PawPrint className="absolute inset-0 m-auto size-10 text-muted-foreground" aria-hidden />
          )}
        </Link>
        {/* A sibling of the photo link, not inside it: a button can't live in a link. */}
        {pet.compatibility !== null && (
          <MatchBadge petId={pet.pet_id} petName={pet.name} score={pet.compatibility} className="absolute top-2 right-2" />
        )}
      </div>
      <div className="grid gap-1 p-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="truncate font-semibold">
            <Link href={`/pets/${pet.pet_id}`} className="hover:underline">
              {pet.name}
            </Link>
          </h3>
          {pet.vaccinated && (
            <span className="inline-flex items-center gap-1 text-xs text-teal" title="Vaccinated">
              <Syringe className="size-3.5" aria-hidden />
              <span className="sr-only">Vaccinated</span>
            </span>
          )}
        </div>
        <p className="truncate text-sm text-muted-foreground capitalize">{details}</p>
        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="size-3.5 shrink-0" aria-hidden />
          <span className="truncate">
            {[pet.area_name, formatDistance(pet.approx_distance_km)].filter(Boolean).join(" · ")}
          </span>
        </p>
        {action && <div className="pt-2">{action}</div>}
      </div>
    </article>
  );
}
