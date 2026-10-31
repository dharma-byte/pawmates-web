"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "cn";
import { useActivity } from "@/hooks/use-activity";
import { Logo } from "@/components/shared/logo";
import { AccountMenu } from "./account-menu";
import { Backdrop, backdropForPath } from "./backdrop";
import { ActivityMenu } from "./activity-menu";
import { CountBadge } from "./count-badge";
import { CreateMenu } from "./create-menu";
import { APP_NAV, isActivePath } from "./nav-config";

// The signed-in app: deliberately different from the marketing site.
//   desktop  one sticky frosted top bar: logo, sections, ＋ Create, bell, account
//   phone    top bar + bottom tab bar with a centre ＋
// Requests live under Friends (its badge and a button on the Friends page);
// Settings is in the account menu.
export function AppShell({ children }: { children: React.ReactNode }) {
  const activity = useActivity();

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <Suspense fallback={<Backdrop name="home" />}>
        <ActiveBackdrop />
      </Suspense>

      <header className="sticky top-0 z-20 border-b bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-3 px-4">
          <Logo href="/home" className="shrink-0" />
          <Suspense fallback={<TopNav badges={activity.badges} pathname={null} />}>
            <ActiveTopNav badges={activity.badges} />
          </Suspense>
          <div className="flex shrink-0 items-center gap-1">
            <span className="mr-1 hidden md:block">
              <CreateMenu variant="bar" />
            </span>
            <ActivityMenu activity={activity} />
            <AccountMenu />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pt-6 pb-24 md:px-8 md:pb-10">{children}</main>

      <Suspense fallback={<TabBar badges={activity.badges} pathname={null} />}>
        <ActiveTabBar badges={activity.badges} />
      </Suspense>
    </div>
  );
}

// The sections shown in the top bar and the phone tab bar. Friends stands in
// for Requests: it is active on /requests and carries the requests badge.
const MAIN_SECTIONS = (["/home", "/discover", "/groups", "/friends", "/chat"] as const).map(
  (href) => APP_NAV.find((item) => item.href === href)!,
);

function sectionState(item: (typeof APP_NAV)[number], pathname: string | null, badges: Record<string, number>) {
  const friends = item.href === "/friends";
  return {
    active: isActivePath(pathname, item.href) || (friends && isActivePath(pathname, "/requests")),
    badge: (friends ? badges["/requests"] : badges[item.href]) ?? 0,
  };
}

// The current path is request-time data on dynamic routes like /chat/[id],
// so only these small wrappers read it, inside Suspense boundaries.
function ActiveBackdrop() {
  return <Backdrop name={backdropForPath(usePathname())} />;
}

function ActiveTopNav({ badges }: { badges: Record<string, number> }) {
  return <TopNav badges={badges} pathname={usePathname()} />;
}

function ActiveTabBar({ badges }: { badges: Record<string, number> }) {
  return <TabBar badges={badges} pathname={usePathname()} />;
}

// Icons only on small laptops, icons and labels from lg up.
function TopNav({ badges, pathname }: { badges: Record<string, number>; pathname: string | null }) {
  return (
    <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
      {MAIN_SECTIONS.map((item) => {
        const { active, badge } = sectionState(item, pathname, badges);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative flex h-9 items-center gap-2 rounded-full px-3 text-sm font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 lg:px-4",
              active ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
            )}
          >
            <span className="relative">
              <Icon className={cn("size-5 lg:size-4", active && "text-coral")} aria-hidden />
              <CountBadge count={badge} floating className="lg:hidden" />
            </span>
            <span className="sr-only lg:not-sr-only">{item.label}</span>
            {/* With labels showing, the count sits after the label instead. */}
            <CountBadge count={badge} className="hidden lg:block" />
          </Link>
        );
      })}
    </nav>
  );
}

function TabBar({ badges, pathname }: { badges: Record<string, number>; pathname: string | null }) {
  const [home, discover, , friends, chat] = MAIN_SECTIONS;
  const tab = (item: (typeof APP_NAV)[number]) => {
    const { active, badge } = sectionState(item, pathname, badges);
    const Icon = item.icon;
    return (
      <Link
        href={item.href}
        aria-current={active ? "page" : undefined}
        className={cn("flex flex-col items-center gap-0.5 py-2 text-xs font-medium", active ? "text-primary" : "text-muted-foreground")}
      >
        <span className="relative">
          <Icon className={cn("size-5", active && "text-coral")} aria-hidden />
          <CountBadge count={badge} floating />
        </span>
        {item.label}
      </Link>
    );
  };

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-20 border-t bg-background/85 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
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
