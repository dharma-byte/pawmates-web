"use client";

import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  CalendarX,
  Heart,
  MessageCircle,
  PartyPopper,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "cn";
import type { useActivity } from "@/hooks/use-activity";
import { markNotificationsRead, notificationKeys, type NotificationType } from "@/lib/api/notifications";
import { formatChatTime } from "@/lib/utils/dates";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CountBadge } from "./count-badge";

const ICONS: Record<NotificationType, typeof Bell> = {
  sniff_request: UserPlus,
  sniff_accepted: Heart,
  playdate_invite: CalendarDays,
  event_new: PartyPopper,
  event_cancelled: CalendarX,
  waitlist_promoted: CalendarCheck,
  event_reminder: CalendarClock,
};

// The bell: notifications, plus a shortcut to unread chats.
// Takes the shell's useActivity() result so there is one Realtime channel.
export function ActivityMenu({ activity }: { activity: ReturnType<typeof useActivity> }) {
  const queryClient = useQueryClient();
  const { unreadChats, notifications, unreadNotifications } = activity;
  const unreadMessages = unreadChats.reduce((sum, chat) => sum + chat.unread_count, 0);

  const markRead = useMutation({
    mutationFn: (ids?: string[]) => markNotificationsRead(ids),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: notificationKeys.all }),
    onError: (error) => toast.error(error.message),
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={unreadNotifications ? `Notifications, ${unreadNotifications} new` : "Notifications"}
        className="relative flex size-10 items-center justify-center rounded-full outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <Bell className="size-5" aria-hidden />
        <CountBadge count={unreadNotifications} floating />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[min(22rem,calc(100vw-2rem))] p-0">
        <div className="flex items-center justify-between gap-2 px-3 py-2.5">
          <p className="font-heading font-semibold">Notifications</p>
          {unreadNotifications > 0 && (
            <button
              type="button"
              onClick={() => markRead.mutate(undefined)}
              disabled={markRead.isPending}
              className="rounded text-xs font-medium text-primary outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              Mark all read
            </button>
          )}
        </div>
        <DropdownMenuSeparator className="my-0" />

        {unreadMessages > 0 && (
          <>
            <DropdownMenuItem render={<Link href="/chat" />} className="mx-1 my-1 gap-3 px-2 py-2">
              <MessageCircle aria-hidden className="text-teal" />
              <span className="flex-1 text-sm font-medium">
                {unreadMessages} unread message{unreadMessages === 1 ? "" : "s"} in {unreadChats.length} chat
                {unreadChats.length === 1 ? "" : "s"}
              </span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-0" />
          </>
        )}

        <div className="max-h-[min(26rem,70dvh)] overflow-y-auto p-1">
          {notifications.length === 0 && (
            <p className="px-3 py-8 text-center text-sm text-muted-foreground">
              You&apos;re all caught up. We&apos;ll let you know about requests, invites and events.
            </p>
          )}
          {notifications.map((notification) => {
            const Icon = ICONS[notification.type];
            const unread = !notification.read_at;
            return (
              <DropdownMenuItem
                key={notification.id}
                render={notification.link ? <Link href={notification.link} /> : undefined}
                onClick={() => unread && markRead.mutate([notification.id])}
                className="items-start gap-3 px-2 py-2.5"
              >
                <span className={cn("mt-0.5 rounded-full p-1.5", unread ? "bg-secondary text-primary" : "bg-muted text-muted-foreground")}>
                  <Icon className="size-4" aria-hidden />
                </span>
                <span className="grid min-w-0 flex-1 gap-0.5">
                  <span className={cn("text-sm leading-snug", unread ? "font-semibold" : "font-medium text-muted-foreground")}>
                    {notification.title}
                  </span>
                  {notification.body && (
                    <span className="line-clamp-2 text-xs text-muted-foreground">{notification.body}</span>
                  )}
                  <span className="text-[11px] text-muted-foreground">{formatChatTime(notification.created_at)}</span>
                </span>
                {unread && <span className="mt-2 size-2 shrink-0 rounded-full bg-coral" aria-label="New" />}
              </DropdownMenuItem>
            );
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
