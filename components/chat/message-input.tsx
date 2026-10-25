"use client";

import { useRef, useState } from "react";
import { Camera, MapPin, SendHorizontal } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function MessageInput({
  disabled,
  onSendText,
  onSendImage,
  onSendLocation,
  onTyping,
}: {
  disabled: boolean;
  onSendText: (body: string) => Promise<unknown>;
  onSendImage: (file: File) => Promise<unknown>;
  onSendLocation: (lat: number, lng: number) => Promise<unknown>;
  onTyping: () => void;
}) {
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  async function run(task: () => Promise<unknown>) {
    setBusy(true);
    try {
      await task();
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't send that.");
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function submit(event?: React.FormEvent) {
    event?.preventDefault();
    const text = body.trim();
    if (!text || busy) return;
    if (await run(() => onSendText(text))) setBody("");
  }

  function shareLocation() {
    if (!("geolocation" in navigator)) {
      toast.error("Your browser can't share its location.");
      return;
    }
    setBusy(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => run(() => onSendLocation(coords.latitude, coords.longitude)),
      () => {
        setBusy(false);
        toast.error("Allow location access to share a meeting point.");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  return (
    <form onSubmit={submit} className="flex items-end gap-1.5 border-t bg-background p-2">
      <Button
        type="button"
        variant="ghost"
        size="icon-lg"
        aria-label="Send a photo"
        disabled={disabled || busy}
        onClick={() => fileInput.current?.click()}
      >
        <Camera />
      </Button>
      <input
        ref={fileInput}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        tabIndex={-1}
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) void run(() => onSendImage(file));
        }}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon-lg"
        aria-label="Share my location as a meeting point"
        disabled={disabled || busy}
        onClick={shareLocation}
      >
        <MapPin />
      </Button>
      <label htmlFor="message-body" className="sr-only">
        Message
      </label>
      <Textarea
        id="message-body"
        rows={1}
        maxLength={4000}
        value={body}
        disabled={disabled}
        placeholder={disabled ? "You can't message this person" : "Message"}
        className="max-h-32 min-h-10 flex-1 resize-none"
        onChange={(event) => {
          setBody(event.target.value);
          onTyping();
        }}
        onKeyDown={(event) => {
          // Enter sends, Shift+Enter adds a new line.
          if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
            event.preventDefault();
            void submit();
          }
        }}
      />
      <Button type="submit" size="icon-lg" aria-label="Send" disabled={disabled || busy || !body.trim()}>
        <SendHorizontal />
      </Button>
    </form>
  );
}
