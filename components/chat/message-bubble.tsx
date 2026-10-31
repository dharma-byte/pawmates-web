"use client";

import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Check, CheckCheck, EllipsisVertical, Flag, MapPin, Trash2 } from "lucide-react";
import { cn } from "cn";
import { chatKeys, locationOf, signedImageUrl, type Message } from "@/lib/api/chat";
import { formatMessageTime } from "@/lib/utils/dates";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function MessageBubble({
  message,
  mine,
  seen,
  inviteCard,
  onDelete,
  onReport,
}: {
  message: Message;
  mine: boolean;
  seen: boolean;
  // The playdate card, for the first message about each playdate.
  inviteCard?: React.ReactNode;
  onDelete: () => void;
  onReport: () => void;
}) {
  const deleted = !!message.deleted_at;

  if (message.type === "invite" && !deleted) {
    return (
      <div className={cn("flex", mine ? "justify-end" : "justify-start")}>
        {inviteCard ?? (
          <p className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs text-muted-foreground">
            <CalendarDays className="size-3.5 text-coral" aria-hidden />
            {message.body} · {formatMessageTime(message.created_at)}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={cn("group flex items-end gap-1", mine ? "flex-row-reverse" : "flex-row")}>
      <div
        className={cn(
          "max-w-[78%] rounded-2xl px-3 py-2 text-sm",
          mine ? "rounded-br-md bg-primary text-primary-foreground" : "rounded-bl-md bg-muted",
          deleted && "bg-transparent text-muted-foreground italic ring-1 ring-border",
        )}
      >
        {deleted ? (
          "Message deleted"
        ) : message.type === "image" && message.attachment_url ? (
          <ChatImage path={message.attachment_url} />
        ) : message.type === "location" ? (
          <LocationPin message={message} mine={mine} />
        ) : (
          <p className="break-words whitespace-pre-wrap">{message.body}</p>
        )}
        <p className={cn("mt-1 flex items-center justify-end gap-1 text-[11px]", mine ? "text-primary-foreground/70" : "text-muted-foreground")}>
          {message.edited_at && !deleted && <span>edited ·</span>}
          {formatMessageTime(message.created_at)}
          {mine && !deleted &&
            (seen ? (
              <CheckCheck className="size-3.5 text-teal-bright" aria-label="Seen" />
            ) : (
              <Check className="size-3.5" aria-label="Sent" />
            ))}
        </p>
      </div>

      {!deleted && (
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label="Message options"
            className="rounded-full p-1 text-muted-foreground opacity-60 outline-none hover:bg-muted focus-visible:opacity-100 focus-visible:ring-3 focus-visible:ring-ring/50 md:opacity-0 md:group-hover:opacity-100"
          >
            <EllipsisVertical className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align={mine ? "end" : "start"}>
            {mine ? (
              <DropdownMenuItem onClick={onDelete} variant="destructive">
                <Trash2 aria-hidden /> Delete message
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={onReport}>
                <Flag aria-hidden /> Report message
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}

// Chat photos are private: fetch a 1-hour signed URL for each one.
function ChatImage({ path }: { path: string }) {
  const { data: url } = useQuery({
    queryKey: chatKeys.image(path),
    queryFn: () => signedImageUrl(path),
    staleTime: 50 * 60 * 1000,
  });
  if (!url) return <Skeleton className="size-48 rounded-lg" />;
  return (
    <a href={url} target="_blank" rel="noreferrer" className="block">
      <Image
        src={url}
        alt="Photo"
        width={240}
        height={240}
        unoptimized
        className="max-h-64 w-auto rounded-lg object-cover"
      />
    </a>
  );
}

function LocationPin({ message, mine }: { message: Message; mine: boolean }) {
  const point = locationOf(message);
  const mapsUrl = point
    ? `https://www.openstreetmap.org/?mlat=${point.lat}&mlon=${point.lng}#map=17/${point.lat}/${point.lng}`
    : null;
  return (
    <div className="grid gap-1">
      <p className="flex items-center gap-1.5 font-medium">
        <MapPin className={cn("size-4", mine ? "text-orange" : "text-coral")} aria-hidden />
        {message.body ?? "Meeting point"}
      </p>
      {mapsUrl && (
        <a href={mapsUrl} target="_blank" rel="noreferrer" className="underline underline-offset-4">
          Open in maps
        </a>
      )}
    </div>
  );
}
