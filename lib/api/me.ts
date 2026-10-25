import { createClient } from "@/lib/supabase/client";

export const meKey = ["me"] as const;

export type Me = Awaited<ReturnType<typeof fetchMe>>;

// The signed-in member, their pets and whether they are an admin.
export async function fetchMe() {
  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) throw error ?? new Error("Not signed in");

  const [profile, pets, isAdmin] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, username, avatar_url, area_name, verification_status")
      .eq("id", user.id)
      .single(),
    supabase
      .from("pets")
      .select("id, name, species, breed, photos")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: true }),
    supabase.rpc("am_i_admin"),
  ]);
  if (profile.error) throw profile.error;
  if (pets.error) throw pets.error;

  return { ...profile.data, email: user.email ?? "", pets: pets.data, isAdmin: isAdmin.data === true };
}

export function firstName(fullName: string | null | undefined) {
  return fullName?.trim().split(/\s+/)[0] ?? "there";
}
