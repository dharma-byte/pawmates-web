"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import { uploadImage } from "@/lib/api/storage";
import type { OnboardingState } from "@/lib/api/onboarding";
import {
  ENERGY_LEVELS,
  GENDERS,
  PLAY_STYLES,
  SIZES,
  SPECIES,
  TEMPERAMENTS,
} from "@/lib/constants/pets";
import { petSchema, type PetValues } from "@/lib/validations/onboarding";
import { Field } from "@/components/auth/field";
import { ChoiceChips } from "@/components/shared/choice-chips";
import { ImagePicker } from "@/components/shared/image-picker";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { StepHeader } from "./step-header";

export function PetStep({ state, onDone }: { state: OnboardingState; onDone: () => void }) {
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<PetValues>({
    resolver: zodResolver(petSchema),
    defaultValues: { name: "", breed: "", birthDate: "", gender: "unknown", vaccinated: false },
  });

  async function onSubmit(values: PetValues) {
    setPhotoError(null);
    if (!photo) {
      setPhotoError("Add a photo of your pet. It's the first thing other owners see.");
      return;
    }

    try {
      const { publicUrl } = await uploadImage("pet-photos", state.userId, photo);
      const { error } = await createClient()
        .from("pets")
        .insert({
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
          photos: publicUrl ? [publicUrl] : [],
        });
      if (error) throw error;
      onDone();
    } catch (error) {
      setError("root", { message: error instanceof Error ? error.message : "Something went wrong." });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-6">
      <StepHeader
        title="Your pet"
        description="This helps us find playmates that match. You can add more pets later."
      />

      <div className="grid gap-1.5">
        <ImagePicker
          file={photo}
          onChange={setPhoto}
          label="Add your pet's photo"
          invalid={!!photoError}
        />
        {photoError && (
          <p role="alert" className="text-sm text-destructive">
            {photoError}
          </p>
        )}
      </div>

      <Field id="pet-name" label="Name" error={errors.name?.message}>
        <Input id="pet-name" className="h-10" aria-invalid={!!errors.name} {...register("name")} />
      </Field>

      <ChipField id="species" label="Species" error={errors.species?.message}>
        <Controller
          control={control}
          name="species"
          render={({ field }) => (
            <ChoiceChips id="species" options={SPECIES} value={field.value} onChange={field.onChange} invalid={!!errors.species} />
          )}
        />
      </ChipField>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field id="breed" label="Breed (optional)" error={errors.breed?.message}>
          <Input id="breed" className="h-10" placeholder="Beagle, Indie, Persian…" {...register("breed")} />
        </Field>
        <Field id="birth-date" label="Birthday (optional)" error={errors.birthDate?.message}>
          <Input id="birth-date" type="date" className="h-10" aria-invalid={!!errors.birthDate} {...register("birthDate")} />
        </Field>
      </div>

      <ChipField id="gender" label="Gender" error={errors.gender?.message}>
        <Controller
          control={control}
          name="gender"
          render={({ field }) => (
            <ChoiceChips id="gender" options={GENDERS} value={field.value} onChange={field.onChange} />
          )}
        />
      </ChipField>

      <ChipField id="size" label="Size" error={errors.size?.message}>
        <Controller
          control={control}
          name="size"
          render={({ field }) => (
            <ChoiceChips id="size" options={SIZES} value={field.value} onChange={field.onChange} invalid={!!errors.size} />
          )}
        />
      </ChipField>

      <ChipField id="energy" label="Energy" error={errors.energy?.message}>
        <Controller
          control={control}
          name="energy"
          render={({ field }) => (
            <ChoiceChips id="energy" options={ENERGY_LEVELS} value={field.value} onChange={field.onChange} invalid={!!errors.energy} />
          )}
        />
      </ChipField>

      <ChipField id="play-style" label="Play style" error={errors.playStyle?.message}>
        <Controller
          control={control}
          name="playStyle"
          render={({ field }) => (
            <ChoiceChips id="play-style" options={PLAY_STYLES} value={field.value} onChange={field.onChange} invalid={!!errors.playStyle} />
          )}
        />
      </ChipField>

      <ChipField id="temperament" label="With other pets" error={errors.temperament?.message}>
        <Controller
          control={control}
          name="temperament"
          render={({ field }) => (
            <ChoiceChips id="temperament" options={TEMPERAMENTS} value={field.value} onChange={field.onChange} invalid={!!errors.temperament} />
          )}
        />
      </ChipField>

      <div className="flex items-center gap-2">
        <Controller
          control={control}
          name="vaccinated"
          render={({ field }) => (
            <Checkbox
              id="vaccinated"
              checked={field.value}
              onCheckedChange={(checked) => field.onChange(checked === true)}
            />
          )}
        />
        <label htmlFor="vaccinated" className="text-sm">
          Vaccinations are up to date
        </label>
      </div>

      {errors.root && (
        <p role="alert" className="text-sm text-destructive">
          {errors.root.message}
        </p>
      )}

      <Button type="submit" size="lg" className="h-11" disabled={isSubmitting}>
        {isSubmitting ? "Saving…" : "Continue"}
      </Button>
    </form>
  );
}

// Label + chip group + error. Chip groups are not single inputs, so the label
// names the group rather than pointing at a control.
function ChipField({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2" role="group" aria-labelledby={`${id}-label`}>
      <span id={`${id}-label`} className="text-sm font-medium">
        {label}
      </span>
      {children}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
