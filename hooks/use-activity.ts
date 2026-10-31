"use client";

import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { chatKeys, fetchInbox } from "@/lib/api/chat";
import { connectionKeys, fetchMyConnections } from "@/lib/api/connections";
import { eventKeys, groupKeys } from "@/lib/api/groups";
import { lostKeys } from "@/lib/api/lost";
import { fetchNotifications, notificationKeys, type Notification } from "@/lib/api/notifications";
import { playdateKeys } from "@/lib/api/playdates";
import { useInboxRealtime } from "@/hooks/use-chat-channel";

// Data a new notification makes stale, so screens update without a reload.
const STALE_BY_TYPE: Record<Notification["type"], readonly (readonly string[])[]> = {
  sniff_request: [connectionKeys.all],
  sniff_accepted: [connectionKeys.all, chatKeys.inbox],
  playdate_invite: [playdateKeys.all],
  event_new: [eventKeys.all],
  event_cancelled: [eventKeys.all, playdateKeys.all],
  waitlist_promoted: [eventKeys.all, groupKeys.all],
  event_reminder: [],
  lost_nearby: [lostKeys.all],
  lost_sighting: [lostKeys.all],
  lost_found: [lostKeys.all],
};

// What needs the member's attention: notifications, unread chats (both live
// via Realtime) and Sniff requests waiting for an answer. Drives badges, the
// bell menu and a toast for each new notification.
export function useActivity() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: inbox } = useQuery({ queryKey: chatKeys.inbox, queryFn: fetchInbox });
  const { data: notifications } = useQuery({ queryKey: notificationKeys.all, queryFn: fetchNotifications });
  const { data: connections } = useQuery({
    queryKey: connectionKeys.mine,
    queryFn: fetchMyConnections,
    refetchOnWindowFocus: true,
  });
  useInboxRealtime(
    () => queryClient.invalidateQueries({ queryKey: chatKeys.inbox }),
    (notification) => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      STALE_BY_TYPE[notification.type].forEach((queryKey) => queryClient.invalidateQueries({ queryKey }));
      toast(notification.title, {
        description: notification.body ?? undefined,
        action: notification.link ? { label: "View", onClick: () => router.push(notification.link!) } : undefined,
      });
    },
  );

  const unreadChats = (inbox ?? []).filter((c) => c.unread_count > 0 && !c.muted);
  const waitingRequests = [...(connections?.values() ?? [])].filter((state) => state === "received").length;
  const unreadNotifications = (notifications ?? []).filter((n) => !n.read_at).length;

  return {
    unreadChats,
    waitingRequests,
    notifications: notifications ?? [],
    unreadNotifications,
    badges: { "/chat": unreadChats.length, "/requests": waitingRequests } as Record<string, number>,
  };
}
