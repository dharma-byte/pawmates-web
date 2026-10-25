"use client";

import type { OnboardingState } from "@/lib/api/onboarding";
import { LocationEditor } from "@/components/profile/location-editor";
import { StepHeader } from "./step-header";

export function LocationStep({ state, onDone }: { state: OnboardingState; onDone: () => void }) {
  return (
    <div className="grid gap-6">
      <StepHeader title="Your area" description="We use this to show pets, groups and events near you." />
      <LocationEditor
        userId={state.userId}
        initialAreaName={state.profile.area_name}
        submitLabel="Continue"
        onSaved={onDone}
      />
    </div>
  );
}
