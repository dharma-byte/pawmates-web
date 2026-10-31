"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings } from "lucide-react";
import { cn } from "cn";
import { useActivity } from "@/hooks/use-activity";
import { Logo } from "@/components/shared/logo";
import { AccountMenu } from "./account-menu";
import { ActivityMenu } from "./activity-menu";
import { CountBadge } from "./count-badge";
import { CreateMenu } from "./create-menu";
import { APP_NAV, isActivePath } from "./nav-config";

// The signed-in app: deliberately different from the marketing site.
//   desktop  left sidebar + slim top bar (activity, account)
//   phone    top bar + bottom tab bar with a centre ＋
export function AppShell({ children }: { children: React.ReactNode }) {
  const activity = useActivity();

  return (
    <div className="flex min-h-full flex-1">
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col gap-6 border-r bg-sidebar px-4 py-5 md:flex">
        <Logo href="/home" className="px-2" />
        <CreateMenu variant="sidebar" />
        <Suspense fallback={<SidebarNav badges={activity.badges} pathname={null} />}>
          <ActiveSidebarNav badges={activity.badges} />
        </Suspense>
        <Link
          href="/settings"
          className="mt-auto flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <Settings className="size-5" aria-hidden /> Settings
        </Link>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-3 border-b bg-background/95 px-4 backdrop-blur md:justify-end">
          <Logo href="/home" className="md:hidden" />
          <div className="flex items-center gap-1">
            <ActivityMenu activity={activity} />
            <AccountMenu />
          </div>
        </header>

        <main className="mx-auto w-full max-w-5xl flex-1 px-4 pt-6 pb-24 md:px-8 md:pb-10">{children}</main>
      </div>

      <Suspense fallback={<TabBar badges={activity.badges} pathname={null} />}>
        <ActiveTabBar badges={activity.badges} />
      </Suspense>
    </div>
  );
}

// The current path is request-time data on dynamic routes like /chat/[id],
// so only these small wrappers read it, inside Suspense boundaries.
function ActiveSidebarNav({ badges }: { badges: Record<string, number> }) {
  return <SidebarNav badges={badges} pathname={usePathname()} />;
}

function ActiveTabBar({ badges }: { badges: Record<string, number> }) {
  return <TabBar badges={badges} pathname={usePathname()} />;
}

function SidebarNav({ badges, pathname }: { badges: Record<string, number>; pathname: string | null }) {
  return (
    <nav aria-label="Main" className="grid gap-1">
      {APP_NAV.map(({ href, label, icon: Icon }) => {
        const active = isActivePath(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              active ? "bg-secondary text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className={cn("size-5", active && "text-coral")} aria-hidden />
            <span className="flex-1">{label}</span>
            <CountBadge count={badges[href] ?? 0} />
          </Link>
        );
      })}
    </nav>
  );
}

function TabBar({ badges, pathname }: { badges: Record<string, number>; pathname: string | null }) {
  // Phones get four tabs plus ＋. Friends stands in for Requests (carrying
  // its badge); Groups is reached from Discover, Home and the ＋ menu.
  const [home, discover, friends, chat] = (["/home", "/discover", "/friends", "/chat"] as const).map(
    (href) => APP_NAV.find((item) => item.href === href)!,
  );
  const tab = (item: (typeof APP_NAV)[number]) => {
    const active =
      isActivePath(pathname, item.href) || (item.href === "/friends" && isActivePath(pathname, "/requests"));
    const badge = item.href === "/friends" ? badges["/requests"] : badges[item.href];
    const Icon = item.icon;
    return (
      <Link
        href={item.href}
        aria-current={active ? "page" : undefined}
        className={cn("flex flex-col items-center gap-0.5 py-2 text-xs font-medium", active ? "text-primary" : "text-muted-foreground")}
      >
        <span className="relative">
          <Icon className={cn("size-5", active && "text-coral")} aria-hidden />
          <CountBadge count={badge ?? 0} floating />
        </span>
        {item.label}
      </Link>
    );
  };

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-20 border-t bg-background pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="grid grid-cols-5 items-end">
        <li>{tab(home)}</li>
        <li>{tab(discover)}</li>
        <li className="flex justify-center">
          <CreateMenu variant="tab" />
        </li>
        <li>{tab(friends)}</li>
        <li>{tab(chat)}</li>
      </ul>
    </nav>
  );
}
