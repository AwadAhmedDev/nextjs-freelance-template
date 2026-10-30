import type { Metadata } from "next";
import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";

export const metadata: Metadata = {
  title: "Nouveau mot de passe",
  robots: { index: false },
};

export default function ResetPasswordPage() {
  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle>Nouveau mot de passe</CardTitle>
      </CardHeader>
      <CardContent>
        <Suspense>
          <ResetPasswordForm />
        </Suspense>
      </CardContent>
    </Card>
  );
}
