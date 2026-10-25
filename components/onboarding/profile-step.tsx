"use client";

import type { OnboardingState } from "@/lib/api/onboarding";
import { ProfileForm } from "@/components/profile/profile-form";
import { StepHeader } from "./step-header";

export function ProfileStep({ state, onDone }: { state: OnboardingState; onDone: () => void }) {
  return (
    <div className="grid gap-6">
      <StepHeader
        title="About you"
        description="Pets are the stars here, but other owners like to know who they're meeting."
      />
      <ProfileForm userId={state.userId} profile={state.profile} submitLabel="Continue" onSaved={onDone} />
    </div>
  );
}
