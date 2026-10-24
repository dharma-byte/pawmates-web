import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { safeNext } from "@/lib/auth/redirect";

// Landing point for every email link: sign-up confirmation, magic link,
// email change. Supports both the PKCE `code` flow (default) and
// `token_hash` links (custom email templates).
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const next = safeNext(searchParams.get("next"), "/onboarding");
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  const fail = () => NextResponse.redirect(new URL("/login?error=link", request.url));

  // Supabase redirects here with ?error=... when a link is expired or reused.
  if (searchParams.get("error")) return fail();

  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return fail();
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (error) return fail();
  } else {
    return fail();
  }

  return NextResponse.redirect(new URL(next, request.url));
}
