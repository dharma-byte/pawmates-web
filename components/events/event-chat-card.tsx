"use client";

import { useQuery } from "@tanstack/react-query";
import { eventKeys, fetchEvent } from "@/lib/api/groups";
import { Skeleton } from "@/components/ui/skeleton";
import { EventCard } from "./event-card";

// The card for a group event, on its announcement message in the group chat.
export function EventChatCard({ eventId, canManage }: { eventId: string; canManage: boolean }) {
  const { data, isPending } = useQuery({ queryKey: eventKeys.detail(eventId), queryFn: () => fetchEvent(eventId) });

  if (isPending) return <Skeleton className="h-40 w-80 max-w-full rounded-2xl" />;
  if (!data?.event) return <p className="text-sm text-muted-foreground italic">This event has ended.</p>;
  return <EventCard event={data.event} canManage={canManage} className="w-80 max-w-full" />;
}
