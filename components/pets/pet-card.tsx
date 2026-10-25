import Image from "next/image";
import { MapPin, PawPrint, Syringe } from "lucide-react";
import { formatAge, formatDistance, type NearbyPet } from "@/lib/api/discover";

export function PetCard({ pet, action }: { pet: NearbyPet; action?: React.ReactNode }) {
  const details = [pet.breed ?? pet.species, formatAge(pet.age_months)].filter(Boolean).join(" · ");

  return (
    <article className="overflow-hidden rounded-xl border bg-card">
      <div className="relative aspect-4/3 bg-muted">
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
        {pet.compatibility !== null && (
          <span className="absolute top-2 right-2 rounded-full bg-background/90 px-2 py-0.5 text-xs font-semibold text-primary shadow-sm">
            {pet.compatibility}% match
          </span>
        )}
      </div>
      <div className="grid gap-1 p-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="truncate font-semibold">{pet.name}</h3>
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
