"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Inbox, MessageCircle, PawPrint, Send, UserRound } from "lucide-react";
import { toast } from "sonner";
import {
  connectionKeys,
  deleteConnection,
  fetchDetailedConnections,
  respondToSniff,
  type DetailedConnection,
} from "@/lib/api/connections";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Tab = "incoming" | "sent" | "pawmates";

export function RequestsView() {
  const { data, isPending, error } = useQuery({
    queryKey: connectionKeys.detailed,
    queryFn: fetchDetailedConnections,
    refetchOnWindowFocus: true,
  });

  // Controlled: open on Received if anything is waiting (else Pawmates), then
  // stay on whatever tab the member picks, even as accepting changes the data.
  const [chosenTab, setChosenTab] = useState<Tab | null>(null);
  const initialTab: Tab = !data || data.incoming.length > 0 || data.pawmates.length === 0 ? "incoming" : "pawmates";
  const tab = chosenTab ?? initialTab;

  return (
    <div className="grid gap-6">
      <div className="grid gap-1">
        <h1 className="text-2xl font-bold">Sniff requests</h1>
        <p className="text-muted-foreground">Accept a request to become Pawmates and start chatting.</p>
      </div>

      {isPending && <Skeleton className="h-64 w-full rounded-xl" />}
      {error && <p className="text-destructive">{error.message}</p>}

      {data && (
        <Tabs value={tab} onValueChange={(value) => setChosenTab(value as Tab)}>
          <TabsList className="w-full">
            <TabsTrigger value="incoming">
              Received {data.incoming.length > 0 && <Badge className="ml-1">{data.incoming.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="sent">Sent</TabsTrigger>
            <TabsTrigger value="pawmates">Pawmates ({data.pawmates.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="incoming" className="grid gap-3 pt-4">
            {data.incoming.length === 0 ? (
              <Empty icon={Inbox} text="No new Sniff requests. They'll show up here." />
            ) : (
              data.incoming.map((c) => <RequestRow key={c.id} connection={c} kind="incoming" />)
            )}
          </TabsContent>

          <TabsContent value="sent" className="grid gap-3 pt-4">
            {data.sent.length === 0 ? (
              <Empty icon={Send} text="You haven't sent any requests yet. Find pets on Discover." />
            ) : (
              data.sent.map((c) => <RequestRow key={c.id} connection={c} kind="sent" />)
            )}
          </TabsContent>

          <TabsContent value="pawmates" className="grid gap-3 pt-4">
            {data.pawmates.length === 0 ? (
              <Empty icon={PawPrint} text="No Pawmates yet. Accept a request or send one from Discover." />
            ) : (
              data.pawmates.map((c) => <RequestRow key={c.id} connection={c} kind="pawmates" />)
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

function RequestRow({
  connection,
  kind,
}: {
  connection: DetailedConnection;
  kind: "incoming" | "sent" | "pawmates";
}) {
  const queryClient = useQueryClient();
  const refresh = () => queryClient.invalidateQueries({ queryKey: connectionKeys.all });

  const respond = useMutation({
    mutationFn: (accept: boolean) => respondToSniff(connection.id, accept),
    onSuccess: (_, accept) => {
      toast.success(accept ? "You're now Pawmates! 🎉" : "Request declined");
      refresh();
    },
    onError: (error) => toast.error(error.message),
  });

  const remove = useMutation({
    mutationFn: () => deleteConnection(connection.id),
    onSuccess: () => {
      toast.success(kind === "sent" ? "Request cancelled" : "Removed from your Pawmates");
      refresh();
    },
    onError: (error) => toast.error(error.message),
  });

  const other = connection.other;
  // Their pet: what they sent from (incoming) or what I sniffed (sent).
  const theirPet = connection.iSent ? connection.target_pet : connection.pet;
  const myPet = connection.iSent ? connection.pet : connection.target_pet;
  const busy = respond.isPending || remove.isPending;

  return (
    <article className="grid gap-3 rounded-xl border p-4">
      <div className="flex items-center gap-3">
        <Avatar size="lg">
          {other?.avatar_url && <AvatarImage src={other.avatar_url} alt="" />}
          <AvatarFallback>{other?.full_name?.[0] ?? <UserRound className="size-4" />}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">
            {other?.full_name ?? "Pawmates member"}{" "}
            <span className="font-normal text-muted-foreground">@{other?.username}</span>
          </p>
          <p className="truncate text-sm text-muted-foreground">
            {theirPet ? `${theirPet.name} · ${theirPet.breed ?? theirPet.species}` : other?.area_name}
            {myPet && ` → ${myPet.name}`}
          </p>
        </div>
        {theirPet?.photos[0] && (
          <span className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-muted">
            <Image src={theirPet.photos[0]} alt={theirPet.name} fill sizes="56px" className="object-cover" />
          </span>
        )}
      </div>

      {connection.message && <p className="rounded-lg bg-muted p-3 text-sm">“{connection.message}”</p>}

      <div className="flex flex-wrap gap-2">
        {kind === "incoming" && (
          <>
            <Button onClick={() => respond.mutate(true)} disabled={busy}>
              Accept
            </Button>
            <Button variant="outline" onClick={() => respond.mutate(false)} disabled={busy}>
              Decline
            </Button>
          </>
        )}
        {kind === "sent" && (
          <>
            <Badge variant="secondary" className="self-center">
              Waiting for a reply
            </Badge>
            <Button variant="ghost" size="sm" onClick={() => remove.mutate()} disabled={busy}>
              Cancel request
            </Button>
          </>
        )}
        {kind === "pawmates" && (
          <>
            <Link href="/chat" className={buttonVariants()}>
              <MessageCircle aria-hidden /> Chat
            </Link>
            <Button variant="ghost" size="sm" onClick={() => remove.mutate()} disabled={busy}>
              Remove
            </Button>
          </>
        )}
      </div>
    </article>
  );
}

function Empty({ icon: Icon, text }: { icon: typeof Inbox; text: string }) {
  return (
    <div className="grid gap-2 rounded-xl border border-dashed p-10 text-center text-muted-foreground">
      <Icon className="mx-auto size-8 text-teal" aria-hidden />
      {text}
    </div>
  );
}
