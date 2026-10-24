import { z } from "zod";

// Mirrors the Supabase Auth settings in pawmates-backend/supabase/config.toml:
// at least 8 characters with letters and digits.
export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Enter your email")
  .pipe(z.email("Enter a valid email address"));

export const passwordSchema = z
  .string()
  .min(8, "Use at least 8 characters")
  .max(72, "Use at most 72 characters")
  .regex(/[a-zA-Z]/, "Include at least one letter")
  .regex(/[0-9]/, "Include at least one number");

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Enter your password"),
});

export const magicLinkSchema = z.object({
  email: emailSchema,
});

export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  acceptTerms: z.boolean().refine((accepted) => accepted, "Please accept the terms to continue"),
});

export type LoginValues = z.infer<typeof loginSchema>;
export type MagicLinkValues = z.infer<typeof magicLinkSchema>;
export type SignupValues = z.infer<typeof signupSchema>;
