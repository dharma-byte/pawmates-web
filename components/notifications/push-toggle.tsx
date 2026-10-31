"use client";

import { useEffect, useState } from "react";
import { BellRing, Share } from "lucide-react";
import { toast } from "sonner";
import { getPushState, turnOffPush, turnOnPush, type PushState } from "@/lib/push";
import { Button } from "@/components/ui/button";

// Turn phone / browser notifications on or off for this device.
//   full     Settings: explains every state, including how to fix blocked
//   compact  bell menu: one line and a button, only when it can be turned on
export function PushToggle({ variant = "full" }: { variant?: "full" | "compact" }) {
  const [state, setState] = useState<PushState | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let live = true;
    void getPushState().then((s) => live && setState(s));
    return () => {
      live = false;
    };
  }, []);

  async function toggle(on: boolean) {
    setBusy(true);
    try {
      if (on) {
        await turnOnPush();
        toast.success("Notifications are on. We'll buzz this device for requests, invites and lost dogs nearby.");
      } else {
        await turnOffPush();
        toast.success("Notifications are off on this device.");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't change notifications.");
    } finally {
      setState(await getPushState());
      setBusy(false);
    }
  }

  if (state === null) return null;

  if (variant === "compact") {
    if (state !== "off") return null;
    return (
      <div className="flex items-center gap-3 rounded-lg bg-secondary px-3 py-2.5 text-sm text-secondary-foreground">
        <BellRing className="size-4 shrink-0 text-coral" aria-hidden />
        <span className="flex-1">Get alerts on this device, even when Pawmates is closed.</span>
        <Button size="sm" onClick={() => toggle(true)} disabled={busy}>
          Turn on
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-3 rounded-2xl border bg-card p-4">
      <div className="flex items-start gap-3">
        <BellRing className="mt-0.5 size-5 shrink-0 text-coral" aria-hidden />
        <div className="grid flex-1 gap-1">
          <p className="font-medium">Notifications on this device</p>
          <p className="text-sm text-muted-foreground">
            Sniff requests, playdate invites, event reminders and lost dogs nearby, even when Pawmates is closed.
          </p>
        </div>
        {(state === "on" || state === "off") && (
          <Button variant={state === "on" ? "outline" : "default"} onClick={() => toggle(state === "off")} disabled={busy}>
            {busy ? "…" : state === "on" ? "Turn off" : "Turn on"}
          </Button>
        )}
      </div>
      {state === "on" && <p className="text-sm text-teal">On for this device.</p>}
      {state === "blocked" && (
        <p className="text-sm text-muted-foreground">
          Blocked in your browser. Open your browser&apos;s site settings for Pawmates, allow notifications, then come back here.
        </p>
      )}
      {state === "ios-install" && (
        <p className="flex items-start gap-2 text-sm text-muted-foreground">
          <Share className="mt-0.5 size-4 shrink-0" aria-hidden />
          On iPhone, first add Pawmates to your home screen: tap Share, then Add to Home Screen. Open it from there and turn
          notifications on.
        </p>
      )}
      {state === "unsupported" && (
        <p className="text-sm text-muted-foreground">This browser can&apos;t receive notifications. Try Chrome, Edge or Firefox.</p>
      )}
    </div>
  );
}
