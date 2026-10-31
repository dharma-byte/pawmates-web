"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Ellipsis, MapPin, PawPrint, Search, UserMinus, UserPlus, UserRound } from "lucide-react";
import { toast } from "sonner";
import {
  connectionKeys,
  deleteConnection,
  fetchFriends,
  fetchMyConnections,
  type Friend,
} from "@/lib/api/connections";
import { OpenChatButton } from "@/components/chat/open-chat-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

// Your Pawmates in one place: message them, see their pets, open profiles.
export function FriendsView() {
  const { data: states } = useQuery({ queryKey: connectionKeys.mine, queryFn: fetchMyConnections });
  const waitingRequests = [...(states?.values() ?? [])].filter((state) => state === "received").length;
  const [query, setQuery] = useState("");
  const { data, isPending, error } = useQuery({ queryKey: connectionKeys.friends, queryFn: fetchFriends });

  const needle = query.trim().toLowerCase();
  const shown = (data ?? []).filter(
    (friend) =>
      !needle ||
      [friend.person.full_name, friend.person.username, friend.person.area_name, ...friend.pets.map((p) => p.name)]
        .some((text) => text?.toLowerCase().includes(needle)),
  );

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="grid gap-1">
          <h1 className="text-2xl font-bold">Friends</h1>
          <p className="text-muted-foreground">Your Pawmates. Message them any time or plan the next playdate.</p>
        </div>
        <Link href="/requests" className={buttonVariants({ variant: "outline" })}>
          <UserPlus aria-hidden /> Requests
          {waitingRequests > 0 && <Badge className="ml-1">{waitingRequests}</Badge>}
        </Link>
      </div>

      {data && data.length > 0 && (
        <label className="relative">
          <span className="sr-only">Search friends</span>
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name, pet or area"
            className="h-10 pl-9"
          />
        </label>
      )}

      {isPending && (
        <div className="grid gap-3 sm:grid-cols-2">
          <Skeleton className="h-44 rounded-2xl" />
          <Skeleton className="h-44 rounded-2xl" />
        </div>
      )}
      {error && <p className="text-destructive">{error.message}</p>}

      {data?.length === 0 && (
        <div className="grid justify-items-center gap-3 rounded-2xl border border-dashed p-10 text-center">
          <PawPrint className="size-8 text-teal" aria-hidden />
          <p className="font-medium">No friends yet</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Send a Sniff request to a pet you like. Once they accept, you&apos;re Pawmates and they show up here.
          </p>
          <Link href="/discover" className={buttonVariants()}>
            Find pets nearby
          </Link>
        </div>
      )}

      {data && data.length > 0 && shown.length === 0 && (
        <p className="text-center text-sm text-muted-foreground">No friends match &ldquo;{query}&rdquo;.</p>
      )}

      {shown.length > 0 && (
        <ul className="grid gap-3 sm:grid-cols-2">
          {shown.map((friend) => (
            <li key={friend.connectionId}>
              <FriendCard friend={friend} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FriendCard({ friend }: { friend: Friend }) {
  const queryClient = useQueryClient();
  const { person, pets } = friend;
  const name = person.full_name ?? "Pawmates member";
  const profileHref = person.username ? `/u/${person.username}` : null;
  const since = new Date(friend.since).toLocaleDateString(undefined, { month: "short", year: "numeric" });

  const remove = useMutation({
    mutationFn: () => deleteConnection(friend.connectionId),
    onSuccess: () => {
      toast.success(`Removed ${name} from your Pawmates`);
      queryClient.invalidateQueries({ queryKey: connectionKeys.all });
    },
    onError: (error) => toast.error(error.message),
  });

  return (
    <article className="grid h-full gap-4 rounded-2xl border bg-card p-4">
      <div className="flex items-start gap-3">
        <Avatar size="lg">
          {person.avatar_url && <AvatarImage src={person.avatar_url} alt="" />}
          <AvatarFallback>{person.full_name?.[0] ?? <UserRound className="size-4" />}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          {profileHref ? (
            <Link href={profileHref} className="block truncate font-semibold hover:underline">
              {name}
            </Link>
          ) : (
            <p className="truncate font-semibold">{name}</p>
          )}
          <p className="flex items-center gap-1 truncate text-sm text-muted-foreground">
            {person.area_name && (
              <>
                <MapPin className="size-3.5 shrink-0" aria-hidden /> {person.area_name} ·{" "}
              </>
            )}
            Pawmates since {since}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label={`More options for ${name}`}
            className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <Ellipsis className="size-4" aria-hidden />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {profileHref && (
              <DropdownMenuItem render={<Link href={profileHref} />}>
                <UserRound aria-hidden /> View profile
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              variant="destructive"
              disabled={remove.isPending}
              onClick={() => window.confirm(`Remove ${name} from your Pawmates? You won't be able to chat until you reconnect.`) && remove.mutate()}
            >
              <UserMinus aria-hidden /> Remove friend
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {pets.length > 0 && (
        <ul className="flex flex-wrap gap-2" aria-label={`${name}'s pets`}>
          {pets.map((pet) => (
            <li key={pet.id}>
              <Link
                href={`/pets/${pet.id}`}
                className="flex items-center gap-2 rounded-full border py-1 pr-3 pl-1 text-sm hover:bg-muted"
              >
                <span className="relative size-7 overflow-hidden rounded-full bg-muted">
                  {pet.photos[0] ? (
                    <Image src={pet.photos[0]} alt="" fill sizes="28px" className="object-cover" />
                  ) : (
                    <PawPrint className="m-1.5 size-4 text-teal" aria-hidden />
                  )}
                </span>
                <span className="font-medium">{pet.name}</span>
                <span className="text-muted-foreground">{pet.breed ?? pet.species}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-auto flex gap-2">
        <OpenChatButton userId={person.id} label="Message" size="sm" className="flex-1" />
        {profileHref && (
          <Link href={profileHref} className={buttonVariants({ variant: "outline", size: "sm", className: "flex-1" })}>
            Profile
          </Link>
        )}
      </div>
    </article>
  );
}
