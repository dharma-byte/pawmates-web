"use client";

import { Fragment, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import { useSharedQuery } from "@/hooks/use-shared-query";
import { ArrowLeft, Ban, Bell, BellOff, EllipsisVertical, Flag, ShieldCheck, UserRound, Users } from "lucide-react";
import { toast } from "sonner";
import {
  blockUser,
  chatKeys,
  deleteMessage,
  fetchConversation,
  fetchMessages,
  markRead,
  MESSAGES_PAGE,
  sendImage,
  sendLocation,
  sendText,
  setMuted,
  type Conversation,
  type Message,
} from "@/lib/api/chat";
import { connectionKeys } from "@/lib/api/connections";
import { reverseGeocode } from "@/lib/api/geocode";
import { fetchMe, meKey } from "@/lib/api/me";
import { eventKeys } from "@/lib/api/groups";
import { playdateKeys } from "@/lib/api/playdates";
import { EventChatCard } from "@/components/events/event-chat-card";
import { HostEventDialog } from "@/components/events/host-event-dialog";
import { PlanPlaydateDialog } from "@/components/playdates/plan-playdate-dialog";
import { PlaydateCard } from "@/components/playdates/playdate-card";
import { formatDayDivider, sameDay } from "@/lib/utils/dates";
import { useChatChannel } from "@/hooks/use-chat-channel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageBubble } from "./message-bubble";
import { MessageInput } from "./message-input";
import { ReportDialog } from "./report-dialog";

type Pages = InfiniteData<Message[], string | undefined>;

// Insert or replace a message in the cached pages (newest first), ignoring
// the echo of a message we already added after sending.
function upsert(data: Pages | undefined, message: Message): Pages | undefined {
  if (!data) return data;
  let found = false;
  const pages = data.pages.map((page) =>
    page.map((m) => {
      if (m.id !== message.id) return m;
      found = true;
      return message;
    }),
  );
  if (!found) pages[0] = [message, ...(pages[0] ?? [])];
  return { ...data, pages };
}

export function ChatRoom() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const scroller = useRef<HTMLDivElement>(null);
  const stickToBottom = useRef(true);
  const [reporting, setReporting] = useState<{ type: "message" | "profile"; id: string } | null>(null);
  const [planning, setPlanning] = useState(false);
  const { data: me } = useSharedQuery({ queryKey: meKey, queryFn: fetchMe });

  const conversation = useQuery({
    queryKey: chatKeys.conversation(conversationId),
    queryFn: () => fetchConversation(conversationId),
  });
  const meId = conversation.data?.meId;
  const other = conversation.data?.other;
  const otherProfile = other?.profile;
  const group = conversation.data?.group ?? null;
  const memberNames = new Map(
    (conversation.data?.members ?? []).map((m) => [m.user_id, m.profile?.full_name ?? "Member"]),
  );

  const messages = useInfiniteQuery({
    queryKey: chatKeys.messages(conversationId),
    queryFn: ({ pageParam }) => fetchMessages(conversationId, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.length === MESSAGES_PAGE ? lastPage[lastPage.length - 1].created_at : undefined,
  });

  const readNow = useCallback(() => {
    void markRead(conversationId).then(() => queryClient.invalidateQueries({ queryKey: chatKeys.inbox }));
  }, [conversationId, queryClient]);

  const addMessage = useCallback(
    (message: Message) => {
      queryClient.setQueryData<Pages>(chatKeys.messages(conversationId), (data) => upsert(data, message));
    },
    [conversationId, queryClient],
  );

  const { typingUserId, onlineUserIds, notifyTyping } = useChatChannel({
    conversationId,
    meId,
    shareOnline: conversation.data?.me.profile?.show_online ?? false,
    onMessage: (message) => {
      addMessage(message);
      if (message.sender_id !== meId && document.visibilityState === "visible") readNow();
      // Accept, decline and cancel post a follow-up: refresh that playdate's card.
      if (message.type === "invite") {
        queryClient.invalidateQueries({ queryKey: playdateKeys.all });
        queryClient.invalidateQueries({ queryKey: eventKeys.all });
      }
    },
    onReadReceipt: (userId, lastReadAt) => {
      queryClient.setQueryData<Conversation>(chatKeys.conversation(conversationId), (data) =>
        data?.other && data.other.user_id === userId
          ? { ...data, other: { ...data.other, last_read_at: lastReadAt } }
          : data,
      );
    },
  });

  // Opening the chat (or coming back to the tab) marks it read.
  useEffect(() => {
    if (!meId) return;
    readNow();
    const onVisible = () => document.visibilityState === "visible" && readNow();
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [meId, readNow]);

  // Oldest first for display.
  const ordered = (messages.data?.pages.flat() ?? []).slice().reverse();

  // The first message about each playdate carries its card; later ones
  // (accepted, cancelled) render as short notes.
  const cardMessageIds = new Set<string>();
  const seenEvents = new Set<string>();
  for (const message of ordered) {
    const eventId = (message.metadata as { event_id?: string } | null)?.event_id;
    if (message.type === "invite" && eventId && !seenEvents.has(eventId)) {
      seenEvents.add(eventId);
      cardMessageIds.add(message.id);
    }
  }

  // Follow new messages when the member is already at the bottom.
  useLayoutEffect(() => {
    const el = scroller.current;
    if (el && stickToBottom.current) el.scrollTop = el.scrollHeight;
  }, [ordered.length, typingUserId]);

  // Show my own message right away; the Realtime echo is de-duplicated.
  async function send(task: () => Promise<Message>) {
    const message = await task();
    stickToBottom.current = true;
    addMessage(message);
  }

  const mute = useMutation({
    mutationFn: (muted: boolean) => setMuted(conversationId, meId!, muted),
    onSuccess: (_, muted) => {
      toast.success(muted ? "Chat muted" : "Chat unmuted");
      queryClient.invalidateQueries({ queryKey: chatKeys.conversation(conversationId) });
      queryClient.invalidateQueries({ queryKey: chatKeys.inbox });
    },
    onError: (error) => toast.error(error.message),
  });

  const block = useMutation({
    mutationFn: () => blockUser(other!.user_id),
    onSuccess: () => {
      toast.success(`${otherProfile?.full_name ?? "Member"} is blocked`);
      queryClient.invalidateQueries({ queryKey: chatKeys.inbox });
      queryClient.invalidateQueries({ queryKey: connectionKeys.all });
      router.replace("/chat");
    },
    onError: (error) => toast.error(error.message),
  });

  if (conversation.error) {
    return (
      <div className="grid gap-3 py-16 text-center">
        <p className="text-destructive">{conversation.error.message}</p>
        <Link href="/chat" className="text-primary underline underline-offset-4">
          Back to chats
        </Link>
      </div>
    );
  }

  const name = group?.name ?? otherProfile?.full_name ?? "Pawmates member";
  const muted = conversation.data?.me.muted ?? false;
  const typingName = typingUserId && typingUserId !== meId ? memberNames.get(typingUserId)?.split(" ")[0] : null;
  const status = group
    ? typingName
      ? `${typingName} is typing…`
      : `${group.member_count} member${group.member_count === 1 ? "" : "s"}`
    : typingUserId === other?.user_id
      ? "typing…"
      : other && otherProfile?.show_online && onlineUserIds.includes(other.user_id)
        ? "online"
        : otherProfile?.area_name ?? "";

  return (
    // Fills the screen between the app header and the mobile tab bar.
    <div className="-mt-6 -mb-24 flex h-[calc(100dvh-3.5rem-4rem)] flex-col md:-mb-10 md:h-[calc(100dvh-3.5rem)]">
      <header className="flex items-center gap-3 border-b py-2">
        <Link href="/chat" aria-label="Back to chats" className="rounded-full p-2 hover:bg-muted">
          <ArrowLeft className="size-5" />
        </Link>
        <Avatar size="lg">
          {otherProfile?.avatar_url && <AvatarImage src={otherProfile.avatar_url} alt="" />}
          <AvatarFallback>{group ? <Users className="size-5 text-teal" aria-hidden /> : (name[0] ?? <UserRound className="size-4" />)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          {conversation.isPending ? (
            <Skeleton className="h-5 w-32" />
          ) : group ? (
            <Link href={`/groups/${group.id}`} className="block truncate font-semibold hover:underline">{name}</Link>
          ) : (
            <p className="truncate font-semibold">{name}</p>
          )}
          <p className={`truncate text-xs ${status === "online" || status.endsWith("typing…") ? "text-teal" : "text-muted-foreground"}`}>
            {status}
          </p>
        </div>
        {group && (
          <DropdownMenu>
            <DropdownMenuTrigger aria-label="Chat options" className="rounded-full p-2 outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50">
              <EllipsisVertical className="size-5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem render={<Link href={`/groups/${group.id}`} />}>
                <Users aria-hidden /> Group info & events
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => mute.mutate(!muted)}>
                {muted ? <Bell aria-hidden /> : <BellOff aria-hidden />} {muted ? "Unmute" : "Mute"} chat
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        {other && (
          <DropdownMenu>
            <DropdownMenuTrigger aria-label="Chat options" className="rounded-full p-2 outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50">
              <EllipsisVertical className="size-5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              {otherProfile?.username && (
                <DropdownMenuItem render={<Link href={`/u/${otherProfile.username}`} />}>
                  <UserRound aria-hidden /> View profile
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => mute.mutate(!muted)}>
                {muted ? <Bell aria-hidden /> : <BellOff aria-hidden />} {muted ? "Unmute" : "Mute"} chat
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setReporting({ type: "profile", id: other.user_id })}>
                <Flag aria-hidden /> Report {name.split(" ")[0]}
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => {
                  if (window.confirm(`Block ${name}? They won't be able to message you or see your pets.`)) {
                    block.mutate();
                  }
                }}
              >
                <Ban aria-hidden /> Block
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </header>

      <div
        ref={scroller}
        className="flex-1 overflow-y-auto py-4"
        onScroll={(event) => {
          const el = event.currentTarget;
          stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
        }}
        aria-live="polite"
      >
        {messages.hasNextPage ? (
          <div className="mb-4 text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                stickToBottom.current = false;
                void messages.fetchNextPage();
              }}
              disabled={messages.isFetchingNextPage}
            >
              {messages.isFetchingNextPage ? "Loading…" : "Load earlier messages"}
            </Button>
          </div>
        ) : (
          messages.isSuccess && <SafetyTip />
        )}

        {messages.isPending && <Skeleton className="mx-auto h-40 w-full max-w-md rounded-xl" />}

        <div className="grid gap-2">
          {ordered.map((message, index) => (
            <Fragment key={message.id}>
              {(index === 0 || !sameDay(ordered[index - 1].created_at, message.created_at)) && (
                <p className="my-2 text-center text-xs text-muted-foreground">{formatDayDivider(message.created_at)}</p>
              )}
              <MessageBubble
                message={message}
                mine={message.sender_id === meId}
                seen={!!other && other.last_read_at >= message.created_at}
                sender={group ? memberNames.get(message.sender_id) ?? "Former member" : undefined}
                inviteCard={
                  cardMessageIds.has(message.id) && group ? (
                    <EventChatCard eventId={(message.metadata as { event_id: string }).event_id} canManage={false} />
                  ) : cardMessageIds.has(message.id) ? (
                    <PlaydateCard
                      eventId={(message.metadata as { event_id: string }).event_id}
                      otherName={name.split(" ")[0]}
                    />
                  ) : undefined
                }
                onDelete={() => deleteMessage(message.id).catch((error) => toast.error(error.message))}
                onReport={() => setReporting({ type: "message", id: message.id })}
              />
            </Fragment>
          ))}
        </div>

        {typingUserId && typingUserId === other?.user_id && (
          <p className="mt-2 text-xs text-muted-foreground" aria-live="polite">
            {name.split(" ")[0]} is typing…
          </p>
        )}
      </div>

      <MessageInput
        disabled={!other && !group}
        onPlan={group || me?.pets.length ? () => setPlanning(true) : undefined}
        planLabel={group ? "Host an event" : "Plan a playdate"}
        onTyping={notifyTyping}
        onSendText={(body) => send(() => sendText(conversationId, body))}
        onSendImage={(file) => send(() => sendImage(conversationId, file))}
        onSendLocation={async (lat, lng) => {
          const label = (await reverseGeocode({ lat, lng })) ?? "Meeting point";
          await send(() => sendLocation(conversationId, lat, lng, `Meet here: ${label}`));
        }}
      />

      <ReportDialog target={reporting} onClose={() => setReporting(null)} />

      {/* Mounted only while open: the planner reads the clock and runs place searches. */}
      {planning && me && group && (
        <HostEventDialog groupId={group.id} groupName={group.name} myPets={me.pets} onClose={() => setPlanning(false)} />
      )}
      {planning && me && !group && (
        <PlanPlaydateDialog
          conversationId={conversationId}
          otherName={name.split(" ")[0]}
          myPets={me.pets}
          onClose={() => setPlanning(false)}
        />
      )}
    </div>
  );
}

// Shown at the start of every conversation (plan: safety tips before the
// first playdate).
function SafetyTip() {
  return (
    <div className="mx-auto mb-4 flex max-w-md gap-2 rounded-xl bg-secondary p-3 text-xs text-secondary-foreground">
      <ShieldCheck className="size-4 shrink-0 text-teal" aria-hidden />
      <p>
        <span className="font-medium">Playdate safety:</span> meet in a public place, keep pets on a
        leash at first, watch their body language, and share exact spots only when you&apos;re ready.
      </p>
    </div>
  );
}
