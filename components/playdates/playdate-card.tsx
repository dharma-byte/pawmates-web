"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, CalendarPlus, Clock, MapPin, Navigation, Star } from "lucide-react";
import { toast } from "sonner";
import { cn } from "cn";
import { fetchMe, meKey } from "@/lib/api/me";
import {
  cancelPlaydate,
  directionsUrl,
  downloadIcs,
  fetchPendingReviews,
  fetchPlaydate,
  playdateKeys,
  respondToPlaydate,
} from "@/lib/api/playdates";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ReviewDialog } from "./review-dialog";

function formatWhen(startsAt: string, endsAt: string) {
  const start = new Date(startsAt);
  const end = new Date(endsAt);
  const day = start.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });
  const time = (d: Date) => d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  return `${day} · ${time(start)} to ${time(end)}`;
}

const STATUS_LABEL: Record<string, string> = {
  invited: "Invited",
  going: "Going",
  not_going: "Can't go",
  maybe: "Maybe",
  waitlist: "Waitlist",
};

// The invite card shown in chat for a playdate message.
export function PlaydateCard({ eventId, otherName }: { eventId: string; otherName: string }) {
  const queryClient = useQueryClient();
  const [now] = useState(() => Date.now());
  const [reviewing, setReviewing] = useState<{ petId: string; petName: string } | null>(null);
  const { data: me } = useQuery({ queryKey: meKey, queryFn: fetchMe });
  const { data: playdate, isPending } = useQuery({
    queryKey: playdateKeys.detail(eventId),
    queryFn: () => fetchPlaydate(eventId),
  });
  const ended = !!playdate && new Date(playdate.ends_at).getTime() <= now;
  const pending = useQuery({
    queryKey: playdateKeys.pendingReviews,
    queryFn: fetchPendingReviews,
    enabled: ended,
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: playdateKeys.all });
  const respond = useMutation({
    mutationFn: (accept: boolean) => respondToPlaydate(eventId, accept, accept && me?.pets[0] ? [me.pets[0].id] : []),
    onSuccess: refresh,
    onError: (error) => toast.error(error.message),
  });
  const cancel = useMutation({
    mutationFn: () => cancelPlaydate(eventId),
    onSuccess: refresh,
    onError: (error) => toast.error(error.message),
  });

  if (isPending) return <Skeleton className="h-36 w-72 rounded-2xl" />;
  if (!playdate) return <p className="text-sm italic">This playdate is no longer available.</p>;

  const mine = playdate.attendees.find((a) => a.user_id === me?.id);
  const theirs = playdate.attendees.find((a) => a.user_id !== me?.id);
  const isHost = playdate.host_id === me?.id;
  const cancelled = playdate.status === "cancelled";
  const upcoming = !cancelled && !ended;
  const toReview = (pending.data ?? []).filter((r) => r.event_id === eventId);

  return (
    <div className={cn("grid w-72 max-w-full gap-3 rounded-2xl border bg-card p-4 text-card-foreground", cancelled && "opacity-60")}>
      <div className="flex items-start justify-between gap-2">
        <p className="flex items-center gap-2 font-heading font-semibold">
          <CalendarDays className="size-4 text-coral" aria-hidden /> {playdate.title}
        </p>
        <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold", cancelled ? "bg-muted" : ended ? "bg-muted" : "bg-secondary text-primary")}>
          {cancelled ? "Cancelled" : ended ? "Done" : "Upcoming"}
        </span>
      </div>

      <div className="grid gap-1.5 text-sm">
        <p className="flex items-center gap-2"><Clock className="size-4 shrink-0 text-muted-foreground" aria-hidden />{formatWhen(playdate.starts_at, playdate.ends_at)}</p>
        <p className="flex items-start gap-2"><MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden /><span>{playdate.address}</span></p>
        {playdate.description && <p className="rounded-lg bg-muted px-3 py-2">“{playdate.description}”</p>}
        <p className="text-xs text-muted-foreground">
          You: {STATUS_LABEL[mine?.status ?? ""] ?? "?"} · {otherName}: {STATUS_LABEL[theirs?.status ?? ""] ?? "?"}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {upcoming && !isHost && mine?.status === "invited" && (
          <>
            <Button size="sm" onClick={() => respond.mutate(true)} disabled={respond.isPending}>Accept</Button>
            <Button size="sm" variant="outline" onClick={() => respond.mutate(false)} disabled={respond.isPending}>Decline</Button>
          </>
        )}
        {upcoming && mine?.status === "going" && (
          <Button size="sm" variant="outline" onClick={() => downloadIcs(playdate)}>
            <CalendarPlus aria-hidden /> Add to calendar
          </Button>
        )}
        {!cancelled && playdate.lat != null && playdate.lng != null && (
          <a href={directionsUrl(playdate.lat, playdate.lng)} target="_blank" rel="noreferrer" className={buttonVariants({ size: "sm", variant: "ghost" })}>
            <Navigation aria-hidden /> Directions
          </a>
        )}
        {upcoming && isHost && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => window.confirm("Cancel this playdate?") && cancel.mutate()}
            disabled={cancel.isPending}
          >
            Cancel playdate
          </Button>
        )}
        {toReview.map((review) => (
          <Button key={review.pet_id} size="sm" onClick={() => setReviewing({ petId: review.pet_id, petName: review.pet_name })}>
            <Star aria-hidden /> How did {review.pet_name} get along?
          </Button>
        ))}
      </div>

      {reviewing && (
        <ReviewDialog eventId={eventId} petId={reviewing.petId} petName={reviewing.petName} onClose={() => setReviewing(null)} />
      )}
    </div>
  );
}
