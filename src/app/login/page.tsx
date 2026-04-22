import Link from "next/link";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { LoginForm } from "./login-form";

export const metadata = { title: "Login" };

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md">
      <Card>
        <CardHeader title="Sign In" />
        <CardBody>
          <LoginForm />
          <p className="mt-3 text-center text-xs text-stone-500">
            <Link href="/login/forgot" className="text-amber-400 hover:underline">
              Forgot my password
            </Link>
          </p>
          <p className="mt-2 text-center text-xs text-stone-500">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-amber-400 hover:underline">
              Create one
            </Link>
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
