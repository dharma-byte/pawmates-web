// Turns Supabase Auth errors into messages members can act on, instead of
// raw text like "HTTP 504".
export function authErrorMessage(error: { code?: string; status?: number; message: string }) {
  switch (error.code) {
    case "invalid_credentials":
      return "Wrong email or password.";
    case "weak_password":
      return "Choose a stronger password: at least 8 characters with letters and numbers.";
    case "over_email_send_rate_limit":
    case "over_request_rate_limit":
      return "Too many attempts. Please wait a few minutes and try again.";
    case "email_address_invalid":
      return "That email address doesn't look right.";
  }

  // 5xx: usually the email service timing out while sending a link.
  if (error.status && error.status >= 500) {
    return "We couldn't send the email right now. Please try again in a minute. If it keeps happening, sign in with “Email me a link” instead.";
  }
  if (/^HTTP \d+$/.test(error.message) || error.message === "{}") {
    return "Something went wrong on our side. Please try again in a minute.";
  }
  return error.message;
}
