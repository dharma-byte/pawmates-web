"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { ALERT_RADII, lostKeys, reportLostPet } from "@/lib/api/lost";
import { fetchMe, meKey } from "@/lib/api/me";
import { useSharedQuery } from "@/hooks/use-shared-query";
import { ChoiceChips } from "@/components/shared/choice-chips";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PlacePicker, type PickedPlace } from "./place-picker";

// "2026-11-01T17:05" for now, in local time, for datetime-local.
export function nowLocal() {
  const date = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

// Mount only while open: it reads the clock for its default time.
export function ReportLostDialog({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: me } = useSharedQuery({ queryKey: meKey, queryFn: fetchMe });
  const pets = me?.pets ?? [];
  const [petId, setPetId] = useState<string | undefined>(undefined);
  const chosenPet = petId ?? pets[0]?.id;
  const [when, setWhen] = useState(nowLocal);
  const [place, setPlace] = useState<PickedPlace | null>(null);
  const [description, setDescription] = useState("");
  const [radius, setRadius] = useState("5");
  const [error, setError] = useState<string | null>(null);

  const report = useMutation({
    mutationFn: () => {
      if (!chosenPet) throw new Error("Add your dog to your profile first.");
      if (!place) throw new Error("Pin where your dog was last seen.");
      if (!place.label.trim()) throw new Error("Give the place a name, like a street or park.");
      const lastSeenAt = new Date(when);
      if (Number.isNaN(lastSeenAt.getTime())) throw new Error("Pick when your dog was last seen.");
      return reportLostPet({
        petId: chosenPet,
        lastSeenAt,
        lat: place.lat,
        lng: place.lng,
        place: place.label,
        description,
        radiusKm: Number(radius),
      });
    },
    onSuccess: (reportId) => {
      toast.success("Alert sent to members nearby. We'll tell you the moment someone sees your dog.");
      queryClient.invalidateQueries({ queryKey: lostKeys.all });
      router.push(`/lost/${reportId}`);
      onClose();
    },
    onError: (cause) => setError(cause.message),
  });

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Report a lost dog</DialogTitle>
          <DialogDescription>Verified members nearby get an alert straight away and can tell you where they saw your dog.</DialogDescription>
        </DialogHeader>

        {me && pets.length === 0 ? (
          <div className="grid gap-3 text-sm">
            <p>Add your dog to your profile first, with a clear photo, so neighbours know who to look for.</p>
            <Link href="/settings?tab=pets" onClick={onClose} className={buttonVariants({ className: "justify-self-start" })}>
              Add your dog
            </Link>
          </div>
        ) : (
          <div className="grid gap-5">
            {pets.length > 1 && (
              <div className="grid gap-1.5">
                <span className="text-sm font-medium">Who&apos;s missing?</span>
                <ChoiceChips id="lost-pet" options={pets.map((p) => ({ value: p.id, label: p.name }))} value={chosenPet} onChange={setPetId} />
              </div>
            )}

            <label className="grid gap-1.5 text-sm font-medium">
              Last seen
              <Input type="datetime-local" value={when} max={nowLocal()} onChange={(event) => setWhen(event.target.value)} className="h-10" />
            </label>

            <div className="grid gap-1.5">
              <span className="text-sm font-medium">Where</span>
              <p className="flex gap-2 rounded-lg bg-secondary p-2.5 text-xs text-secondary-foreground">
                <ShieldAlert className="size-4 shrink-0 text-coral" aria-hidden />
                This spot is shown to members nearby. Pick the street or park where your dog was last seen, not your home address.
              </p>
              <PlacePicker idPrefix="lost" value={place} onChange={setPlace} />
            </div>

            <label className="grid gap-1.5 text-sm font-medium">
              What should people know?
              <Textarea
                rows={3}
                maxLength={1000}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Collar colour, size, whether to approach or call you. E.g. Red collar, shy, please don't chase."
              />
            </label>

            <div className="grid gap-1.5">
              <span className="text-sm font-medium">Alert members within</span>
              <ChoiceChips id="lost-radius" options={ALERT_RADII} value={radius} onChange={setRadius} />
            </div>

            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          {pets.length > 0 && (
            <Button onClick={() => { setError(null); report.mutate(); }} disabled={report.isPending}>
              {report.isPending ? "Sending alert…" : "Send alert"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
