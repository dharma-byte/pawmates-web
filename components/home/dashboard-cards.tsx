"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Circle, MessageCircle, PawPrint, ShieldCheck, Star, Users } from "lucide-react";
import { fetchPendingReviews, playdateKeys } from "@/lib/api/playdates";
import { ReviewDialog } from "@/components/playdates/review-dialog";
import { toast } from "sonner";
import { chatKeys, fetchInbox } from "@/lib/api/chat";
import { connectionKeys, fetchDetailedConnections, respondToSniff, type DetailedConnection } from "@/lib/api/connections";
import { profileChecklist, type Me } from "@/lib/api/me";
import { formatChatTime } from "@/lib/utils/dates";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export function DashboardCard({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="grid content-start gap-3 rounded-2xl border bg-card p-4" aria-label={title}>
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-heading text-base font-semibold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

// Sniff requests waiting for an answer, accept or decline without leaving home.
export function RequestsWaiting() {
  const queryClient = useQueryClient();
  const { data } = useQuery({ queryKey: connectionKeys.detailed, queryFn: fetchDetailedConnections });
  const respond = useMutation({
    mutationFn: ({ id, accept }: { id: string; accept: boolean }) => respondToSniff(id, accept),
    onSuccess: (_, { accept }) => {
      toast.success(accept ? "You're now Pawmates! 🎉" : "Request declined");
      queryClient.invalidateQueries({ queryKey: connectionKeys.all });
    },
    onError: (error) => toast.error(error.message),
  });

  const incoming = data?.incoming ?? [];
  if (incoming.length === 0) return null;

  return (
    <DashboardCard
      title={`Sniff requests (${incoming.length})`}
      action={<Link href="/requests" className="text-sm font-medium text-primary">See all</Link>}
    >
      <ul className="grid gap-3">
        {incoming.slice(0, 3).map((request) => (
          <RequestRow
            key={request.id}
            request={request}
            busy={respond.isPending}
            onAnswer={(accept) => respond.mutate({ id: request.id, accept })}
          />
        ))}
      </ul>
    </DashboardCard>
  );
}

function RequestRow({
  request,
  busy,
  onAnswer,
}: {
  request: DetailedConnection;
  busy: boolean;
  onAnswer: (accept: boolean) => void;
}) {
  const pet = request.pet;
  return (
    <li className="flex flex-wrap items-center gap-3">
      <span className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-muted">
        {pet?.photos[0] ? (
          <Image src={pet.photos[0]} alt="" fill sizes="48px" className="object-cover" />
        ) : (
          <PawPrint className="absolute inset-0 m-auto size-5 text-muted-foreground" aria-hidden />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{pet?.name ?? request.other?.full_name}</p>
        <p className="truncate text-sm text-muted-foreground">
          {request.other?.full_name}
          {request.message ? ` · “${request.message}”` : ""}
        </p>
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={() => onAnswer(true)} disabled={busy}>Accept</Button>
        <Button size="sm" variant="outline" onClick={() => onAnswer(false)} disabled={busy}>Decline</Button>
      </div>
    </li>
  );
}

// "How did it go?": finished playdates still waiting for this member's review.
export function PendingReviews() {
  const [reviewing, setReviewing] = useState<{ eventId: string; petId: string; petName: string } | null>(null);
  const { data } = useQuery({ queryKey: playdateKeys.pendingReviews, queryFn: fetchPendingReviews });
  if (!data || data.length === 0) return null;

  return (
    <DashboardCard title="How did your playdates go?">
      <ul className="grid gap-3">
        {data.slice(0, 3).map((item) => (
          <li key={`${item.event_id}-${item.pet_id}`} className="flex items-center gap-3">
            <span className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-muted">
              {item.pet_photo ? (
                <Image src={item.pet_photo} alt="" fill sizes="48px" className="object-cover" />
              ) : (
                <PawPrint className="absolute inset-0 m-auto size-5 text-muted-foreground" aria-hidden />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{item.pet_name}</p>
              <p className="truncate text-sm text-muted-foreground">{item.title}</p>
            </div>
            <Button size="sm" onClick={() => setReviewing({ eventId: item.event_id, petId: item.pet_id, petName: item.pet_name })}>
              <Star aria-hidden /> Review
            </Button>
          </li>
        ))}
      </ul>
      {reviewing && (
        <ReviewDialog eventId={reviewing.eventId} petId={reviewing.petId} petName={reviewing.petName} onClose={() => setReviewing(null)} />
      )}
    </DashboardCard>
  );
}

export function UnreadChats() {
  const { data } = useQuery({ queryKey: chatKeys.inbox, queryFn: fetchInbox });
  const recent = (data ?? []).slice(0, 4);

  return (
    <DashboardCard title="Chats" action={<Link href="/chat" className="text-sm font-medium text-primary">Open</Link>}>
      {recent.length === 0 ? (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <MessageCircle className="size-4" aria-hidden /> No chats yet. Become Pawmates to start one.
        </p>
      ) : (
        <ul className="grid gap-1">
          {recent.map((chat) => (
            <li key={chat.conversation_id}>
              <Link href={`/chat/${chat.conversation_id}`} className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-muted">
                <Avatar>
                  {chat.other?.avatar_url && <AvatarImage src={chat.other.avatar_url} alt="" />}
                  <AvatarFallback>{chat.other?.full_name?.[0] ?? "?"}</AvatarFallback>
                </Avatar>
                <span className="min-w-0 flex-1">
                  <span className={`block truncate text-sm ${chat.unread_count ? "font-semibold" : "font-medium"}`}>{chat.other?.full_name ?? "Chat"}</span>
                  <span className="block truncate text-xs text-muted-foreground">{chat.last_message_body ?? "Say hi 👋"}</span>
                </span>
                <span className="flex flex-col items-end gap-1">
                  <span className="text-[11px] text-muted-foreground">{formatChatTime(chat.last_message_at)}</span>
                  {chat.unread_count > 0 && (
                    <span className="min-w-5 rounded-full bg-coral px-1.5 text-center text-[11px] font-semibold text-white">{chat.unread_count}</span>
                  )}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </DashboardCard>
  );
}

export function ProfileStrength({ me }: { me: Me }) {
  const items = profileChecklist(me);
  const done = items.filter((item) => item.done).length;
  if (done === items.length) return null;
  const percent = Math.round((done / items.length) * 100);

  return (
    <DashboardCard title="Profile strength">
      <div className="grid gap-1.5">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Complete profiles get more Sniffs</span>
          <span className="font-semibold">{percent}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label="Profile strength">
          <div className="h-full rounded-full bg-teal" style={{ width: `${percent}%` }} />
        </div>
      </div>
      <ul className="grid gap-1.5">
        {items.map((item) => (
          <li key={item.label}>
            {item.done ? (
              <span className="flex items-center gap-2 text-sm text-muted-foreground line-through">
                <CheckCircle2 className="size-4 text-teal" aria-hidden /> {item.label}
              </span>
            ) : (
              <Link href={item.href} className="flex items-center gap-2 text-sm font-medium hover:underline">
                <Circle className="size-4 text-muted-foreground" aria-hidden /> {item.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </DashboardCard>
  );
}

const SAFETY_TIPS = [
  "Meet in a public, fenced park for a first playdate.",
  "Keep leashes on for the first few minutes while the pets say hello.",
  "Watch for stiff bodies or raised hackles, and give pets a break if play gets rough.",
  "Share the exact meeting spot in chat only when you're ready.",
  "Bring water and a towel. Indie dogs love a splash, Persians mostly don't.",
];

// One tip per day, picked from the date so it changes daily. Read the clock
// once, on first render, so the tip never changes under the reader.
export function SafetyTip() {
  const [tip] = useState(() => SAFETY_TIPS[Math.floor(Date.now() / 86_400_000) % SAFETY_TIPS.length]);
  return (
    <section className="flex gap-3 rounded-2xl bg-secondary p-4 text-sm text-secondary-foreground" aria-label="Safety tip">
      <ShieldCheck className="size-5 shrink-0 text-teal" aria-hidden />
      <p><span className="font-semibold">Playdate tip:</span> {tip}</p>
    </section>
  );
}

export function EventsSoon() {
  return (
    <DashboardCard title="Events near you">
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Users className="size-4" aria-hidden /> Group walks and playdates are coming soon.
      </p>
    </DashboardCard>
  );
}
