"use server";

import { z } from "zod";
import { ForgotPasswordSchema } from "@/lib/validators/auth";
import { requestPasswordReset } from "@/lib/services/password-reset";

export type ForgotState = {
  error?: string;
  message?: string;
  fieldError?: string;
};

const GENERIC_OK =
  "If that account exists, we've sent an email with instructions to reset your password.";

export async function forgotPasswordAction(
  _prev: ForgotState | undefined,
  formData: FormData,
): Promise<ForgotState> {
  const parsed = ForgotPasswordSchema.safeParse({
    identifier: String(formData.get("identifier") ?? "").trim(),
  });
  if (!parsed.success) {
    const flat = z.flattenError(parsed.error);
    return { fieldError: flat.fieldErrors.identifier?.[0] ?? "Invalid input." };
  }

  try {
    await requestPasswordReset(parsed.data.identifier);
  } catch (err) {
    console.error("requestPasswordReset failed", err);
    // Fall through to the generic message — we don't want to confirm whether
    // the account exists just because the email provider blew up.
  }

  return { message: GENERIC_OK };
}
