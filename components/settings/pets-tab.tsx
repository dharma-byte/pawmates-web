"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { ExternalLink, PawPrint, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deletePet, type MySettings } from "@/lib/api/settings";
import { PetForm } from "@/components/pets/pet-form";
import { Button, buttonVariants } from "@/components/ui/button";

export function PetsTab({ settings, onSaved }: { settings: MySettings; onSaved: (message: string) => void }) {
  const [editing, setEditing] = useState<string | "new" | null>(null);

  const remove = useMutation({
    mutationFn: deletePet,
    onSuccess: () => onSaved("Pet removed"),
    onError: (error) => toast.error(error.message),
  });

  if (editing) {
    const pet = settings.pets.find((p) => p.id === editing);
    return (
      <div className="grid max-w-xl gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">{pet ? `Edit ${pet.name}` : "Add a pet"}</h2>
          <Button variant="ghost" onClick={() => setEditing(null)}>
            Cancel
          </Button>
        </div>
        <PetForm
          userId={settings.userId}
          pet={pet}
          submitLabel={pet ? "Save changes" : "Add pet"}
          onSaved={() => {
            setEditing(null);
            onSaved(pet ? `${pet.name} updated` : "Pet added");
          }}
        />
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <ul className="grid gap-3">
        {settings.pets.map((pet) => (
          <li key={pet.id} className="flex items-center gap-3 rounded-xl border p-3">
            <span className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-muted">
              {pet.photos[0] ? (
                <Image src={pet.photos[0]} alt="" fill sizes="64px" className="object-cover" />
              ) : (
                <PawPrint className="absolute inset-0 m-auto size-6 text-muted-foreground" aria-hidden />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{pet.name}</p>
              <p className="truncate text-sm text-muted-foreground capitalize">
                {pet.breed ?? pet.species} · {pet.photos.length} photo{pet.photos.length === 1 ? "" : "s"}
              </p>
            </div>
            <Link href={`/pets/${pet.id}`} className={buttonVariants({ variant: "ghost", size: "icon" })} aria-label={`View ${pet.name}'s page`}>
              <ExternalLink />
            </Link>
            <Button variant="outline" size="sm" onClick={() => setEditing(pet.id)}>
              <Pencil aria-hidden /> Edit
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Remove ${pet.name}`}
              disabled={remove.isPending}
              onClick={() => {
                // Everything on Pawmates is about pets, so keep at least one.
                if (settings.pets.length === 1) {
                  toast.error("You need at least one pet on Pawmates. Add another before removing this one.");
                  return;
                }
                if (window.confirm(`Remove ${pet.name} from Pawmates? This can't be undone.`)) remove.mutate(pet.id);
              }}
            >
              <Trash2 />
            </Button>
          </li>
        ))}
      </ul>
      <Button variant="outline" className="justify-self-start" onClick={() => setEditing("new")}>
        <Plus aria-hidden /> Add another pet
      </Button>
    </div>
  );
}
