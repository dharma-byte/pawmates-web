import { createClient } from "@/lib/supabase/client";

export const adminKeys = {
  isAdmin: ["admin", "is-admin"] as const,
  stats: ["admin", "stats"] as const,
  verifications: ["admin", "verifications"] as const,
};

export async function fetchIsAdmin() {
  const { data, error } = await createClient().rpc("am_i_admin");
  if (error) throw error;
  return data;
}

export async function fetchAdminStats() {
  const { data, error } = await createClient().rpc("admin_stats").single();
  if (error) throw error;
  return data;
}

export type PendingVerification = Awaited<ReturnType<typeof fetchPendingVerifications>>[number];

// Pending requests, oldest first, with the applicant's profile, pets and
// short-lived signed URLs for the two private verification photos.
export async function fetchPendingVerifications() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("verifications")
    .select(
      `id, created_at, profile_photo_path, pet_photo_path,
       applicant:profiles!verifications_user_id_fkey (
         id, full_name, username, avatar_url, area_name, bio,
         pets ( id, name, species, breed, photos )
       )`,
    )
    .eq("status", "pending")
    .order("created_at", { ascending: true })
    .limit(50);
  if (error) throw error;

  const paths = data.flatMap((request) => [request.profile_photo_path, request.pet_photo_path]);
  const signed = new Map<string, string>();
  if (paths.length > 0) {
    const { data: urls, error: urlError } = await supabase.storage
      .from("verification-photos")
      .createSignedUrls(paths, 60 * 10);
    if (urlError) throw urlError;
    urls.forEach((url) => {
      if (url.path && url.signedUrl) signed.set(url.path, url.signedUrl);
    });
  }

  return data.map((request) => ({
    ...request,
    profilePhotoUrl: signed.get(request.profile_photo_path) ?? null,
    petPhotoUrl: signed.get(request.pet_photo_path) ?? null,
  }));
}

export type ReviewDecision = "approved" | "rejected" | "needs_info";

export async function reviewVerification(requestId: string, decision: ReviewDecision, notes: string) {
  const { error } = await createClient().rpc("review_verification", {
    request_id: requestId,
    decision,
    review_notes: notes || undefined,
  });
  if (error) throw error;
}
