"use client";

import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dog, MapPin, Sparkles, Users } from "lucide-react";
import { toast } from "sonner";
import { cn } from "cn";
import { GROUP_KINDS, groupKeys, joinGroup, type GroupKind, type GroupSummary } from "@/lib/api/groups";
import { Button } from "@/components/ui/button";

export const KIND_STYLE: Record<GroupKind, { icon: typeof Dog; banner: string }> = {
  area: { icon: MapPin, banner: "from-teal/25 to-secondary" },
  breed: { icon: Dog, banner: "from-orange/30 to-secondary" },
  interest: { icon: Sparkles, banner: "from-coral/25 to-secondary" },
};

export function kindLabel(group: { kind: GroupKind; breed: string | null }) {
  return group.kind === "breed" && group.breed
    ? `${group.breed} club`
    : GROUP_KINDS.find((k) => k.value === group.kind)?.label ?? "Group";
}

export function GroupCard({ group }: { group: GroupSummary }) {
  const queryClient = useQueryClient();
  const { icon: Icon, banner } = KIND_STYLE[group.kind];
  const join = useMutation({
    mutationFn: () => joinGroup(group.id),
    onSuccess: () => {
      toast.success(`You joined ${group.name} 🐾`);
      queryClient.invalidateQueries({ queryKey: groupKeys.all });
    },
    onError: (error) => toast.error(error.message),
  });

  return (
    <article className="relative flex h-full flex-col overflow-hidden rounded-2xl border bg-card">
      <div className={cn("flex h-16 items-end bg-linear-to-br px-4 pb-0", banner)}>
        <span className="translate-y-1/2 rounded-xl border bg-card p-2 shadow-sm">
          <Icon className="size-5 text-primary" aria-hidden />
        </span>
      </div>
      <div className="grid flex-1 gap-2 px-4 pt-7 pb-4">
        <h3 className="font-heading font-semibold leading-snug">
          {/* The whole card opens the group; Join sits above the link. */}
          <Link href={`/groups/${group.id}`} className="after:absolute after:inset-0 hover:underline">
            {group.name}
          </Link>
        </h3>
        <p className="flex flex-wrap items-center gap-x-1.5 text-xs text-muted-foreground">
          <span>{kindLabel(group)}</span>
          {group.area_name && <span>· {group.area_name}</span>}
          {group.distance_km != null && <span>· ~{group.distance_km} km</span>}
        </p>
        {group.description && <p className="line-clamp-2 text-sm text-muted-foreground">{group.description}</p>}
        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Users className="size-4" aria-hidden /> {group.member_count} member{group.member_count === 1 ? "" : "s"}
          </span>
          {group.my_role ? (
            <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-primary">
              {group.my_role === "member" ? "Joined" : group.my_role === "owner" ? "Owner" : "Admin"}
            </span>
          ) : (
            <Button size="sm" className="relative z-10" onClick={() => join.mutate()} disabled={join.isPending}>
              {join.isPending ? "Joining…" : "Join"}
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
