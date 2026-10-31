"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LogOut, Settings, Shield, UserRound } from "lucide-react";
import { fetchMe, meKey } from "@/lib/api/me";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AccountMenu() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: me } = useQuery({ queryKey: meKey, queryFn: fetchMe });

  async function signOut() {
    await fetch("/auth/signout", { method: "POST" });
    // Drop everything cached for this member before leaving.
    queryClient.clear();
    router.replace("/");
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Account menu"
        className="rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <Avatar>
          {me?.avatar_url && <AvatarImage src={me.avatar_url} alt="" />}
          <AvatarFallback>{me?.full_name?.[0]?.toUpperCase() ?? <UserRound className="size-4" />}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            <span className="block truncate font-medium text-foreground">{me?.full_name ?? "…"}</span>
            <span className="block truncate text-xs font-normal">{me?.email}</span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        {me?.username && (
          <DropdownMenuItem render={<Link href={`/u/${me.username}`} />}>
            <UserRound aria-hidden /> My profile
          </DropdownMenuItem>
        )}
        <DropdownMenuItem render={<Link href="/settings" />}>
          <Settings aria-hidden /> Settings
        </DropdownMenuItem>
        {me?.isAdmin && (
          <DropdownMenuItem render={<Link href="/admin" />}>
            <Shield aria-hidden /> Admin
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut}>
          <LogOut aria-hidden /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
