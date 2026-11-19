// Answer-engine and AI-search (AEO/GEO) content: short, factual answers that
// search engines and AI assistants can quote, plus the /llms.txt summary.
// Copy is approved by Navigeto before publishing. No prices and no internal
// cost or supplier data: tour prices come only from the published catalogue.

export type Faq = { q: string; a: string };

export const INDEXNOW_KEY = "6bed7d5d56cc6ba16594d58ed8ae655e";

/** Dates the editorial guides were last reviewed (shown on the page and in schema). */
export const CONTENT_REVIEWED = { guides: "2026-11-03", itineraries: "2026-11-05" } as const;

export const ORGANIZATION_FACTS = {
  name: "Navigeto Travels",
  legalName: "Navigeto Travels (Pvt) Ltd",
  location: "Colombo, Sri Lanka",
  phone: "+94 77 420 6166",
  whatsapp: "https://wa.me/94774206166",
  email: "info@navigeto.com",
  services: ["Private Sri Lanka tours", "Tailor-made Sri Lanka holidays", "Sri Lanka hotels", "Airport and private transfers", "Flights", "International holiday packages", "Visa assistance for Sri Lankan passport holders", "Corporate and group travel"],
  knowsAbout: ["Sri Lanka travel", "Sri Lanka private tours", "Sri Lanka itineraries", "Sri Lanka hotels", "Cultural Triangle", "Sri Lanka hill country", "Sri Lanka wildlife safaris", "Sri Lanka beaches", "Visa requirements for Sri Lankan passport holders"],
} as const;

export const HUB_FAQS: Record<"/" | "/tours" | "/visas", { heading: string; faqs: Faq[] }> = {
  "/": {
    heading: "Planning Sri Lanka with Navigeto: answers.",
    faqs: [
      { q: "Who are Navigeto Travels?", a: "Navigeto Travels is a Colombo-based travel agency and destination management company. We plan private Sri Lanka tours, hotels, airport transfers, flights, international holidays and visa assistance, and a local team handles every booking." },
      { q: "How do I plan a private Sri Lanka tour with Navigeto?", a: "Send your dates, number of travellers and interests through the website or on WhatsApp (+94 77 420 6166). A Sri Lanka specialist replies with a suggested route, hotel options and a quotation, then adjusts it with you until it fits." },
      { q: "When is the best time to visit Sri Lanka?", a: "Sri Lanka can be visited all year because its two monsoons reach different coasts at different times. December to April is usually best for the south and west coasts and the hill country; May to September suits the east coast, such as Trincomalee and Arugam Bay." },
      { q: "How many days do I need in Sri Lanka?", a: "Seven days covers the Cultural Triangle, Kandy and one beach or hill stop at a comfortable pace. Ten days adds the tea country and a safari, and fourteen days lets you see most of the island without rushing. Our 7, 10 and 14-day itineraries show each route day by day." },
      { q: "Are the prices on the website final?", a: "Tour and hotel prices on the website are selling prices for the dates and party shown. A consultant rechecks availability and confirms the final price in writing before you pay anything." },
      { q: "Can Navigeto help with visas?", a: "Yes. We give destination-specific visa guidance for Sri Lankan passport holders travelling abroad and review your documents before you apply. A consultant rechecks the requirements for every application." },
    ],
  },
  "/tours": {
    heading: "Sri Lanka tours: answers.",
    faqs: [
      { q: "Can I change a tour itinerary?", a: "Yes. Every private tour can be adjusted: add or remove nights, change hotels or slow the pace. Use \"Get a quote for these choices\" on any tour page, or send your changes on WhatsApp." },
      { q: "What is the difference between private and group tours?", a: "A private tour runs only for your party, on the dates you choose. Group departures have fixed dates and are shared with other travellers." },
      { q: "Which hotels are used on the tours?", a: "Each tour shows a hotel standard, such as 3, 4 or 5 star, and your quotation names the hotels for each night. You can ask for alternatives at any point." },
      { q: "Do you offer tours outside Sri Lanka?", a: "Yes. Alongside Sri Lanka we offer holidays to destinations such as Malaysia, Singapore, Thailand, Vietnam and the United Arab Emirates, with flights and hotels arranged together." },
    ],
  },
  "/visas": {
    heading: "Visa assistance: answers.",
    faqs: [
      { q: "Who is the Navigeto visa service for?", a: "It is designed for Sri Lankan passport holders travelling abroad. Each destination page lists the visa types and documents we have verified." },
      { q: "Does Navigeto guarantee a visa?", a: "No. The decision is always made by the destination's immigration authority. We help you prepare a complete application and explain the verified requirements." },
      { q: "How up to date are the visa requirements?", a: "Each destination page shows when its requirements were last verified against official sources. Rules can change at short notice, so a consultant rechecks them before you apply." },
      { q: "How much does visa assistance cost?", a: "It depends on the destination and visa type. Your consultant confirms the government fee and the service charge before you go ahead." },
    ],
  },
};

