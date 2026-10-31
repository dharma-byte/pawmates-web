"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { cn } from "cn";
import { playdateKeys, reviewPlaydate } from "@/lib/api/playdates";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

const LABELS = ["", "Didn't get along", "A bit tense", "Okay", "Played well", "Best friends!"];

// "How did they get along?" after a playdate.
export function ReviewDialog({
  eventId,
  petId,
  petName,
  onClose,
}: {
  eventId: string;
  petId: string;
  petName: string;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const submit = useMutation({
    mutationFn: () => reviewPlaydate(eventId, petId, rating, comment.trim()),
    onSuccess: () => {
      toast.success(`Thanks! Your review of ${petName} helps everyone plan better playdates.`);
      queryClient.invalidateQueries({ queryKey: playdateKeys.all });
      onClose();
    },
    onError: (error) => toast.error(error.message),
  });

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>How did {petName} get along?</DialogTitle>
          <DialogDescription>
            Your comment is shared only with {petName}&apos;s owner. Ratings help pets earn a Good playmate badge.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid justify-items-center gap-2">
            <div role="radiogroup" aria-label="Rating" className="flex gap-1">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={rating === value}
                  aria-label={`${value} of 5: ${LABELS[value]}`}
                  onClick={() => setRating(value)}
                  className="rounded-lg p-1.5 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <Star className={cn("size-8", value <= rating ? "fill-orange text-orange" : "text-muted-foreground")} aria-hidden />
                </button>
              ))}
            </div>
            <p className="h-5 text-sm font-medium">{LABELS[rating]}</p>
          </div>
          <label className="grid gap-1.5 text-sm font-medium">
            Anything to add? (optional)
            <Textarea rows={3} maxLength={500} value={comment} onChange={(event) => setComment(event.target.value)} placeholder={`${petName} was gentle and loved chasing the ball.`} />
          </label>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Later</Button>
          <Button onClick={() => submit.mutate()} disabled={rating === 0 || submit.isPending}>
            {submit.isPending ? "Sending…" : "Send review"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
