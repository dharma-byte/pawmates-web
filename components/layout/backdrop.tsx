"use client";

import { useEffect, useRef } from "react";

// Blurred pet photos behind each part of the site (public-domain / CC0 from
// Wikimedia Commons; sources in public/backdrops/CREDITS.md). Each comes in a
// wide crop for computers and a tall one for phones.
export type BackdropName = "homepage" | "home" | "discover" | "friends" | "chat" | "groups" | "requests";

// How far the photo drifts over a full page scroll, as a share of the screen.
const DRIFT = 0.12;

// One continuous photo fixed behind the page. It drifts up slowly as the page
// scrolls (a gentle parallax) and sits under a veil in the page's own
// background colour, so text stays readable in light and dark mode.
export function Backdrop({ name }: { name: BackdropName }) {
  const photo = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - innerHeight;
      const progress = max > 0 ? Math.min(scrollY / max, 1) : 0;
      if (photo.current) photo.current.style.transform = `translate3d(0, ${-progress * DRIFT * 100}vh, 0)`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background">
      <div
        key={name}
        ref={photo}
        className="backdrop-photo absolute inset-x-0 top-0 h-[115vh] will-change-transform"
        style={
          {
            "--backdrop-wide": `url(/backdrops/${name}-wide.webp)`,
            "--backdrop-tall": `url(/backdrops/${name}-tall.webp)`,
          } as React.CSSProperties
        }
      />
      <div className="backdrop-veil absolute inset-0" />
    </div>
  );
}

export function backdropForPath(pathname: string | null): BackdropName {
  const section = pathname?.split("/")[1];
  switch (section) {
    case "discover":
    case "friends":
    case "chat":
    case "groups":
    case "requests":
      return section;
    default:
      return "home";
  }
}
