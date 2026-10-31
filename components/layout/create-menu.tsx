"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarPlus, PawPrint, Plus, Radar, Users } from "lucide-react";
import { cn } from "cn";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CreateGroupDialog } from "@/components/groups/create-group-dialog";
import { ReportLostDialog } from "@/components/lost/report-lost-dialog";

// The ＋ action: things members create, with Report a lost dog always one tap away.
export function CreateMenu({ variant }: { variant: "bar" | "tab" }) {
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [reportingLost, setReportingLost] = useState(false);
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="Create"
          className={cn(
            "flex items-center justify-center gap-2 font-semibold outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
            variant === "tab"
              ? "-mt-6 size-14 rounded-full bg-primary text-primary-foreground shadow-lg"
              : "h-9 rounded-full bg-primary px-3 text-sm text-primary-foreground hover:bg-primary/90 lg:px-4",
          )}
        >
          <Plus className={variant === "tab" ? "size-6" : "size-4"} aria-hidden />
          {variant === "bar" && <span className="sr-only lg:not-sr-only">Create</span>}
        </DropdownMenuTrigger>
        <DropdownMenuContent align={variant === "tab" ? "center" : "end"} className="w-60">
          <DropdownMenuItem render={<Link href="/settings?tab=pets" />}>
            <PawPrint aria-hidden /> Add a dog
          </DropdownMenuItem>
          {/* Playdates are planned with a Pawmate inside a chat (📅 button). */}
          <DropdownMenuItem render={<Link href="/chat" />}>
            <CalendarPlus aria-hidden /> Plan a playdate <span className="ml-auto text-xs text-muted-foreground">in chat</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setCreatingGroup(true)}>
            <Users aria-hidden /> Start a group
          </DropdownMenuItem>
          {/* Events are hosted inside a group. */}
          <DropdownMenuItem render={<Link href="/groups" />}>
            <CalendarPlus aria-hidden /> Host an event <span className="ml-auto text-xs text-muted-foreground">in a group</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setReportingLost(true)} className="text-coral">
            <Radar aria-hidden /> Report a lost dog
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {creatingGroup && <CreateGroupDialog onClose={() => setCreatingGroup(false)} />}
      {reportingLost && <ReportLostDialog onClose={() => setReportingLost(false)} />}
    </>
  );
}
