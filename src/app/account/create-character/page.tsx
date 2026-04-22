import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { CreateCharacterForm } from "./create-character-form";

export const metadata = { title: "Create Character" };

export default async function CreateCharacterPage() {
  const session = await auth();
  if (!session?.user?.accountId) redirect("/login");

  return (
    <div className="mx-auto max-w-md">
      <Card>
        <CardHeader
          title="New Character"
          actions={
            <Link
              href="/account"
              className="text-xs text-stone-400 hover:text-amber-300"
            >
              ← Back
            </Link>
          }
        />
        <CardBody>
          <p className="mb-4 text-sm text-stone-400">
            Pick a unique name and your character&apos;s sex. You&apos;ll start
            at level 1 in Rookgaard — choose your vocation inside the game.
          </p>
          <CreateCharacterForm />
        </CardBody>
      </Card>
    </div>
  );
}
