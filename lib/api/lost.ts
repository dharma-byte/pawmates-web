import { createClient } from "@/lib/supabase/client";

export const lostKeys = {
  all: ["lost"] as const,
  nearby: ["lost", "nearby"] as const,
  detail: (id: string) => ["lost", "detail", id] as const,
};

export const ALERT_RADII = [
  { value: "2", label: "2 km" },
  { value: "5", label: "5 km" },
  { value: "10", label: "10 km" },
];

// Lost (and recently found) pets near me, plus my own reports.
export async function fetchLostNearby() {
  const { data, error } = await createClient().rpc("lost_pets_nearby", { radius_km: 15 });
  if (error) throw error;
  return data;
}

export type LostSummary = Awaited<ReturnType<typeof fetchLostNearby>>[number];

const PERSON = "id, full_name, username, avatar_url";

// One report with its pet, owner, sightings and map points. Null if hidden.
export async function fetchLostReport(reportId: string) {
  const supabase = createClient();
  const [report, sightings, points] = await Promise.all([
    supabase
      .from("lost_reports")
      .select(
        `id, owner_id, status, last_seen_at, last_seen_place, description, alert_radius_km, found_at, created_at,
         pet:pets (id, name, species, breed, photos, size, temperament),
         owner:profiles!lost_reports_owner_id_fkey (${PERSON})`,
      )
      .eq("id", reportId)
      .maybeSingle(),
    supabase
      .from("lost_sightings")
      .select(`id, reporter_id, seen_at, place, note, created_at, reporter:profiles!lost_sightings_reporter_id_fkey (${PERSON})`)
      .eq("report_id", reportId)
      .order("seen_at", { ascending: false }),
    supabase.rpc("lost_report_points", { report: reportId }),
  ]);
  if (report.error) throw report.error;
  if (sightings.error) throw sightings.error;
  if (points.error) throw points.error;
  if (!report.data) return null;
  return { ...report.data, sightings: sightings.data, points: points.data };
}

export type LostReport = NonNullable<Awaited<ReturnType<typeof fetchLostReport>>>;

export async function reportLostPet(input: {
  petId: string;
  lastSeenAt: Date;
  lat: number;
  lng: number;
  place: string;
  description: string;
  radiusKm: number;
}) {
  const { data, error } = await createClient().rpc("report_lost_pet", {
    pet: input.petId,
    last_seen_at: input.lastSeenAt.toISOString(),
    lat: input.lat,
    lng: input.lng,
    last_seen_place: input.place,
    description: input.description.trim() || undefined,
    alert_radius_km: input.radiusKm,
  });
  if (error) throw new Error(error.message);
  return data;
}

export async function addSighting(input: { reportId: string; seenAt: Date; lat: number; lng: number; place: string; note: string }) {
  const { error } = await createClient().rpc("add_lost_sighting", {
    report: input.reportId,
    seen_at: input.seenAt.toISOString(),
    lat: input.lat,
    lng: input.lng,
    place: input.place.trim() || undefined,
    note: input.note.trim() || undefined,
  });
  if (error) throw new Error(error.message);
}

// found: the pet is home. Otherwise the report is just closed.
export async function closeLostReport(reportId: string, found: boolean) {
  const { error } = await createClient().rpc("close_lost_report", { report: reportId, found_home: found });
  if (error) throw new Error(error.message);
}
