"use client";

// Leaflet touches `window`, so import this file with next/dynamic and ssr: false.
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import { CircleMarker, MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";
import type { LatLng } from "@/lib/api/geocode";

// Bengaluru, a sensible default for the first launch city.
const DEFAULT_CENTER: LatLng = { lat: 12.9716, lng: 77.5946 };

export default function LocationPickerMap({
  value,
  onPick,
}: {
  value: LatLng | null;
  onPick: (point: LatLng) => void;
}) {
  const center = value ?? DEFAULT_CENTER;

  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={value ? 15 : 11}
      scrollWheelZoom={false}
      className="h-72 w-full rounded-xl border"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <PickOnClick onPick={onPick} />
      <FollowValue value={value} />
      {value && (
        <CircleMarker
          center={[value.lat, value.lng]}
          radius={11}
          pathOptions={{ color: "#0e3f4a", weight: 3, fillColor: "#ff5a4f", fillOpacity: 0.95 }}
        />
      )}
    </MapContainer>
  );
}

function PickOnClick({ onPick }: { onPick: (point: LatLng) => void }) {
  useMapEvents({
    click: (event) => onPick({ lat: event.latlng.lat, lng: event.latlng.lng }),
  });
  return null;
}

// Pan to the pin when it is set from outside the map (GPS or search).
function FollowValue({ value }: { value: LatLng | null }) {
  const map = useMap();
  useEffect(() => {
    if (value) map.setView([value.lat, value.lng], Math.max(map.getZoom(), 15));
  }, [map, value]);
  return null;
}
