import { z } from "zod";

export const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(72, "Password must be at most 72 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;

export const ChangeEmailSchema = z.object({
  password: z.string().min(1, "Password is required"),
  email: z.string().email("Invalid email"),
});

export type ChangeEmailInput = z.infer<typeof ChangeEmailSchema>;
