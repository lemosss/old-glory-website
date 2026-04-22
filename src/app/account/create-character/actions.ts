"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { CreateCharacterSchema } from "@/lib/validators/characters";
import {
  characterNameAvailable,
  createCharacter,
} from "@/lib/services/characters";

export type CreateCharacterState = {
  errors?: Record<string, string>;
  message?: string;
};

export async function createCharacterAction(
  _prev: CreateCharacterState | undefined,
  formData: FormData,
): Promise<CreateCharacterState> {
  const session = await auth();
  if (!session?.user?.accountId) return { message: "Not signed in." };

  const parsed = CreateCharacterSchema.safeParse({
    name: String(formData.get("name") ?? "").trim(),
    sex: String(formData.get("sex") ?? ""),
  });
  if (!parsed.success) {
    const flat = z.flattenError(parsed.error);
    const errors: Record<string, string> = {};
    for (const [field, messages] of Object.entries(flat.fieldErrors)) {
      if (messages && messages.length > 0) errors[field] = messages[0];
    }
    return { errors };
  }

  // Normalize name to TitleCase
  const name = parsed.data.name
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  if (!(await characterNameAvailable(name))) {
    return { errors: { name: "This character name is already taken." } };
  }

  try {
    await createCharacter({
      accountId: session.user.accountId,
      name,
      sex: parsed.data.sex === "1" ? 1 : 0,
    });
  } catch (err) {
    console.error("createCharacter failed", err);
    return { message: "Unable to create character. Please try again." };
  }

  redirect("/account");
}
