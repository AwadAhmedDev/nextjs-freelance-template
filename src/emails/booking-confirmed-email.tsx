import { Heading, Text } from "react-email";
import { formatCents, formatDateTime } from "@/lib/utils";
import { EmailLayout } from "./email-layout";

type Props = { name: string; startsAt: Date; depositCents: number };

export function BookingConfirmedEmail({ name, startsAt, depositCents }: Props) {
  return (
    <EmailLayout preview="Votre réservation est confirmée">
      <Heading as="h1" style={{ fontSize: "22px" }}>
        Réservation confirmée
      </Heading>
      <Text>Bonjour {name},</Text>
      <Text>
        Votre acompte de {formatCents(depositCents)} a bien été reçu. Votre rendez-vous est confirmé
        pour le <strong>{formatDateTime(startsAt)}</strong>.
      </Text>
      <Text>À bientôt !</Text>
    </EmailLayout>
  );
}
