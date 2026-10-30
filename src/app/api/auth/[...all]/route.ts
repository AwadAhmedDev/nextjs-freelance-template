import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";

/**
 * Routes HTTP de Better Auth : /api/auth/sign-in/email, /api/auth/sign-up/email,
 * /api/auth/callback/google, /api/auth/sign-out...
 * Appelées par le client d'authentification (src/lib/auth-client.ts) et par Google.
 */
export const { GET, POST } = toNextJsHandler(auth);
