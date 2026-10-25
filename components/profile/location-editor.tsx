"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Crosshair, Lock, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { reverseGeocode, searchPlaces, type LatLng, type Place } from "@/lib/api/geocode";
import { Field } from "@/components/auth/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

const LocationPickerMap = dynamic(() => import("@/components/map/location-picker-map"), {
  ssr: false,
  loading: () => <Skeleton className="h-72 w-full rounded-xl" />,
});

// Home area: GPS, place search or a map pin. Used by onboarding and settings.
export function LocationEditor({
  userId,
  initialAreaName,
  submitLabel,
  onSaved,
}: {
  userId: string;
  initialAreaName: string | null;
  submitLabel: string;
  onSaved: () => void;
}) {
  const [point, setPoint] = useState<LatLng | null>(null);
  const [areaName, setAreaName] = useState(initialAreaName ?? "");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Place[]>([]);
  const [busy, setBusy] = useState<"gps" | "search" | "save" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function pick(next: LatLng, name?: string) {
    setPoint(next);
    setResults([]);
    setError(null);
    setAreaName(name ?? (await reverseGeocode(next)) ?? "");
  }

  function locateMe() {
    if (!("geolocation" in navigator)) {
      setError("Your browser can't share its location. Search for your area or tap the map.");
      return;
    }
    setBusy("gps");
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        await pick({ lat: coords.latitude, lng: coords.longitude });
        setBusy(null);
      },
      () => {
        setBusy(null);
        setError("We couldn't get your location. Allow location access, or search or tap the map.");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  async function search(event: React.FormEvent) {
    event.preventDefault();
    if (query.trim().length < 3) return;
    setBusy("search");
    setResults(await searchPlaces(query.trim()));
    setBusy(null);
  }

  async function save() {
    if (!point) {
      setError("Set your location first.");
      return;
    }
    if (areaName.trim().length < 2) {
      setError("Give your area a name, like “Indiranagar, Bengaluru”.");
      return;
    }
    setBusy("save");
    const { error } = await createClient()
      .from("profiles")
      .update({
        // PostGIS reads this text as a point; longitude comes first.
        location: `POINT(${point.lng} ${point.lat})`,
        area_name: areaName.trim().slice(0, 120),
      })
      .eq("id", userId);
    setBusy(null);
    if (error) setError(error.message);
    else onSaved();
  }

  return (
    <div className="grid gap-6">

      <p className="flex gap-2 rounded-lg bg-secondary p-3 text-sm text-secondary-foreground">
        <Lock className="mt-0.5 size-4 shrink-0" aria-hidden />
        Your exact spot stays private. Others only see your area name and a rounded distance, like
        “about 2 km away”.
      </p>

      <Button type="button" variant="outline" size="lg" className="h-11" onClick={locateMe} disabled={busy !== null}>
        <Crosshair aria-hidden />
        {busy === "gps" ? "Finding you…" : "Use my current location"}
      </Button>

      <form onSubmit={search} className="grid gap-2">
        <label htmlFor="area-search" className="text-sm font-medium">
          Or search for your area
        </label>
        <div className="flex gap-2">
          <Input
            id="area-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Indiranagar, Bengaluru"
            className="h-10"
          />
          <Button type="submit" variant="secondary" className="h-10" disabled={busy !== null}>
            <Search aria-hidden />
            <span className="sr-only sm:not-sr-only">{busy === "search" ? "Searching…" : "Search"}</span>
          </Button>
        </div>
        {results.length > 0 && (
          <ul className="grid divide-y rounded-lg border">
            {results.map((place) => (
              <li key={`${place.lat},${place.lng}`}>
                <button
                  type="button"
                  className="w-full px-3 py-2 text-left text-sm hover:bg-muted"
                  onClick={() => pick(place, place.areaName)}
                >
                  {place.label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </form>

      <div className="grid gap-2">
        <span className="text-sm font-medium">Or tap the map to drop a pin</span>
        <LocationPickerMap value={point} onPick={(next) => pick(next)} />
      </div>

      {point && (
        <Field id="area-name" label="Area name shown to others" hint="Neighbourhood and city is perfect.">
          <Input
            id="area-name"
            value={areaName}
            maxLength={120}
            onChange={(event) => setAreaName(event.target.value)}
            className="h-10"
          />
        </Field>
      )}

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <Button type="button" size="lg" className="h-11" onClick={save} disabled={busy !== null}>
        {busy === "save" ? "Saving…" : submitLabel}
      </Button>
    </div>
  );
}
