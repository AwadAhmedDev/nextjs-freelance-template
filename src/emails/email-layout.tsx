import type { ReactNode } from "react";
import { Body, Container, Head, Hr, Html, Preview, Section, Text } from "react-email";

/** Mise en page commune à tous les emails : change ici le nom et les couleurs du client. */
export function EmailLayout({ preview, children }: { preview: string; children: ReactNode }) {
  return (
    <Html lang="fr">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={{ backgroundColor: "#f5f5f4", fontFamily: "Arial, Helvetica, sans-serif" }}>
        <Container
          style={{
            backgroundColor: "#ffffff",
            margin: "24px auto",
            padding: "32px",
            maxWidth: "560px",
            borderRadius: "8px",
          }}
        >
          <Section>{children}</Section>
          <Hr style={{ borderColor: "#e7e5e4", margin: "32px 0 16px" }} />
          <Text style={{ color: "#78716c", fontSize: "12px" }}>
            Cet email vous a été envoyé automatiquement. Merci de ne pas y répondre directement.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
