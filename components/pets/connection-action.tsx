"use client";

import Link from "next/link";
import { Check, Clock } from "lucide-react";
import type { ConnectionState } from "@/lib/api/connections";
import { OpenChatButton } from "@/components/chat/open-chat-button";
import { Button, buttonVariants } from "@/components/ui/button";

// The one button that matches how I relate to another owner.
export function ConnectionAction({
  ownerId,
  state,
  canSniff,
  onSniff,
  className = "w-full",
}: {
  ownerId: string;
  state: ConnectionState;
  canSniff: boolean;
  onSniff: () => void;
  className?: string;
}) {
  if (state === "pawmates") {
    return <OpenChatButton userId={ownerId} label="Pawmates · Chat" variant="secondary" className={className} />;
  }
  if (state === "sent") {
    return (
      <Button variant="outline" className={className} disabled>
        <Clock aria-hidden /> Request sent
      </Button>
    );
  }
  if (state === "received") {
    return (
      <Link href="/requests" className={buttonVariants({ className })}>
        <Check aria-hidden /> They sniffed you! Respond
      </Link>
    );
  }
  return (
    <Button className={className} onClick={onSniff} disabled={!canSniff}>
      🐾 Send Sniff request
    </Button>
  );
}
