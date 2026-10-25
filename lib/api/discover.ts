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
