"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { registerAction, type RegisterState } from "./actions";

const initialState: RegisterState = {};

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(registerAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <Field
        label="Account name"
        name="name"
        error={state.errors?.name}
        maxLength={32}
        autoComplete="username"
        required
      />
      <Field
        label="Email"
        name="email"
        type="email"
        error={state.errors?.email}
        autoComplete="email"
        required
      />
      <Field
        label="Password"
        name="password"
        type="password"
        error={state.errors?.password}
        autoComplete="new-password"
        required
      />
      <Field
        label="Confirm password"
        name="confirmPassword"
        type="password"
        error={state.errors?.confirmPassword}
        autoComplete="new-password"
        required
      />
      {state.message && (
        <p className="text-sm text-red-400">{state.message}</p>
      )}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Creating…" : "Create Account"}
      </Button>
    </form>
  );
}

function Field({
  label,
  error,
  ...inputProps
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }) {
  return (
    <label className="block space-y-1 text-sm">
      <span className="text-stone-300">{label}</span>
      <Input {...inputProps} />
      {error && <span className="block text-xs text-red-400">{error}</span>}
    </label>
  );
}
