"use client";

import { useState } from "react";
import { Controller, useForm, useWatch, type Control, type FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import { uploadImage } from "@/lib/api/storage";
import {
  ENERGY_LEVELS,
  GENDERS,
  PLAY_STYLES,
  SIZES,
  SPECIES,
  TEMPERAMENTS,
  type Option,
} from "@/lib/constants/pets";
import { petSchema, type PetValues } from "@/lib/validations/onboarding";
import type { Database } from "@/types/database";
import { Field } from "@/components/auth/field";
import { ChoiceChips } from "@/components/shared/choice-chips";
import { PhotoGrid, type PhotoItem } from "@/components/shared/photo-grid";
import { TagInput } from "@/components/shared/tag-input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

export type PetRow = Database["public"]["Tables"]["pets"]["Row"];

type YesNo = "yes" | "no" | "unsure";
const YES_NO: Option<YesNo>[] = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "unsure", label: "Not sure" },
];
const toYesNo = (value: boolean | null | undefined): YesNo =>
  value === true ? "yes" : value === false ? "no" : "unsure";
const fromYesNo = (value: YesNo) => (value === "yes" ? true : value === "no" ? false : null);

function defaultsFrom(pet?: PetRow): PetValues {
  return {
    name: pet?.name ?? "",
    species: pet?.species as PetValues["species"],
    breed: pet?.breed ?? "",
    birthDate: pet?.birth_date ?? "",
    gender: pet?.gender ?? "unknown",
    size: pet?.size as PetValues["size"],
    energy: pet?.energy as PetValues["energy"],
    temperament: pet?.temperament as PetValues["temperament"],
    playStyle: pet?.play_style as PetValues["playStyle"],
    vaccinated: pet?.vaccinated ?? false,
    vaccinatedOn: pet?.vaccinated_on ?? "",
    goodWithKids: pet?.good_with_kids ?? null,
    goodWithCats: pet?.good_with_cats ?? null,
    goodWithSmallDogs: pet?.good_with_small_dogs ?? null,
    neutered: pet?.neutered ?? null,
    allergies: pet?.allergies ?? "",
    specialNeeds: pet?.special_needs ?? "",
    likes: pet?.likes ?? [],
    dislikes: pet?.dislikes ?? [],
  };
}

