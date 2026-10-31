"use client";

// Leaflet touches `window`, so import this file with next/dynamic and ssr: false.
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { Circle, CircleMarker, MapContainer, Popup, TileLayer, Tooltip } from "react-leaflet";
import type { NearbyPet } from "@/lib/api/discover";

type OwnerPin = { ownerId: string; lat: number; lng: number; pets: NearbyPet[] };

// Pets pinned at each owner's FUZZED public point (500 m to 1 km from home),
// grouped per owner. The circle shows the search radius.
export default function DiscoverMap({
  pets,
  center,
  radiusKm,
}: {
  pets: NearbyPet[];
  center: { lat: number; lng: number };
  radiusKm: number;
}) {
  const pins = new Map<string, OwnerPin>();
  for (const pet of pets) {
    if (pet.approx_lat == null || pet.approx_lng == null) continue;
    const pin = pins.get(pet.owner_id) ?? { ownerId: pet.owner_id, lat: pet.approx_lat, lng: pet.approx_lng, pets: [] };
    pin.pets.push(pet);
    pins.set(pet.owner_id, pin);
  }

  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={radiusKm <= 1 ? 15 : radiusKm <= 5 ? 13 : radiusKm <= 10 ? 12 : 11}
      scrollWheelZoom
      className="h-[60dvh] min-h-96 w-full rounded-2xl border"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Circle
        center={[center.lat, center.lng]}
        radius={radiusKm * 1000}
        pathOptions={{ color: "#0b7a75", weight: 1.5, fillColor: "#19b5a5", fillOpacity: 0.06 }}
      />
      <CircleMarker
        center={[center.lat, center.lng]}
        radius={7}
        pathOptions={{ color: "#ffffff", weight: 3, fillColor: "#0e3f4a", fillOpacity: 1 }}
      >
        <Tooltip>You (approximate)</Tooltip>
      </CircleMarker>
      {[...pins.values()].map((pin) => (
        <CircleMarker
          key={pin.ownerId}
          center={[pin.lat, pin.lng]}
          radius={11}
          pathOptions={{ color: "#0e3f4a", weight: 2, fillColor: "#ff5a4f", fillOpacity: 0.9 }}
        >
          <Tooltip direction="top" offset={[0, -10]} permanent>
            {pin.pets.map((p) => p.name).join(", ")}
          </Tooltip>
          <Popup>
            <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 6 }}>
              {pin.pets.map((pet) => (
                <li key={pet.pet_id}>
                  <Link href={`/pets/${pet.pet_id}`} style={{ fontWeight: 600 }}>
                    {pet.name}
                  </Link>
                  <span style={{ color: "#52696e" }}>
                    {" "}· {pet.breed ?? pet.species}
                    {pet.compatibility != null ? ` · ${pet.compatibility}% match` : ""}
                  </span>
                </li>
              ))}
            </ul>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
