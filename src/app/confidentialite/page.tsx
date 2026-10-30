import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = { title: "Politique de confidentialité" };

/**
 * Modèle à adapter pour chaque projet avec la checklist docs/securite-rgpd.md.
 * Liste uniquement les données réellement collectées, et les vraies durées.
 */
export default function PrivacyPage() {
  return (
    <article className="grid max-w-prose gap-4">
      <h1 className="text-3xl font-bold tracking-tight">Politique de confidentialité</h1>

      <h2 className="text-xl font-semibold">Responsable du traitement</h2>
      <p>
        {siteConfig.company.legalName}, {siteConfig.company.address}. Contact :{" "}
        {siteConfig.company.email}.
      </p>

      <h2 className="text-xl font-semibold">Données collectées et finalités</h2>
      <ul className="list-disc pl-6">
        <li>Nom et email : création du compte et envoi des confirmations de réservation.</li>
        <li>Réservations : gestion des rendez-vous.</li>
        <li>
          Paiement : traité par Stripe. Nous ne recevons ni ne conservons vos données de carte
          bancaire.
        </li>
      </ul>

      <h2 className="text-xl font-semibold">Durée de conservation</h2>
      <p>
        Les données du compte sont conservées tant que le compte est actif, puis supprimées après 3
        ans d&apos;inactivité. Les données de facturation sont conservées 10 ans (obligation
        légale).
      </p>

      <h2 className="text-xl font-semibold">Sous-traitants</h2>
      <p>Hébergement : {siteConfig.host.name}. Paiement : Stripe. Envoi d&apos;emails : Resend.</p>

      <h2 className="text-xl font-semibold">Vos droits</h2>
      <p>
        Vous pouvez accéder à vos données, les rectifier, les supprimer ou vous opposer à leur
        traitement en écrivant à {siteConfig.company.email}. Vous pouvez aussi saisir la CNIL
        (cnil.fr).
      </p>

      <h2 className="text-xl font-semibold">Cookies</h2>
      <p>
        Ce site utilise uniquement un cookie de session, nécessaire à la connexion. Il ne nécessite
        pas de consentement. Si vous ajoutez un outil de mesure d&apos;audience ou de publicité,
        ajoutez un bandeau de consentement.
      </p>
    </article>
  );
}
