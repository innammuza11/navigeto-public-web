// Sri Lanka destination guides: editorial copy (approved by Navigeto before
// publishing) plus pure helpers that match published tours to each place.
// No prices here: tour prices come only from the published catalogue.

export type DestinationGuide = {
  slug: string;
  name: string;
  region: string;
  art: string;
  metaTitle: string;
  metaDescription: string;
  headline: string;
  intro: string;
  highlights: Array<{ title: string; copy: string }>;
  bestTime: string;
  stay: string;
  gettingThere: string;
  /** Names used in published tour destinations/itineraries for this place. */
  aliases: string[];
  /** Place names that contain an alias but are elsewhere, e.g. Galle Face in Colombo. */
  excludes?: string[];
  pairWith: string[];
  faqs: Array<{ q: string; a: string }>;
};

export const DESTINATION_GUIDES: DestinationGuide[] = [
  {
    slug: "kandy",
    name: "Kandy",
    region: "Hill Country",
    art: "sri-lanka-kandy",
    metaTitle: "Kandy Tours & Travel Guide | Navigeto Travels",
    metaDescription: "Plan Kandy with Navigeto: the Temple of the Tooth, Kandy Lake and Peradeniya gardens, how long to stay, when to go and private tours that include Kandy.",
    headline: "Kandy, Sri Lanka's last royal capital.",
    intro: "Set around a lake in the central hills, Kandy was the seat of Sri Lanka's last kingdom and is home to the Temple of the Sacred Tooth Relic. The city is a UNESCO World Heritage Site and the natural first stop between the airport and the tea country.",
    highlights: [
      { title: "Temple of the Sacred Tooth Relic", copy: "Sri Lanka's most revered Buddhist shrine, best visited during the evening puja when drums and offerings fill the temple." },
      { title: "Peradeniya Royal Botanical Gardens", copy: "Avenues of royal palms, an orchid house and a giant Javan fig tree, just outside the city." },
      { title: "Kandy Lake and the old town", copy: "An easy lakeside walk, the colonial-era streets and the viewpoint above the city at sunset." },
      { title: "Esala Perahera", copy: "Kandy's great procession of dancers, drummers and decorated elephants, held in July or August each year." },
    ],
    bestTime: "Kandy can be visited all year. Mornings are fresh and afternoons warm; short showers are common in the monsoon months. Book early if your dates fall during the Esala Perahera.",
    stay: "One or two nights. One night covers the temple and lake; two lets you add Peradeniya, a tea factory or a cultural dance show without rushing.",
    gettingThere: "About three to three and a half hours by private car from Bandaranaike International Airport, and around two and a half hours from Sigiriya. Your chauffeur confirms timings on the day.",
    aliases: ["Kandy"],
    pairWith: ["sigiriya", "nuwara-eliya", "ella"],
    faqs: [
      { q: "How many days do you need in Kandy?", a: "Most travellers spend one or two nights. One night is enough for the Temple of the Tooth and Kandy Lake; a second adds the botanical gardens and a slower pace." },
      { q: "When is the Kandy Esala Perahera?", a: "The Perahera takes place over around ten nights in July or August, following the lunar calendar. Hotels fill quickly, so we confirm the year's dates and book well ahead." },
      { q: "Can I travel from Kandy to Ella by train?", a: "Yes. The hill-country railway from Kandy to Ella is one of Sri Lanka's most scenic journeys. We can reserve seats where available and arrange your car to meet you at the other end." },
    ],
  },
  {
    slug: "sigiriya",
    name: "Sigiriya & Dambulla",
    region: "Cultural Triangle",
    art: "sri-lanka-heritage",
    metaTitle: "Sigiriya & Dambulla Tours | Navigeto Travels",
    metaDescription: "Climb Sigiriya Rock, see the Dambulla cave temples and join an elephant safari. When to visit, how long to stay and private Sigiriya tours from Navigeto.",
    headline: "Sigiriya, the rock fortress of the Cultural Triangle.",
    intro: "Rising from the plains of the Cultural Triangle, Sigiriya is a fifth-century rock fortress and one of Sri Lanka's eight UNESCO World Heritage Sites. Nearby Dambulla, Polonnaruwa and the national parks make this the island's richest region for history and wildlife.",
    highlights: [
      { title: "Sigiriya Rock Fortress", copy: "Climb past the frescoes, the Mirror Wall and the Lion's Paw to the palace ruins on the summit. Start early to beat the heat." },
      { title: "Dambulla Cave Temple", copy: "A complex of painted cave shrines filled with Buddha statues, a UNESCO site a short drive from Sigiriya." },
      { title: "Pidurangala Rock", copy: "A shorter, quieter climb with a famous view across to Sigiriya, especially at sunrise." },
      { title: "Elephant safaris", copy: "Minneriya, Kaudulla and Eco Park draw large elephant herds, especially in the drier months of the year." },
    ],
    bestTime: "The Cultural Triangle is generally driest from around May to September, which is also the best season for elephant gatherings. Rain falls mainly from October to January, but the sites stay open all year.",
    stay: "Two nights lets you climb Sigiriya early, visit Dambulla and add a safari or Polonnaruwa without rushing.",
    gettingThere: "About three and a half to four hours by private car from the airport, and around two and a half hours from Kandy.",
    aliases: ["Sigiriya", "Dambulla", "Habarana", "Polonnaruwa"],
    pairWith: ["kandy", "yala", "nuwara-eliya"],
    faqs: [
      { q: "How long does it take to climb Sigiriya?", a: "Most people take two to three hours up and down, including time at the frescoes and the summit. There are around 1,200 steps, so start early in the morning." },
      { q: "Is it better to climb Sigiriya or Pidurangala?", a: "They suit different travellers. Sigiriya has the history and frescoes; Pidurangala is a shorter, steeper scramble with the classic view of Sigiriya. Many guests do both." },
      { q: "Where should I stay for Sigiriya?", a: "Sigiriya, Habarana and Dambulla are all within easy reach. We suggest hotels to match your style and the rest of your route." },
    ],
  },
  {
    slug: "nuwara-eliya",
    name: "Nuwara Eliya",
    region: "Tea Country",
    art: "sri-lanka-tea",
    metaTitle: "Nuwara Eliya Tea Country Guide | Navigeto Travels",
    metaDescription: "Visit Nuwara Eliya, Sri Lanka's tea country: tea estates, Gregory Lake and Horton Plains. How long to stay, when to go and private tours from Navigeto.",
    headline: "Nuwara Eliya, cool air and endless tea.",
    intro: "High in the central mountains, Nuwara Eliya is surrounded by tea estates and still shows traces of its colonial hill-station past. Cool evenings, misty mornings and nearby Horton Plains make it a calm contrast to the coast.",
    highlights: [
      { title: "Tea estates and factories", copy: "Walk through the plantations and see how Ceylon tea is withered, rolled and graded, with a tasting at the end." },
      { title: "Horton Plains and World's End", copy: "An early-morning walk across highland grassland to a sheer escarpment and Baker's Falls." },
      { title: "Gregory Lake and the town", copy: "Boating, a lakeside stroll and the old colonial buildings around the town centre." },
      { title: "The hill-country train", copy: "Nanu Oya station connects Nuwara Eliya to the scenic railway towards Ella and Kandy." },
    ],
    bestTime: "Pleasant all year, with cool nights. The driest months are usually from January to April. Bring a warm layer for evenings and early starts.",
    stay: "One or two nights. Add a second night if you want to walk Horton Plains at dawn.",
    gettingThere: "About two and a half hours by private car from Kandy, and around two hours from Ella.",
    aliases: ["Nuwara Eliya"],
    pairWith: ["kandy", "ella", "yala"],
    faqs: [
      { q: "How cold is Nuwara Eliya?", a: "Days are mild, but nights and early mornings can feel cold compared with the rest of Sri Lanka. A light jacket or fleece is enough for most travellers." },
      { q: "Can I visit Horton Plains from Nuwara Eliya?", a: "Yes. Horton Plains National Park is a short drive away. Most guests leave before dawn to walk to World's End before the mist rolls in." },
      { q: "Should I take the train from Nuwara Eliya to Ella?", a: "Many travellers do. The train leaves from Nanu Oya, near Nuwara Eliya, and your chauffeur can meet you in Ella with your luggage." },
    ],
  },
  {
    slug: "ella",
    name: "Ella",
    region: "Hill Country",
    art: "sri-lanka-river",
    metaTitle: "Ella Sri Lanka Guide & Tours | Navigeto Travels",
    metaDescription: "Plan Ella: Nine Arch Bridge, Little Adam's Peak and the scenic train. How long to stay, when to go and private Sri Lanka tours that include Ella.",
    headline: "Ella, viewpoints, waterfalls and the famous train.",
    intro: "Ella is a small hill-country town with big views. Short hikes lead to sweeping viewpoints, the Nine Arch Bridge carries the railway through the tea, and the scenic train ride here is a highlight of many Sri Lanka journeys.",
    highlights: [
      { title: "Nine Arch Bridge", copy: "A colonial-era railway viaduct in the jungle. Time your visit with a passing train." },
      { title: "Little Adam's Peak", copy: "An easy walk through tea gardens to a ridge-top viewpoint over the Ella Gap." },
      { title: "Ella Rock", copy: "A longer, more rewarding hike for active travellers, best started early." },
      { title: "Ravana Falls", copy: "A roadside waterfall just below the town, worth a short stop on the way south." },
    ],
    bestTime: "The driest months are usually from January to April, but Ella is enjoyable all year. Hikes are best in the early morning.",
    stay: "Two nights gives you time for the main walks and a relaxed evening in town.",
    gettingThere: "Reach Ella on the scenic train from Kandy or Nanu Oya, or by private car: about two hours from Nuwara Eliya and around two and a half to three hours from Yala.",
    aliases: ["Ella"],
    pairWith: ["nuwara-eliya", "yala", "kandy"],
    faqs: [
      { q: "How many days should I spend in Ella?", a: "Two nights is ideal for Little Adam's Peak, the Nine Arch Bridge and a longer hike such as Ella Rock." },
      { q: "Is the train to Ella worth it?", a: "For most travellers, yes. The line climbs through tea estates and mountain scenery. Seats are limited in peak months, so we plan around availability and keep your private car as a backup." },
      { q: "What is near Ella?", a: "Yala National Park, the south coast and Nuwara Eliya are all within a few hours, so Ella links easily into a wider route." },
    ],
  },
  {
    slug: "yala",
    name: "Yala",
    region: "Wildlife",
    art: "sri-lanka-wildlife",
    metaTitle: "Yala Safari Guide & Tours | Navigeto Travels",
    metaDescription: "Plan a Yala National Park safari: leopards, elephants and birdlife, when to go, how long to stay and private Sri Lanka wildlife tours from Navigeto.",
    headline: "Yala, Sri Lanka's leopard country.",
    intro: "Yala National Park, on the dry south-east coast, is Sri Lanka's best-known wildlife park and one of the best places in Asia to look for leopards. Elephants, sloth bears, crocodiles and abundant birdlife share the scrub, lagoons and rock outcrops.",
    highlights: [
      { title: "Jeep safaris", copy: "Morning and afternoon game drives in a private safari jeep with a tracker." },
      { title: "Leopards and elephants", copy: "Yala has one of the highest leopard densities in the world. Sightings are never guaranteed, which is part of the thrill." },
      { title: "Birdlife and lagoons", copy: "Painted storks, peacocks and migratory birds gather around the park's lagoons and the nearby Bundala wetlands." },
      { title: "Kataragama and Tissamaharama", copy: "Pilgrim towns and ancient stupas a short drive from the park gates." },
    ],
    bestTime: "Yala is open most of the year. The dry months make wildlife easier to spot. Parts of the park usually close for several weeks around September and October; we confirm the year's closure dates when you book.",
    stay: "One or two nights near Tissamaharama or Kirinda, which allows a morning and an afternoon safari.",
    gettingThere: "About two and a half to three hours by private car from Ella, and roughly four to five hours from Colombo by the Southern Expressway.",
    aliases: ["Yala", "Tissamaharama", "Kataragama"],
    pairWith: ["ella", "galle", "mirissa"],
    faqs: [
      { q: "Will I see a leopard in Yala?", a: "Many visitors do, but sightings depend on luck, season and time of day. Two game drives give you the best chance." },
      { q: "Is Yala open all year?", a: "Most of the year. Parts of the park usually close for a few weeks around September and October to let the wildlife rest. We check the current dates before planning your route." },
      { q: "Morning or afternoon safari?", a: "Both are good. Early mornings are cooler with active wildlife; afternoons have golden light. Staying a night nearby lets you do both." },
    ],
  },
  {
    slug: "galle",
    name: "Galle",
    region: "South Coast",
    art: "sri-lanka-coast",
    metaTitle: "Galle Fort Guide & Tours | Navigeto Travels",
    metaDescription: "Explore Galle Fort, its ramparts and lighthouse, plus nearby beaches. When to visit, how long to stay and private Sri Lanka tours that include Galle.",
    headline: "Galle, a walled fort town by the sea.",
    intro: "Galle Fort is a UNESCO World Heritage Site: a walled old town of Dutch-era streets, churches and villas on a headland above the Indian Ocean. Boutique shops, cafés and the ramparts at sunset make it a favourite on the south coast.",
    highlights: [
      { title: "The ramparts and lighthouse", copy: "Walk the fort walls past bastions and the lighthouse, ideally in the late afternoon." },
      { title: "Old town streets", copy: "Colonial houses, churches, museums, galleries and cafés within the fort walls." },
      { title: "Nearby beaches", copy: "Unawatuna, Jungle Beach and Koggala are a short drive away for swimming and snorkelling." },
      { title: "Stilt fishermen", copy: "The traditional stilt fishing seen along the coast near Koggala." },
    ],
    bestTime: "The south and west coasts are usually driest from around November to April. From May to September the sea is rougher, but the fort is pleasant to explore all year.",
    stay: "One or two nights in or near the fort, or visit as a day trip from a nearby beach hotel.",
    gettingThere: "About one and a half to two hours by private car from Colombo on the Southern Expressway, and roughly three hours from the airport.",
    aliases: ["Galle", "Unawatuna", "Koggala", "Hikkaduwa"],
    excludes: ["Galle Face"],
    pairWith: ["mirissa", "bentota", "yala"],
    faqs: [
      { q: "Is Galle Fort worth visiting?", a: "Yes. It is one of the best-preserved colonial fort towns in Asia and easy to explore on foot in half a day." },
      { q: "Can I stay inside Galle Fort?", a: "Yes, there are boutique hotels and villas inside the walls. Beach hotels nearby are another good option." },
      { q: "When is the best weather in Galle?", a: "Usually from November to April, when the south-west monsoon has passed and the sea is calmer." },
    ],
  },
  {
    slug: "mirissa",
    name: "Mirissa",
    region: "South Coast",
    art: "sri-lanka-coast",
    metaTitle: "Mirissa Beach & Whale Watching | Navigeto Travels",
    metaDescription: "Plan Mirissa: whale watching, a crescent beach and nearby surf towns. When to go, how long to stay and private Sri Lanka tours with a beach finish.",
    headline: "Mirissa, whales, surf and a crescent bay.",
    intro: "Mirissa is a relaxed south-coast beach town and Sri Lanka's best-known base for whale watching. Palm-fringed sand, sunset cafés and nearby surf breaks make it an easy place to end a journey.",
    highlights: [
      { title: "Whale watching", copy: "Morning boat trips look for blue whales, sperm whales and dolphins in the deep water offshore." },
      { title: "Coconut Tree Hill", copy: "A palm-covered headland that is one of the island's most photographed viewpoints." },
      { title: "Weligama and nearby beaches", copy: "Gentle surf for beginners at Weligama, and quieter coves along the coast." },
      { title: "Sunsets by the sea", copy: "Fresh seafood and beach cafés along the bay." },
    ],
    bestTime: "The beach and whale-watching season usually runs from about November to April, when the sea is calmer. From May to September the south-west monsoon brings rougher seas.",
    stay: "Two to four nights, depending on how much beach time you want at the end of your trip.",
    gettingThere: "About two and a half hours by private car from Colombo on the Southern Expressway, and around three hours from Yala.",
    aliases: ["Mirissa", "Weligama", "Tangalle"],
    pairWith: ["galle", "yala", "bentota"],
    faqs: [
      { q: "When can you see whales in Mirissa?", a: "Whale-watching trips usually run from about November to April. Sightings vary from day to day; boats leave early in the morning." },
      { q: "Is Mirissa good for swimming?", a: "In the calmer months the bay is good for swimming. Always follow local advice on currents and flags." },
      { q: "How do I combine Mirissa with the rest of Sri Lanka?", a: "Mirissa works well as the last stop after the hill country and Yala, followed by a drive back to Colombo or the airport." },
    ],
  },
  {
    slug: "bentota",
    name: "Bentota",
    region: "West Coast",
    art: "sri-lanka-river",
    metaTitle: "Bentota Beach Holidays | Navigeto Travels",
    metaDescription: "Plan Bentota: golden beaches, river safaris, water sports and Bawa gardens. When to go, how long to stay and private Sri Lanka tours with a beach stay.",
    headline: "Bentota, river, lagoon and golden sand.",
    intro: "Bentota sits where a river meets the sea on Sri Lanka's west coast. Long beaches, river safaris and water sports make it a popular, easy-to-reach beach stop, close to Colombo and the airport.",
    highlights: [
      { title: "Bentota River safari", copy: "A boat trip through mangroves and quiet backwaters to spot birds and monitor lizards." },
      { title: "Water sports", copy: "Jet skiing, windsurfing and banana-boat rides on the calm river lagoon." },
      { title: "Geoffrey Bawa's gardens", copy: "Lunuganga and the Brief Garden, the landscaped estates of Sri Lanka's famous architect and his brother." },
      { title: "Turtle hatcheries", copy: "Conservation hatcheries along the coast at nearby Kosgoda." },
    ],
    bestTime: "Usually driest and calmest from about November to April. The south-west monsoon brings rougher seas from around May to September.",
    stay: "Two to three nights, often at the end of a round trip before the airport.",
    gettingThere: "About one and a half hours by private car from Colombo on the Southern Expressway, and around two hours from the airport.",
    aliases: ["Bentota", "Beruwala", "Induruwa", "Kosgoda"],
    pairWith: ["galle", "mirissa", "kandy"],
    faqs: [
      { q: "Is Bentota good for families?", a: "Yes. The beaches, river safari and water sports suit families, and the short transfer to the airport keeps the last day easy." },
      { q: "How far is Bentota from the airport?", a: "Roughly two hours by private car, depending on traffic." },
      { q: "What is the best month for Bentota?", a: "From about November to April the weather is usually sunnier and the sea calmer." },
    ],
  },
];

