"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { addSighting, lostKeys } from "@/lib/api/lost";
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
import { Textarea } from "@/components/ui/textarea";
import { PlacePicker, type PickedPlace } from "./place-picker";
import { nowLocal } from "./report-lost-dialog";

// "I saw this dog": where, when and a note. Mount only while open.
export function SightingDialog({ reportId, petName, onClose }: { reportId: string; petName: string; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [when, setWhen] = useState(nowLocal);
  const [place, setPlace] = useState<PickedPlace | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  const send = useMutation({
    mutationFn: () => {
      if (!place) throw new Error(`Pin where you saw ${petName}.`);
      const seenAt = new Date(when);
      if (Number.isNaN(seenAt.getTime())) throw new Error("Pick when you saw them.");
      return addSighting({ reportId, seenAt, lat: place.lat, lng: place.lng, place: place.label, note });
    },
    onSuccess: () => {
      toast.success(`Thank you! ${petName}'s owner has been told.`);
      queryClient.invalidateQueries({ queryKey: lostKeys.all });
      onClose();
    },
    onError: (cause) => setError(cause.message),
  });

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>I saw {petName}</DialogTitle>
          <DialogDescription>The owner gets your sighting straight away and can message you.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-5">
          <label className="grid gap-1.5 text-sm font-medium">
            When
            <Input type="datetime-local" value={when} max={nowLocal()} onChange={(event) => setWhen(event.target.value)} className="h-10" />
          </label>
          <div className="grid gap-1.5">
            <span className="text-sm font-medium">Where</span>
            <PlacePicker idPrefix="sighting" value={place} onChange={setPlace} />
          </div>
          <label className="grid gap-1.5 text-sm font-medium">
            Anything else? (optional)
            <Textarea rows={2} maxLength={500} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Which way they were heading, whether they looked hurt…" />
          </label>
          <p className="rounded-lg bg-secondary p-2.5 text-xs text-secondary-foreground">
            Frightened dogs often run from people. Don&apos;t chase: stay calm, crouch down, and let the owner know where they are.
          </p>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => { setError(null); send.mutate(); }} disabled={send.isPending}>
            {send.isPending ? "Sending…" : "Send sighting"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
