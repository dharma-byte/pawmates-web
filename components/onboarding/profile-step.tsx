"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import { uploadImage } from "@/lib/api/storage";
import type { OnboardingState } from "@/lib/api/onboarding";
import { profileSchema, type ProfileValues } from "@/lib/validations/onboarding";
import { Field } from "@/components/auth/field";
import { ImagePicker } from "@/components/shared/image-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { StepHeader } from "./step-header";

export function ProfileStep({ state, onDone }: { state: OnboardingState; onDone: () => void }) {
  const { profile, userId } = state;
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: profile.full_name ?? "",
      username: profile.username ?? "",
      bio: profile.bio ?? "",
    },
  });

  async function onSubmit(values: ProfileValues) {
    setPhotoError(null);
    if (!photo && !profile.avatar_url) {
      setPhotoError("Add a profile photo so other members can recognise you.");
      return;
    }

    try {
      const avatarUrl = photo
        ? (await uploadImage("avatars", userId, photo)).publicUrl
        : profile.avatar_url;

      const { error } = await createClient()
        .from("profiles")
        .update({
          full_name: values.fullName,
          username: values.username,
          bio: values.bio || null,
          avatar_url: avatarUrl,
        })
        .eq("id", userId);

      if (error?.code === "23505") {
        setError("username", { message: "That username is taken. Try another one." });
        return;
      }
      if (error) throw error;
      onDone();
    } catch (error) {
      setError("root", { message: error instanceof Error ? error.message : "Something went wrong." });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-6">
      <StepHeader
        title="About you"
        description="Pets are the stars here, but other owners like to know who they're meeting."
      />

      <div className="grid gap-1.5">
        <ImagePicker
          file={photo}
          onChange={setPhoto}
          existingUrl={profile.avatar_url}
          label="Add a profile photo"
          shape="circle"
          invalid={!!photoError}
        />
        {photoError && (
          <p role="alert" className="text-sm text-destructive">
            {photoError}
          </p>
        )}
      </div>

      <Field id="full-name" label="Your name" error={errors.fullName?.message}>
        <Input
          id="full-name"
          autoComplete="name"
          className="h-10"
          aria-invalid={!!errors.fullName}
          {...register("fullName")}
        />
      </Field>

      <Field
        id="username"
        label="Username"
        error={errors.username?.message}
        hint="Your profile link: pawmates.app/u/your-username"
      >
        <Input
          id="username"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          className="h-10"
          aria-invalid={!!errors.username}
          {...register("username")}
        />
      </Field>

      <Field id="bio" label="Short bio (optional)" error={errors.bio?.message}>
        <Textarea
          id="bio"
          rows={3}
          placeholder="Weekend dog-park regular, always up for a walk by the lake."
          aria-invalid={!!errors.bio}
          {...register("bio")}
        />
      </Field>

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
