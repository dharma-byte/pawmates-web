import { createClient } from "@/lib/supabase/client";

export const onboardingKey = ["onboarding"] as const;

export type OnboardingStep = "profile" | "pet" | "location" | "verification" | "pending" | "done";

export type OnboardingState = Awaited<ReturnType<typeof fetchOnboardingState>>;

// Everything onboarding needs, in one round of queries. The current step is
// derived from what is already saved, so users resume where they left off.
export async function fetchOnboardingState() {
  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) throw userError ?? new Error("Not signed in");

  const [profileResult, petsResult, verificationResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, username, full_name, avatar_url, bio, area_name, public_location, verification_status")
      .eq("id", user.id)
      .single(),
    supabase.from("pets").select("id", { count: "exact", head: true }).eq("owner_id", user.id),
    supabase
      .from("verifications")
      .select("status, notes, created_at")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (profileResult.error) throw profileResult.error;
  if (petsResult.error) throw petsResult.error;
  if (verificationResult.error) throw verificationResult.error;

  const profile = profileResult.data;
  const petCount = petsResult.count ?? 0;
  const lastVerification = verificationResult.data;

  let step: OnboardingStep;
  if (!profile.username || !profile.full_name || !profile.avatar_url) step = "profile";
  else if (petCount === 0) step = "pet";
  else if (!profile.public_location) step = "location";
  else if (profile.verification_status === "pending") step = "pending";
  else if (profile.verification_status === "verified") step = "done";
  else step = "verification";

  return { userId: user.id, email: user.email ?? "", profile, petCount, lastVerification, step };
}
