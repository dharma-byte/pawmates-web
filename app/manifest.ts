import type { MetadataRoute } from "next";

// Lets members add Pawmates to their home screen and open it full screen,
// like an app, on walks. Signed-out visitors land on sign-in from /home.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Pawmates",
    short_name: "Pawmates",
    description: "Find playmates for your dog nearby, join walking groups and help bring lost dogs home.",
    id: "/",
    start_url: "/home",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0b2a31",
    theme_color: "#0b2a31",
    categories: ["social", "lifestyle"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Report a lost dog", url: "/lost", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Chat", url: "/chat", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
    ],
  };
}
