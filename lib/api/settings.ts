import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database";

export type MessagePrivacy = Database["public"]["Enums"]["message_privacy"];

export const settingsKeys = {
  mine: ["settings", "mine"] as const,
  blocked: ["settings", "blocked"] as const,
};

export async function fetchMySettings() {
  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) throw error ?? new Error("Not signed in");

  const [profile, pets] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, username, bio, avatar_url, area_name, verification_status, message_privacy, show_area, show_online")
      .eq("id", user.id)
      .single(),
    supabase.from("pets").select("*").eq("owner_id", user.id).order("created_at", { ascending: true }),
  ]);
  if (profile.error) throw profile.error;
  if (pets.error) throw pets.error;
  return { userId: user.id, email: user.email ?? "", profile: profile.data, pets: pets.data };
}

export type MySettings = Awaited<ReturnType<typeof fetchMySettings>>;

export async function updatePrivacy(
  userId: string,
  changes: Partial<{ message_privacy: MessagePrivacy; show_area: boolean; show_online: boolean }>,
) {
  const { error } = await createClient().from("profiles").update(changes).eq("id", userId);
  if (error) throw new Error(error.message);
}

export async function deletePet(petId: string) {
  const { error } = await createClient().from("pets").delete().eq("id", petId);
  if (error) throw new Error(error.message);
}

export async function fetchBlocked() {
  const { data, error } = await createClient().rpc("my_blocked_users");
  if (error) throw error;
  return data;
}

export async function unblock(userId: string) {
  const { error } = await createClient().from("blocks").delete().eq("blocked_id", userId);
  if (error) throw new Error(error.message);
}

// Downloads everything Pawmates holds about the member as a JSON file.
export async function downloadMyData() {
  const { data, error } = await createClient().rpc("export_my_data");
  if (error) throw new Error(error.message);
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `pawmates-data-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

// Removes the member's photos, then the account and all its data.
// Photos shared inside chats stay with the conversation's other member
// until that conversation is removed.
export async function deleteMyAccount(userId: string) {
  const supabase = createClient();
  for (const bucket of ["avatars", "pet-photos", "verification-photos"]) {
    const { data: files } = await supabase.storage.from(bucket).list(userId, { limit: 1000 });
    if (files && files.length > 0) {
      await supabase.storage.from(bucket).remove(files.map((file) => `${userId}/${file.name}`));
    }
  }
  const { error } = await supabase.rpc("delete_my_account");
  if (error) throw new Error(error.message);
  await supabase.auth.signOut();
}
