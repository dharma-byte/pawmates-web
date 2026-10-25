"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Compass, House, LogOut, MessageCircle, Settings, Shield, UserRound, Users } from "lucide-react";
import { cn } from "cn";
import { chatKeys, fetchInbox } from "@/lib/api/chat";
import { connectionKeys, fetchMyConnections } from "@/lib/api/connections";
import { fetchMe, meKey } from "@/lib/api/me";
import { useInboxRealtime } from "@/hooks/use-chat-channel";
import { Logo } from "@/components/shared/logo";
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

const TABS = [
  { href: "/home", label: "Home", icon: House },
  { href: "/discover", label: "Discover", icon: Compass },
  { href: "/requests", label: "Requests", icon: Users },
  { href: "/chat", label: "Chat", icon: MessageCircle },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: me } = useQuery({ queryKey: meKey, queryFn: fetchMe });

  // Badges: unread chats (live via Realtime) and unanswered Sniff requests.
  const { data: inbox } = useQuery({ queryKey: chatKeys.inbox, queryFn: fetchInbox });
  const { data: connections } = useQuery({
    queryKey: connectionKeys.mine,
    queryFn: fetchMyConnections,
    refetchOnWindowFocus: true,
  });
  useInboxRealtime(() => queryClient.invalidateQueries({ queryKey: chatKeys.inbox }));
  const badges: Record<string, number> = {
    "/chat": inbox?.filter((c) => c.unread_count > 0 && !c.muted).length ?? 0,
    "/requests": [...(connections?.values() ?? [])].filter((state) => state === "received").length,
  };

  async function signOut() {
    await fetch("/auth/signout", { method: "POST" });
    // Drop everything cached for this member before leaving.
    queryClient.clear();
    router.replace("/");
    router.refresh();
  }
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between gap-4 px-4">
          <Logo href="/home" />

          <nav aria-label="Main" className="hidden gap-1 md:flex">
            {TABS.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                aria-current={isActive(href) ? "page" : undefined}
                className={cn(
                  "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive(href) ? "bg-secondary text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="size-4" aria-hidden />
                {label}
                <CountBadge count={badges[href] ?? 0} />
              </Link>
            ))}
          </nav>

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
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pt-6 pb-24 md:pb-10">{children}</main>

      {/* Mobile tab bar: most members use Pawmates on a phone, outdoors. */}
      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-20 border-t bg-background pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        <ul className="grid grid-cols-4">
          {TABS.map(({ href, label, icon: Icon }) => (
            <li key={href}>
              <Link
                href={href}
                aria-current={isActive(href) ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-0.5 py-2 text-xs font-medium",
                  isActive(href) ? "text-primary" : "text-muted-foreground",
                )}
              >
                <span className="relative">
                  <Icon className={cn("size-5", isActive(href) && "text-coral")} aria-hidden />
                  <CountBadge count={badges[href] ?? 0} floating />
                </span>
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

function CountBadge({ count, floating }: { count: number; floating?: boolean }) {
  if (count === 0) return null;
  return (
    <span
      className={cn(
        "min-w-4 rounded-full bg-coral px-1 text-center text-[10px] leading-4 font-semibold text-white",
        floating && "absolute -top-1.5 -right-2.5",
      )}
    >
      {count > 9 ? "9+" : count}
      <span className="sr-only"> new</span>
    </span>
  );
}
