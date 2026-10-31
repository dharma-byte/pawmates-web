"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, MapPin, PawPrint, Syringe, X } from "lucide-react";
import type { ConnectionState } from "@/lib/api/connections";
import { formatAge, formatDistance, type NearbyPet } from "@/lib/api/discover";
import { ConnectionAction } from "@/components/pets/connection-action";
import { Button, buttonVariants } from "@/components/ui/button";
import { MatchBadge } from "./match-badge";

const SWIPE_DISTANCE = 110;

// One pet at a time. Drag right (or →) to Sniff, left (or ←) to skip.
export function SwipeDeck({
  pets,
  connectionOf,
  canSniff,
  onSniff,
  onExhausted,
}: {
  pets: NearbyPet[];
  connectionOf: (ownerId: string) => ConnectionState;
  canSniff: boolean;
  onSniff: (pet: NearbyPet) => void;
  onExhausted: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [dragX, setDragX] = useState(0);
  const start = useRef<number | null>(null);
  const pet = pets[index];

  const next = () => {
    setDragX(0);
    if (index + 1 >= pets.length) onExhausted();
    setIndex((i) => i + 1);
  };

  const sniff = () => {
    setDragX(0);
    if (pet && canSniff && connectionOf(pet.owner_id) === "none") onSniff(pet);
  };

  if (!pet) {
    return (
      <div className="grid justify-items-center gap-3 rounded-3xl border border-dashed p-10 text-center">
        <PawPrint className="size-9 text-teal" aria-hidden />
        <p className="font-medium">You&apos;ve seen every pet nearby</p>
        <p className="text-sm text-muted-foreground">Try a bigger radius or fewer filters, or switch to the grid.</p>
        <Button variant="outline" onClick={() => setIndex(0)}>Start over</Button>
      </div>
    );
  }

  const details = [pet.breed ?? pet.species, formatAge(pet.age_months)].filter(Boolean).join(" · ");

  return (
    <div className="mx-auto grid w-full max-w-md gap-5">
      <div
        role="group"
        aria-roledescription="card"
        aria-label={`${pet.name}, ${index + 1} of ${pets.length}. Use left and right arrow keys to skip or Sniff.`}
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft") next();
          if (event.key === "ArrowRight") sniff();
        }}
        onPointerDown={(event) => {
          start.current = event.clientX;
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (start.current !== null) setDragX(event.clientX - start.current);
        }}
        onPointerUp={() => {
          start.current = null;
          if (dragX > SWIPE_DISTANCE) sniff();
          else if (dragX < -SWIPE_DISTANCE) next();
          else setDragX(0);
        }}
        style={{ transform: `translateX(${dragX}px) rotate(${dragX / 25}deg)` }}
        className="relative touch-pan-y overflow-hidden rounded-3xl border bg-card shadow-md transition-transform duration-150 outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <div className="relative aspect-4/5 bg-muted">
          {pet.photo ? (
            <Image src={pet.photo} alt={`${pet.name}, ${details}`} fill sizes="448px" className="pointer-events-none object-cover" draggable={false} />
          ) : (
            <PawPrint className="absolute inset-0 m-auto size-14 text-muted-foreground" aria-hidden />
          )}
          {pet.compatibility !== null && (
            <MatchBadge petId={pet.pet_id} petName={pet.name} score={pet.compatibility} className="absolute top-3 right-3 px-3 py-1.5 text-sm" />
          )}
          {dragX > 40 && <span className="absolute top-4 left-4 rotate-[-12deg] rounded-lg border-2 border-teal bg-background/90 px-3 py-1 font-heading font-bold text-teal">SNIFF</span>}
          {dragX < -40 && <span className="absolute top-4 right-4 rotate-12 rounded-lg border-2 border-muted-foreground bg-background/90 px-3 py-1 font-heading font-bold text-muted-foreground">SKIP</span>}
        </div>
        <div className="grid gap-2 p-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-heading text-2xl font-bold">{pet.name}</h2>
            {pet.vaccinated && (
              <span className="inline-flex items-center gap-1 text-sm text-teal">
                <Syringe className="size-4" aria-hidden /> Vaccinated
              </span>
            )}
          </div>
          <p className="text-muted-foreground capitalize">{details}</p>
          <p className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="size-4" aria-hidden />
            {[pet.area_name, formatDistance(pet.approx_distance_km)].filter(Boolean).join(" · ")}
          </p>
          {pet.likes.length > 0 && (
            <ul className="flex flex-wrap gap-1.5 pt-1">
              {pet.likes.slice(0, 4).map((like) => (
                <li key={like} className="rounded-full bg-accent px-2.5 py-1 text-xs text-accent-foreground">{like}</li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="flex items-center justify-center gap-3">
        <Button variant="outline" size="icon-lg" className="size-14 rounded-full" aria-label={`Skip ${pet.name}`} onClick={next}>
          <X className="size-6" />
        </Button>
        <div className="min-w-48">
          <ConnectionAction ownerId={pet.owner_id} state={connectionOf(pet.owner_id)} canSniff={canSniff} onSniff={sniff} className="h-14 w-full rounded-full text-base" />
        </div>
        <Link href={`/pets/${pet.pet_id}`} aria-label={`View ${pet.name}'s profile`} className={buttonVariants({ variant: "outline", size: "icon-lg", className: "size-14 rounded-full" })}>
          <Heart className="size-6 text-coral" />
        </Link>
      </div>
      <p className="text-center text-xs text-muted-foreground">{index + 1} of {pets.length}</p>
    </div>
  );
}
