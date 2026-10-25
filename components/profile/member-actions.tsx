"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Ban, EllipsisVertical, Flag } from "lucide-react";
import { toast } from "sonner";
import { blockUser } from "@/lib/api/chat";
import { ReportDialog } from "@/components/chat/report-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Report and block, available on every profile and pet page (plan: safety).
export function MemberActions({
  userId,
  name,
  petId,
}: {
  userId: string;
  name: string;
  petId?: string;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [reporting, setReporting] = useState<{ type: "profile" | "pet"; id: string } | null>(null);

  const block = useMutation({
    mutationFn: () => blockUser(userId),
    onSuccess: () => {
      toast.success(`${name} is blocked. You can unblock them in Settings.`);
      queryClient.invalidateQueries();
      router.replace("/discover");
    },
    onError: (error) => toast.error(error.message),
  });

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="More options"
          className="rounded-full border p-2 outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <EllipsisVertical className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          {petId && (
            <DropdownMenuItem onClick={() => setReporting({ type: "pet", id: petId })}>
              <Flag aria-hidden /> Report this pet
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => setReporting({ type: "profile", id: userId })}>
            <Flag aria-hidden /> Report {name.split(" ")[0]}
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            onClick={() => {
              if (window.confirm(`Block ${name}? You won't see each other's profiles or pets, and they can't message you.`)) {
                block.mutate();
              }
            }}
          >
            <Ban aria-hidden /> Block {name.split(" ")[0]}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ReportDialog target={reporting} onClose={() => setReporting(null)} />
    </>
  );
}
