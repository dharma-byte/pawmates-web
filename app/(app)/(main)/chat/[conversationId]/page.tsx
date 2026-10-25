import { Suspense } from "react";
import type { Metadata } from "next";
import { ChatRoom } from "@/components/chat/chat-room";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = { title: "Chat" };

export default function ConversationPage() {
  return (
    // ChatRoom reads the conversation id from the URL, which is request-time data.
    <Suspense fallback={<Skeleton className="h-[60dvh] w-full rounded-xl" />}>
      <ChatRoom />
    </Suspense>
  );
}
