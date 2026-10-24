"use client";

import { useState } from "react";
import { MailCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

// Shown after sign-up or a magic-link request. `onResend` sends the email again.
export function CheckEmail({
  email,
  message,
  onResend,
  onBack,
}: {
  email: string;
  message: string;
  onResend: () => Promise<{ error: { message: string } | null }>;
  onBack: () => void;
}) {
  const [sending, setSending] = useState(false);

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
        Open the link in this browser. It expires in 1 hour. Not there? Check your spam folder.
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
