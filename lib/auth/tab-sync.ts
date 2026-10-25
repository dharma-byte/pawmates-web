// Lets the tab that opened an email link hand off to the tab that is waiting
// on "check your email", so only one tab continues into the app.
//
//   link tab    -> { type: "confirmed" }
//   waiting tab -> { type: "claimed" }   (then the waiting tab continues)
//
// No reply means no waiting tab in this browser: the link tab continues.
export const AUTH_CHANNEL = "pawmates-auth";

export type AuthTabMessage = { type: "confirmed" } | { type: "claimed" };

export function openAuthChannel(): BroadcastChannel | null {
  return typeof window !== "undefined" && "BroadcastChannel" in window
    ? new BroadcastChannel(AUTH_CHANNEL)
    : null;
}
