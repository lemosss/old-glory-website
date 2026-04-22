"use server";

import { z } from "zod";
import { ResetPasswordSchema } from "@/lib/validators/auth";
import { completePasswordReset } from "@/lib/services/password-reset";

export type ResetState = {
  errors?: Record<string, string>;
  message?: string;
  ok?: boolean;
};

export async function resetPasswordAction(
  _prev: ResetState | undefined,
  formData: FormData,
): Promise<ResetState> {
  const input = {
    token: String(formData.get("token") ?? ""),
    password: String(formData.get("password") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
  };
  const parsed = ResetPasswordSchema.safeParse(input);
  if (!parsed.success) {
    const flat = z.flattenError(parsed.error);
    const errors: Record<string, string> = {};
    for (const [field, messages] of Object.entries(flat.fieldErrors)) {
      if (messages && messages.length > 0) errors[field] = messages[0];
    }
    return { errors };
  }

  const result = await completePasswordReset(parsed.data.token, parsed.data.password);
  if (!result.ok) return { errors: { token: result.error } };

  return {
    ok: true,
    message: "Password successfully reset! You can now sign in with your new password.",
  };
}
