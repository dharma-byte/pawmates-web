"use client";

import { useState, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { Compass, Layers, LayoutGrid, Map as MapIcon, SlidersHorizontal } from "lucide-react";
import { connectionKeys, fetchMyConnections } from "@/lib/api/connections";
import { fetchMyLocation, fetchNearbyPets, type NearbyPet } from "@/lib/api/discover";
import { fetchMe, meKey } from "@/lib/api/me";
import { ENERGY_LEVELS, SIZES, SPECIES, TEMPERAMENTS, type Option } from "@/lib/constants/pets";
import type { Database } from "@/types/database";
import { ConnectionAction } from "@/components/pets/connection-action";
import { PetCard } from "@/components/pets/pet-card";
import { ChoiceChips } from "@/components/shared/choice-chips";
import { FilterChips } from "@/components/shared/filter-chips";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { SniffDialog } from "./sniff-dialog";
import { SwipeDeck } from "./swipe-deck";

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

const DiscoverMap = dynamic(() => import("@/components/map/discover-map"), {
  ssr: false,
  loading: () => <Skeleton className="h-[60dvh] w-full rounded-2xl" />,
});

type View = "grid" | "swipe" | "map";
const VIEWS: { value: View; label: string; icon: typeof LayoutGrid }[] = [
  { value: "grid", label: "Grid", icon: LayoutGrid },
  { value: "swipe", label: "Swipe", icon: Layers },
  { value: "map", label: "Map", icon: MapIcon },
];

// The chosen view is remembered per device. useSyncExternalStore reads it in
// the browser only, so prerendering always sees "grid".
const VIEW_KEY = "pawmates:discover-view";
const VIEW_EVENT = "pawmates:discover-view";
function readView(): View {
  try {
    const saved = window.localStorage.getItem(VIEW_KEY);
    return saved === "swipe" || saved === "map" ? saved : "grid";
  } catch {
    return "grid";
  }
}
function subscribeView(callback: () => void) {
  window.addEventListener(VIEW_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(VIEW_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

export function DiscoverView() {
  const view = useSyncExternalStore(subscribeView, readView, () => "grid" as View);
  const chooseView = (next: View) => {
    try {
      window.localStorage.setItem(VIEW_KEY, next);
    } catch {
      // Private mode or blocked storage: the view still switches below.
    }
    window.dispatchEvent(new Event(VIEW_EVENT));
  };
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

  const { data: myLocation } = useQuery({
    queryKey: ["me", "location"],
    queryFn: fetchMyLocation,
    enabled: view === "map",
  });

  const pets = results.data?.pages.flat() ?? [];
  const activeFilters =
    filters.species.length + filters.sizes.length + filters.energies.length +
    filters.temperaments.length + (filters.vaccinatedOnly ? 1 : 0);

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="grid gap-1">
          <h1 className="text-2xl font-bold">Discover</h1>
          <p className="text-muted-foreground">
            Verified pets near {me?.area_name ?? "you"}
            {me?.pets[0] ? `, with match scores for ${me.pets[0].name}` : ""}.
          </p>
          {/* Phones have no Groups tab, so Discover points the way. */}
          <Link href="/groups" className="w-fit text-sm font-medium text-primary underline-offset-4 hover:underline md:hidden">
            Groups & events near you →
          </Link>
        </div>
        <div role="radiogroup" aria-label="View" className="flex rounded-full border bg-muted p-1">
          {VIEWS.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={view === value}
              onClick={() => chooseView(value)}
              className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
                view === value ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="size-4" aria-hidden /> {label}
            </button>
          ))}
        </div>
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

      {pets.length > 0 && view === "swipe" && (
        <SwipeDeck
          pets={pets}
          connectionOf={(ownerId) => connections?.get(ownerId) ?? "none"}
          canSniff={!!me?.pets.length}
          onSniff={setSniffing}
          onExhausted={() => results.hasNextPage && results.fetchNextPage()}
        />
      )}

      {pets.length > 0 && view === "map" && (
        <div className="grid gap-2">
          {myLocation ? (
            <DiscoverMap pets={pets} center={myLocation} radiusKm={Number(filters.radius)} />
          ) : (
            <Skeleton className="h-[60dvh] w-full rounded-2xl" />
          )}
          <p className="text-xs text-muted-foreground">
            Pins show each owner&apos;s approximate area, never their home. Tap a pin to see their pets.
          </p>
        </div>
      )}

      {pets.length > 0 && view === "grid" && (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pets.map((pet) => (
            <li key={pet.pet_id}>
              <PetCard
                pet={pet}
                action={
                  <ConnectionAction
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

      {results.hasNextPage && view !== "swipe" && (
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

