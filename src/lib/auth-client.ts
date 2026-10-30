"use client";

import { createAuthClient } from "better-auth/react";

/**
 * Client d'authentification pour les composants navigateur ("use client") :
 * inscription, connexion, déconnexion, connexion Google.
 * Il appelle les routes /api/auth/* exposées par Better Auth.
 */
export const authClient = createAuthClient();

export const { signIn, signUp, signOut, requestPasswordReset, resetPassword } = authClient;
