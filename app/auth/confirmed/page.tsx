import { Suspense } from "react";
import type { Metadata } from "next";
import { Logo } from "@/components/shared/logo";
import { EmailConfirmed } from "@/components/auth/email-confirmed";

export const metadata: Metadata = { title: "Email confirmed" };

// Where /auth/confirm sends people after a successful email link.
export default function ConfirmedPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-10">
      <Logo className="text-lg" />
      {/* Reads ?next, which is request-time data. */}
      <Suspense fallback={<p className="text-muted-foreground">Signing you in…</p>}>
        <EmailConfirmed />
      </Suspense>
    </main>
  );
}
