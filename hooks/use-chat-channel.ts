"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import type { Message } from "@/lib/api/chat";
import type { Notification } from "@/lib/api/notifications";

const TYPING_SHOWN_MS = 3000;
const TYPING_SEND_EVERY_MS = 2000;

// One private Realtime channel per open conversation (`chat:<id>`):
//   postgres_changes  new and edited messages, read receipts (RLS applies)
//   broadcast         typing, never stored
//   presence          who has the chat open right now
// Only conversation members may join; see the realtime.messages policies.
export function useChatChannel({
  conversationId,
  meId,
  shareOnline,
  onMessage,
  onReadReceipt,
}: {
  conversationId: string;
  meId: string | undefined;
  shareOnline: boolean;
  onMessage: (message: Message) => void;
  onReadReceipt: (userId: string, lastReadAt: string) => void;
}) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const lastTypingSent = useRef(0);
  const typingTimer = useRef<number | undefined>(undefined);
  const [typingUserId, setTypingUserId] = useState<string | null>(null);
  const [onlineUserIds, setOnlineUserIds] = useState<string[]>([]);

  // Keep the latest callbacks without resubscribing on every render.
  const handlers = useRef({ onMessage, onReadReceipt });
  useEffect(() => {
    handlers.current = { onMessage, onReadReceipt };
  });

  useEffect(() => {
    if (!meId) return;
    const supabase = createClient();
    let cancelled = false;

    const channel = supabase.channel(`chat:${conversationId}`, {
      config: { private: true, presence: { key: meId }, broadcast: { self: false } },
    });
    channelRef.current = channel;

    channel
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` },
        (payload) => handlers.current.onMessage(payload.new as Message),
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` },
        (payload) => handlers.current.onMessage(payload.new as Message),
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "conversation_members",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const row = payload.new as { user_id: string; last_read_at: string };
          handlers.current.onReadReceipt(row.user_id, row.last_read_at);
        },
      )
      .on("broadcast", { event: "typing" }, ({ payload }) => {
        if (payload?.userId === meId) return;
        setTypingUserId(payload?.userId ?? null);
        window.clearTimeout(typingTimer.current);
        typingTimer.current = window.setTimeout(() => setTypingUserId(null), TYPING_SHOWN_MS);
      })
      .on("presence", { event: "sync" }, () => {
        setOnlineUserIds(Object.keys(channel.presenceState()));
      });

    // Private channels need the member's access token before joining.
    supabase.realtime.setAuth().then(() => {
      if (cancelled) return;
      channel.subscribe(async (status) => {
        if (status === "SUBSCRIBED" && shareOnline) {
          await channel.track({ online_at: new Date().toISOString() });
        }
      });
    });

    return () => {
      cancelled = true;
      window.clearTimeout(typingTimer.current);
      channelRef.current = null;
      supabase.removeChannel(channel);
    };
  }, [conversationId, meId, shareOnline]);

  // Call on every keystroke; sends at most one typing signal every 2 seconds.
  const notifyTyping = useCallback(() => {
    const now = Date.now();
    if (now - lastTypingSent.current < TYPING_SEND_EVERY_MS) return;
    lastTypingSent.current = now;
    channelRef.current?.send({ type: "broadcast", event: "typing", payload: { userId: meId } });
  }, [meId]);

  return { typingUserId, onlineUserIds, notifyTyping };
}

// App-wide: refresh the inbox and unread badge whenever any of my
// conversations gets a message (RLS limits events to my conversations).
// New notifications arrive on the same channel.
export function useInboxRealtime(onChange: () => void, onNotification?: (notification: Notification) => void) {
  const handler = useRef(onChange);
  const notify = useRef(onNotification);
  useEffect(() => {
    handler.current = onChange;
    notify.current = onNotification;
  });

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("inbox")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, () => handler.current())
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "conversation_members" }, () =>
        handler.current(),
      )
      // RLS limits this to my own notifications.
      .on<Notification>("postgres_changes", { event: "INSERT", schema: "public", table: "notifications" }, (payload) =>
        notify.current?.(payload.new),
      );
    supabase.realtime.setAuth().then(() => channel.subscribe());
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
}
