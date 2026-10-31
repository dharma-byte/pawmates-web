import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database";

type NearbyArgs = Database["public"]["Functions"]["nearby_pets"]["Args"];
export type NearbyPet = Database["public"]["Functions"]["nearby_pets"]["Returns"][number];

export const discoverKeys = {
  nearby: (args: NearbyArgs) => ["discover", "nearby", args] as const,
};

export async function fetchNearbyPets(args: NearbyArgs) {
  const { data, error } = await createClient().rpc("nearby_pets", args);
  if (error) throw error;
  return data;
}

// The member's own saved location (only ever theirs), to centre the map.
export async function fetchMyLocation() {
  const { data, error } = await createClient().rpc("get_my_location");
  if (error) throw error;
  const row = data?.[0];
  return row ? { lat: row.lat, lng: row.lng } : null;
}

export type MatchBreakdown = {
  size: { points: number; max: number };
  energy: { points: number; max: number };
  play_style: { points: number; max: number };
  temperament: { points: number; max: number };
  multiplier: number;
  notes: string[];
  total: number;
};

export const matchKeys = {
  breakdown: (mine: string, theirs: string) => ["match", "breakdown", mine, theirs] as const,
};

// Why two pets match: the same calculation as the score, part by part.
export async function fetchMatchBreakdown(myPetId: string, theirPetId: string) {
  const { data, error } = await createClient().rpc("compatibility_breakdown", {
    pet_a: myPetId,
    pet_b: theirPetId,
  });
  if (error) throw error;
  return data as unknown as MatchBreakdown | null;
}

export function formatDistance(km: number | null) {
  if (km === null) return null;
  return km <= 1 ? "under 1 km away" : `about ${km} km away`;
}

export function formatAge(months: number | null) {
  if (months === null) return null;
  if (months < 12) return `${months} mo`;
  const years = Math.floor(months / 12);
  return `${years} yr${years === 1 ? "" : "s"}`;
}
