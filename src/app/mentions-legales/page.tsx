import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = { title: "Mentions légales" };

/** À compléter avec les vraies informations du client (src/lib/site.ts). */
export default function LegalNoticePage() {
  const { company, host } = siteConfig;
  return (
    <article className="grid max-w-prose gap-4">
      <h1 className="text-3xl font-bold tracking-tight">Mentions légales</h1>
      <h2 className="text-xl font-semibold">Éditeur du site</h2>
      <p>
        {company.legalName}
        <br />
        {company.address}
        <br />
        SIRET : {company.siret}
        <br />
        Contact : {company.email} · {company.phone}
      </p>
      <h2 className="text-xl font-semibold">Hébergement</h2>
      <p>
        {host.name}
        <br />
        {host.address}
      </p>
    </article>
  );
}
