import type { Metadata } from "next";
import { Inbox } from "@/components/chat/inbox";

export const metadata: Metadata = { title: "Chat" };

export default function ChatPage() {
  return <Inbox />;
}
