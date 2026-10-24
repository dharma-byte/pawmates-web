// Only allow redirects to paths on this site, so a crafted ?next= link
// cannot send someone to another website after they sign in.
export function safeNext(next: string | null | undefined, fallback = "/home") {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) {
    return fallback;
  }
  return next;
}

// Where Supabase sends people back to after they click an email link.
export function emailRedirectUrl(next: string) {
  const url = new URL("/auth/confirm", window.location.origin);
  url.searchParams.set("next", safeNext(next));
  return url.toString();
}
