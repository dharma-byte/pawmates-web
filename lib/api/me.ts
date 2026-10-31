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
      .select("id, full_name, username, avatar_url, bio, area_name, verification_status")
      .eq("id", user.id)
      .single(),
    supabase
      .from("pets")
      .select("id, name, species, breed, photos, likes, good_with_cats, good_with_kids")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: true }),
    supabase.rpc("am_i_admin"),
  ]);
  if (profile.error) throw profile.error;
  if (pets.error) throw pets.error;

  return { ...profile.data, email: user.email ?? "", pets: pets.data, isAdmin: isAdmin.data === true };
}

// Profile strength: things that help other owners say yes to a Sniff request.
export function profileChecklist(me: Me) {
  const pet = me.pets[0];
  return [
    { label: "Add a profile photo", done: !!me.avatar_url, href: "/settings?tab=profile" },
    { label: "Write a short bio", done: !!me.bio, href: "/settings?tab=profile" },
    { label: `Add 3+ photos of ${pet?.name ?? "your pet"}`, done: (pet?.photos.length ?? 0) >= 3, href: "/settings?tab=pets" },
    { label: `Add what ${pet?.name ?? "your pet"} loves`, done: (pet?.likes.length ?? 0) > 0, href: "/settings?tab=pets" },
    {
      label: `Say who ${pet?.name ?? "your pet"} is good with`,
      done: pet?.good_with_cats != null || pet?.good_with_kids != null,
      href: "/settings?tab=pets",
    },
  ];
}

export function firstName(fullName: string | null | undefined) {
  return fullName?.trim().split(/\s+/)[0] ?? "there";
}
