import type { Metadata } from "next";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Set up your profile" };

// Placeholder until the onboarding steps (profile, first pet, location,
// verification) are built. Reaching it proves sign-up and sign-in work.
export default function OnboardingPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-10 text-center">
      <Logo className="text-lg" />
      <div className="grid max-w-sm gap-2">
        <h1 className="text-2xl font-semibold">You&apos;re in! 🐾</h1>
        <p className="text-muted-foreground">
          Your email is confirmed. Next you&apos;ll set up your profile, add your pet and get
          verified. That part is coming soon.
        </p>
      </div>
      <form action="/auth/signout" method="post">
        <Button type="submit" variant="outline">
          Sign out
        </Button>
      </form>
    </main>
  );
}
