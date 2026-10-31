"use client";

import { useState } from "react";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import { authErrorMessage } from "@/lib/auth/errors";
import { emailRedirectUrl } from "@/lib/auth/redirect";
import { signupSchema, type SignupValues } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/shared/password-input";
import { CheckEmail } from "./check-email";
import { Field } from "./field";

export function SignupForm() {
  const [sentTo, setSentTo] = useState<string | null>(null);
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { email: "", password: "", acceptTerms: false },
  });

  const supabase = createClient();
  const redirect = () => emailRedirectUrl("/onboarding");

  async function onSubmit({ email, password }: SignupValues) {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: redirect() },
    });

    if (error) {
      setError("root", { message: authErrorMessage(error) });
      return;
    }

    // Supabase answers the same way whether or not the email is already
    // registered, so nobody can probe which emails have accounts.
    setSentTo(email);
  }

  if (sentTo) {
    return (
      <CheckEmail
        email={sentTo}
        message="We sent a confirmation link to"
        redirectTo="/onboarding"
        onResend={() =>
          supabase.auth.resend({ type: "signup", email: sentTo, options: { emailRedirectTo: redirect() } })
        }
        onBack={() => setSentTo(null)}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-4">
      <Field id="signup-email" label="Email" error={errors.email?.message}>
        <Input
          id="signup-email"
          type="email"
          autoComplete="email"
          inputMode="email"
          className="h-10"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "signup-email-error" : undefined}
          {...register("email")}
        />
      </Field>
      <Field
        id="signup-password"
        label="Password"
        error={errors.password?.message}
        hint="At least 8 characters, with letters and numbers."
      >
        <PasswordInput
          id="signup-password"
          autoComplete="new-password"
          className="h-10"
          aria-invalid={!!errors.password}
          aria-describedby={errors.password ? "signup-password-error" : "signup-password-hint"}
          {...register("password")}
        />
      </Field>

      <div className="grid gap-1.5">
        <div className="flex items-start gap-2">
          <Controller
            control={control}
            name="acceptTerms"
            render={({ field }) => (
              <Checkbox
                id="signup-terms"
                checked={field.value}
                onCheckedChange={(checked) => field.onChange(checked === true)}
                aria-invalid={!!errors.acceptTerms}
                className="mt-0.5"
              />
            )}
          />
          <label htmlFor="signup-terms" className="text-sm leading-snug text-muted-foreground">
            I agree to the{" "}
            <Link href="/terms" className="text-foreground underline underline-offset-4">
              Terms of Use
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-foreground underline underline-offset-4">
              Privacy Policy
            </Link>
            .
          </label>
        </div>
        {errors.acceptTerms && (
          <p role="alert" className="text-sm text-destructive">
            {errors.acceptTerms.message}
          </p>
        )}
      </div>

      {errors.root && (
        <p role="alert" className="text-sm text-destructive">
          {errors.root.message}
        </p>
      )}

      <Button type="submit" size="lg" className="h-10" disabled={isSubmitting}>
        {isSubmitting ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}
