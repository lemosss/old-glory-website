import "server-only";
import { env } from "@/lib/env";

export type MailMessage = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

/**
 * Minimal mailer. Uses Resend's HTTP API when `RESEND_API_KEY` is configured,
 * otherwise logs the message to the server console (so local development and
 * unconfigured environments don't silently fail — ops can read the link from
 * the logs and continue the flow).
 */
export async function sendMail(msg: MailMessage): Promise<void> {
  const from = env.MAIL_FROM ?? `no-reply@${new URL(env.NEXT_PUBLIC_SITE_URL).hostname}`;

  if (!env.RESEND_API_KEY) {
    console.info(
      `[mail] (dev / unconfigured) to=${msg.to} subject=${JSON.stringify(msg.subject)}\n${msg.text}`,
    );
    return;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: msg.to,
      subject: msg.subject,
      text: msg.text,
      html: msg.html,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Resend failed (${res.status}): ${body}`);
  }
}
