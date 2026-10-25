import type { Metadata } from "next";
import { Settings } from "lucide-react";
import { ComingSoon } from "@/components/layout/coming-soon";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <ComingSoon
      icon={Settings}
      title="Settings"
      text="Edit your profile, privacy (who can message you, showing your area), notifications, and delete your account."
    />
  );
}
