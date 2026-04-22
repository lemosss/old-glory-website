import Link from "next/link";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { ForgotForm } from "./forgot-form";

export const metadata = { title: "Forgot Password" };

export default function ForgotPasswordPage() {
  return (
    <div className="mx-auto max-w-md">
      <Card>
        <CardHeader title="Forgot Password" />
        <CardBody>
          <p className="mb-4 text-sm text-stone-400">
            Enter your account name or registered email. We&apos;ll send you a link to
            create a new password.
          </p>
          <ForgotForm />
          <p className="mt-4 text-center text-xs text-stone-500">
            Remembered it?{" "}
            <Link href="/login" className="text-amber-400 hover:underline">
              Back to sign in
            </Link>
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
