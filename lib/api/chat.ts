import { createClient } from "@/lib/supabase/client";
import { uploadImage } from "@/lib/api/storage";
import type { Database } from "@/types/database";

export type Message = Database["public"]["Tables"]["messages"]["Row"];
export type ReportReason = Database["public"]["Enums"]["report_reason"];

export const MESSAGES_PAGE = 50;

export const chatKeys = {
  inbox: ["chat", "inbox"] as const,
  conversation: (id: string) => ["chat", "conversation", id] as const,
  messages: (id: string) => ["chat", "messages", id] as const,
  image: (path: string) => ["chat", "image", path] as const,
};

const PERSON = "id, full_name, username, avatar_url, area_name, show_online";

// Inbox rows plus the other person's profile for direct chats.
export async function fetchInbox() {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("get_my_conversations");
  if (error) throw error;

  const otherIds = data.map((c) => c.other_user_id).filter((id): id is string => !!id);
  const people = new Map<string, { full_name: string | null; username: string | null; avatar_url: string | null }>();
  if (otherIds.length > 0) {
    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select("id, full_name, username, avatar_url")
      .in("id", otherIds);
    if (profileError) throw profileError;
    profiles.forEach((p) => people.set(p.id, p));
  }

  return data.map((c) => ({ ...c, other: c.other_user_id ? people.get(c.other_user_id) ?? null : null }));
}

export type InboxItem = Awaited<ReturnType<typeof fetchInbox>>[number];

export async function fetchConversation(conversationId: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("conversation_members")
    .select(`user_id, last_read_at, muted, profile:profiles (${PERSON})`)
    .eq("conversation_id", conversationId);
  if (error) throw error;

  const me = data.find((m) => m.user_id === user?.id);
  if (!me) throw new Error("This conversation doesn't exist or you're not part of it.");
  const other = data.find((m) => m.user_id !== user?.id) ?? null;
  return { meId: me.user_id, me, other };
}

export type Conversation = Awaited<ReturnType<typeof fetchConversation>>;

// Newest first; `before` pages backwards through history.
export async function fetchMessages(conversationId: string, before?: string) {
  let query = createClient()
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: false })
    .limit(MESSAGES_PAGE);
  if (before) query = query.lt("created_at", before);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

function friendly(error: { code?: string; message: string }) {
  if (error.code === "42501") return new Error("You can't message this person right now.");
  return new Error(error.message);
}

export async function sendText(conversationId: string, body: string) {
  const { data, error } = await createClient()
    .from("messages")
    .insert({ conversation_id: conversationId, type: "text", body: body.trim() })
    .select()
    .single();
  if (error) throw friendly(error);
  return data;
}

// Chat photos go to the private bucket under the conversation's folder;
// attachment_url stores the storage path, shown through a signed URL.
export async function sendImage(conversationId: string, file: File) {
  const { path } = await uploadImage("chat-images", conversationId, file);
  const { data, error } = await createClient()
    .from("messages")
    .insert({ conversation_id: conversationId, type: "image", attachment_url: path })
    .select()
    .single();
  if (error) throw friendly(error);
  return data;
}

// The point is also kept in metadata so clients can read it as plain numbers.
export async function sendLocation(conversationId: string, lat: number, lng: number, label: string) {
  const { data, error } = await createClient()
    .from("messages")
    .insert({
      conversation_id: conversationId,
      type: "location",
      body: label,
      location: `POINT(${lng} ${lat})`,
      metadata: { lat, lng },
    })
    .select()
    .single();
  if (error) throw friendly(error);
  return data;
}

export async function deleteMessage(messageId: string) {
  const { error } = await createClient()
    .from("messages")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", messageId);
  if (error) throw friendly(error);
}

export async function markRead(conversationId: string) {
  await createClient().rpc("mark_conversation_read", { conv: conversationId });
}

export async function setMuted(conversationId: string, userId: string, muted: boolean) {
  const { error } = await createClient()
    .from("conversation_members")
    .update({ muted })
    .eq("conversation_id", conversationId)
    .eq("user_id", userId);
  if (error) throw friendly(error);
}

export async function openDirectChat(otherUserId: string) {
  const { data, error } = await createClient().rpc("get_or_create_direct_conversation", {
    other_user: otherUserId,
  });
  if (error) throw friendly(error);
  return data;
}

export async function signedImageUrl(path: string) {
  const { data, error } = await createClient()
    .storage.from("chat-images")
    .createSignedUrl(path, 60 * 60);
  if (error) throw error;
  return data.signedUrl;
}

export async function blockUser(userId: string) {
  const { error } = await createClient().from("blocks").insert({ blocked_id: userId });
  if (error && error.code !== "23505") throw friendly(error);
}

export async function reportContent(
  targetType: "message" | "profile" | "pet",
  targetId: string,
  reason: ReportReason,
  details: string,
) {
  const { error } = await createClient()
    .from("reports")
    .insert({ target_type: targetType, target_id: targetId, reason, details: details.trim() || null });
  if (error?.code === "23505") throw new Error("You've already reported this. Our team is on it.");
  if (error) throw new Error(error.message);
}

export function locationOf(message: Message) {
  const meta = message.metadata as { lat?: number; lng?: number } | null;
  return typeof meta?.lat === "number" && typeof meta?.lng === "number"
    ? { lat: meta.lat, lng: meta.lng }
    : null;
}
