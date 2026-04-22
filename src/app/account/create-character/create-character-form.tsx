"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createCharacterAction,
  type CreateCharacterState,
} from "./actions";

const initial: CreateCharacterState = {};

export function CreateCharacterForm() {
  const [state, formAction, pending] = useActionState(
    createCharacterAction,
    initial,
  );

  return (
    <form action={formAction} className="space-y-4">
      <label className="block space-y-1 text-sm">
        <span className="text-stone-300">Character name</span>
        <Input name="name" maxLength={25} required autoComplete="off" />
        {state.errors?.name && (
          <span className="block text-xs text-red-400">
            {state.errors.name}
          </span>
        )}
        <span className="block text-xs text-stone-500">
          3–25 letters, spaces allowed. This is your in-game name.
        </span>
      </label>

      <fieldset className="space-y-1 text-sm">
        <legend className="text-stone-300">Sex</legend>
        <div className="flex gap-4 pt-1">
          <label className="flex items-center gap-2 text-sm">
            <input type="radio" name="sex" value="1" defaultChecked />
            <span>Male</span>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="radio" name="sex" value="0" />
            <span>Female</span>
          </label>
        </div>
        {state.errors?.sex && (
          <span className="block text-xs text-red-400">{state.errors.sex}</span>
        )}
      </fieldset>

      {state.message && <p className="text-sm text-red-400">{state.message}</p>}

      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Creating…" : "Create Character"}
        </Button>
      </div>
    </form>
  );
}
