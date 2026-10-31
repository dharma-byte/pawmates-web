import type { Metadata } from "next";
import { GroupsView } from "@/components/groups/groups-view";

export const metadata: Metadata = { title: "Groups & events" };

export default function GroupsPage() {
  return <GroupsView />;
}
