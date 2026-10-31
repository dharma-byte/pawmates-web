"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Clock, Eye, House, MapPin, PawPrint, Share2, UserRound } from "lucide-react";
import { toast } from "sonner";
import { cn } from "cn";
import { closeLostReport, fetchLostReport, lostKeys } from "@/lib/api/lost";
import { fetchMe, meKey } from "@/lib/api/me";
import { createClient } from "@/lib/supabase/client";
import { timeAgo } from "@/lib/utils/dates";
import { useSharedQuery } from "@/hooks/use-shared-query";
import { OpenChatButton } from "@/components/chat/open-chat-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SightingDialog } from "./sighting-dialog";

const LostMap = dynamic(() => import("@/components/map/lost-map"), {
  ssr: false,
  loading: () => <Skeleton className="h-80 w-full rounded-2xl" />,
});

const when = (iso: string) =>
  new Date(iso).toLocaleString(undefined, { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

export function LostReportView() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [now] = useState(() => Date.now());
  const [sighting, setSighting] = useState(false);
  const { data: me } = useSharedQuery({ queryKey: meKey, queryFn: fetchMe });
  const { data: report, isPending, error } = useQuery({ queryKey: lostKeys.detail(id), queryFn: () => fetchLostReport(id) });

  // New sightings appear without a reload.
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`lost:${id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "lost_sightings", filter: `report_id=eq.${id}` }, () =>
        queryClient.invalidateQueries({ queryKey: lostKeys.all }),
      );
    supabase.realtime.setAuth().then(() => channel.subscribe());
    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, queryClient]);

  const close = useMutation({
    mutationFn: (found: boolean) => closeLostReport(id, found),
    onSuccess: (_, found) => {
      toast.success(found ? "So glad they're home! Everyone who helped has been told. 🎉" : "Report closed");
      queryClient.invalidateQueries({ queryKey: lostKeys.all });
    },
    onError: (cause) => toast.error(cause.message),
  });

  if (isPending) return <Skeleton className="h-96 w-full rounded-2xl" />;
  if (error || !report) {
    return (
      <div className="grid gap-3 py-16 text-center">
        <p className="text-muted-foreground">{error?.message ?? "This report isn't available."}</p>
        <Link href="/lost" className="text-primary underline underline-offset-4">Back to Lost & Found</Link>
      </div>
    );
  }

  const pet = report.pet;
  const mine = report.owner_id === me?.id;
  const lost = report.status === "lost";
  const iSawIt = report.sightings.some((s) => s.reporter_id === me?.id);
  const ownerName = report.owner?.full_name ?? "the owner";

  async function share() {
    const url = location.href;
    const text = `${pet?.name ?? "A dog"} is lost near ${report!.last_seen_place}. Please keep an eye out.`;
    try {
      if (navigator.share) await navigator.share({ title: `Lost: ${pet?.name}`, text, url });
      else {
        await navigator.clipboard.writeText(`${text} ${url}`);
        toast.success("Link copied. Share it in your building and walking groups.");
      }
    } catch {
      // The member closed the share sheet.
    }
  }

  return (
    <div className="grid gap-6">
      <Link href="/lost" className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden /> Lost & Found
      </Link>

      <header className="grid gap-5 rounded-2xl border bg-card p-5 sm:grid-cols-[12rem_1fr]">
        <span className="relative aspect-square w-full max-w-48 overflow-hidden rounded-2xl bg-muted">
          {pet?.photos[0] ? (
            <Image src={pet.photos[0]} alt={pet.name} fill sizes="192px" className="object-cover" preload />
          ) : (
            <PawPrint className="absolute inset-0 m-auto size-12 text-teal" aria-hidden />
          )}
        </span>
        <div className="grid content-start gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "rounded-full px-2.5 py-1 text-xs font-bold tracking-wide uppercase",
                lost ? "bg-coral text-white" : report.status === "found" ? "bg-teal text-white" : "bg-muted",
              )}
            >
              {lost ? "Lost" : report.status === "found" ? "Found 🎉" : "Closed"}
            </span>
            <span className="text-sm text-muted-foreground">
              {lost ? `Missing for ${timeAgo(report.last_seen_at, now).replace(" ago", "")}` : report.found_at ? `Home since ${when(report.found_at)}` : ""}
            </span>
          </div>
          <h1 className="text-3xl font-bold">
            {pet?.name}
            {pet?.breed && <span className="font-sans text-lg font-normal text-muted-foreground"> · {pet.breed}</span>}
          </h1>
          <div className="grid gap-1.5 text-sm">
            <p className="flex items-center gap-2"><Clock className="size-4 shrink-0 text-muted-foreground" aria-hidden />Last seen {when(report.last_seen_at)}</p>
            <p className="flex items-start gap-2"><MapPin className="mt-0.5 size-4 shrink-0 text-coral" aria-hidden />{report.last_seen_place}</p>
            <p className="flex items-center gap-2"><UserRound className="size-4 shrink-0 text-muted-foreground" aria-hidden />Owner: {mine ? "you" : ownerName}</p>
          </div>
          {report.description && <p className="rounded-xl bg-muted px-3 py-2">{report.description}</p>}

          <div className="flex flex-wrap gap-2">
            {lost && !mine && (
              <Button onClick={() => setSighting(true)} className="bg-coral text-white hover:bg-coral/90">
                <Eye aria-hidden /> I saw {pet?.name}
              </Button>
            )}
            {!mine && iSawIt && report.owner && <OpenChatButton userId={report.owner.id} label={`Message ${ownerName.split(" ")[0]}`} variant="outline" />}
            {lost && mine && (
              <>
                <Button onClick={() => window.confirm(`Is ${pet?.name} home safe?`) && close.mutate(true)} disabled={close.isPending}>
                  <House aria-hidden /> {pet?.name} is home!
                </Button>
                <Button variant="ghost" onClick={() => window.confirm("Close this report without marking found?") && close.mutate(false)} disabled={close.isPending}>
                  Close report
                </Button>
              </>
            )}
            {lost && (
              <Button variant="outline" onClick={share}>
                <Share2 aria-hidden /> Share
              </Button>
            )}
          </div>
          {lost && !mine && !iSawIt && (
            <p className="text-xs text-muted-foreground">Report a sighting to message {ownerName.split(" ")[0]} directly.</p>
          )}
        </div>
      </header>

      <section className="grid gap-3" aria-labelledby="lost-map-title">
        <h2 id="lost-map-title" className="font-heading text-lg font-semibold">Where {pet?.name} has been seen</h2>
        <LostMap points={report.points} />
        <p className="flex flex-wrap gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><span className="size-3 rounded-full bg-coral" /> Last seen by the owner</span>
          <span className="flex items-center gap-1.5"><span className="size-3 rounded-full bg-teal" /> Sightings, joined in time order</span>
        </p>
      </section>

      <section className="grid gap-3" aria-labelledby="sightings-title">
        <h2 id="sightings-title" className="font-heading text-lg font-semibold">Sightings ({report.sightings.length})</h2>
        {report.sightings.length === 0 ? (
          <p className="rounded-2xl border border-dashed bg-card/60 p-6 text-center text-sm text-muted-foreground">
            No sightings yet. {mine ? "Members nearby have been alerted." : `If you see ${pet?.name}, tap “I saw ${pet?.name}”.`}
          </p>
        ) : (
          <ul className="divide-y overflow-hidden rounded-2xl border bg-card">
            {report.sightings.map((s) => (
              <li key={s.id} className="flex items-start gap-3 p-4">
                <Avatar>
                  {s.reporter?.avatar_url && <AvatarImage src={s.reporter.avatar_url} alt="" />}
                  <AvatarFallback>{s.reporter?.full_name?.[0] ?? <UserRound className="size-4" />}</AvatarFallback>
                </Avatar>
                <div className="grid min-w-0 flex-1 gap-0.5 text-sm">
                  <p>
                    <span className="font-semibold">{s.reporter_id === me?.id ? "You" : s.reporter?.full_name ?? "A member"}</span>
                    <span className="text-muted-foreground"> · {when(s.seen_at)}</span>
                  </p>
                  {s.place && <p className="flex items-start gap-1.5"><MapPin className="mt-0.5 size-3.5 shrink-0 text-teal" aria-hidden />{s.place}</p>}
                  {s.note && <p className="text-muted-foreground">“{s.note}”</p>}
                </div>
                {mine && s.reporter && s.reporter_id !== me?.id && (
                  <OpenChatButton userId={s.reporter.id} label="Message" size="sm" variant="outline" />
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {sighting && pet && <SightingDialog reportId={report.id} petName={pet.name} onClose={() => setSighting(false)} />}
    </div>
  );
}
