"use client";

import { useState } from "react";
import { CircleAlert, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { uploadImage } from "@/lib/api/storage";
import type { OnboardingState } from "@/lib/api/onboarding";
import { ImagePicker } from "@/components/shared/image-picker";
import { Button } from "@/components/ui/button";
import { StepHeader } from "./step-header";

export function VerificationStep({ state, onDone }: { state: OnboardingState; onDone: () => void }) {
  const [facePhoto, setFacePhoto] = useState<File | null>(null);
  const [petPhoto, setPetPhoto] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tried, setTried] = useState(false);

  const previous = state.lastVerification;
  const sentBack = previous && (previous.status === "rejected" || previous.status === "needs_info");

  async function submit() {
    setTried(true);
    setError(null);
    if (!facePhoto || !petPhoto) {
      setError("Add both photos to continue.");
      return;
    }

    setSubmitting(true);
    try {
      // Private bucket: only you and Pawmates admins can see these.
      const [face, withPet] = await Promise.all([
        uploadImage("verification-photos", state.userId, facePhoto),
        uploadImage("verification-photos", state.userId, petPhoto),
      ]);

      const supabase = createClient();
      const { error: requestError } = await supabase
        .from("verifications")
        .insert({ profile_photo_path: face.path, pet_photo_path: withPet.path });
      if (requestError) throw requestError;

      await supabase
        .from("profiles")
        .update({ onboarded_at: new Date().toISOString() })
        .eq("id", state.userId);

      onDone();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid gap-6">
      <StepHeader
        title="Get verified"
        description="Every Pawmates member is checked by a person, so everyone you meet is real."
      />

      {sentBack && (
        <div role="alert" className="flex gap-2 rounded-lg bg-accent p-3 text-sm text-accent-foreground">
          <CircleAlert className="mt-0.5 size-4 shrink-0 text-coral" aria-hidden />
          <div className="grid gap-1">
            <p className="font-medium">
              {previous.status === "needs_info"
                ? "We need a little more from you."
                : "Your last request wasn't approved."}
            </p>
            {previous.notes && <p>{previous.notes}</p>}
            <p>Please upload new photos below.</p>
          </div>
        </div>
      )}

      <div className="grid gap-5 rounded-xl border p-4">
        <div className="grid gap-2">
          <h2 className="font-medium">1. A clear photo of you</h2>
          <p className="text-sm text-muted-foreground">Face the camera in good light, no sunglasses.</p>
          <ImagePicker
            file={facePhoto}
            onChange={setFacePhoto}
            label="Add a photo of you"
            shape="circle"
            invalid={tried && !facePhoto}
          />
        </div>
        <div className="grid gap-2">
          <h2 className="font-medium">2. You with your pet</h2>
          <p className="text-sm text-muted-foreground">Both of you in the same photo.</p>
          <ImagePicker
            file={petPhoto}
            onChange={setPetPhoto}
            label="Add a photo with your pet"
            invalid={tried && !petPhoto}
          />
        </div>
      </div>

      <p className="flex gap-2 text-sm text-muted-foreground">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-teal" aria-hidden />
        These photos are private. Only you and the Pawmates team can see them.
      </p>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <Button type="button" size="lg" className="h-11" onClick={submit} disabled={submitting}>
        {submitting ? "Uploading…" : "Submit for review"}
      </Button>
    </div>
  );
}
