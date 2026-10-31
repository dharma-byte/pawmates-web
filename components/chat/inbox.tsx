"use client";

import Link from "next/link";
import { useSharedQuery } from "@/hooks/use-shared-query";
import { BellOff, CalendarDays, Camera, MapPin, MessageCircle, UserRound, Users } from "lucide-react";
import { cn } from "cn";
import { chatKeys, chatTitle, fetchInbox, type InboxItem } from "@/lib/api/chat";
import { formatChatTime } from "@/lib/utils/dates";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function Inbox() {
  const { data, isPending, error } = useSharedQuery({ queryKey: chatKeys.inbox, queryFn: fetchInbox });

  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-bold">Chat</h1>

      {isPending && <Skeleton className="h-64 w-full rounded-xl" />}
      {error && <p className="text-destructive">{error.message}</p>}

      {data?.length === 0 && (
        <div className="grid justify-items-center gap-3 rounded-xl border border-dashed p-10 text-center">
          <MessageCircle className="size-8 text-teal" aria-hidden />
          <p className="font-medium">No chats yet</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Become Pawmates with another owner, then tap Chat to plan a playdate.
          </p>
          <Link href="/discover" className={buttonVariants({ variant: "outline" })}>
            Find pets nearby
          </Link>
        </div>
      )}

      {data && data.length > 0 && (
        <ul className="divide-y overflow-hidden rounded-xl border bg-card/85 backdrop-blur-md">
          {data.map((item) => (
            <li key={item.conversation_id}>
              <InboxRow item={item} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function preview(item: InboxItem) {
  if (item.last_message_type === "image") return { icon: Camera, text: "Photo" };
  if (item.last_message_type === "location") return { icon: MapPin, text: item.last_message_body ?? "Location" };
  if (item.last_message_type === "invite") return { icon: CalendarDays, text: item.last_message_body ?? "Invite" };
  return { icon: null, text: item.last_message_body ?? "Say hi 👋" };
}

function InboxRow({ item }: { item: InboxItem }) {
  const unread = item.unread_count > 0;
  const { icon: Icon, text } = preview(item);
  const name = chatTitle(item);

  return (
    <Link
      href={`/chat/${item.conversation_id}`}
      className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted"
    >
      <Avatar size="lg">
        {item.other?.avatar_url && <AvatarImage src={item.other.avatar_url} alt="" />}
        <AvatarFallback>{item.group ? <Users className="size-4 text-teal" aria-hidden /> : (name[0] ?? <UserRound className="size-4" />)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className={cn("truncate", unread ? "font-semibold" : "font-medium")}>{name}</p>
          <time className={cn("shrink-0 text-xs", unread ? "font-medium text-coral" : "text-muted-foreground")}>
            {formatChatTime(item.last_message_at)}
          </time>
        </div>
        <div className="flex items-center justify-between gap-2">
          <p className={cn("flex min-w-0 items-center gap-1 text-sm", unread ? "text-foreground" : "text-muted-foreground")}>
            {Icon && <Icon className="size-3.5 shrink-0" aria-hidden />}
            <span className="truncate">{text}</span>
          </p>
          <span className="flex shrink-0 items-center gap-1">
            {item.muted && <BellOff className="size-3.5 text-muted-foreground" aria-label="Muted" />}
            {unread && (
              <span className="min-w-5 rounded-full bg-coral px-1.5 text-center text-xs font-semibold text-white">
                {item.unread_count}
                <span className="sr-only"> unread</span>
              </span>
            )}
          </span>
        </div>
      </div>
    </Link>
  );
}
