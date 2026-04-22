"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginAction, type LoginState } from "./actions";

const initial: LoginState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initial);

  return (
    <form action={formAction} className="space-y-4">
      <label className="block space-y-1 text-sm">
        <span className="text-stone-300">Account name</span>
        <Input name="name" autoComplete="username" required />
      </label>
      <label className="block space-y-1 text-sm">
        <span className="text-stone-300">Password</span>
        <Input name="password" type="password" autoComplete="current-password" required />
      </label>
      {state.error && <p className="text-sm text-red-400">{state.error}</p>}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
