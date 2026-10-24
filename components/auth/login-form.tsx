"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { emailRedirectUrl, safeNext } from "@/lib/auth/redirect";
import {
  loginSchema,
  magicLinkSchema,
  type LoginValues,
  type MagicLinkValues,
} from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckEmail } from "./check-email";
import { Field } from "./field";

const LINK_ERRORS: Record<string, string> = {
  link: "That link is invalid or has expired. Sign in below or request a new link.",
};

export function LoginForm() {
  const searchParams = useSearchParams();
  const next = safeNext(searchParams.get("next"));
  const linkError = LINK_ERRORS[searchParams.get("error") ?? ""];
  const [sentTo, setSentTo] = useState<string | null>(null);

  const supabase = createClient();

  const sendMagicLink = (email: string) =>
    supabase.auth.signInWithOtp({
      email,
      // Only existing accounts: new users go through /signup to accept the terms.
      options: { emailRedirectTo: emailRedirectUrl(next), shouldCreateUser: false },
    });

  if (sentTo) {
    return (
      <CheckEmail
        email={sentTo}
        message="If there is a Pawmates account for this email, we sent a sign-in link to"
        onResend={() => sendMagicLink(sentTo)}
        onBack={() => setSentTo(null)}
      />
    );
  }

  return (
    <div className="grid gap-4">
      {linkError && (
        <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {linkError}
        </p>
      )}
      <Tabs defaultValue="password">
        <TabsList className="w-full">
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="link">Email me a link</TabsTrigger>
        </TabsList>
        <TabsContent value="password" className="pt-4">
          <PasswordLogin next={next} onMagicLinkSent={setSentTo} sendMagicLink={sendMagicLink} />
        </TabsContent>
        <TabsContent value="link" className="pt-4">
          <MagicLinkLogin onSent={setSentTo} sendMagicLink={sendMagicLink} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

type SendMagicLink = (email: string) => Promise<{ error: { message: string; code?: string } | null }>;

function PasswordLogin({
  next,
  sendMagicLink,
  onMagicLinkSent,
}: {
  next: string;
  sendMagicLink: SendMagicLink;
  onMagicLinkSent: (email: string) => void;
}) {
  const router = useRouter();
  const [unconfirmedEmail, setUnconfirmedEmail] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginValues) {
    setUnconfirmedEmail(null);
    const { error } = await createClient().auth.signInWithPassword(values);

    if (error?.code === "email_not_confirmed") {
      setUnconfirmedEmail(values.email);
      return;
    }
    if (error) {
      setError("root", {
        message:
          error.code === "invalid_credentials"
            ? "Wrong email or password."
            : error.message,
      });
      return;
    }

    // The proxy decides the final stop (onboarding vs. the app).
    router.replace(next);
    router.refresh();
  }

  async function resendConfirmation() {
    if (!unconfirmedEmail) return;
    const { error } = await createClient().auth.resend({
      type: "signup",
      email: unconfirmedEmail,
      options: { emailRedirectTo: emailRedirectUrl("/onboarding") },
    });
    if (error) toast.error(error.message);
    else toast.success("Confirmation email sent. Check your inbox.");
  }

  async function signInWithLinkInstead(email: string) {
    const { error } = await sendMagicLink(email);
    if (error) toast.error(error.message);
    else onMagicLinkSent(email);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-4">
      <Field id="login-email" label="Email" error={errors.email?.message}>
        <Input
          id="login-email"
          type="email"
          autoComplete="email"
          inputMode="email"
          className="h-10"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "login-email-error" : undefined}
          {...register("email")}
        />
      </Field>
      <Field id="login-password" label="Password" error={errors.password?.message}>
        <Input
          id="login-password"
          type="password"
          autoComplete="current-password"
          className="h-10"
          aria-invalid={!!errors.password}
          aria-describedby={errors.password ? "login-password-error" : undefined}
          {...register("password")}
        />
      </Field>

      {errors.root && (
        <div role="alert" className="grid gap-1 text-sm text-destructive">
          <p>{errors.root.message}</p>
          <button
            type="button"
            className="justify-self-start text-primary underline underline-offset-4"
            onClick={handleSubmit((v) => signInWithLinkInstead(v.email))}
          >
            Forgot your password? Email me a sign-in link
          </button>
        </div>
      )}

      {unconfirmedEmail && (
        <div role="alert" className="grid gap-2 rounded-lg bg-muted p-3 text-sm">
          <p>Please confirm your email first. We sent a link when you signed up.</p>
          <Button type="button" variant="outline" onClick={resendConfirmation}>
            Resend confirmation email
          </Button>
        </div>
      )}

      <Button type="submit" size="lg" className="h-10" disabled={isSubmitting}>
        {isSubmitting ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}

function MagicLinkLogin({
  sendMagicLink,
  onSent,
}: {
  sendMagicLink: SendMagicLink;
  onSent: (email: string) => void;
}) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<MagicLinkValues>({ resolver: zodResolver(magicLinkSchema) });

  async function onSubmit({ email }: MagicLinkValues) {
    const { error } = await sendMagicLink(email);
    // Do not reveal whether an account exists: "no such user" counts as sent.
    if (error && error.code !== "otp_disabled" && !/signups not allowed/i.test(error.message)) {
      setError("root", { message: error.message });
      return;
    }
    onSent(email);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-4">
      <Field
        id="link-email"
        label="Email"
        error={errors.email?.message}
        hint="We'll email you a link that signs you in, no password needed."
      >
        <Input
          id="link-email"
          type="email"
          autoComplete="email"
          inputMode="email"
          className="h-10"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "link-email-error" : "link-email-hint"}
          {...register("email")}
        />
      </Field>
      {errors.root && (
        <p role="alert" className="text-sm text-destructive">
          {errors.root.message}
        </p>
      )}
      <Button type="submit" size="lg" className="h-10" disabled={isSubmitting}>
        {isSubmitting ? "Sending…" : "Email me a sign-in link"}
      </Button>
    </form>
  );
}
