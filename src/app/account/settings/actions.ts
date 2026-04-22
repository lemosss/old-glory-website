"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import {
  updateAccountEmail,
  updateAccountPassword,
  verifyAccountPassword,
} from "@/lib/services/accounts";
import {
  ChangeEmailSchema,
  ChangePasswordSchema,
} from "@/lib/validators/account";
import { db } from "@/lib/db";

export type FormState = {
  errors?: Record<string, string>;
  message?: string;
  ok?: boolean;
};

function flattenErrors(err: z.ZodError) {
  const out: Record<string, string> = {};
  const fieldErrors = z.flattenError(err).fieldErrors as Record<
    string,
    string[] | undefined
  >;
  for (const [field, msgs] of Object.entries(fieldErrors)) {
    if (msgs && msgs.length > 0) out[field] = msgs[0];
  }
  return out;
}

export async function changePasswordAction(
  _prev: FormState | undefined,
  formData: FormData,
): Promise<FormState> {
  const session = await auth();
  if (!session?.user?.accountId) return { message: "Not signed in." };

  const parsed = ChangePasswordSchema.safeParse({
    currentPassword: String(formData.get("currentPassword") ?? ""),
    newPassword: String(formData.get("newPassword") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
  });
  if (!parsed.success) return { errors: flattenErrors(parsed.error) };

  const account = await db.accounts.findUnique({
    where: { id: session.user.accountId },
  });
  if (!account) return { message: "Account not found." };

  const ok = await verifyAccountPassword(account.name, parsed.data.currentPassword);
  if (!ok) return { errors: { currentPassword: "Current password is wrong." } };

  await updateAccountPassword(session.user.accountId, parsed.data.newPassword);
  revalidatePath("/account");
  return { ok: true, message: "Password updated." };
}

export async function changeEmailAction(
  _prev: FormState | undefined,
  formData: FormData,
): Promise<FormState> {
  const session = await auth();
  if (!session?.user?.accountId) return { message: "Not signed in." };

  const parsed = ChangeEmailSchema.safeParse({
    password: String(formData.get("password") ?? ""),
    email: String(formData.get("email") ?? ""),
  });
  if (!parsed.success) return { errors: flattenErrors(parsed.error) };

  const account = await db.accounts.findUnique({
    where: { id: session.user.accountId },
  });
  if (!account) return { message: "Account not found." };

  const ok = await verifyAccountPassword(account.name, parsed.data.password);
  if (!ok) return { errors: { password: "Password is wrong." } };

  await updateAccountEmail(session.user.accountId, parsed.data.email);
  revalidatePath("/account");
  return { ok: true, message: "Email updated." };
}
