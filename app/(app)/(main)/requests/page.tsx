import type { Metadata } from "next";
import { Users } from "lucide-react";
import { ComingSoon } from "@/components/layout/coming-soon";

export const metadata: Metadata = { title: "Sniff requests" };

export default function RequestsPage() {
  return (
    <ComingSoon
      icon={Users}
      title="Sniff requests"
      text="Accept requests from other owners to become Pawmates and unlock chat."
    />
  );
}
