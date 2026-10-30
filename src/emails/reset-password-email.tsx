import { Button, Heading, Text } from "react-email";
import { EmailLayout } from "./email-layout";

export function ResetPasswordEmail({ name, url }: { name: string; url: string }) {
  return (
    <EmailLayout preview="Réinitialisez votre mot de passe">
      <Heading as="h1" style={{ fontSize: "22px" }}>
        Réinitialisation du mot de passe
      </Heading>
      <Text>Bonjour {name},</Text>
      <Text>Vous avez demandé à changer votre mot de passe. Ce lien est valable une heure.</Text>
      <Button
        href={url}
        style={{
          backgroundColor: "#1c1917",
          color: "#ffffff",
          padding: "12px 20px",
          borderRadius: "6px",
        }}
      >
        Choisir un nouveau mot de passe
      </Button>
      <Text>Si vous n&apos;êtes pas à l&apos;origine de cette demande, ignorez cet email.</Text>
    </EmailLayout>
  );
}
