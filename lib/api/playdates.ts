import { createClient } from "@/lib/supabase/client";

export const playdateKeys = {
  all: ["playdate"] as const,
  detail: (id: string) => ["playdate", id] as const,
  midpoint: (conversationId: string) => ["playdate", "midpoint", conversationId] as const,
  spots: (lat: number, lng: number) => ["playdate", "spots", lat.toFixed(3), lng.toFixed(3)] as const,
  pendingReviews: ["playdate", "pending-reviews"] as const,
  playmate: (petId: string) => ["playdate", "playmate", petId] as const,
};

// A playdate with its attendees and meeting point. Null if not visible.
export async function fetchPlaydate(eventId: string) {
  const supabase = createClient();
  const [event, attendees, location] = await Promise.all([
    supabase
      .from("events")
      .select("id, host_id, conversation_id, status, title, description, starts_at, ends_at, address, place_name")
      .eq("id", eventId)
      .maybeSingle(),
    supabase.from("event_attendees").select("user_id, status, pet_ids").eq("event_id", eventId),
    supabase.rpc("event_location", { event: eventId }),
  ]);
  if (event.error) throw event.error;
  if (attendees.error) throw attendees.error;
  if (!event.data) return null;
  const point = location.data?.[0];
  return { ...event.data, attendees: attendees.data, lat: point?.lat ?? null, lng: point?.lng ?? null };
}

export type Playdate = NonNullable<Awaited<ReturnType<typeof fetchPlaydate>>>;

export async function createPlaydate(input: {
  conversationId: string;
  startsAt: Date;
  durationMinutes: number;
  lat: number;
  lng: number;
  placeName: string;
  address: string;
  note: string;
  petIds: string[];
}) {
  const { data, error } = await createClient().rpc("create_playdate", {
    conv: input.conversationId,
    starts_at: input.startsAt.toISOString(),
    duration_minutes: input.durationMinutes,
    lat: input.lat,
    lng: input.lng,
    place_name: input.placeName,
    address: input.address,
    note: input.note || undefined,
    my_pet_ids: input.petIds,
  });
  if (error) throw new Error(error.message);
  return data;
}

export async function respondToPlaydate(eventId: string, accept: boolean, petIds: string[]) {
  const { error } = await createClient().rpc("respond_to_playdate", { event: eventId, accept, my_pet_ids: petIds });
  if (error) throw new Error(error.message);
}

export async function cancelPlaydate(eventId: string) {
  const { error } = await createClient().rpc("cancel_playdate", { event: eventId });
  if (error) throw new Error(error.message);
}

export async function reviewPlaydate(eventId: string, petId: string, rating: number, comment: string) {
  const { error } = await createClient().rpc("review_playdate", {
    event: eventId,
    pet: petId,
    rating,
    comment: comment || undefined,
  });
  if (error?.code === "23505") throw new Error("You've already reviewed this pet for this playdate.");
  if (error) throw new Error(error.message);
}

export async function fetchPendingReviews() {
  const { data, error } = await createClient().rpc("my_pending_reviews");
  if (error) throw error;
  return data;
}

export async function fetchPlaymateStats(petId: string) {
  const { data, error } = await createClient().rpc("pet_playmate_stats", { pet: petId });
  if (error) throw error;
  return data[0] ?? null;
}

export async function fetchMidpoint(conversationId: string) {
  const { data, error } = await createClient().rpc("playdate_midpoint", { conv: conversationId });
  if (error) throw error;
  return data[0] ?? null;
}

export type Spot = { name: string; kind: "dog park" | "park"; lat: number; lng: number };

// Named parks and dog parks within 2.5 km, from OpenStreetMap (Overpass API).
// Called only when someone opens the planner.
export async function suggestSpots(lat: number, lng: number): Promise<Spot[]> {
  const query = `[out:json][timeout:10];(nwr["leisure"="dog_park"](around:2500,${lat},${lng});nwr["leisure"="park"]["name"](around:2500,${lat},${lng}););out center 30;`;
  const response = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    body: new URLSearchParams({ data: query }),
  });
  if (!response.ok) return [];
  const json: {
    elements: { lat?: number; lon?: number; center?: { lat: number; lon: number }; tags?: Record<string, string> }[];
  } = await response.json();

  const spots = json.elements
    .map((el) => {
      const point = el.center ?? (el.lat != null && el.lon != null ? { lat: el.lat, lon: el.lon } : null);
      const name = el.tags?.name;
      if (!point || !name) return null;
      const kind: Spot["kind"] = el.tags?.leisure === "dog_park" ? "dog park" : "park";
      return { name, kind, lat: point.lat, lng: point.lon };
    })
    .filter((spot): spot is Spot => spot !== null);

  // Dog parks first, then the nearest parks; one entry per name.
  const seen = new Set<string>();
  return spots
    .sort((a, b) => (a.kind === b.kind ? distance(a, lat, lng) - distance(b, lat, lng) : a.kind === "dog park" ? -1 : 1))
    .filter((spot) => !seen.has(spot.name) && seen.add(spot.name))
    .slice(0, 6);
}

function distance(spot: Spot, lat: number, lng: number) {
  return (spot.lat - lat) ** 2 + (spot.lng - lng) ** 2;
}

// .ics file so the playdate lands in Google Calendar, Apple Calendar or Outlook.
export function downloadIcs(
  playdate: Pick<Playdate, "id" | "title" | "starts_at" | "ends_at" | "address" | "description"> & {
    lat?: number | null;
    lng?: number | null;
  },
) {
  const stamp = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const escape = (text: string) => text.replace(/[\\,;]/g, (c) => `\\${c}`).replace(/\n/g, "\\n");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Pawmates//Playdates//EN",
    "BEGIN:VEVENT",
    `UID:${playdate.id}@pawmates`,
    `DTSTAMP:${stamp(new Date().toISOString())}`,
    `DTSTART:${stamp(playdate.starts_at)}`,
    `DTEND:${stamp(playdate.ends_at)}`,
    `SUMMARY:${escape(playdate.title)}`,
    `LOCATION:${escape(playdate.address)}`,
    playdate.lat != null ? `GEO:${playdate.lat};${playdate.lng}` : "",
    playdate.description ? `DESCRIPTION:${escape(playdate.description)}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean);
  const url = URL.createObjectURL(new Blob([lines.join("\r\n")], { type: "text/calendar" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "pawmates-playdate.ics";
  link.click();
  URL.revokeObjectURL(url);
}

export function directionsUrl(lat: number, lng: number) {
  return `https://www.openstreetmap.org/directions?to=${lat}%2C${lng}#map=17/${lat}/${lng}`;
}
