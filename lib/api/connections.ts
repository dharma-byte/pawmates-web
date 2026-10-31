import { createClient } from "@/lib/supabase/client";

export const connectionKeys = {
  all: ["connections"] as const,
  mine: ["connections", "mine"] as const,
  detailed: ["connections", "detailed"] as const,
  friends: ["connections", "friends"] as const,
};

// How the signed-in member relates to another owner.
//   none      no request either way
//   sent      I sent a request (a decline also shows as sent, so nobody is
//             told they were declined)
//   received  they sent me a request I have not answered
//   pawmates  accepted
export type ConnectionState = "none" | "sent" | "received" | "pawmates";

export async function fetchMyConnections() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("connections")
    .select("id, requester_id, addressee_id, status");
  if (error) throw error;

  const byOwner = new Map<string, ConnectionState>();
  for (const connection of data) {
    const iSent = connection.requester_id === user?.id;
    const other = iSent ? connection.addressee_id : connection.requester_id;
    if (connection.status === "accepted") byOwner.set(other, "pawmates");
    else if (iSent) byOwner.set(other, "sent");
    else if (connection.status === "pending") byOwner.set(other, "received");
  }
  return byOwner;
}

export async function sendSniffRequest(input: {
  addresseeId: string;
  petId?: string;
  targetPetId?: string;
  message?: string;
}) {
  const { error } = await createClient().from("connections").insert({
    addressee_id: input.addresseeId,
    pet_id: input.petId ?? null,
    target_pet_id: input.targetPetId ?? null,
    message: input.message?.trim() || null,
  });
  if (!error) return;
  if (error.code === "23505") throw new Error("You already have a Sniff request with this owner.");
  throw new Error(error.message);
}

const PERSON = "id, full_name, username, avatar_url, area_name";
const PET = "id, name, species, breed, photos";

export type DetailedConnection = Awaited<ReturnType<typeof fetchDetailedConnections>>["incoming"][number];

// Requests page: incoming, sent and accepted, with people and pets attached.
export async function fetchDetailedConnections() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("connections")
    .select(
      `id, status, message, created_at, responded_at, requester_id, addressee_id,
       requester:profiles!connections_requester_id_fkey (${PERSON}),
       addressee:profiles!connections_addressee_id_fkey (${PERSON}),
       pet:pets!connections_pet_id_fkey (${PET}),
       target_pet:pets!connections_target_pet_id_fkey (${PET})`,
    )
    .order("created_at", { ascending: false });
  if (error) throw error;

  const withOther = data.map((connection) => {
    const iSent = connection.requester_id === user?.id;
    return { ...connection, iSent, other: iSent ? connection.addressee : connection.requester };
  });

  return {
    incoming: withOther.filter((c) => !c.iSent && c.status === "pending"),
    // Declined requests stay listed as "sent": senders are not told.
    sent: withOther.filter((c) => c.iSent && c.status !== "accepted"),
    pawmates: withOther.filter((c) => c.status === "accepted"),
  };
}

// Friends page: every Pawmate with all of their pets, newest friends first.
export async function fetchFriends() {
  const { pawmates } = await fetchDetailedConnections();
  const friends = pawmates
    .filter((c) => c.other)
    .map((c) => ({ connectionId: c.id, since: c.responded_at ?? c.created_at, person: c.other! }))
    .sort((a, b) => b.since.localeCompare(a.since));
  if (friends.length === 0) return [];

  const { data: pets, error } = await createClient()
    .from("pets")
    .select(`${PET}, owner_id`)
    .in("owner_id", friends.map((f) => f.person.id))
    .order("created_at");
  if (error) throw error;

  return friends.map((friend) => ({ ...friend, pets: pets.filter((p) => p.owner_id === friend.person.id) }));
}

export type Friend = Awaited<ReturnType<typeof fetchFriends>>[number];

export async function respondToSniff(connectionId: string, accept: boolean) {
  const { error } = await createClient().rpc("respond_to_sniff", {
    connection_id: connectionId,
    accept,
  });
  if (error) throw new Error(error.message);
}

// Cancels a pending request I sent, or removes a Pawmate.
export async function deleteConnection(connectionId: string) {
  const { error } = await createClient().from("connections").delete().eq("id", connectionId);
  if (error) throw new Error(error.message);
}