export function faqJsonLd(faqs: Faq[]) {
  return { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map(faq => ({ "@type": "Question", name: faq.q, acceptedAnswer: { "@type": "Answer", text: faq.a } })) };
}

/** schema.org WebPage node that tells search and AI engines who wrote a page and when it was reviewed. */
export function reviewedPageNode(siteUrl: string, path: string, name: string, dateModified: string) {
  return { "@type": "WebPage", "@id": `${siteUrl}${path}#webpage`, url: `${siteUrl}${path}`, name, inLanguage: "en", dateModified, isPartOf: { "@id": `${siteUrl}/#website` }, author: { "@id": `${siteUrl}/#organization` }, publisher: { "@id": `${siteUrl}/#organization` } };
}

export function reviewedLabel(date: string) {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });
}

type LinkItem = { title: string; path: string; note?: string };

export type LlmsInput = {
  guides: LinkItem[];
  itineraries: LinkItem[];
  visas: LinkItem[];
  tours: LinkItem[];
};

const clean = (value: string) => value.replace(/\s+/g, " ").replace(/[[\]]/g, "").trim();

/** Builds /llms.txt (llmstxt.org format): a plain-language map of the site for AI assistants. */
export function buildLlmsTxt(siteUrl: string, input: LlmsInput) {
  const link = (item: LinkItem) => `- [${clean(item.title)}](${siteUrl}${item.path})${item.note ? `: ${clean(item.note)}` : ""}`;
  const section = (title: string, items: LinkItem[]) => items.length ? [`## ${title}`, "", ...items.map(link), ""] : [];
  const f = ORGANIZATION_FACTS;
  return [
    `# ${f.name}`,
    "",
    `> ${f.name} is a travel agency and destination management company based in ${f.location}. It plans private and tailor-made Sri Lanka tours, hotels, airport transfers, flights, international holidays and visa assistance for Sri Lankan passport holders.`,
    "",
    "Key facts:",
    `- Contact: ${f.phone} (phone and WhatsApp, ${f.whatsapp}), ${f.email}`,
    `- Services: ${f.services.join("; ")}`,
    "- Prices shown on the website are selling prices; availability and the final price are confirmed in writing by a consultant before payment.",
    "- Visa information covers Sri Lankan passport holders and is rechecked by a consultant for every application. Navigeto does not decide or guarantee visas.",
    "- To request a quote, use the enquiry form on any page, the custom trip planner or WhatsApp.",
    "",
    ...section("Plan a trip", [
      { title: "Plan a tailor-made Sri Lanka trip", path: "/custom-trip", note: "Share dates, travellers and interests for a private quotation" },
      { title: "Sri Lanka tours", path: "/tours/sri-lanka", note: "Private tours that can be customised" },
      { title: "International tours", path: "/tours/international" },
      { title: "Group departures", path: "/group-tours", note: "Fixed-date shared tours" },
      { title: "Sri Lanka hotels", path: "/hotels" },
      { title: "Airport and private transfers", path: "/transfers" },
      { title: "Flights", path: "/flights" },
      { title: "Visa assistance", path: "/visas" },
      { title: "Corporate and group travel", path: "/corporate" },
    ]),
    ...section("Sri Lanka destination guides", input.guides),
    ...section("Sri Lanka itineraries", input.itineraries),
    ...section("Visa guides (verified requirements)", input.visas),
    ...section("Tour packages", input.tours),
    "## About",
    "",
    link({ title: "About Navigeto Travels", path: "/about" }),
    link({ title: "Customer reviews", path: "/reviews" }),
    link({ title: "Contact", path: "/contact" }),
    link({ title: "Booking terms", path: "/terms" }),
    link({ title: "Privacy policy", path: "/privacy" }),
    "",
  ].join("\n");
}