export function guideBySlug(slug: string) {
  return DESTINATION_GUIDES.find(guide => guide.slug === slug) || null;
}

type TourPlaces = { slug: string; destinations?: string[]; itinerary?: Array<Record<string, unknown>> };

/** Published tours whose destinations or itinerary mention the guide's place. */
export function toursForGuide<T extends TourPlaces>(tours: T[], guide: DestinationGuide) {
  const names = guide.aliases.map(name => name.toLowerCase());
  const excluded = (guide.excludes || []).map(name => name.toLowerCase());
  return tours.filter(tour => {
    const places = [...(tour.destinations || []), ...(tour.itinerary || []).flatMap(day => ["title", "route", "location", "overnight"].map(key => day[key]).filter((value): value is string => typeof value === "string"))];
    return places.some(place => {
      let text = place.toLowerCase();
      for (const name of excluded) text = text.replaceAll(name, " ");
      return names.some(name => text.includes(name));
    });
  });
}

export function guideJsonLd(siteUrl: string, guide: DestinationGuide) {
  const url = `${siteUrl}/sri-lanka/${guide.slug}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "TouristDestination", "@id": `${url}#destination`, name: guide.name, description: guide.intro, url, image: `${siteUrl}/art/watercolour/${guide.art}.webp`, containedInPlace: { "@type": "Country", name: "Sri Lanka" }, touristType: guide.region },
      { "@type": "FAQPage", mainEntity: guide.faqs.map(faq => ({ "@type": "Question", name: faq.q, acceptedAnswer: { "@type": "Answer", text: faq.a } })) },
      { "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
        { "@type": "ListItem", position: 2, name: "Sri Lanka destinations", item: `${siteUrl}/sri-lanka` },
        { "@type": "ListItem", position: 3, name: guide.name, item: url },
      ] },
    ],
  };
}
