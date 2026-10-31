"use client";

import Link from "next/link";
import { CalendarPlus, PawPrint, Plus, Radar } from "lucide-react";
import { cn } from "cn";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// The ＋ action: things members create. Upcoming actions are listed but
// disabled so people see what's coming.
export function CreateMenu({ variant }: { variant: "sidebar" | "tab" }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Create"
        className={cn(
          "flex items-center justify-center gap-2 font-semibold outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
          variant === "tab"
            ? "-mt-6 size-14 rounded-full bg-primary text-primary-foreground shadow-lg"
            : "h-11 w-full rounded-xl bg-primary text-sm text-primary-foreground hover:bg-primary/90",
        )}
      >
        <Plus className={variant === "tab" ? "size-6" : "size-4"} aria-hidden />
        {variant === "sidebar" && "Create"}
      </DropdownMenuTrigger>
      <DropdownMenuContent align={variant === "tab" ? "center" : "start"} className="w-60">
        <DropdownMenuItem render={<Link href="/settings?tab=pets" />}>
          <PawPrint aria-hidden /> Add a pet
        </DropdownMenuItem>
        {/* Playdates are planned with a Pawmate inside a chat (📅 button). */}
        <DropdownMenuItem render={<Link href="/chat" />}>
          <CalendarPlus aria-hidden /> Plan a playdate <span className="ml-auto text-xs text-muted-foreground">in chat</span>
        </DropdownMenuItem>
        <DropdownMenuItem disabled>
          <Radar aria-hidden /> Report a lost pet <span className="ml-auto text-xs">soon</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
