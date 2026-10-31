import type { Metadata } from "next";
import { LostView } from "@/components/lost/lost-view";

export const metadata: Metadata = { title: "Lost & Found" };

export default function LostPage() {
  return <LostView />;
}
