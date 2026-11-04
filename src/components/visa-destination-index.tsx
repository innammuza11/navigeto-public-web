import Link from "next/link";
import { publicVisaCatalog } from "@/lib/visa-catalog-server";
import { visaDestinations } from "@/lib/visa-pages";

/** Server-rendered links to every destination's visa page, under the client-side storefront. */
export async function VisaDestinationIndex() {
  const destinations = visaDestinations(await publicVisaCatalog().catch(() => []));
  if (!destinations.length) return null;
  return <section className="shell tour-index" aria-labelledby="visa-index-title">
    <p className="eyebrow">Visa guides</p>
    <h2 id="visa-index-title">Visa requirements for Sri Lankans, by destination</h2>
    <ul className="destination-tours">{destinations.map(item => <li key={item.code}><Link prefetch={false} href={`/visas/${item.slug}`}>{item.flag} {item.name} visa</Link><small>{item.products.length} service{item.products.length === 1 ? "" : "s"}</small></li>)}</ul>
  </section>;
}
