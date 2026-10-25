"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { connectionKeys } from "@/lib/api/connections";
import {
  fetchBlocked,
  settingsKeys,
  unblock,
  updatePrivacy,
  type MessagePrivacy,
  type MySettings,
} from "@/lib/api/settings";
import { ChoiceChips } from "@/components/shared/choice-chips";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

export function PrivacyTab({ settings, onSaved }: { settings: MySettings; onSaved: (message: string) => void }) {
  const queryClient = useQueryClient();
  const { profile, userId } = settings;

  const update = useMutation({
    mutationFn: (changes: Parameters<typeof updatePrivacy>[1]) => updatePrivacy(userId, changes),
    onSuccess: () => onSaved("Privacy updated"),
    onError: (error) => toast.error(error.message),
  });

  const blocked = useQuery({ queryKey: settingsKeys.blocked, queryFn: fetchBlocked });
  const removeBlock = useMutation({
    mutationFn: unblock,
    onSuccess: () => {
      toast.success("Unblocked");
      queryClient.invalidateQueries({ queryKey: settingsKeys.blocked });
      queryClient.invalidateQueries({ queryKey: connectionKeys.all });
    },
    onError: (error) => toast.error(error.message),
  });

  return (
    <div className="grid max-w-xl gap-8">
      <section className="grid gap-3" aria-labelledby="messages-heading">
        <div>
          <h2 id="messages-heading" className="font-semibold">
            Who can message me
          </h2>
          <p className="text-sm text-muted-foreground">Pawmates can always message you.</p>
        </div>
        <ChoiceChips<MessagePrivacy>
          id="message-privacy"
          options={[
            { value: "connections", label: "Only my Pawmates" },
            { value: "everyone", label: "Any verified member" },
          ]}
          value={profile.message_privacy}
          onChange={(message_privacy) => update.mutate({ message_privacy })}
        />
      </section>

      <Toggle
        id="show-area"
        title="Show my area name"
        description={`Others see “${profile.area_name ?? "your area"}” on your profile and pets. Distances are always approximate.`}
        checked={profile.show_area}
        onChange={(show_area) => update.mutate({ show_area })}
      />

      <Toggle
        id="show-online"
        title="Show when I'm online"
        description="Lets people in your chats see when you have the conversation open."
        checked={profile.show_online}
        onChange={(show_online) => update.mutate({ show_online })}
      />

      <section className="grid gap-3 border-t pt-8" aria-labelledby="blocked-heading">
        <h2 id="blocked-heading" className="font-semibold">
          Blocked members
        </h2>
        {blocked.data?.length === 0 && <p className="text-sm text-muted-foreground">You haven&apos;t blocked anyone.</p>}
        <ul className="grid gap-2">
          {blocked.data?.map((person) => (
            <li key={person.user_id} className="flex items-center gap-3 rounded-lg border p-2">
              <Avatar>
                {person.avatar_url && <AvatarImage src={person.avatar_url} alt="" />}
                <AvatarFallback>{person.full_name?.[0] ?? "?"}</AvatarFallback>
              </Avatar>
              <span className="min-w-0 flex-1 truncate text-sm">
                {person.full_name} <span className="text-muted-foreground">@{person.username}</span>
              </span>
              <Button variant="outline" size="sm" onClick={() => removeBlock.mutate(person.user_id)} disabled={removeBlock.isPending}>
                Unblock
              </Button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Toggle({
  id,
  title,
  description,
  checked,
  onChange,
}: {
  id: string;
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="grid gap-0.5">
        <label htmlFor={id} className="font-semibold">
          {title}
        </label>
        <p id={`${id}-description`} className="text-sm text-muted-foreground">
          {description}
        </p>
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onChange} aria-describedby={`${id}-description`} />
    </div>
  );
}
