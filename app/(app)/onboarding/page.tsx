import type { Metadata } from "next";
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Set up your profile" };

// Static shell; the flow loads the user's progress in the browser and
// resumes at the first unfinished step.
export default function OnboardingPage() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="mx-auto flex w-full max-w-xl items-center justify-between px-4 py-4">
        <Logo />
        <form action="/auth/signout" method="post">
          <Button type="submit" variant="ghost" size="sm">
            Sign out
          </Button>
        </form>
      </header>
      <main className="mx-auto w-full max-w-xl flex-1 px-4 pt-2 pb-12">
        <OnboardingFlow />
      </main>
    </div>
  );
}
