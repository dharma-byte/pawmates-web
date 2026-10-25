"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Download, LogOut, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { deleteMyAccount, downloadMyData, type MySettings } from "@/lib/api/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const CONFIRM_WORD = "DELETE";

export function AccountTab({ settings }: { settings: MySettings }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [confirmText, setConfirmText] = useState("");

  const exportData = useMutation({
    mutationFn: downloadMyData,
    onSuccess: () => toast.success("Your data is downloading"),
    onError: (error) => toast.error(error.message),
  });

  const destroy = useMutation({
    mutationFn: () => deleteMyAccount(settings.userId),
    onSuccess: () => {
      queryClient.clear();
      toast.success("Your account has been deleted. Take care of your pets! 🐾");
      router.replace("/");
      router.refresh();
    },
    onError: (error) => toast.error(error.message),
  });

  async function signOut() {
    await fetch("/auth/signout", { method: "POST" });
    queryClient.clear();
    router.replace("/");
    router.refresh();
  }

  return (
    <div className="grid max-w-xl gap-8">
      <section className="grid gap-1">
        <h2 className="font-semibold">Signed in as</h2>
        <p className="text-muted-foreground">{settings.email}</p>
        <Button variant="outline" className="mt-2 justify-self-start" onClick={signOut}>
          <LogOut aria-hidden /> Sign out
        </Button>
      </section>

      <section className="grid gap-2 border-t pt-8">
        <h2 className="font-semibold">Download your data</h2>
        <p className="text-sm text-muted-foreground">
          A JSON file with your profile, pets, Sniff requests, messages you sent, blocks and reports.
        </p>
        <Button
          variant="outline"
          className="justify-self-start"
          onClick={() => exportData.mutate()}
          disabled={exportData.isPending}
        >
          <Download aria-hidden /> {exportData.isPending ? "Preparing…" : "Download my data"}
        </Button>
      </section>

      <section className="grid gap-3 rounded-xl border border-destructive/40 p-4" aria-labelledby="delete-heading">
        <h2 id="delete-heading" className="flex items-center gap-2 font-semibold text-destructive">
          <TriangleAlert className="size-4" aria-hidden /> Delete account
        </h2>
        <p className="text-sm">
          This permanently deletes your profile, pets, photos, Sniff requests, chats you started and
          messages you sent. It can&apos;t be undone.
        </p>
        <label htmlFor="confirm-delete" className="text-sm">
          Type <span className="font-mono font-semibold">{CONFIRM_WORD}</span> to confirm
        </label>
        <Input
          id="confirm-delete"
          value={confirmText}
          onChange={(event) => setConfirmText(event.target.value)}
          autoComplete="off"
          className="h-10 sm:max-w-56"
        />
        <Button
          variant="destructive"
          className="justify-self-start"
          disabled={confirmText !== CONFIRM_WORD || destroy.isPending}
          onClick={() => destroy.mutate()}
        >
          {destroy.isPending ? "Deleting…" : "Delete my account forever"}
        </Button>
      </section>
    </div>
  );
}
