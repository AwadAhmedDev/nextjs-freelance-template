import Link from "next/link";
import { SignOutButton } from "@/components/sign-out-button";
import { getCurrentUser } from "@/lib/session";

/** Lit la session : doit rester dans un <Suspense> (voir SiteHeader). */
export async function UserMenu() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <Link href="/connexion" className="hover:underline">
        Connexion
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-4">
      {user.role === "admin" && (
        <Link href="/admin" className="hover:underline">
          Administration
        </Link>
      )}
      <Link href="/espace" className="hover:underline">
        Mon espace
      </Link>
      <SignOutButton />
    </div>
  );
}
