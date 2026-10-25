"use client";

import { useState } from "react";
import Link from "next/link";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { Check, Clock, Compass, SlidersHorizontal } from "lucide-react";
import { OpenChatButton } from "@/components/chat/open-chat-button";
import { connectionKeys, fetchMyConnections, type ConnectionState } from "@/lib/api/connections";
import { fetchNearbyPets, type NearbyPet } from "@/lib/api/discover";
import { fetchMe, meKey } from "@/lib/api/me";
import { ENERGY_LEVELS, SIZES, SPECIES, TEMPERAMENTS, type Option } from "@/lib/constants/pets";
import type { Database } from "@/types/database";
import { PetCard } from "@/components/pets/pet-card";
import { ChoiceChips } from "@/components/shared/choice-chips";
import { FilterChips } from "@/components/shared/filter-chips";
import { Button, buttonVariants } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { SniffDialog } from "./sniff-dialog";

type Enums = Database["public"]["Enums"];
const PAGE_SIZE = 30;

const RADII: Option<"1" | "5" | "10" | "25">[] = [
  { value: "1", label: "1 km" },
  { value: "5", label: "5 km" },
  { value: "10", label: "10 km" },
  { value: "25", label: "25 km" },
];

type Filters = {
  radius: "1" | "5" | "10" | "25";
  species: Enums["pet_species"][];
  sizes: Enums["pet_size"][];
  energies: Enums["energy_level"][];
  temperaments: Enums["pet_temperament"][];
  vaccinatedOnly: boolean;
};

const DEFAULT_FILTERS: Filters = {
  radius: "5",
  species: [],
  sizes: [],
  energies: [],
  temperaments: [],
  vaccinatedOnly: false,
};

const orNull = <T,>(values: T[]) => (values.length ? values : undefined);

export function DiscoverView() {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const [sniffing, setSniffing] = useState<NearbyPet | null>(null);
  const set = <K extends keyof Filters>(key: K, value: Filters[K]) =>
    setFilters((current) => ({ ...current, [key]: value }));

  const { data: me } = useQuery({ queryKey: meKey, queryFn: fetchMe });
  const { data: connections } = useQuery({ queryKey: connectionKeys.mine, queryFn: fetchMyConnections });

  const args = {
    radius_km: Number(filters.radius),
    my_pet_id: me?.pets[0]?.id,
    species_filter: orNull(filters.species),
    sizes: orNull(filters.sizes),
    energies: orNull(filters.energies),
    temperaments: orNull(filters.temperaments),
    vaccinated_only: filters.vaccinatedOnly,
    page_size: PAGE_SIZE,
  };

  const results = useInfiniteQuery({
    queryKey: ["discover", "nearby", "infinite", args],
    queryFn: ({ pageParam }) => fetchNearbyPets({ ...args, page_offset: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) =>
      lastPage.length === PAGE_SIZE ? pages.length * PAGE_SIZE : undefined,
    enabled: !!me,
  });

  const pets = results.data?.pages.flat() ?? [];
  const activeFilters =
    filters.species.length + filters.sizes.length + filters.energies.length +
    filters.temperaments.length + (filters.vaccinatedOnly ? 1 : 0);

  return (
    <div className="grid gap-6">
      <div className="grid gap-1">
        <h1 className="text-2xl font-bold">Discover</h1>
        <p className="text-muted-foreground">
          Verified pets near {me?.area_name ?? "you"}
          {me?.pets[0] ? `, with match scores for ${me.pets[0].name}` : ""}.
        </p>
      </div>

      <div className="grid gap-4 rounded-xl border p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <ChoiceChips id="radius" options={RADII} value={filters.radius} onChange={(v) => set("radius", v)} />
          <Button variant="outline" onClick={() => setShowFilters((s) => !s)} aria-expanded={showFilters}>
            <SlidersHorizontal aria-hidden />
            Filters{activeFilters > 0 && ` (${activeFilters})`}
          </Button>
        </div>

        {showFilters && (
          <div className="grid gap-5 border-t pt-4">
            <FilterChips label="Species" options={SPECIES} value={filters.species} onChange={(v) => set("species", v)} />
            <FilterChips label="Size" options={SIZES} value={filters.sizes} onChange={(v) => set("sizes", v)} />
            <FilterChips label="Energy" options={ENERGY_LEVELS} value={filters.energies} onChange={(v) => set("energies", v)} />
            <FilterChips label="Temperament" options={TEMPERAMENTS} value={filters.temperaments} onChange={(v) => set("temperaments", v)} />
            <div className="flex items-center gap-2">
              <Checkbox
                id="vaccinated-only"
                checked={filters.vaccinatedOnly}
                onCheckedChange={(checked) => set("vaccinatedOnly", checked === true)}
              />
              <label htmlFor="vaccinated-only" className="text-sm">
                Vaccinated pets only
              </label>
            </div>
            {activeFilters > 0 && (
              <Button
                variant="ghost"
                className="justify-self-start"
                onClick={() => setFilters({ ...DEFAULT_FILTERS, radius: filters.radius })}
              >
                Clear filters
              </Button>
            )}
          </div>
        )}
      </div>

      {results.isPending && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="aspect-4/3 w-full rounded-xl" />
          ))}
        </div>
      )}

      {results.error && <p className="text-destructive">{results.error.message}</p>}

      {results.isSuccess && pets.length === 0 && (
        <div className="grid gap-3 rounded-xl border border-dashed p-10 text-center">
          <Compass className="mx-auto size-8 text-teal" aria-hidden />
          <p className="font-medium">No pets match within {filters.radius} km</p>
          <p className="text-sm text-muted-foreground">Try a bigger radius or fewer filters.</p>
        </div>
      )}

      {pets.length > 0 && (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pets.map((pet) => (
            <li key={pet.pet_id}>
              <PetCard
                pet={pet}
                action={
                  <SniffAction
                    ownerId={pet.owner_id}
                    state={connections?.get(pet.owner_id) ?? "none"}
                    canSniff={!!me?.pets.length}
                    onSniff={() => setSniffing(pet)}
                  />
                }
              />
            </li>
          ))}
        </ul>
      )}

      {results.hasNextPage && (
        <Button
          variant="outline"
          className="justify-self-center"
          onClick={() => results.fetchNextPage()}
          disabled={results.isFetchingNextPage}
        >
          {results.isFetchingNextPage ? "Loading…" : "Load more"}
        </Button>
      )}

      {sniffing && me && (
        <SniffDialog
          pet={sniffing}
          myPets={me.pets}
          open={!!sniffing}
          onOpenChange={(open) => !open && setSniffing(null)}
        />
      )}
    </div>
  );
}

function SniffAction({
  ownerId,
  state,
  canSniff,
  onSniff,
}: {
  ownerId: string;
  state: ConnectionState;
  canSniff: boolean;
  onSniff: () => void;
}) {
  if (state === "pawmates") {
    return <OpenChatButton userId={ownerId} label="Pawmates · Chat" variant="secondary" className="w-full" />;
  }
  if (state === "sent") {
    return (
      <Button variant="outline" className="w-full" disabled>
        <Clock aria-hidden /> Request sent
      </Button>
    );
  }
  if (state === "received") {
    return (
      <Link href="/requests" className={buttonVariants({ className: "w-full" })}>
        <Check aria-hidden /> They sniffed you! Respond
      </Link>
    );
  }
  return (
    <Button className="w-full" onClick={onSniff} disabled={!canSniff}>
      🐾 Send Sniff request
    </Button>
  );
}
