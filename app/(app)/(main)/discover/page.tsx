import type { Metadata } from "next";
import { Compass } from "lucide-react";
import { ComingSoon } from "@/components/layout/coming-soon";

export const metadata: Metadata = { title: "Discover" };

export default function DiscoverPage() {
  return (
    <ComingSoon
      icon={Compass}
      title="Discover"
      text="Browse verified pets near you with filters for size, energy and play style, then send a Sniff request."
    />
  );
}
