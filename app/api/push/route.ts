import { timingSafeEqual } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import webpush from "web-push";
import type { Database } from "@/types/database";

// Called by the database (trigger notifications_push, migration 020) for each
// new notification: delivers it to every device the member turned on, then
// removes devices the push service says are gone. Guarded by a shared secret.

type Payload = {
  subscriptions: { endpoint: string; keys: { p256dh: string; auth: string } }[];
  notification: { id: string; type: string; title: string; body: string | null; link: string | null };
};

function sameSecret(given: string | null, expected: string | undefined) {
  if (!given || !expected) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  const secret = process.env.PUSH_WEBHOOK_SECRET;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!sameSecret(request.headers.get("x-push-secret"), secret)) {
    return Response.json({ error: "Not allowed" }, { status: 401 });
  }
  if (!publicKey || !privateKey) {
    return Response.json({ error: "Push is not configured" }, { status: 503 });
  }

  const { subscriptions, notification } = (await request.json()) as Payload;
  // Push services want an https: or mailto: contact; local dev runs on http.
  const site = process.env.NEXT_PUBLIC_SITE_URL;
  webpush.setVapidDetails(site?.startsWith("https://") ? site : "https://pawmates-web-phi.vercel.app", publicKey, privateKey);
  const message = JSON.stringify({
    id: notification.id,
    type: notification.type,
    title: notification.title,
    body: notification.body ?? "",
    link: notification.link ?? "/home",
  });

  const results = await Promise.allSettled(
    subscriptions.map((subscription) => webpush.sendNotification(subscription, message, { TTL: 60 * 60 * 24 })),
  );

  // 404 / 410: the member uninstalled, cleared data or turned it off.
  const gone = subscriptions
    .filter((_, i) => {
      const result = results[i];
      return result.status === "rejected" && [404, 410].includes((result.reason as { statusCode?: number }).statusCode ?? 0);
    })
    .map((subscription) => subscription.endpoint);

  if (gone.length > 0) {
    const supabase = createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
      auth: { persistSession: false },
    });
    await supabase.rpc("remove_push_subscriptions", { secret: secret!, endpoints: gone });
  }

  return Response.json({
    sent: results.filter((r) => r.status === "fulfilled").length,
    failed: results.filter((r) => r.status === "rejected").length,
    removed: gone.length,
  });
}
