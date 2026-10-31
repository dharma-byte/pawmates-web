"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { MapPin, Search, ShieldCheck, Trees } from "lucide-react";
import { toast } from "sonner";
import { cn } from "cn";
import { reverseGeocode, searchPlaces, type Place } from "@/lib/api/geocode";
import type { Me } from "@/lib/api/me";
import { createPlaydate, fetchMidpoint, playdateKeys, suggestSpots } from "@/lib/api/playdates";
import { ChoiceChips } from "@/components/shared/choice-chips";
import { FilterChips } from "@/components/shared/filter-chips";
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
  { value: "30", label: "30 min" },
  { value: "60", label: "1 hour" },
  { value: "90", label: "1.5 hours" },
  { value: "120", label: "2 hours" },
];

// "2026-11-01T17:00" for tomorrow at 5 pm, in local time, for datetime-local.
function tomorrowAtFive() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  date.setHours(17, 0, 0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T17:00`;
}

// Mount only while open: it reads the clock for its default time.
export function PlanPlaydateDialog({
  conversationId,
  otherName,
  myPets,
  onClose,
}: {
  conversationId: string;
  otherName: string;
  myPets: Me["pets"];
  onClose: () => void;
}) {
  const [when, setWhen] = useState(tomorrowAtFive);
  const [duration, setDuration] = useState("60");
  const [chosen, setChosen] = useState<Chosen | null>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Place[]>([]);
  const [petIds, setPetIds] = useState<string[]>(myPets[0] ? [myPets[0].id] : []);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  const midpoint = useQuery({ queryKey: playdateKeys.midpoint(conversationId), queryFn: () => fetchMidpoint(conversationId) });
  const spots = useQuery({
    queryKey: playdateKeys.spots(midpoint.data?.lat ?? 0, midpoint.data?.lng ?? 0),
    queryFn: () => suggestSpots(midpoint.data!.lat, midpoint.data!.lng),
    enabled: !!midpoint.data,
    staleTime: 60 * 60 * 1000,
  });

  const plan = useMutation({
    mutationFn: async () => {
      if (!chosen) throw new Error("Choose where to meet.");
      const startsAt = new Date(when);
      if (Number.isNaN(startsAt.getTime())) throw new Error("Pick a date and time.");
      const address = chosen.address ?? [chosen.name, await reverseGeocode(chosen)].filter(Boolean).join(", ");
      return createPlaydate({
        conversationId,
        startsAt,
        durationMinutes: Number(duration),
        lat: chosen.lat,
        lng: chosen.lng,
        placeName: chosen.name,
        address,
        note: note.trim(),
        petIds,
      });
    },
    onSuccess: () => {
      toast.success(`Playdate invite sent to ${otherName} 🐾`);
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
          <DialogTitle>Plan a playdate with {otherName}</DialogTitle>
          <DialogDescription>They&apos;ll get an invite card in this chat to accept or decline.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-5">
          <div className="grid gap-2 sm:grid-cols-2">
            <label className="grid gap-1.5 text-sm font-medium">
              When
              <Input type="datetime-local" value={when} onChange={(event) => setWhen(event.target.value)} className="h-10" />
            </label>
            <div className="grid gap-1.5">
              <span className="text-sm font-medium">How long</span>
              <ChoiceChips id="duration" options={DURATIONS} value={duration} onChange={setDuration} />
            </div>
          </div>

          <fieldset className="grid gap-2">
            <legend className="mb-1 text-sm font-medium">Where to meet</legend>
            <p className="text-xs text-muted-foreground">Public parks halfway between you two.</p>
            {(midpoint.isPending || spots.isPending) && midpoint.data !== null && <Skeleton className="h-24 w-full" />}
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
            {spots.data?.length === 0 && <p className="text-sm text-muted-foreground">No named parks nearby. Search for a place below.</p>}

            <form onSubmit={search} className="flex gap-2">
              <label htmlFor="spot-search" className="sr-only">Search for another place</label>
              <Input id="spot-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Or search: Cubbon Park, a pet café…" className="h-10" />
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

          {myPets.length > 1 && (
            <FilterChips
              label="Who's coming"
              options={myPets.map((pet) => ({ value: pet.id, label: pet.name }))}
              value={petIds}
              onChange={setPetIds}
            />
          )}

          <label className="grid gap-1.5 text-sm font-medium">
            Note (optional)
            <Textarea rows={2} maxLength={1000} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Bring a ball, Luna loves fetch!" />
          </label>

          <p className="flex gap-2 rounded-lg bg-secondary p-3 text-xs text-secondary-foreground">
            <ShieldCheck className="size-4 shrink-0 text-teal" aria-hidden />
            Meet somewhere public, keep leashes on for the first few minutes, and let the pets set the pace.
          </p>

          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => { setError(null); plan.mutate(); }} disabled={plan.isPending || !chosen}>
            {plan.isPending ? "Sending…" : "Send invite"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
