"use client";

import type { OnboardingState } from "@/lib/api/onboarding";
import { PetForm } from "@/components/pets/pet-form";
import { StepHeader } from "./step-header";

// Onboarding asks for the basics only; the rest lives in Settings -> Pets.
export function PetStep({ state, onDone }: { state: OnboardingState; onDone: () => void }) {
  return (
    <div className="grid gap-6">
      <StepHeader
        title="Your pet"
        description="This helps us find playmates that match. You can add more pets and details later."
      />
      <PetForm userId={state.userId} detailed={false} submitLabel="Continue" onSaved={onDone} />
    </div>
  );
}
