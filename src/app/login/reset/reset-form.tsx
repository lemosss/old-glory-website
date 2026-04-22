"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { resetPasswordAction, type ResetState } from "./actions";

const initial: ResetState = {};

export function ResetForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(resetPasswordAction, initial);

  if (state.ok) {
    return (
      <div className="space-y-4">
        <p className="rounded bg-emerald-950/40 px-3 py-2 text-sm text-emerald-300">
          {state.message}
        </p>
        <Link href="/login" className="block">
          <Button className="w-full">Go to sign in</Button>
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="token" value={token} />

      <label className="block space-y-1 text-sm">
        <span className="text-stone-300">New password</span>
        <Input
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
        {state.errors?.password && (
          <span className="block text-xs text-red-400">{state.errors.password}</span>
        )}
      </label>

      <label className="block space-y-1 text-sm">
        <span className="text-stone-300">Confirm new password</span>
        <Input
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
        {state.errors?.confirmPassword && (
          <span className="block text-xs text-red-400">
            {state.errors.confirmPassword}
          </span>
        )}
      </label>

      {state.errors?.token && (
        <p className="rounded bg-red-950/40 px-3 py-2 text-sm text-red-300">
          {state.errors.token}
        </p>
      )}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Saving…" : "Set new password"}
      </Button>
    </form>
  );
}
