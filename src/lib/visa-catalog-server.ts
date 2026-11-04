import type { PublicVisaProduct } from "@/lib/visa-pages";

const ADMIN_ORIGIN = process.env.TRAVELOS_ADMIN_ORIGIN || "https://admin.navigeto.com";

/** The public, rate-limited Visa catalogue (reads visa_rules_active), cached for six hours. */
export async function publicVisaCatalog(): Promise<PublicVisaProduct[]> {
  const response = await fetch(`${ADMIN_ORIGIN}/api/visa/catalog`, { headers: { accept: "application/json" }, next: { revalidate: 21600 } });
  if (!response.ok) throw new Error(`Visa catalogue unavailable (${response.status})`);
  const body = await response.json() as { data?: { products?: PublicVisaProduct[] } };
  return Array.isArray(body?.data?.products) ? body.data.products : [];
}
