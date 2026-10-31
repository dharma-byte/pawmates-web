import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database";

export type Notification = Database["public"]["Tables"]["notifications"]["Row"];
export type NotificationType = Database["public"]["Enums"]["notification_type"];

export const notificationKeys = {
  all: ["notifications"] as const,
};

// The latest 30, newest first (older ones are cleared after 60 days).
export async function fetchNotifications() {
  const { data, error } = await createClient()
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(30);
  if (error) throw error;
  return data;
}

// No ids: mark everything read.
export async function markNotificationsRead(ids?: string[]) {
  const { error } = await createClient().rpc("mark_notifications_read", { ids });
  if (error) throw new Error(error.message);
}
