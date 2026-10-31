"use client";

// Leaflet touches `window`, so import this file with next/dynamic and ssr: false.
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import { CircleMarker, MapContainer, Polyline, TileLayer, Tooltip, useMap } from "react-leaflet";
import type { LostReport } from "@/lib/api/lost";

const time = (iso: string) =>
  new Date(iso).toLocaleString(undefined, { weekday: "short", hour: "numeric", minute: "2-digit" });

// Last-seen spot (coral) and sightings (teal), joined oldest to newest so the
// trail shows which way the dog went.
export default function LostMap({ points }: { points: LostReport["points"] }) {
  const ordered = [...points].sort((a, b) => a.seen_at.localeCompare(b.seen_at));
  const first = ordered[0];
  if (!first) return null;

  return (
    <MapContainer center={[first.lat, first.lng]} zoom={15} scrollWheelZoom={false} className="h-80 w-full rounded-2xl border">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitAll points={ordered} />
      {ordered.length > 1 && (
        <Polyline positions={ordered.map((p) => [p.lat, p.lng])} pathOptions={{ color: "#19b5a5", weight: 2, dashArray: "6 6" }} />
      )}
      {ordered.map((point) => (
        <CircleMarker
          key={point.sighting_id ?? "last-seen"}
          center={[point.lat, point.lng]}
          radius={point.kind === "last_seen" ? 11 : 8}
          pathOptions={
            point.kind === "last_seen"
              ? { color: "#ffffff", weight: 3, fillColor: "#ff5a4f", fillOpacity: 1 }
              : { color: "#0e3f4a", weight: 2, fillColor: "#19b5a5", fillOpacity: 0.95 }
          }
        >
          <Tooltip>{point.kind === "last_seen" ? `Last seen · ${time(point.seen_at)}` : `Seen · ${time(point.seen_at)}`}</Tooltip>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}

function FitAll({ points }: { points: { lat: number; lng: number }[] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length > 1) map.fitBounds(points.map((p) => [p.lat, p.lng] as [number, number]), { padding: [40, 40], maxZoom: 16 });
  }, [map, points]);
  return null;
}
