import "server-only";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { env } from "@/lib/env";
import { db } from "@/lib/db";
import { sendMail } from "@/lib/mail";
import { updateAccountPassword } from "@/lib/services/accounts";

const TOKEN_TTL_MINUTES = 30;

function b64urlEncode(buf: Buffer): string {
  return buf.toString("base64").replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function b64urlDecode(s: string): Buffer {
  const padded = s.replace(/-/g, "+").replace(/_/g, "/").padEnd(
    s.length + ((4 - (s.length % 4)) % 4),
    "=",
  );
  return Buffer.from(padded, "base64");
}

function hmac(payload: string): Buffer {
  return createHmac("sha256", env.AUTH_SECRET).update(payload).digest();
}

type TokenPayload = { accountId: number; nonce: string; exp: number };

/**
 * Build a stateless password-reset token. Payload is base64url-encoded and
 * signed with HMAC-SHA256 using AUTH_SECRET, so we don't need a dedicated
 * DB table. A random nonce is bound to the password hash in use at creation
 * time so the token invalidates automatically once the password changes.
 */
export function createResetToken(accountId: number, passwordSnapshot: string): string {
  const nonce = b64urlEncode(hmac(`nonce:${accountId}:${passwordSnapshot}`).subarray(0, 8));
  const payload: TokenPayload = {
    accountId,
    nonce,
    exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_MINUTES * 60,
  };
  const body = b64urlEncode(Buffer.from(JSON.stringify(payload)));
  const sig = b64urlEncode(hmac(body));
  return `${body}.${sig}`;
}

export type VerifiedToken = { accountId: number };

export async function verifyResetToken(token: string): Promise<VerifiedToken | null> {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [body, sig] = parts;

  const expectedSig = b64urlEncode(hmac(body));
  const given = Buffer.from(sig);
  const expected = Buffer.from(expectedSig);
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;

  let payload: TokenPayload;
  try {
    payload = JSON.parse(b64urlDecode(body).toString("utf8")) as TokenPayload;
  } catch {
    return null;
  }

  if (typeof payload.accountId !== "number" || typeof payload.exp !== "number") return null;
  if (payload.exp < Math.floor(Date.now() / 1000)) return null;

  const account = await db.accounts.findUnique({
    where: { id: payload.accountId },
    select: { id: true, password: true },
  });
  if (!account) return null;

  // Nonce is derived from the current password hash — a successful reset
  // rotates the hash and invalidates any outstanding tokens.
  const expectedNonce = b64urlEncode(
    hmac(`nonce:${account.id}:${account.password}`).subarray(0, 8),
  );
  if (payload.nonce !== expectedNonce) return null;

  return { accountId: account.id };
}

/**
 * Kick off a password reset. Looks up the account by name or email and, if
 * found, emails a one-time reset link. Always resolves successfully so the
 * caller can show a generic "if the account exists we sent an email" message
 * and avoid leaking which names/emails are registered.
 */
export async function requestPasswordReset(identifier: string): Promise<void> {
  const trimmed = identifier.trim();
  if (!trimmed) return;

  const isEmail = trimmed.includes("@");
  const account = await db.accounts.findFirst({
    where: isEmail
      ? { email: { equals: trimmed } }
      : { name: { equals: trimmed } },
    select: { id: true, name: true, email: true, password: true },
  });
  if (!account || !account.email) return;

  const token = createResetToken(account.id, account.password);
  const url = `${env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "")}/login/reset?token=${encodeURIComponent(token)}`;

  const siteName = env.NEXT_PUBLIC_SITE_NAME;
  const text =
    `Hi ${account.name},\n\n` +
    `We received a request to reset the password for your ${siteName} account.\n` +
    `To set a new password, open the link below (valid for ${TOKEN_TTL_MINUTES} minutes):\n\n` +
    `${url}\n\n` +
    `If you didn't request this, you can ignore this email — your password won't change.\n`;

  const html =
    `<p>Hi <strong>${account.name}</strong>,</p>` +
    `<p>We received a request to reset the password for your ${siteName} account.</p>` +
    `<p>To set a new password, click the link below (valid for ${TOKEN_TTL_MINUTES} minutes):</p>` +
    `<p><a href="${url}">${url}</a></p>` +
    `<p>If you didn't request this, you can ignore this email — your password won't change.</p>`;

  await sendMail({
    to: account.email,
    subject: `Password reset — ${siteName}`,
    text,
    html,
  });
}

export async function completePasswordReset(
  token: string,
  newPassword: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const verified = await verifyResetToken(token);
  if (!verified) return { ok: false, error: "Invalid or expired link." };
  await updateAccountPassword(verified.accountId, newPassword);
  return { ok: true };
}

/**
 * Generate a fresh random token for external use (e.g. email verification).
 * Not used by the reset flow — kept as a utility for future features.
 */
export function randomToken(bytes = 24): string {
  return b64urlEncode(randomBytes(bytes));
}
