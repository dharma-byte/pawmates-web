"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { chatKeys, fetchInbox } from "@/lib/api/chat";
import { connectionKeys, fetchMyConnections } from "@/lib/api/connections";
import { useInboxRealtime } from "@/hooks/use-chat-channel";

// What needs the member's attention: unread chats (live via Realtime) and
// Sniff requests waiting for an answer. Drives badges and the bell menu.
export function useActivity() {
  const queryClient = useQueryClient();
  const { data: inbox } = useQuery({ queryKey: chatKeys.inbox, queryFn: fetchInbox });
  const { data: connections } = useQuery({
    queryKey: connectionKeys.mine,
    queryFn: fetchMyConnections,
    refetchOnWindowFocus: true,
  });
  useInboxRealtime(() => queryClient.invalidateQueries({ queryKey: chatKeys.inbox }));

  const unreadChats = (inbox ?? []).filter((c) => c.unread_count > 0 && !c.muted);
  const waitingRequests = [...(connections?.values() ?? [])].filter((state) => state === "received").length;

  return {
    unreadChats,
    waitingRequests,
    badges: { "/chat": unreadChats.length, "/requests": waitingRequests } as Record<string, number>,
    total: unreadChats.length + waitingRequests,
  };
}
