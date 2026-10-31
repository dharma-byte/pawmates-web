"use client";

import Link from "next/link";
import { Bell, MessageCircle, Users } from "lucide-react";
import type { useActivity } from "@/hooks/use-activity";
import { chatTitle } from "@/lib/api/chat";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CountBadge } from "./count-badge";

// The bell: Sniff requests to answer and unread chats, in one place.
// Takes the shell's useActivity() result so there is one Realtime channel.
export function ActivityMenu({ activity }: { activity: ReturnType<typeof useActivity> }) {
  const { unreadChats, waitingRequests, total } = activity;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={total ? `Activity, ${total} new` : "Activity"}
        className="relative flex size-10 items-center justify-center rounded-full outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <Bell className="size-5" aria-hidden />
        <CountBadge count={total} floating />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Activity</DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        {total === 0 && <p className="px-3 py-6 text-center text-sm text-muted-foreground">You&apos;re all caught up.</p>}
        {waitingRequests > 0 && (
          <DropdownMenuItem render={<Link href="/requests" />}>
            <Users aria-hidden />
            {waitingRequests} Sniff request{waitingRequests === 1 ? "" : "s"} waiting
          </DropdownMenuItem>
        )}
        {unreadChats.slice(0, 5).map((chat) => (
          <DropdownMenuItem key={chat.conversation_id} render={<Link href={`/chat/${chat.conversation_id}`} />}>
            <MessageCircle aria-hidden />
            <span className="min-w-0 flex-1 truncate">
              <span className="font-medium">{chatTitle(chat)}</span>
              <span className="text-muted-foreground"> · {chat.unread_count} new</span>
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
