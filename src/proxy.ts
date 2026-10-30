import { getSessionCookie } from "better-auth/cookies";
import { type NextRequest, NextResponse } from "next/server";

/**
 * PROXY (anciennement "middleware") : s'exécute avant chaque requête ciblée.
 *
 * Ici : redirection RAPIDE vers /connexion si aucun cookie de session n'est présent.
 * C'est un confort, pas une sécurité : le cookie n'est pas vérifié ici.
 * La vraie vérification reste dans chaque page (requireUser / requireAdmin)
 * et dans chaque Server Action (getCurrentUser).
 */
export function proxy(request: NextRequest) {
  if (!getSessionCookie(request)) {
    const url = new URL("/connexion", request.url);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/espace/:path*", "/admin/:path*"],
};
