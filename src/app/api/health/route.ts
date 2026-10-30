import { prisma } from "@/lib/prisma";

/**
 * Sonde de disponibilité : GET /api/health
 * Utilisée par Docker (healthcheck) et par ton service de surveillance
 * (Uptime Kuma, Better Stack...) pour être alerté si le site ou la base tombe.
 * Ne renvoie aucune information sensible.
 */
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return Response.json({ status: "ok" }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Healthcheck : base de données injoignable", error);
    return Response.json(
      { status: "error" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
