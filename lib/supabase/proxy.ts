import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";

// Routes anyone can open without signing in.
const PUBLIC_ROUTES = ["/", "/login", "/signup", "/auth", "/privacy", "/terms"];

// Routes a signed-in user can open before being verified.
const UNVERIFIED_ROUTES = ["/onboarding", "/settings", "/auth"];

function matches(pathname: string, routes: string[]) {
  return routes.some(
    (route) => pathname === route || (route !== "/" && pathname.startsWith(`${route}/`)),
  );
}

// Refreshes the Supabase session cookie and routes users by state:
//   signed out          -> public pages only, otherwise /login
//   not onboarded       -> /onboarding
//   onboarded, waiting  -> /onboarding (shows verification status)
//   verified            -> everything; /login and /signup go to /home
// RLS still protects the data; this only decides which page to show.
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
          Object.entries(headers ?? {}).forEach(([key, value]) =>
            response.headers.set(key, value),
          );
        },
      },
    },
  );

  // Do not run code between createServerClient and getClaims():
  // getClaims() refreshes an expired session and verifies the JWT.
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  const { pathname } = request.nextUrl;

  const redirectTo = (path: string) => {
    const url = request.nextUrl.clone();
    url.pathname = path;
    url.search = "";
    if (path === "/login") url.searchParams.set("next", pathname);
    const redirect = NextResponse.redirect(url);
    // Keep any refreshed session cookies on the redirect.
    response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() !== "location") redirect.headers.set(key, value);
    });
    return redirect;
  };

  if (!userId) {
    return matches(pathname, PUBLIC_ROUTES) ? response : redirectTo("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("verification_status, onboarded_at")
    .eq("id", userId)
    .single();

  const verified = profile?.verification_status === "verified";

  if (pathname === "/login" || pathname === "/signup") {
    return redirectTo(verified ? "/home" : "/onboarding");
  }

  if (!verified && !matches(pathname, [...PUBLIC_ROUTES, ...UNVERIFIED_ROUTES])) {
    return redirectTo("/onboarding");
  }

  return response;
}
