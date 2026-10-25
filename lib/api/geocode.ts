// OpenStreetMap Nominatim, called directly from the browser on explicit user
// actions only (tap the map, press search), to respect its ~1 request/second
// policy. TODO: move behind the backend `geocode` Edge Function with caching
// before the public beta.
const NOMINATIM = "https://nominatim.openstreetmap.org";

export type LatLng = { lat: number; lng: number };
export type Place = LatLng & { label: string; areaName: string };

type NominatimAddress = Partial<
  Record<"suburb" | "neighbourhood" | "city_district" | "quarter" | "city" | "town" | "village" | "county" | "state", string>
>;

function areaNameFrom(address: NominatimAddress | undefined, fallback: string) {
  if (!address) return fallback;
  const local = address.suburb ?? address.neighbourhood ?? address.quarter ?? address.city_district;
  const city = address.city ?? address.town ?? address.village ?? address.county ?? address.state;
  return [local, city].filter(Boolean).join(", ") || fallback;
}

export async function reverseGeocode({ lat, lng }: LatLng): Promise<string | null> {
  const url = `${NOMINATIM}/reverse?format=jsonv2&zoom=16&addressdetails=1&lat=${lat}&lon=${lng}`;
  const response = await fetch(url, { headers: { "Accept-Language": "en" } });
  if (!response.ok) return null;
  const data = await response.json();
  return areaNameFrom(data.address, data.name ?? null);
}

export async function searchPlaces(query: string): Promise<Place[]> {
  const url = `${NOMINATIM}/search?format=jsonv2&addressdetails=1&limit=5&q=${encodeURIComponent(query)}`;
  const response = await fetch(url, { headers: { "Accept-Language": "en" } });
  if (!response.ok) return [];
  const results: { lat: string; lon: string; display_name: string; address?: NominatimAddress }[] =
    await response.json();
  return results.map((result) => ({
    lat: Number(result.lat),
    lng: Number(result.lon),
    label: result.display_name,
    areaName: areaNameFrom(result.address, result.display_name.split(",")[0]),
  }));
}
