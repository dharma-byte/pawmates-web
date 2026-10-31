import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database";

export type GroupKind = Database["public"]["Enums"]["group_kind"];
export type RsvpStatus = Database["public"]["Enums"]["rsvp_status"];
export type Species = Database["public"]["Enums"]["pet_species"];

export const GROUP_KINDS: { value: GroupKind; label: string; hint: string }[] = [
  { value: "area", label: "Neighbourhood", hint: "Walks and meetups near home" },
  { value: "breed", label: "Breed club", hint: "Owners of one breed" },
  { value: "interest", label: "Interest", hint: "Training, adoption, rescue dogs…" },
];

export const groupKeys = {
  all: ["groups"] as const,
  find: (search: string, kind: GroupKind | null) => ["groups", "find", search, kind] as const,
  detail: (id: string) => ["groups", "detail", id] as const,
  members: (id: string) => ["groups", "members", id] as const,
};

export const eventKeys = {
  all: ["events"] as const,
  upcoming: (groupId: string | null) => ["events", "upcoming", groupId] as const,
  detail: (id: string) => ["events", "detail", id] as const,
};

function friendly(error: { code?: string; message: string }) {
  if (error.code === "23505") return new Error("A group with that name already exists. Try another name.");
  if (error.code === "23514") return new Error("Check the group details: breed clubs need a breed.");
  return new Error(error.message);
}

// My groups first, then groups nearby.
export async function findGroups(search: string, kind: GroupKind | null) {
  const { data, error } = await createClient().rpc("find_groups", {
    search: search || undefined,
    kind_filter: kind ?? undefined,
    radius_km: 50,
  });
  if (error) throw error;
  return data;
}

export type GroupSummary = Awaited<ReturnType<typeof findGroups>>[number];

// One group, my role in it and (for members) its chat.
export async function fetchGroup(groupId: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const [group, membership, chat] = await Promise.all([
    supabase
      .from("groups")
      .select("id, name, description, kind, species, breed, area_name, created_by, member_count, created_at")
      .eq("id", groupId)
      .maybeSingle(),
    supabase.from("group_members").select("role").eq("group_id", groupId).eq("user_id", user?.id ?? "").maybeSingle(),
    supabase.from("conversations").select("id").eq("type", "group").eq("group_id", groupId).maybeSingle(),
  ]);
  if (group.error) throw group.error;
  if (!group.data) return null;
  return { ...group.data, myRole: membership.data?.role ?? null, conversationId: chat.data?.id ?? null, meId: user?.id ?? null };
}

export type Group = NonNullable<Awaited<ReturnType<typeof fetchGroup>>>;

export async function fetchGroupMembers(groupId: string) {
  const { data, error } = await createClient()
    .from("group_members")
    .select("user_id, role, joined_at, profile:profiles (id, full_name, username, avatar_url, area_name)")
    .eq("group_id", groupId)
    .order("joined_at");
  if (error) throw error;
  const rank = { owner: 0, admin: 1, member: 2 } as Record<string, number>;
  return data.sort((a, b) => rank[a.role] - rank[b.role]);
}

export type GroupMember = Awaited<ReturnType<typeof fetchGroupMembers>>[number];

export async function createGroup(input: {
  name: string;
  kind: GroupKind;
  description: string;
  species: Species | null;
  breed: string;
}) {
  const { data, error } = await createClient().rpc("create_group", {
    name: input.name.trim(),
    kind: input.kind,
    description: input.description.trim() || undefined,
    species: input.species ?? undefined,
    breed: input.breed.trim() || undefined,
  });
  if (error) throw friendly(error);
  return data;
}

export async function updateGroup(groupId: string, name: string, description: string) {
  const { error } = await createClient().rpc("update_group", { g: groupId, name: name.trim(), description: description.trim() || undefined });
  if (error) throw friendly(error);
}

// Returns the group chat's id.
export async function joinGroup(groupId: string) {
  const { data, error } = await createClient().rpc("join_group", { g: groupId });
  if (error) throw new Error(error.message);
  return data;
}

export async function leaveGroup(groupId: string) {
  const { error } = await createClient().rpc("leave_group", { g: groupId });
  if (error) throw new Error(error.message);
}

export async function removeGroupMember(groupId: string, userId: string) {
  const { error } = await createClient().rpc("remove_group_member", { g: groupId, member: userId });
  if (error) throw new Error(error.message);
}

export async function setGroupAdmin(groupId: string, userId: string, makeAdmin: boolean) {
  const { error } = await createClient().rpc("set_group_admin", { g: groupId, member: userId, make_admin: makeAdmin });
  if (error) throw new Error(error.message);
}

export async function deleteGroup(groupId: string) {
  const { error } = await createClient().rpc("delete_group", { g: groupId });
  if (error) throw new Error(error.message);
}

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

// One group's upcoming events, or (no group) those in my groups and nearby.
export async function fetchUpcomingEvents(groupId: string | null) {
  const { data, error } = await createClient().rpc("upcoming_events", {
    group_filter: groupId ?? undefined,
    radius_km: 50,
  });
  if (error) throw error;
  return data;
}

export type GroupEvent = Awaited<ReturnType<typeof fetchUpcomingEvents>>[number];

// A single event, for its card in the group chat.
export async function fetchEvent(eventId: string) {
  const supabase = createClient();
  const { data: event, error } = await supabase
    .from("events")
    .select("id, type, group_id")
    .eq("id", eventId)
    .maybeSingle();
  if (error) throw error;
  if (!event?.group_id) return event ? { type: event.type, event: null } : null;
  const events = await fetchUpcomingEvents(event.group_id);
  return { type: event.type, event: events.find((e) => e.id === eventId) ?? null };
}

export async function createGroupEvent(input: {
  groupId: string;
  title: string;
  startsAt: Date;
  durationMinutes: number;
  lat: number;
  lng: number;
  placeName: string;
  address: string;
  description: string;
  capacity: number | null;
  petIds: string[];
}) {
  const { data, error } = await createClient().rpc("create_group_event", {
    g: input.groupId,
    title: input.title.trim(),
    starts_at: input.startsAt.toISOString(),
    duration_minutes: input.durationMinutes,
    lat: input.lat,
    lng: input.lng,
    place_name: input.placeName,
    address: input.address,
    description: input.description.trim() || undefined,
    capacity: input.capacity ?? undefined,
    my_pet_ids: input.petIds,
  });
  if (error) throw new Error(error.message);
  return data;
}

export async function rsvpEvent(eventId: string, answer: "going" | "maybe" | "not_going", petIds: string[]) {
  const { data, error } = await createClient().rpc("rsvp_event", { event: eventId, answer, my_pet_ids: petIds });
  if (error) throw new Error(error.message);
  return data;
}

export async function cancelEvent(eventId: string) {
  const { error } = await createClient().rpc("cancel_event", { event: eventId });
  if (error) throw new Error(error.message);
}

export async function fetchEventLocation(eventId: string) {
  const { data, error } = await createClient().rpc("event_location", { event: eventId });
  if (error) throw error;
  return data[0] ?? null;
}
