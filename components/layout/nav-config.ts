import { Compass, Contact, House, MessageCircle, UserPlus, Users } from "lucide-react";

// Main sections of the signed-in app, shared by the sidebar and tab bar.
export const APP_NAV = [
  { href: "/home", label: "Home", icon: House },
  { href: "/discover", label: "Discover", icon: Compass },
  { href: "/groups", label: "Groups", icon: Users },
  { href: "/friends", label: "Friends", icon: Contact },
  { href: "/requests", label: "Requests", icon: UserPlus },
  { href: "/chat", label: "Chat", icon: MessageCircle },
] as const;

export type AppNavHref = (typeof APP_NAV)[number]["href"];

export function isActivePath(pathname: string | null, href: string) {
  return !!pathname && (pathname === href || pathname.startsWith(`${href}/`));
}
