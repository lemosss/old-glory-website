"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  changeEmailAction,
  changePasswordAction,
  type FormState,
} from "./actions";

const initial: FormState = {};

export function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState(
    changePasswordAction,
    initial,
  );

  return (
    <form action={formAction} className="space-y-3">
      <Field
        label="Current password"
        name="currentPassword"
        type="password"
        autoComplete="current-password"
        error={state.errors?.currentPassword}
        required
      />
      <Field
        label="New password"
        name="newPassword"
        type="password"
        autoComplete="new-password"
        error={state.errors?.newPassword}
        required
      />
      <Field
        label="Confirm new password"
        name="confirmPassword"
        type="password"
        autoComplete="new-password"
        error={state.errors?.confirmPassword}
        required
      />
      {state.ok && (
        <p className="text-xs text-emerald-400">{state.message}</p>
      )}
      {!state.ok && state.message && (
        <p className="text-xs text-red-400">{state.message}</p>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? "Updating…" : "Update password"}
      </Button>
    </form>
  );
}

export function ChangeEmailForm({ current }: { current: string }) {
  const [state, formAction, pending] = useActionState(changeEmailAction, initial);

  return (
    <form action={formAction} className="space-y-3">
      <Field
        label="New email"
        name="email"
        type="email"
        autoComplete="email"
        defaultValue={current}
        error={state.errors?.email}
        required
      />
      <Field
        label="Current password"
        name="password"
        type="password"
        autoComplete="current-password"
        error={state.errors?.password}
        required
      />
      {state.ok && (
        <p className="text-xs text-emerald-400">{state.message}</p>
      )}
      {!state.ok && state.message && (
        <p className="text-xs text-red-400">{state.message}</p>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? "Updating…" : "Update email"}
      </Button>
    </form>
  );
}

function Field({
  label,
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }) {
  return (
    <label className="block space-y-1 text-sm">
      <span className="text-stone-300">{label}</span>
      <Input {...props} />
      {error && <span className="block text-xs text-red-400">{error}</span>}
    </label>
  );
}
