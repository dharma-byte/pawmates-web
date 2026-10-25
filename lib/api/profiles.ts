import { createClient } from "@/lib/supabase/client";

export const profileKeys = {
  byUsername: (username: string) => ["profile", "username", username] as const,
  pet: (id: string) => ["pet", id] as const,
  compatibility: (a: string, b: string) => ["pet", "compatibility", a, b] as const,
};

const PUBLIC_PROFILE =
  "id, full_name, username, avatar_url, bio, area_name, show_area, verification_status, verified_at, created_at";

// RLS returns nothing for unverified, banned or blocked members, so "not
// found" covers all of those without saying which.
export async function fetchProfileByUsername(username: string) {
  const supabase = createClient();
  const { data: profile, error } = await supabase
    .from("profiles")
    .select(PUBLIC_PROFILE)
    .eq("username", username.toLowerCase())
    .maybeSingle();
  if (error) throw error;
  if (!profile) return null;

  const { data: pets, error: petsError } = await supabase
    .from("pets")
    .select("*")
    .eq("owner_id", profile.id)
    .order("created_at", { ascending: true });
  if (petsError) throw petsError;

  return { ...profile, pets };
}

export type PublicProfile = NonNullable<Awaited<ReturnType<typeof fetchProfileByUsername>>>;

export async function fetchPet(id: string) {
  const { data, error } = await createClient()
    .from("pets")
    .select(`*, owner:profiles!pets_owner_id_fkey (${PUBLIC_PROFILE})`)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export type PetWithOwner = NonNullable<Awaited<ReturnType<typeof fetchPet>>>;

export async function fetchCompatibility(myPetId: string, theirPetId: string) {
  const { data, error } = await createClient().rpc("compatibility_score", {
    pet_a: myPetId,
    pet_b: theirPetId,
  });
  if (error) throw error;
  return data;
}

export function ageFrom(birthDate: string | null) {
  if (!birthDate) return null;
  const born = new Date(birthDate);
  const now = new Date();
  const months = (now.getFullYear() - born.getFullYear()) * 12 + now.getMonth() - born.getMonth() - (now.getDate() < born.getDate() ? 1 : 0);
  if (months < 12) return `${Math.max(months, 0)} month${months === 1 ? "" : "s"}`;
  const years = Math.floor(months / 12);
  return `${years} year${years === 1 ? "" : "s"}`;
}

export function memberSince(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: "long", year: "numeric" });
}
