"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { reportContent, type ReportReason } from "@/lib/api/chat";
import type { Option } from "@/lib/constants/pets";
import { ChoiceChips } from "@/components/shared/choice-chips";
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

const REASONS: Option<ReportReason>[] = [
  { value: "harassment", label: "Harassment" },
  { value: "spam", label: "Spam" },
  { value: "inappropriate", label: "Inappropriate" },
  { value: "scam", label: "Scam or selling pets" },
  { value: "fake_profile", label: "Fake profile" },
  { value: "unsafe_meetup", label: "Unsafe meetup" },
  { value: "animal_welfare", label: "Animal welfare" },
  { value: "other", label: "Something else" },
];

export function ReportDialog({
  target,
  onClose,
}: {
  target: { type: "message" | "profile" | "pet"; id: string } | null;
  onClose: () => void;
}) {
  const [reason, setReason] = useState<ReportReason | undefined>();
  const [details, setDetails] = useState("");

  const report = useMutation({
    mutationFn: () => reportContent(target!.type, target!.id, reason!, details),
    onSuccess: () => {
      toast.success("Thanks. Our team will review this.");
      setReason(undefined);
      setDetails("");
      onClose();
    },
    onError: (error) => toast.error(error.message),
  });

  return (
    <Dialog open={!!target} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report {target?.type === "profile" ? "this member" : target?.type === "pet" ? "this pet" : "this message"}</DialogTitle>
          <DialogDescription>
            Reports are private. The person isn&apos;t told who reported them.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <ChoiceChips id="report-reason" options={REASONS} value={reason} onChange={setReason} />
          <div className="grid gap-1.5">
            <label htmlFor="report-details" className="text-sm font-medium">
              Anything else we should know? (optional)
            </label>
            <Textarea
              id="report-details"
              rows={3}
              maxLength={1000}
              value={details}
              onChange={(event) => setDetails(event.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => report.mutate()} disabled={!reason || report.isPending}>
            {report.isPending ? "Sending…" : "Send report"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
