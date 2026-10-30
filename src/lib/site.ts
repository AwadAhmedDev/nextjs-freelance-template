/**
 * Informations du site, utilisées par le SEO, les mentions légales et les emails.
 * C'est le PREMIER fichier à modifier pour un nouveau client.
 */
export const siteConfig = {
  name: "Mon Site",
  description: "Prise de rendez-vous en ligne avec acompte.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  locale: "fr_FR",
  // Données de l'entreprise (mentions légales, données structurées)
  company: {
    legalName: "Nom de l'entreprise",
    address: "1 rue Exemple, 75001 Paris",
    email: "contact@exemple.fr",
    phone: "01 23 45 67 89",
    siret: "000 000 000 00000",
  },
  // Hébergeur (obligatoire dans les mentions légales)
  host: {
    name: "Nom de l'hébergeur",
    address: "Adresse de l'hébergeur",
  },
} as const;
