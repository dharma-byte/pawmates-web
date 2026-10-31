"use client";

import { useDeferredValue, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Plus, Search, Users } from "lucide-react";
import { cn } from "cn";
import { eventKeys, fetchUpcomingEvents, findGroups, GROUP_KINDS, groupKeys, type GroupKind } from "@/lib/api/groups";
import { EventCard } from "@/components/events/event-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { CreateGroupDialog } from "./create-group-dialog";
import { GroupCard } from "./group-card";

// Groups & events: what's on nearby, my groups, and groups to join.
export function GroupsView() {
  const [search, setSearch] = useState("");
  const [kind, setKind] = useState<GroupKind | null>(null);
  const [creating, setCreating] = useState(false);
  const deferredSearch = useDeferredValue(search.trim());

  const events = useQuery({ queryKey: eventKeys.upcoming(null), queryFn: () => fetchUpcomingEvents(null) });
  const groups = useQuery({
    queryKey: groupKeys.find(deferredSearch, kind),
    queryFn: () => findGroups(deferredSearch, kind),
    placeholderData: (previous) => previous,
  });

  const mine = (groups.data ?? []).filter((g) => g.my_role);
  const nearby = (groups.data ?? []).filter((g) => !g.my_role);
  const filtering = !!deferredSearch || !!kind;
  const upcoming = (events.data ?? []).filter((e) => e.status === "scheduled").slice(0, 4);

  return (
    <div className="grid gap-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="grid gap-1">
          <h1 className="text-2xl font-bold">Groups & events</h1>
          <p className="text-muted-foreground">Walk together, swap tips and meet pets near you.</p>
        </div>
        <Button onClick={() => setCreating(true)}>
          <Plus aria-hidden /> Start a group
        </Button>
      </div>

      {!filtering && (
        <section className="grid gap-3" aria-labelledby="events-heading">
          <h2 id="events-heading" className="flex items-center gap-2 font-heading text-lg font-semibold">
            <CalendarDays className="size-5 text-coral" aria-hidden /> Coming up
          </h2>
          {events.isPending && <Skeleton className="h-40 rounded-2xl" />}
          {events.data && upcoming.length === 0 && (
            <p className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">
              No events nearby yet. Join a group and host the first walk!
            </p>
          )}
          {upcoming.length > 0 && (
            <ul className="grid gap-3 md:grid-cols-2">
              {upcoming.map((event) => (
                <li key={event.id}>
                  <EventCard event={event} showGroup className="h-full" />
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <section className="grid gap-4" aria-labelledby="groups-heading">
        <h2 id="groups-heading" className="flex items-center gap-2 font-heading text-lg font-semibold">
          <Users className="size-5 text-teal" aria-hidden /> Groups
        </h2>

        <div className="grid gap-3">
          <label className="relative">
            <span className="sr-only">Search groups</span>
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name, breed or area" className="h-10 pl-9" />
          </label>
          <div role="radiogroup" aria-label="Kind of group" className="flex flex-wrap gap-2">
            {[{ value: null, label: "All" }, ...GROUP_KINDS].map((option) => (
              <button
                key={option.label}
                type="button"
                role="radio"
                aria-checked={kind === option.value}
                onClick={() => setKind(option.value)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-sm transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                  kind === option.value ? "border-primary bg-primary text-primary-foreground" : "border-input bg-background hover:bg-muted",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {groups.isPending && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-48 rounded-2xl" />
            <Skeleton className="h-48 rounded-2xl" />
            <Skeleton className="h-48 rounded-2xl" />
          </div>
        )}
        {groups.error && <p className="text-destructive">{groups.error.message}</p>}

        {mine.length > 0 && <GroupGrid title="Your groups" groups={mine} />}
        {groups.data && (
          <GroupGrid
            title={filtering ? "Results" : "Near you"}
            groups={nearby}
            empty={
              filtering
                ? "No groups match. Try another search, or start one yourself."
                : "No groups near you yet. Start one for your area or your pet's breed!"
            }
          />
        )}
      </section>

      {creating && <CreateGroupDialog onClose={() => setCreating(false)} />}
    </div>
  );
}

function GroupGrid({ title, groups, empty }: { title: string; groups: Parameters<typeof GroupCard>[0]["group"][]; empty?: string }) {
  return (
    <div className="grid gap-3">
      <h3 className="text-sm font-semibold text-muted-foreground">{title}</h3>
      {groups.length === 0 ? (
        empty && <p className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">{empty}</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => (
            <li key={group.id}>
              <GroupCard group={group} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
