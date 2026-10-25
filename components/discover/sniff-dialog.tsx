"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { connectionKeys, sendSniffRequest } from "@/lib/api/connections";
import type { NearbyPet } from "@/lib/api/discover";
import type { Me } from "@/lib/api/me";
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
import { Textarea } from "@/components/ui/textarea";

// Anything with a pet and its owner: a Discover result, a profile or a pet page.
export type SniffTarget = Pick<NearbyPet, "pet_id" | "name" | "owner_id"> & { owner_username: string | null };

export function SniffDialog({
  pet,
  myPets,
  open,
  onOpenChange,
}: {
  pet: SniffTarget;
  myPets: Me["pets"];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const [fromPetId, setFromPetId] = useState(myPets[0]?.id);
  const [message, setMessage] = useState("");

  const send = useMutation({
    mutationFn: () =>
      sendSniffRequest({
        addresseeId: pet.owner_id,
        petId: fromPetId,
        targetPetId: pet.pet_id,
        message,
      }),
    onSuccess: () => {
      toast.success(`Sniff request sent to ${pet.name}'s owner 🐾`);
      queryClient.invalidateQueries({ queryKey: connectionKeys.all });
      onOpenChange(false);
      setMessage("");
    },
    onError: (error) => toast.error(error.message),
  });

  const fromPet = myPets.find((p) => p.id === fromPetId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sniff {pet.name}?</DialogTitle>
          <DialogDescription>
            If {pet.owner_username ? `@${pet.owner_username}` : "their owner"} accepts, you become
            Pawmates and can chat to plan a playdate.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5">
          {myPets.length > 1 && (
            <div className="grid gap-2">
              <span className="text-sm font-medium">From</span>
              <ChoiceChips
                id="sniff-from"
                options={myPets.map((p) => ({ value: p.id, label: p.name }))}
                value={fromPetId}
                onChange={setFromPetId}
              />
            </div>
          )}
          <div className="grid gap-1.5">
            <label htmlFor="sniff-message" className="text-sm font-medium">
              Say hi (optional)
            </label>
            <Textarea
              id="sniff-message"
              rows={3}
              maxLength={300}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder={`${fromPet?.name ?? "We"} would love a playdate at the park this weekend!`}
            />
            <span className="justify-self-end text-xs text-muted-foreground">{message.length}/300</span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => send.mutate()} disabled={send.isPending}>
            {send.isPending ? "Sending…" : "Send Sniff request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