// Add or edit a pet. Used by onboarding (the basics) and settings (everything).
export function PetForm({
  userId,
  pet,
  detailed = true,
  submitLabel,
  onSaved,
}: {
  userId: string;
  pet?: PetRow;
  detailed?: boolean;
  submitLabel: string;
  onSaved: () => void;
}) {
  const [photos, setPhotos] = useState<PhotoItem[]>(
    (pet?.photos ?? []).map((url) => ({ kind: "existing" as const, url })),
  );
  const [photoError, setPhotoError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<PetValues>({ resolver: zodResolver(petSchema), defaultValues: defaultsFrom(pet) });
  const petName = useWatch({ control, name: "name" }) || "your pet";
  const vaccinated = useWatch({ control, name: "vaccinated" });

  async function onSubmit(values: PetValues) {
    setPhotoError(null);
    if (photos.length === 0) {
      setPhotoError("Add at least one photo. It's the first thing other owners see.");
      return;
    }

    try {
      // Upload new photos in order; keep existing ones as they are.
      const urls: string[] = [];
      for (const photo of photos) {
        if (photo.kind === "existing") urls.push(photo.url);
        else {
          const { publicUrl } = await uploadImage("pet-photos", userId, photo.file);
          if (publicUrl) urls.push(publicUrl);
        }
      }

      const row = {
        name: values.name,
        species: values.species,
        breed: values.breed || null,
        birth_date: values.birthDate || null,
        gender: values.gender,
        size: values.size,
        energy: values.energy,
        temperament: values.temperament,
        play_style: values.playStyle,
        vaccinated: values.vaccinated,
        vaccinated_on: values.vaccinated ? values.vaccinatedOn || null : null,
        good_with_kids: values.goodWithKids,
        good_with_cats: values.goodWithCats,
        good_with_small_dogs: values.goodWithSmallDogs,
        neutered: values.neutered,
        allergies: values.allergies || null,
        special_needs: values.specialNeeds || null,
        likes: values.likes,
        dislikes: values.dislikes,
        photos: urls,
      };

      const supabase = createClient();
      const { error } = pet
        ? await supabase.from("pets").update(row).eq("id", pet.id)
        : await supabase.from("pets").insert(row);
      if (error) throw error;
      onSaved();
    } catch (error) {
      setError("root", { message: error instanceof Error ? error.message : "Something went wrong." });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-6">
      <div className="grid gap-1.5">
        <span className="text-sm font-medium">Photos</span>
        <PhotoGrid items={photos} onChange={setPhotos} max={detailed ? 6 : 1} label={petName} />
        {photoError && (
          <p role="alert" className="text-sm text-destructive">
            {photoError}
          </p>
        )}
      </div>

      <Field id="pet-name" label="Name" error={errors.name?.message}>
        <Input id="pet-name" className="h-10" aria-invalid={!!errors.name} {...register("name")} />
      </Field>

      <Chips control={control} name="species" label="Species" options={SPECIES} error={errors.species?.message} />

      <div className="grid gap-6 sm:grid-cols-2">
        <Field id="breed" label="Breed (optional)" error={errors.breed?.message}>
          <Input id="breed" className="h-10" placeholder="Beagle, Indie, Persian…" {...register("breed")} />
        </Field>
        <Field id="birth-date" label="Birthday (optional)" error={errors.birthDate?.message}>
          <Input id="birth-date" type="date" className="h-10" aria-invalid={!!errors.birthDate} {...register("birthDate")} />
        </Field>
      </div>

      <Chips control={control} name="gender" label="Gender" options={GENDERS} error={errors.gender?.message} />
      <Chips control={control} name="size" label="Size" options={SIZES} error={errors.size?.message} />
      <Chips control={control} name="energy" label="Energy" options={ENERGY_LEVELS} error={errors.energy?.message} />
      <Chips control={control} name="playStyle" label="Play style" options={PLAY_STYLES} error={errors.playStyle?.message} />
      <Chips control={control} name="temperament" label="With other pets" options={TEMPERAMENTS} error={errors.temperament?.message} />

      <div className="grid gap-3">
        <div className="flex items-center gap-2">
          <Controller
            control={control}
            name="vaccinated"
            render={({ field }) => (
              <Checkbox id="vaccinated" checked={field.value} onCheckedChange={(checked) => field.onChange(checked === true)} />
            )}
          />
          <label htmlFor="vaccinated" className="text-sm">
            Vaccinations are up to date
          </label>
        </div>
        {detailed && vaccinated && (
          <Field id="vaccinated-on" label="Last vaccination (optional)" error={errors.vaccinatedOn?.message}>
            <Input id="vaccinated-on" type="date" className="h-10 sm:max-w-56" {...register("vaccinatedOn")} />
          </Field>
        )}
      </div>

      {detailed && (
        <fieldset className="grid gap-6 rounded-xl border p-4">
          <legend className="px-1 text-sm font-semibold">More about {petName}</legend>
          <YesNoChips control={control} name="goodWithKids" label="Good with kids?" />
          <YesNoChips control={control} name="goodWithCats" label="Good with cats?" />
          <YesNoChips control={control} name="goodWithSmallDogs" label="Good with small dogs?" />
          <YesNoChips control={control} name="neutered" label="Neutered or spayed?" />
          <Field id="likes" label="Likes" hint="Press Enter after each one, e.g. fetch, water, belly rubs">
            <Controller
              control={control}
              name="likes"
              render={({ field }) => <TagInput id="likes" value={field.value} onChange={field.onChange} placeholder="fetch" />}
            />
          </Field>
          <Field id="dislikes" label="Dislikes" hint="e.g. loud noises, bikes">
            <Controller
              control={control}
              name="dislikes"
              render={({ field }) => <TagInput id="dislikes" value={field.value} onChange={field.onChange} placeholder="loud noises" />}
            />
          </Field>
          <Field id="allergies" label="Allergies (optional)" error={errors.allergies?.message}>
            <Input id="allergies" className="h-10" {...register("allergies")} />
          </Field>
          <Field id="special-needs" label="Special needs (optional)" error={errors.specialNeeds?.message}>
            <Input id="special-needs" className="h-10" {...register("specialNeeds")} />
          </Field>
        </fieldset>
      )}

      {errors.root && (
        <p role="alert" className="text-sm text-destructive">
          {errors.root.message}
        </p>
      )}

      <Button type="submit" size="lg" className="h-11" disabled={isSubmitting}>
        {isSubmitting ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}

type ChipName = "species" | "gender" | "size" | "energy" | "playStyle" | "temperament";

function Chips<T extends string>({
  control,
  name,
  label,
  options,
  error,
}: {
  control: Control<PetValues>;
  name: ChipName;
  label: string;
  options: Option<T>[];
  error?: string;
}) {
  return (
    <div className="grid gap-2" role="group" aria-labelledby={`${name}-label`}>
      <span id={`${name}-label`} className="text-sm font-medium">
        {label}
      </span>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <ChoiceChips id={name} options={options} value={field.value as T | undefined} onChange={field.onChange} invalid={!!error} />
        )}
      />
      {error && (
        <p id={`${name}-error`} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

function YesNoChips({
  control,
  name,
  label,
}: {
  control: Control<PetValues>;
  name: Extract<FieldPath<PetValues>, "goodWithKids" | "goodWithCats" | "goodWithSmallDogs" | "neutered">;
  label: string;
}) {
  return (
    <div className="grid gap-2" role="group" aria-labelledby={`${name}-label`}>
      <span id={`${name}-label`} className="text-sm font-medium">
        {label}
      </span>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <ChoiceChips
            id={name}
            options={YES_NO}
            value={toYesNo(field.value)}
            onChange={(value) => field.onChange(fromYesNo(value))}
          />
        )}
      />
    </div>
  );
}
