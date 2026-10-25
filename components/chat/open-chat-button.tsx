"use client";

import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { openDirectChat } from "@/lib/api/chat";
import { Button } from "@/components/ui/button";

// Opens (or creates) the direct chat with another member.
export function OpenChatButton({
  userId,
  label = "Chat",
  variant = "default",
  className,
}: {
  userId: string;
  label?: string;
  variant?: "default" | "secondary" | "outline";
  className?: string;
}) {
  const router = useRouter();
  const open = useMutation({
    mutationFn: () => openDirectChat(userId),
    onSuccess: (conversationId) => router.push(`/chat/${conversationId}`),
    onError: (error) => toast.error(error.message),
  });

  return (
    <Button variant={variant} className={className} onClick={() => open.mutate()} disabled={open.isPending}>
      <MessageCircle aria-hidden /> {open.isPending ? "Opening…" : label}
    </Button>
  );
}
