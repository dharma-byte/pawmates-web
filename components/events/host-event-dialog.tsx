"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MapPin, Search, ShieldCheck, Trees } from "lucide-react";
import { toast } from "sonner";
import { cn } from "cn";
import { fetchMyLocation } from "@/lib/api/discover";
import { reverseGeocode, searchPlaces, type Place } from "@/lib/api/geocode";
import { createGroupEvent, eventKeys, groupKeys } from "@/lib/api/groups";
import type { Me } from "@/lib/api/me";
import { playdateKeys, suggestSpots } from "@/lib/api/playdates";
import { ChoiceChips } from "@/components/shared/choice-chips";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

type Chosen = { name: string; lat: number; lng: number; address?: string };

const DURATIONS = [
  { value: "60", label: "1 hour" },
  { value: "90", label: "1.5 hours" },
  { value: "120", label: "2 hours" },
  { value: "180", label: "3 hours" },
];

// "2026-11-02T07:30" for the coming Saturday or Sunday morning, local time.
function nextWeekendMorning() {
  const date = new Date();
  date.setDate(date.getDate() + (((6 - date.getDay() + 7) % 7) || 7));
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T07:30`;
}

// Mount only while open: it reads the clock for its default time.
export function HostEventDialog({
  groupId,
  groupName,
  myPets,
  onClose,
}: {
  groupId: string;
  groupName: string;
  myPets: Me["pets"];
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [when, setWhen] = useState(nextWeekendMorning);
  const [duration, setDuration] = useState("90");
  const [capacity, setCapacity] = useState("");
  const [chosen, setChosen] = useState<Chosen | null>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Place[]>([]);
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  const home = useQuery({ queryKey: ["me", "location"], queryFn: fetchMyLocation });
  const spots = useQuery({
    queryKey: playdateKeys.spots(home.data?.lat ?? 0, home.data?.lng ?? 0),
    queryFn: () => suggestSpots(home.data!.lat, home.data!.lng),
    enabled: !!home.data,
    staleTime: 60 * 60 * 1000,
  });

  const host = useMutation({
    mutationFn: async () => {
      if (!title.trim()) throw new Error("Give the event a name.");
      if (!chosen) throw new Error("Choose where to meet.");
      const startsAt = new Date(when);
      if (Number.isNaN(startsAt.getTime())) throw new Error("Pick a date and time.");
      const cap = capacity.trim() ? Number(capacity) : null;
      if (cap != null && (!Number.isInteger(cap) || cap < 2 || cap > 500)) throw new Error("Capacity must be between 2 and 500, or left empty.");
      const address = chosen.address ?? [chosen.name, await reverseGeocode(chosen)].filter(Boolean).join(", ");
      return createGroupEvent({
        groupId,
        title,
        startsAt,
        durationMinutes: Number(duration),
        lat: chosen.lat,
        lng: chosen.lng,
        placeName: chosen.name,
        address,
        description,
        capacity: cap,
        petIds: myPets[0] ? [myPets[0].id] : [],
      });
    },
    onSuccess: () => {
      toast.success(`${title.trim()} is posted in ${groupName} 🎉`);
      queryClient.invalidateQueries({ queryKey: eventKeys.all });
      queryClient.invalidateQueries({ queryKey: groupKeys.all });
      onClose();
    },
    onError: (cause) => setError(cause.message),
  });

  async function search(event: React.FormEvent) {
    event.preventDefault();
    if (query.trim().length >= 3) setResults(await searchPlaces(query.trim()));
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Host an event in {groupName}</DialogTitle>
          <DialogDescription>Members get a card in the group chat and can RSVP.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-5">
          <label className="grid gap-1.5 text-sm font-medium">
            Event name
            <Input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={120} placeholder="Sunday pack walk" className="h-10" />
          </label>

          <div className="grid gap-2 sm:grid-cols-2">
            <label className="grid gap-1.5 text-sm font-medium">
              When
              <Input type="datetime-local" value={when} onChange={(event) => setWhen(event.target.value)} className="h-10" />
            </label>
            <label className="grid gap-1.5 text-sm font-medium">
              Max people (optional)
              <Input type="number" inputMode="numeric" min={2} max={500} value={capacity} onChange={(event) => setCapacity(event.target.value)} placeholder="No limit" className="h-10" />
            </label>
          </div>

          <div className="grid gap-1.5">
            <span className="text-sm font-medium">How long</span>
            <ChoiceChips id="event-duration" options={DURATIONS} value={duration} onChange={setDuration} />
          </div>

          <fieldset className="grid gap-2">
            <legend className="mb-1 text-sm font-medium">Where</legend>
            <p className="text-xs text-muted-foreground">Public parks near you, or search for any place.</p>
            {home.data && spots.isPending && <Skeleton className="h-24 w-full" />}
            {spots.data && spots.data.length > 0 && (
              <ul className="grid gap-2 sm:grid-cols-2">
                {spots.data.map((spot) => (
                  <li key={spot.name}>
                    <button
                      type="button"
                      aria-pressed={chosen?.name === spot.name}
                      onClick={() => setChosen(spot)}
                      className={cn(
                        "flex w-full items-start gap-2 rounded-xl border p-3 text-left text-sm transition-colors",
                        chosen?.name === spot.name ? "border-primary bg-secondary" : "hover:bg-muted",
                      )}
                    >
                      <Trees className="mt-0.5 size-4 shrink-0 text-teal" aria-hidden />
                      <span>
                        <span className="block font-medium">{spot.name}</span>
                        <span className="block text-xs text-muted-foreground capitalize">{spot.kind}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <form onSubmit={search} className="flex gap-2">
              <label htmlFor="event-place-search" className="sr-only">Search for a place</label>
              <Input id="event-place-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search: a park, a pet café…" className="h-10" />
              <Button type="submit" variant="secondary" className="h-10" aria-label="Search">
                <Search aria-hidden />
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
                        setChosen({ name: place.label.split(",")[0], lat: place.lat, lng: place.lng, address: place.label });
                        setResults([]);
                      }}
                    >
                      {place.label}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {chosen && (
              <p className="flex items-center gap-1.5 text-sm font-medium text-primary">
                <MapPin className="size-4 text-coral" aria-hidden /> {chosen.name}
              </p>
            )}
          </fieldset>

          <label className="grid gap-1.5 text-sm font-medium">
            Details (optional)
            <Textarea rows={3} maxLength={1000} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Route, what to bring, which gate to meet at…" />
          </label>

          <p className="flex gap-2 rounded-lg bg-secondary p-3 text-xs text-secondary-foreground">
            <ShieldCheck className="size-4 shrink-0 text-teal" aria-hidden />
            Pick a public place. Ask everyone to keep leashes on at the start and bring water for the pets.
          </p>

          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => { setError(null); host.mutate(); }} disabled={host.isPending}>
            {host.isPending ? "Posting…" : "Post event"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
