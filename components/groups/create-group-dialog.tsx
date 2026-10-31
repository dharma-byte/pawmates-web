"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { SPECIES } from "@/lib/constants/pets";
import { createGroup, GROUP_KINDS, groupKeys, type GroupKind, type Species } from "@/lib/api/groups";
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
import { Textarea } from "@/components/ui/textarea";

// Start a group; opens it on success.
export function CreateGroupDialog({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [kind, setKind] = useState<GroupKind>("area");
  const [species, setSpecies] = useState<Species>("dog");
  const [breed, setBreed] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  const create = useMutation({
    mutationFn: () => {
      if (name.trim().length < 3) throw new Error("Give the group a name of at least 3 characters.");
      if (kind === "breed" && !breed.trim()) throw new Error("Which breed is this club for?");
      return createGroup({
        name,
        kind,
        description,
        species: kind === "area" ? null : species,
        breed: kind === "breed" ? breed : "",
      });
    },
    onSuccess: (groupId) => {
      toast.success(`${name.trim()} is live 🎉 Invite your Pawmates!`);
      queryClient.invalidateQueries({ queryKey: groupKeys.all });
      router.push(`/groups/${groupId}`);
      onClose();
    },
    onError: (cause) => setError(cause.message),
  });

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Start a group</DialogTitle>
          <DialogDescription>
            Groups are open to verified members nearby. You&apos;ll get a group chat and can host events.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5">
          <div className="grid gap-1.5">
            <span className="text-sm font-medium">What kind of group?</span>
            <ChoiceChips id="group-kind" options={GROUP_KINDS} value={kind} onChange={setKind} />
            <p className="text-xs text-muted-foreground">{GROUP_KINDS.find((k) => k.value === kind)?.hint}</p>
          </div>

          <label className="grid gap-1.5 text-sm font-medium">
            Name
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={60}
              placeholder={kind === "breed" ? "Bengaluru Beagle Club" : kind === "area" ? "Indiranagar Dog Walkers" : "Rescue Pet Parents"}
              className="h-10"
            />
          </label>

          {kind !== "area" && (
            <div className="grid gap-1.5">
              <span className="text-sm font-medium">For</span>
              <ChoiceChips id="group-species" options={SPECIES} value={species} onChange={setSpecies} />
            </div>
          )}

          {kind === "breed" && (
            <label className="grid gap-1.5 text-sm font-medium">
              Breed
              <Input value={breed} onChange={(event) => setBreed(event.target.value)} maxLength={60} placeholder="Beagle" className="h-10" />
            </label>
          )}

          <label className="grid gap-1.5 text-sm font-medium">
            About (optional)
            <Textarea
              rows={3}
              maxLength={1000}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Who it's for, when you usually meet, any house rules."
            />
          </label>

          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => { setError(null); create.mutate(); }} disabled={create.isPending}>
            {create.isPending ? "Creating…" : "Create group"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
