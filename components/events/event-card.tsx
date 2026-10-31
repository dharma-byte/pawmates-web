"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, CalendarPlus, Clock, MapPin, Navigation, Users } from "lucide-react";
import { toast } from "sonner";
import { cn } from "cn";
import { fetchMe, meKey } from "@/lib/api/me";
import {
  cancelEvent,
  eventKeys,
  fetchEventLocation,
  groupKeys,
  rsvpEvent,
  type GroupEvent,
} from "@/lib/api/groups";
import { directionsUrl, downloadIcs } from "@/lib/api/playdates";
import { formatEventWhen } from "@/lib/utils/dates";
import { Button, buttonVariants } from "@/components/ui/button";

const ANSWERS = [
  { value: "going", label: "Going" },
  { value: "maybe", label: "Maybe" },
  { value: "not_going", label: "Can't go" },
] as const;

// A group event with RSVP. Used on the Groups page, a group's page and as
// the card in the group chat.
export function EventCard({
  event,
  showGroup = false,
  canManage = false,
  className,
}: {
  event: GroupEvent;
  showGroup?: boolean;
  // Group owners and admins can cancel any event in their group.
  canManage?: boolean;
  className?: string;
}) {
  const queryClient = useQueryClient();
  const [now] = useState(() => Date.now());
  const { data: me } = useQuery({ queryKey: meKey, queryFn: fetchMe });
  const location = useQuery({ queryKey: [...eventKeys.detail(event.id), "location"], queryFn: () => fetchEventLocation(event.id) });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: eventKeys.all });
    queryClient.invalidateQueries({ queryKey: groupKeys.all });
  };
  const rsvp = useMutation({
    mutationFn: (answer: (typeof ANSWERS)[number]["value"]) =>
      rsvpEvent(event.id, answer, answer !== "not_going" && me?.pets[0] ? [me.pets[0].id] : []),
    onSuccess: (status) => {
      if (status === "waitlist") toast("It's full, so you're on the waitlist. We'll move you up if a spot frees.");
      else if (status === "going") toast.success("See you there! 🐾");
      refresh();
    },
    onError: (error) => toast.error(error.message),
  });
  const cancel = useMutation({
    mutationFn: () => cancelEvent(event.id),
    onSuccess: () => {
      toast.success("Event cancelled. The group has been told.");
      refresh();
    },
    onError: (error) => toast.error(error.message),
  });

  const cancelled = event.status === "cancelled";
  const isHost = event.host_id === me?.id;
  const started = new Date(event.starts_at).getTime() <= now;
  const going = event.my_status === "going";
  const full = event.capacity != null && event.going_count >= event.capacity;
  const point = location.data;

  return (
    <article className={cn("grid gap-3 rounded-2xl border bg-card p-4 text-card-foreground", cancelled && "opacity-60", className)}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          {showGroup && (
            <Link href={`/groups/${event.group_id}`} className="text-xs font-medium text-teal hover:underline">
              {event.group_name}
            </Link>
          )}
          <p className="flex items-center gap-2 font-heading font-semibold">
            <CalendarDays className="size-4 shrink-0 text-coral" aria-hidden /> {event.title}
          </p>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold",
            cancelled ? "bg-muted" : started ? "bg-teal text-white" : going ? "bg-secondary text-primary" : "bg-muted",
          )}
        >
          {cancelled ? "Cancelled" : started ? "Happening now" : isHost ? "Hosting" : going ? "Going" : event.my_status === "waitlist" ? "Waitlist" : "Upcoming"}
        </span>
      </div>

      <div className="grid gap-1.5 text-sm">
        <p className="flex items-center gap-2">
          <Clock className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          {formatEventWhen(event.starts_at, event.ends_at)}
        </p>
        <p className="flex items-start gap-2">
          <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
          <span>
            {event.place_name && event.place_name !== event.address ? `${event.place_name}, ` : ""}
            {event.address}
            {event.distance_km != null && <span className="text-muted-foreground"> · ~{event.distance_km} km</span>}
          </span>
        </p>
        <p className="flex items-center gap-2 text-muted-foreground">
          <Users className="size-4 shrink-0" aria-hidden />
          {event.going_count} going
          {event.capacity != null && ` of ${event.capacity}`}
          {event.waitlist_count > 0 && ` · ${event.waitlist_count} on the waitlist`}
        </p>
        {event.description && <p className="rounded-lg bg-muted px-3 py-2">{event.description}</p>}
      </div>

      {!cancelled && (
        <div className="flex flex-wrap items-center gap-2">
          {!isHost && !started && (
            <div role="group" aria-label="Your RSVP" className="flex gap-1 rounded-lg bg-muted p-1">
              {ANSWERS.map((answer) => {
                const selected =
                  event.my_status === answer.value || (answer.value === "going" && event.my_status === "waitlist");
                return (
                  <button
                    key={answer.value}
                    type="button"
                    aria-pressed={selected}
                    disabled={rsvp.isPending}
                    onClick={() => rsvp.mutate(answer.value)}
                    className={cn(
                      "rounded-md px-3 py-1 text-sm font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50",
                      selected ? "bg-primary text-primary-foreground" : "hover:bg-background",
                    )}
                  >
                    {answer.value === "going" && full && !going ? "Join waitlist" : answer.label}
                  </button>
                );
              })}
            </div>
          )}
          {(going || isHost) && (
            <Button size="sm" variant="outline" onClick={() => downloadIcs({ ...event, lat: point?.lat, lng: point?.lng })}>
              <CalendarPlus aria-hidden /> Add to calendar
            </Button>
          )}
          {point && (
            <a href={directionsUrl(point.lat, point.lng)} target="_blank" rel="noreferrer" className={buttonVariants({ size: "sm", variant: "ghost" })}>
              <Navigation aria-hidden /> Directions
            </a>
          )}
          {(isHost || canManage) && !started && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => window.confirm(`Cancel ${event.title}? Everyone in the group chat will be told.`) && cancel.mutate()}
              disabled={cancel.isPending}
            >
              Cancel event
            </Button>
          )}
        </div>
      )}
    </article>
  );
}
