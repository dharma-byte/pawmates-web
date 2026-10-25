import { AppShell } from "@/components/layout/app-shell";

// Signed-in, verified area (proxy.ts sends everyone else away).
// Onboarding sits outside this group so it has no navigation.
export default function MainLayout({ children }: LayoutProps<"/">) {
  return <AppShell>{children}</AppShell>;
}
