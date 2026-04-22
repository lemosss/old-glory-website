"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { RegisterSchema } from "@/lib/validators/auth";
import { accountNameAvailable, createAccount } from "@/lib/services/accounts";
import { signIn } from "@/lib/auth";

export type RegisterState = {
  errors?: Record<string, string>;
  message?: string;
};

export async function registerAction(
  _prev: RegisterState | undefined,
  formData: FormData,
): Promise<RegisterState> {
  const input = {
    name: String(formData.get("name") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
  };

  const parsed = RegisterSchema.safeParse(input);
  if (!parsed.success) {
    const flat = z.flattenError(parsed.error);
    const errors: Record<string, string> = {};
    for (const [field, messages] of Object.entries(flat.fieldErrors)) {
      if (messages && messages.length > 0) errors[field] = messages[0];
    }
    return { errors };
  }

  if (!(await accountNameAvailable(parsed.data.name))) {
    return { errors: { name: "That account name is already taken." } };
  }

  try {
    await createAccount({
      name: parsed.data.name,
      email: parsed.data.email,
      password: parsed.data.password,
    });
  } catch (err) {
    console.error("createAccount failed", err);
    return { message: "Unable to create account. Please try again." };
  }

  await signIn("credentials", {
    name: parsed.data.name,
    password: parsed.data.password,
    redirect: false,
  });

  redirect("/account");
}
