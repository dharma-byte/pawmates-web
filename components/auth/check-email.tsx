"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MailCheck } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

// Shown after sign-up or a magic-link request. `onResend` sends the email again.
//
// The email link usually opens in a new tab and signs the user in there.
// Auth cookies are shared by every tab, so this tab watches for the session
// and moves on to `redirectTo` by itself instead of waiting forever.
export function CheckEmail({
  email,
  message,
  redirectTo,
  onResend,
  onBack,
}: {
  email: string;
  message: string;
  redirectTo: string;
  onResend: () => Promise<{ error: { message: string } | null }>;
  onBack: () => void;
}) {
  const router = useRouter();
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    let done = false;

    const proceed = () => {
      if (done) return;
      done = true;
      toast.success("Email confirmed. Welcome to Pawmates!");
      router.replace(redirectTo);
      router.refresh();
    };

    const check = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) proceed();
    };

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) proceed();
    });

    // Re-check right away when the user switches back to this tab, and every
    // few seconds while it stays open.
    const onVisible = () => {
      if (document.visibilityState === "visible") void check();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") void check();
    }, 3000);

    return () => {
      listener.subscription.unsubscribe();
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
      window.clearInterval(timer);
    };
  }, [redirectTo, router]);

  async function resend() {
    setSending(true);
    const { error } = await onResend();
    setSending(false);
    if (error) toast.error(error.message);
    else toast.success("Sent again. Check your inbox.");
  }

  return (
    <div className="grid gap-4 text-center">
      <MailCheck className="mx-auto size-10 text-primary" aria-hidden />
      <p className="text-sm">
        {message} <span className="font-medium break-all">{email}</span>.
      </p>
      <p className="text-sm text-muted-foreground">
        The link works once and expires in 1 hour. Not there? Check your spam folder.
      </p>
      <p className="text-xs text-muted-foreground" aria-live="polite">
        Opening the link in this browser? This page continues on its own.
      </p>
      <div className="grid gap-2">
        <Button variant="outline" size="lg" onClick={resend} disabled={sending}>
          {sending ? "Sending…" : "Send it again"}
        </Button>
        <Button variant="ghost" size="lg" onClick={onBack}>
          Use a different email
        </Button>
      </div>
    </div>
  );
}
