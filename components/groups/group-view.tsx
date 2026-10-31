"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  CalendarPlus,
  Ellipsis,
  LogOut,
  MessageCircle,
  ShieldCheck,
  Trash2,
  UserMinus,
  UserRound,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "cn";
import { chatKeys } from "@/lib/api/chat";
import {
  deleteGroup,
  eventKeys,
  fetchGroup,
  fetchGroupMembers,
  fetchUpcomingEvents,
  groupKeys,
  joinGroup,
  leaveGroup,
  removeGroupMember,
  setGroupAdmin,
  type Group,
  type GroupMember,
} from "@/lib/api/groups";
import { fetchMe, meKey } from "@/lib/api/me";
import { EventCard } from "@/components/events/event-card";
import { HostEventDialog } from "@/components/events/host-event-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KIND_STYLE, kindLabel } from "./group-card";

export function GroupView() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [hosting, setHosting] = useState(false);
  const { data: me } = useQuery({ queryKey: meKey, queryFn: fetchMe });
  const { data: group, isPending, error } = useQuery({ queryKey: groupKeys.detail(id), queryFn: () => fetchGroup(id) });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: groupKeys.all });
    queryClient.invalidateQueries({ queryKey: eventKeys.all });
    queryClient.invalidateQueries({ queryKey: chatKeys.inbox });
  };
  const join = useMutation({
    mutationFn: () => joinGroup(id),
    onSuccess: () => {
      toast.success(`Welcome to ${group?.name} 🐾`);
      refresh();
    },
    onError: (cause) => toast.error(cause.message),
  });
  const leave = useMutation({
    mutationFn: () => leaveGroup(id),
    onSuccess: () => {
      toast.success(`You left ${group?.name}`);
      refresh();
    },
    onError: (cause) => toast.error(cause.message),
  });
  const remove = useMutation({
    mutationFn: () => deleteGroup(id),
    onSuccess: () => {
      toast.success("Group deleted");
      refresh();
      router.replace("/groups");
    },
    onError: (cause) => toast.error(cause.message),
  });

  if (isPending) return <Skeleton className="h-72 w-full rounded-2xl" />;
  if (error || !group) {
    return (
      <div className="grid gap-3 py-16 text-center">
        <p className="text-muted-foreground">{error?.message ?? "This group doesn't exist any more."}</p>
        <Link href="/groups" className="text-primary underline underline-offset-4">Back to groups</Link>
      </div>
    );
  }

  const { icon: Icon, banner } = KIND_STYLE[group.kind];
  const isMember = !!group.myRole;
  const isAdmin = group.myRole === "owner" || group.myRole === "admin";

  return (
    <div className="grid gap-6">
      <Link href="/groups" className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden /> All groups
      </Link>

      <header className="overflow-hidden rounded-2xl border bg-card">
        <div className={cn("flex h-24 items-end bg-linear-to-br px-5", banner)}>
          <span className="translate-y-1/2 rounded-2xl border bg-card p-3 shadow-sm">
            <Icon className="size-7 text-primary" aria-hidden />
          </span>
        </div>
        <div className="grid gap-3 px-5 pt-10 pb-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="grid gap-1">
              <h1 className="text-2xl font-bold">{group.name}</h1>
              <p className="flex flex-wrap items-center gap-x-1.5 text-sm text-muted-foreground">
                <span>{kindLabel(group)}</span>
                {group.area_name && <span>· {group.area_name}</span>}
                <span>· {group.member_count} member{group.member_count === 1 ? "" : "s"}</span>
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {isMember ? (
                <>
                  {group.conversationId && (
                    <Link href={`/chat/${group.conversationId}`} className={buttonVariants()}>
                      <MessageCircle aria-hidden /> Group chat
                    </Link>
                  )}
                  <Button variant="outline" onClick={() => setHosting(true)}>
                    <CalendarPlus aria-hidden /> Host an event
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      aria-label="Group options"
                      className="flex size-9 items-center justify-center rounded-lg border outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
                    >
                      <Ellipsis className="size-4" aria-hidden />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52">
                      <DropdownMenuItem
                        onClick={() => {
                          const owner = group.myRole === "owner";
                          const message = owner
                            ? `Leave ${group.name}? The longest-standing admin or member becomes the owner.`
                            : `Leave ${group.name}? You'll leave the group chat too.`;
                          if (window.confirm(message)) leave.mutate();
                        }}
                      >
                        <LogOut aria-hidden /> Leave group
                      </DropdownMenuItem>
                      {group.myRole === "owner" && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() =>
                              window.confirm(`Delete ${group.name} for everyone? Its chat and events are deleted too.`) &&
                              remove.mutate()
                            }
                          >
                            <Trash2 aria-hidden /> Delete group
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <Button onClick={() => join.mutate()} disabled={join.isPending}>
                  <Users aria-hidden /> {join.isPending ? "Joining…" : "Join group"}
                </Button>
              )}
            </div>
          </div>
          {group.description && <p className="max-w-2xl whitespace-pre-line">{group.description}</p>}
          {!isMember && (
            <p className="text-sm text-muted-foreground">Join to chat with members and RSVP to their events.</p>
          )}
        </div>
      </header>

      <Tabs defaultValue="events">
        <TabsList>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
        </TabsList>
        <TabsContent value="events" className="pt-4">
          <GroupEvents group={group} canManage={isAdmin} onHost={isMember ? () => setHosting(true) : undefined} />
        </TabsContent>
        <TabsContent value="members" className="pt-4">
          {isMember ? (
            <GroupMembers group={group} />
          ) : (
            <p className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">
              Join the group to see who&apos;s in it.
            </p>
          )}
        </TabsContent>
      </Tabs>

      {/* Mounted only while open: the dialog reads the clock and searches places. */}
      {hosting && me && (
        <HostEventDialog groupId={group.id} groupName={group.name} myPets={me.pets} onClose={() => setHosting(false)} />
      )}
    </div>
  );
}

