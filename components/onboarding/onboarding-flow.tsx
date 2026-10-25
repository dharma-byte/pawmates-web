"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { cn } from "cn";
import { fetchOnboardingState, onboardingKey, type OnboardingStep } from "@/lib/api/onboarding";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { LocationStep } from "./location-step";
import { DoneStep, PendingStep } from "./pending-step";
import { PetStep } from "./pet-step";
import { ProfileStep } from "./profile-step";
import { VerificationStep } from "./verification-step";

const STEPS: { step: OnboardingStep; label: string }[] = [
  { step: "profile", label: "You" },
  { step: "pet", label: "Pet" },
  { step: "location", label: "Area" },
  { step: "verification", label: "Verify" },
];

export function OnboardingFlow() {
  const queryClient = useQueryClient();
  const { data: state, error, refetch, isPending } = useQuery({
    queryKey: onboardingKey,
    queryFn: fetchOnboardingState,
    // While waiting for review, check again whenever the user comes back.
    refetchOnWindowFocus: true,
    refetchInterval: (query) => (query.state.data?.step === "pending" ? 30_000 : false),
  });

  if (isPending) return <Skeleton className="h-96 w-full rounded-xl" />;

  if (error || !state) {
    return (
      <div className="grid gap-3 text-center">
        <p className="text-destructive">We couldn&apos;t load your profile.</p>
        <Button variant="outline" onClick={() => refetch()}>
          Try again
        </Button>
      </div>
    );
  }

  const next = () => queryClient.invalidateQueries({ queryKey: onboardingKey });
  const currentIndex = STEPS.findIndex(({ step }) => step === state.step);
  const stepProps = { state, onDone: next };

  return (
    <div className="grid gap-8">
      {currentIndex >= 0 && (
        <ol className="grid grid-cols-4 gap-2" aria-label="Onboarding progress">
          {STEPS.map(({ step, label }, index) => (
            <li key={step} className="grid gap-1.5" aria-current={index === currentIndex ? "step" : undefined}>
              <span
                className={cn(
                  "h-1.5 rounded-full",
                  index < currentIndex ? "bg-teal" : index === currentIndex ? "bg-coral" : "bg-muted",
                )}
              />
              <span
                className={cn(
                  "text-xs",
                  index === currentIndex ? "font-medium text-foreground" : "text-muted-foreground",
                )}
              >
                {index + 1}. {label}
              </span>
            </li>
          ))}
        </ol>
      )}

      {state.step === "profile" && <ProfileStep {...stepProps} />}
      {state.step === "pet" && <PetStep {...stepProps} />}
      {state.step === "location" && <LocationStep {...stepProps} />}
      {state.step === "verification" && <VerificationStep {...stepProps} />}
      {state.step === "pending" && <PendingStep />}
      {state.step === "done" && <DoneStep />}
    </div>
  );
}
