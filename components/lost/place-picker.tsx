"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Crosshair, MapPin, Search } from "lucide-react";
import { reverseGeocode, searchPlaces, type LatLng, type Place } from "@/lib/api/geocode";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

const LocationPickerMap = dynamic(() => import("@/components/map/location-picker-map"), {
  ssr: false,
  loading: () => <Skeleton className="h-72 w-full rounded-xl" />,
});

export type PickedPlace = LatLng & { label: string };

// Pick a spot by searching, tapping the map or using the phone's location.
// The label is filled in from the map and can be edited.
export function PlacePicker({
  value,
  onChange,
  idPrefix,
}: {
  value: PickedPlace | null;
  onChange: (place: PickedPlace) => void;
  idPrefix: string;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Place[]>([]);
  const [locating, setLocating] = useState(false);
  const [hint, setHint] = useState<string | null>(null);

  async function pick(point: LatLng, label?: string) {
    onChange({ ...point, label: label ?? value?.label ?? "" });
    if (!label) {
      const name = await reverseGeocode(point);
      onChange({ ...point, label: name ?? "Pinned on the map" });
    }
  }

  async function search(event: React.FormEvent) {
    event.preventDefault();
    if (query.trim().length >= 3) setResults(await searchPlaces(query.trim()));
  }

  function useMyLocation() {
    if (!navigator.geolocation) return setHint("Your browser can't share its location. Search or tap the map instead.");
    setLocating(true);
    setHint(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocating(false);
        void pick({ lat: position.coords.latitude, lng: position.coords.longitude });
      },
      () => {
        setLocating(false);
        setHint("Couldn't get your location. Search or tap the map instead.");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  return (
    <div className="grid gap-2">
      <form onSubmit={search} className="flex gap-2">
        <label htmlFor={`${idPrefix}-search`} className="sr-only">Search for a place</label>
        <Input id={`${idPrefix}-search`} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search a street, park or landmark" className="h-10" />
        <Button type="submit" variant="secondary" className="h-10" aria-label="Search">
          <Search aria-hidden />
        </Button>
        <Button type="button" variant="outline" className="h-10" onClick={useMyLocation} disabled={locating}>
          <Crosshair aria-hidden /> {locating ? "Locating…" : "Here"}
        </Button>
      </form>
      {results.length > 0 && (
        <ul className="grid divide-y rounded-lg border">
          {results.map((place) => (
            <li key={`${place.lat},${place.lng}`}>
              <button
                type="button"
                className="w-full px-3 py-2 text-left text-sm hover:bg-muted"
                onClick={() => {
                  void pick(place, place.label.split(",").slice(0, 2).join(","));
                  setResults([]);
                }}
              >
                {place.label}
              </button>
            </li>
          ))}
        </ul>
      )}
      <LocationPickerMap value={value} onPick={(point) => void pick(point)} />
      <p className="text-xs text-muted-foreground">Tap the map to move the pin.</p>
      {hint && <p className="text-sm text-destructive">{hint}</p>}
      {value && (
        <label className="grid gap-1.5 text-sm font-medium">
          <span className="flex items-center gap-1.5"><MapPin className="size-4 text-coral" aria-hidden /> Place name shown to others</span>
          <Input
            id={`${idPrefix}-label`}
            value={value.label}
            maxLength={300}
            onChange={(event) => onChange({ ...value, label: event.target.value })}
            className="h-10"
          />
        </label>
      )}
    </div>
  );
}
