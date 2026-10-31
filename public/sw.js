// Pawmates service worker: shows push notifications and opens the right page
// when one is tapped. Registered from lib/push.ts when a member turns on
// notifications. Keep it small: no caching, so the site never goes stale.

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: event.data ? event.data.text() : "Pawmates" };
  }
  const urgent = data.type === "lost_nearby" || data.type === "lost_sighting";
  event.waitUntil(
    self.registration.showNotification(data.title || "Pawmates", {
      body: data.body || "",
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      // One notification per item: a newer one replaces an older one.
      tag: data.id || undefined,
      data: { link: data.link || "/home" },
      requireInteraction: urgent,
      vibrate: urgent ? [200, 100, 200, 100, 200] : [100],
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = new URL(event.notification.data?.link || "/home", self.location.origin).href;
  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const client of windows) {
        if (new URL(client.url).origin === self.location.origin && "focus" in client) {
          await client.focus();
          return client.navigate(url);
        }
      }
      return self.clients.openWindow(url);
    })(),
  );
});
