// Visa destination pages for Sri Lankan passport holders, built only from the
// public Visa catalogue (which reads visa_rules_active). A destination is
// indexable only while every one of its services is officially verified.

export type PublicVisaProduct = {
  id: string;
  destinationCode: string;
  destination: string;
  region?: string | null;
  flag?: string | null;
  visaType?: string | null;
  packageName: string;
  totalEstimate?: number | null;
  currency?: string | null;
  governmentFeeIncluded?: boolean;
  processingTime?: string | null;
  maxStayDays?: number | null;
  entryType?: string | null;
  resultLabel?: string | null;
  inclusions?: string[];
  exclusions?: string[];
  requiredDocuments?: string[];
  conditionalDocuments?: Array<{ name: string; when: string }>;
  financialEvidenceGuidance?: string | null;
  documentStatus?: string | null;
  documentSourceUrls?: string[];
  lastVerifiedAt?: string | null;
};

export type VisaDestination = {
  slug: string;
  name: string;
  code: string;
  region: string;
  flag: string;
  products: PublicVisaProduct[];
  verified: boolean;
  lastVerifiedAt: string | null;
};

export function visaDestinationSlug(name: string) {
  return name.toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/[\s_]+/g, "-").replace(/-+/g, "-");
}

export function visaDestinations(products: PublicVisaProduct[]): VisaDestination[] {
  const groups = new Map<string, PublicVisaProduct[]>();
  for (const product of products) {
    if (!product?.destination || !product.destinationCode) continue;
    groups.set(product.destinationCode, [...(groups.get(product.destinationCode) || []), product]);
  }
  return [...groups.values()].map(list => {
    const first = list[0];
    const dates = list.map(product => product.lastVerifiedAt).filter((value): value is string => Boolean(value)).sort();
    return {
      slug: visaDestinationSlug(first.destination),
      name: first.destination,
      code: first.destinationCode,
      region: first.region || "",
      flag: first.flag || "",
      products: list,
      verified: list.every(product => product.documentStatus === "officially_verified"),
      lastVerifiedAt: dates[0] || null,
    };
  }).sort((a, b) => a.name.localeCompare(b.name));
}

export function visaPageFaqs(destination: VisaDestination) {
  const main = destination.products[0];
  const documents = main.requiredDocuments || [];
  return [
    { q: `Do Sri Lankans need a visa for ${destination.name}?`, a: `${main.resultLabel || "A visa or travel authorisation is required"} for Sri Lankan passport holders travelling for ${main.visaType || "tourism"}. A Navigeto consultant confirms the right visa for your purpose and dates before you apply.` },
    ...(documents.length ? [{ q: `What documents do I need for a ${destination.name} visa?`, a: `The main documents are: ${documents.join("; ")}. Extra documents may apply depending on your situation.` }] : []),
    { q: `How long does a ${destination.name} visa take?`, a: main.processingTime || "Processing time is confirmed against the authority's current service level before submission." },
  ];
}

export function visaJsonLd(siteUrl: string, destination: VisaDestination) {
  const url = `${siteUrl}/visas/${destination.slug}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "FAQPage", "@id": `${url}#faq`, mainEntity: visaPageFaqs(destination).map(faq => ({ "@type": "Question", name: faq.q, acceptedAnswer: { "@type": "Answer", text: faq.a } })) },
      { "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
        { "@type": "ListItem", position: 2, name: "Visas", item: `${siteUrl}/visas` },
        { "@type": "ListItem", position: 3, name: `${destination.name} visa`, item: url },
      ] },
    ],
  };
}
