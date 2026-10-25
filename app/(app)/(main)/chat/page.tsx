import type { Metadata } from "next";
import { MessageCircle } from "lucide-react";
import { ComingSoon } from "@/components/layout/coming-soon";

export const metadata: Metadata = { title: "Chat" };

export default function ChatPage() {
  return (
    <ComingSoon
      icon={MessageCircle}
      title="Chat"
      text="Real-time chat with your Pawmates: plan playdates, share photos and meeting spots."
    />
  );
}
