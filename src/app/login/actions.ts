"use server";

import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { LoginSchema } from "@/lib/validators/auth";
import { signIn } from "@/lib/auth";

export type LoginState = { error?: string };

export async function loginAction(
  _prev: LoginState | undefined,
  formData: FormData,
): Promise<LoginState> {
  const parsed = LoginSchema.safeParse({
    name: formData.get("name"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: "Invalid credentials." };

  try {
    await signIn("credentials", {
      name: parsed.data.name,
      password: parsed.data.password,
      redirect: false,
    });
  } catch (err) {
    if (err instanceof AuthError) return { error: "Invalid account name or password." };
    throw err;
  }

  redirect("/account");
}
