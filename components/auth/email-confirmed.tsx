"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CircleCheck } from "lucide-react";
import { safeNext } from "@/lib/auth/redirect";
import { openAuthChannel, type AuthTabMessage } from "@/lib/auth/tab-sync";
import { Button } from "@/components/ui/button";

// How long to wait for a "check your email" tab to answer before continuing here.
const HANDOFF_WAIT_MS = 700;

export function EmailConfirmed() {
  const router = useRouter();
  const next = safeNext(useSearchParams().get("next"), "/onboarding");
  const [handedOff, setHandedOff] = useState(false);

  useEffect(() => {
    const channel = openAuthChannel();
    if (!channel) {
      router.replace(next);
      return;
    }

    let claimed = false;
    channel.onmessage = (event: MessageEvent<AuthTabMessage>) => {
      if (event.data?.type === "claimed") {
        claimed = true;
        setHandedOff(true);
      }
    };
    channel.postMessage({ type: "confirmed" } satisfies AuthTabMessage);

    const timer = window.setTimeout(() => {
      if (!claimed) router.replace(next);
    }, HANDOFF_WAIT_MS);

    return () => {
      window.clearTimeout(timer);
      channel.close();
    };
  }, [next, router]);

  if (!handedOff) {
    return <p className="text-muted-foreground">Signing you in…</p>;
  }

  return (
    <div className="grid max-w-sm gap-4 text-center">
      <CircleCheck className="mx-auto size-12 text-teal" aria-hidden />
      <h1 className="text-2xl font-semibold">Email confirmed</h1>
      <p className="text-muted-foreground">
        Go back to the Pawmates tab where you signed up. It has already moved on. You can close
        this tab.
      </p>
      <Button variant="outline" size="lg" onClick={() => router.replace(next)}>
        Continue in this tab instead
      </Button>
    </div>
  );
}
