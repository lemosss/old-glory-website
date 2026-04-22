"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { forgotPasswordAction, type ForgotState } from "./actions";

const initial: ForgotState = {};

export function ForgotForm() {
  const [state, formAction, pending] = useActionState(forgotPasswordAction, initial);

  return (
    <form action={formAction} className="space-y-4">
      <label className="block space-y-1 text-sm">
        <span className="text-stone-300">Account name or email</span>
        <Input
          name="identifier"
          autoComplete="username"
          required
          placeholder="e.g. MyAccount or user@example.com"
        />
        {state.fieldError && (
          <span className="block text-xs text-red-400">{state.fieldError}</span>
        )}
      </label>

      {state.error && <p className="text-sm text-red-400">{state.error}</p>}
      {state.message && (
        <p className="rounded bg-emerald-950/40 px-3 py-2 text-sm text-emerald-300">
          {state.message}
        </p>
      )}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Sending…" : "Send reset link"}
      </Button>
    </form>
  );
}
