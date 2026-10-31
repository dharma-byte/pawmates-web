"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { meKey } from "@/lib/api/me";
import { fetchMySettings, settingsKeys } from "@/lib/api/settings";
import { ProfileForm } from "@/components/profile/profile-form";
import { LocationEditor } from "@/components/profile/location-editor";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PushToggle } from "@/components/notifications/push-toggle";
import { AccountTab } from "./account-tab";
import { PetsTab } from "./pets-tab";
import { PrivacyTab } from "./privacy-tab";

const TABS = ["profile", "pets", "privacy", "notifications", "account"] as const;
type Tab = (typeof TABS)[number];

export function SettingsView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const requested = searchParams.get("tab") as Tab | null;
  const tab: Tab = requested && TABS.includes(requested) ? requested : "profile";

  const { data, isPending, error } = useQuery({ queryKey: settingsKeys.mine, queryFn: fetchMySettings });

  // Saved anywhere: refresh settings plus the header and home data.
  const saved = (message: string) => {
    toast.success(message);
    queryClient.invalidateQueries({ queryKey: settingsKeys.mine });
    queryClient.invalidateQueries({ queryKey: meKey });
    queryClient.invalidateQueries({ queryKey: ["discover"] });
    router.refresh();
  };

  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      {isPending && <Skeleton className="h-96 w-full rounded-xl" />}
      {error && <p className="text-destructive">{error.message}</p>}

      {data && (
        <Tabs value={tab} onValueChange={(value) => router.replace(`/settings?tab=${value}`, { scroll: false })}>
          <TabsList className="w-full">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="pets">Pets</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
            <TabsTrigger value="notifications">Alerts</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="grid max-w-xl gap-10 pt-6">
            <ProfileForm
              key={data.profile.avatar_url ?? "none"}
              userId={data.userId}
              profile={data.profile}
              verified={data.profile.verification_status === "verified"}
              submitLabel="Save profile"
              onSaved={() => saved("Profile saved")}
            />
            <section className="grid gap-4 border-t pt-8" aria-labelledby="area-heading">
              <div>
                <h2 id="area-heading" className="text-lg font-bold">
                  Home area
                </h2>
                <p className="text-sm text-muted-foreground">
                  Currently: {data.profile.area_name ?? "not set"}. Set a new spot to change it.
                </p>
              </div>
              <LocationEditor
                userId={data.userId}
                initialAreaName={data.profile.area_name}
                submitLabel="Save area"
                onSaved={() => saved("Home area updated")}
              />
            </section>
          </TabsContent>

          <TabsContent value="pets" className="pt-6">
            <PetsTab settings={data} onSaved={saved} />
          </TabsContent>

          <TabsContent value="privacy" className="pt-6">
            <PrivacyTab settings={data} onSaved={saved} />
          </TabsContent>

          <TabsContent value="notifications" className="grid max-w-xl gap-3 pt-6">
            <PushToggle />
            <p className="text-sm text-muted-foreground">
              This is set per device: turn it on separately on your phone and your computer.
            </p>
          </TabsContent>

          <TabsContent value="account" className="pt-6">
            <AccountTab settings={data} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
