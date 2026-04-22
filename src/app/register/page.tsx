import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { RegisterForm } from "./register-form";
import Link from "next/link";

export const metadata = { title: "Create Account" };

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-md">
      <Card>
        <CardHeader title="Create Account" />
        <CardBody>
          <p className="mb-4 text-sm text-stone-400">
            Create your account to log in and play. It takes just a few seconds.
          </p>
          <RegisterForm />
          <p className="mt-4 text-center text-xs text-stone-500">
            Already have an account?{" "}
            <Link href="/login" className="text-amber-400 hover:underline">
              Sign in
            </Link>
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
