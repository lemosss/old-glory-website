import { z } from "zod";

export const RegisterSchema = z
  .object({
    name: z
      .string()
      .min(3, "Account name must be at least 3 characters")
      .max(32, "Account name must be at most 32 characters")
      .regex(/^[A-Za-z0-9]+$/, "Only letters and numbers allowed"),
    email: z.string().email("Invalid email"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(72, "Password must be at most 72 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export type RegisterInput = z.infer<typeof RegisterSchema>;

export const LoginSchema = z.object({
  name: z.string().min(1, "Account name is required"),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof LoginSchema>;

export const ForgotPasswordSchema = z.object({
  identifier: z
    .string()
    .min(3, "Enter your account name or email")
    .max(255),
});

export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;

export const ResetPasswordSchema = z
  .object({
    token: z.string().min(8, "Invalid token"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(72, "Password must be at most 72 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;
