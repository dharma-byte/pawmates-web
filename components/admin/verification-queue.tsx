"use client";

import { useState } from "react";
import Image from "next/image";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Inbox, MessageSquareWarning, X } from "lucide-react";
import { toast } from "sonner";
import {
  adminKeys,
  fetchPendingVerifications,
  reviewVerification,
  type PendingVerification,
  type ReviewDecision,
} from "@/lib/api/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

export function VerificationQueue() {
  const { data, isPending, error } = useQuery({
    queryKey: adminKeys.verifications,
    queryFn: fetchPendingVerifications,
    refetchOnWindowFocus: true,
  });

  return (
    <section className="grid gap-4" aria-labelledby="queue-heading">
      <h2 id="queue-heading" className="text-xl font-bold">
        Verification requests {data && data.length > 0 && <Badge className="ml-1 align-middle">{data.length}</Badge>}
      </h2>

      {isPending && <Skeleton className="h-80 w-full rounded-xl" />}
      {error && <p className="text-destructive">Couldn&apos;t load requests: {error.message}</p>}
      {data?.length === 0 && (
        <div className="grid gap-2 rounded-xl border border-dashed py-12 text-center text-muted-foreground">
          <Inbox className="mx-auto size-8" aria-hidden />
          All caught up. No one is waiting for review.
        </div>
      )}
      {data?.map((request) => <RequestCard key={request.id} request={request} />)}
    </section>
  );
}

function RequestCard({ request }: { request: PendingVerification }) {
  const queryClient = useQueryClient();
  const [notes, setNotes] = useState("");
  const [needsNote, setNeedsNote] = useState(false);
  const applicant = request.applicant;

  const review = useMutation({
    mutationFn: (decision: ReviewDecision) => reviewVerification(request.id, decision, notes.trim()),
    onSuccess: (_, decision) => {
      toast.success(
        decision === "approved"
          ? `${applicant?.full_name ?? "Member"} is verified`
          : decision === "rejected"
            ? "Request rejected"
            : "Asked for more information",
      );
      queryClient.invalidateQueries({ queryKey: adminKeys.verifications });
      queryClient.invalidateQueries({ queryKey: adminKeys.stats });
    },
    onError: (error) => toast.error(error.message),
  });

  // Rejections and info requests are shown to the member, so they need a reason.
  function decide(decision: ReviewDecision) {
    if (decision !== "approved" && !notes.trim()) {
      setNeedsNote(true);
      return;
    }
    review.mutate(decision);
  }

  const submitted = new Date(request.created_at).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <article className="grid gap-4 rounded-xl border p-4">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="font-semibold">
            {applicant?.full_name ?? "Unnamed"}{" "}
            <span className="font-normal text-muted-foreground">@{applicant?.username ?? "–"}</span>
          </h3>
          <p className="text-sm text-muted-foreground">
            {applicant?.area_name ?? "No area"} · submitted {submitted}
          </p>
        </div>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        <Photo label="Profile photo" src={applicant?.avatar_url} />
        <Photo label="Verification: face" src={request.profilePhotoUrl} />
        <Photo label="Verification: with pet" src={request.petPhotoUrl} />
      </div>

      {applicant?.pets && applicant.pets.length > 0 && (
        <div className="flex flex-wrap gap-2 text-sm">
          <span className="text-muted-foreground">Pets:</span>
          {applicant.pets.map((pet) => (
            <Badge key={pet.id} variant="secondary">
              {pet.name} · {pet.species}
              {pet.breed ? ` · ${pet.breed}` : ""}
            </Badge>
          ))}
        </div>
      )}

      {applicant?.bio && <p className="text-sm">“{applicant.bio}”</p>}

      <div className="grid gap-1.5">
        <label htmlFor={`notes-${request.id}`} className="text-sm font-medium">
          Note to the member {needsNote && <span className="text-destructive">(required to reject or ask for info)</span>}
        </label>
        <Textarea
          id={`notes-${request.id}`}
          rows={2}
          value={notes}
          aria-invalid={needsNote && !notes.trim()}
          onChange={(event) => {
            setNotes(event.target.value);
            setNeedsNote(false);
          }}
          placeholder="e.g. Your pet isn't visible in the second photo, please upload one with both of you."
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button onClick={() => decide("approved")} disabled={review.isPending}>
          <Check aria-hidden /> Approve
        </Button>
        <Button variant="outline" onClick={() => decide("needs_info")} disabled={review.isPending}>
          <MessageSquareWarning aria-hidden /> Ask for more info
        </Button>
        <Button variant="destructive" onClick={() => decide("rejected")} disabled={review.isPending}>
          <X aria-hidden /> Reject
        </Button>
      </div>
    </article>
  );
}

function Photo({ label, src }: { label: string; src: string | null | undefined }) {
  return (
    <figure className="grid gap-1">
      <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
        {src ? (
          <a href={src} target="_blank" rel="noreferrer" aria-label={`Open ${label} full size`}>
            <Image src={src} alt={label} fill unoptimized className="object-cover" />
          </a>
        ) : (
          <span className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No photo
          </span>
        )}
      </div>
      <figcaption className="text-xs text-muted-foreground">{label}</figcaption>
    </figure>
  );
}
