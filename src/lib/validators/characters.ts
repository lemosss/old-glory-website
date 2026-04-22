import { z } from "zod";

const INVALID_NAMES = /^(?:admin|administrator|god|gm|tutor|owner|account manager)$/i;

export const CreateCharacterSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(25, "Name must be at most 25 characters")
    .regex(/^[A-Za-z ]+$/, "Only letters and spaces allowed")
    .refine((n) => n.trim().length > 0, "Name cannot be blank")
    .refine((n) => !INVALID_NAMES.test(n.trim()), "This name is reserved"),
  sex: z.enum(["0", "1"]),
});

export type CreateCharacterInput = z.infer<typeof CreateCharacterSchema>;
