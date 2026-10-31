import { createClient } from "@/lib/supabase/client";

// Phone and browser notifications (Web Push). The service worker lives in
// public/sw.js; delivery happens in app/api/push/route.ts.

const PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

export type PushState =
  | "unsupported" // no service workers / push in this browser
  | "ios-install" // iPhone Safari: only works once added to the home screen
  | "blocked" // the member said no in the browser's prompt
  | "off"
  | "on";

function isIos() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isInstalled() {
  return matchMedia("(display-mode: standalone)").matches || (navigator as { standalone?: boolean }).standalone === true;
}

export async function getPushState(): Promise<PushState> {
  if (!PUBLIC_KEY || !("serviceWorker" in navigator)) return "unsupported";
  if (!("PushManager" in window) || !("Notification" in window)) {
    return isIos() && !isInstalled() ? "ios-install" : "unsupported";
  }
  if (Notification.permission === "denied") return "blocked";
  const registration = await navigator.serviceWorker.getRegistration("/");
  const subscription = await registration?.pushManager.getSubscription();
  return subscription && Notification.permission === "granted" ? "on" : "off";
}

function keyBytes(base64url: string) {
  const base64 = (base64url + "=".repeat((4 - (base64url.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
}

// Must run from a tap: browsers only show the permission prompt then.
export async function turnOnPush() {
  if (!PUBLIC_KEY) throw new Error("Notifications aren't set up on this site yet.");
  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error(
      permission === "denied"
        ? "Notifications are blocked. Allow them for this site in your browser settings, then try again."
        : "Notifications weren't turned on.",
    );
  }
  const registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
  await navigator.serviceWorker.ready;
  const subscription =
    (await registration.pushManager.getSubscription()) ??
    (await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyBytes(PUBLIC_KEY) }));
  const json = subscription.toJSON();
  const { error } = await createClient().rpc("save_push_subscription", {
    endpoint: subscription.endpoint,
    p256dh: json.keys?.p256dh ?? "",
    auth_key: json.keys?.auth ?? "",
    user_agent: navigator.userAgent,
  });
  if (error) throw new Error(error.message);
}

export async function turnOffPush() {
  const registration = await navigator.serviceWorker.getRegistration("/");
  const subscription = await registration?.pushManager.getSubscription();
  if (!subscription) return;
  await createClient().rpc("delete_push_subscription", { endpoint: subscription.endpoint });
  await subscription.unsubscribe();
}