function GroupEvents({ group, canManage, onHost }: { group: Group; canManage: boolean; onHost?: () => void }) {
  const { data, isPending, error } = useQuery({
    queryKey: eventKeys.upcoming(group.id),
    queryFn: () => fetchUpcomingEvents(group.id),
  });

  if (isPending) return <Skeleton className="h-40 rounded-2xl" />;
  if (error) return <p className="text-destructive">{error.message}</p>;
  if (data.length === 0) {
    return (
      <div className="grid justify-items-center gap-3 rounded-2xl border border-dashed p-8 text-center">
        <p className="text-sm text-muted-foreground">No upcoming events in this group.</p>
        {onHost && (
          <Button variant="outline" onClick={onHost}>
            <CalendarPlus aria-hidden /> Host the first one
          </Button>
        )}
      </div>
    );
  }
  return (
    <ul className="grid gap-3 md:grid-cols-2">
      {data.map((event) => (
        <li key={event.id}>
          <EventCard event={event} canManage={canManage} className="h-full" />
        </li>
      ))}
    </ul>
  );
}

const ROLE_LABEL: Record<string, string> = { owner: "Owner", admin: "Admin", member: "" };

function GroupMembers({ group }: { group: Group }) {
  const { data, isPending, error } = useQuery({
    queryKey: groupKeys.members(group.id),
    queryFn: () => fetchGroupMembers(group.id),
  });

  if (isPending) return <Skeleton className="h-40 rounded-2xl" />;
  if (error) return <p className="text-destructive">{error.message}</p>;
  return (
    <ul className="divide-y rounded-2xl border">
      {data.map((member) => (
        <li key={member.user_id}>
          <MemberRow group={group} member={member} />
        </li>
      ))}
    </ul>
  );
}

function MemberRow({ group, member }: { group: Group; member: GroupMember }) {
  const queryClient = useQueryClient();
  const refresh = () => queryClient.invalidateQueries({ queryKey: groupKeys.all });
  const name = member.profile?.full_name ?? "Pawmates member";
  const isMe = member.user_id === group.meId;
  const canRemove =
    !isMe && (group.myRole === "owner" || (group.myRole === "admin" && member.role === "member"));
  const canPromote = !isMe && group.myRole === "owner" && member.role !== "owner";

  const promote = useMutation({
    mutationFn: () => setGroupAdmin(group.id, member.user_id, member.role !== "admin"),
    onSuccess: () => {
      toast.success(member.role === "admin" ? `${name} is no longer an admin` : `${name} is now an admin`);
      refresh();
    },
    onError: (cause) => toast.error(cause.message),
  });
  const remove = useMutation({
    mutationFn: () => removeGroupMember(group.id, member.user_id),
    onSuccess: () => {
      toast.success(`${name} was removed from the group`);
      refresh();
    },
    onError: (cause) => toast.error(cause.message),
  });

  const profileHref = member.profile?.username ? `/u/${member.profile.username}` : null;
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <Avatar>
        {member.profile?.avatar_url && <AvatarImage src={member.profile.avatar_url} alt="" />}
        <AvatarFallback>{member.profile?.full_name?.[0] ?? <UserRound className="size-4" />}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        {profileHref && !isMe ? (
          <Link href={profileHref} className="block truncate font-medium hover:underline">{name}</Link>
        ) : (
          <p className="truncate font-medium">{name}{isMe && " (you)"}</p>
        )}
        {member.profile?.area_name && <p className="truncate text-xs text-muted-foreground">{member.profile.area_name}</p>}
      </div>
      {ROLE_LABEL[member.role] && (
        <span className="flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold text-primary">
          <ShieldCheck className="size-3.5" aria-hidden /> {ROLE_LABEL[member.role]}
        </span>
      )}
      {(canRemove || canPromote) && (
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label={`Manage ${name}`}
            className="flex size-8 items-center justify-center rounded-lg text-muted-foreground outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <Ellipsis className="size-4" aria-hidden />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {canPromote && (
              <DropdownMenuItem onClick={() => promote.mutate()}>
                <ShieldCheck aria-hidden /> {member.role === "admin" ? "Remove admin" : "Make admin"}
              </DropdownMenuItem>
            )}
            {canRemove && (
              <DropdownMenuItem
                variant="destructive"
                onClick={() => window.confirm(`Remove ${name} from ${group.name}?`) && remove.mutate()}
              >
                <UserMinus aria-hidden /> Remove from group
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
