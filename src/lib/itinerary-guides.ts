// Suggested Sri Lanka itineraries: editorial routes (approved by Navigeto
// before publishing) plus helpers that match published tours by length.
// No prices here: tour prices come only from the published catalogue.

export type ItineraryDay = { day: string; title: string; copy: string; stop?: string };

export type ItineraryGuide = {
  slug: string;
  name: string;
  metaTitle: string;
  metaDescription: string;
  headline: string;
  intro: string;
  suits: string[];
  days: ItineraryDay[];
  tips: string[];
  /** Published tours of roughly this length are suggested as ready-made versions. */
  durationDays: [number, number];
  faqs: Array<{ q: string; a: string }>;
};

export const ITINERARY_GUIDES: ItineraryGuide[] = [
  {
    slug: "sri-lanka-7-days",
    name: "Sri Lanka in 7 days",
    metaTitle: "Sri Lanka 7-Day Itinerary | Navigeto Travels",
    metaDescription: "A 7-day Sri Lanka itinerary by private car: Sigiriya, Kandy, tea country, the Ella train and the south coast. Day by day, with tours you can book.",
    headline: "Sri Lanka in 7 days: the classic first trip.",
    intro: "One week is enough to see the best of Sri Lanka's highlights at a comfortable pace: an ancient rock fortress, the hill capital, tea country, the famous train ride to Ella and a final night by the sea.",
    suits: ["First-time visitors", "Couples and friends", "Travellers with one week of leave"],
    days: [
      { day: "Day 1", title: "Arrive and drive to Sigiriya", copy: "Meet your chauffeur at the airport and drive to the Cultural Triangle. Relax at your hotel after the journey.", stop: "sigiriya" },
      { day: "Day 2", title: "Sigiriya Rock and Dambulla", copy: "Climb Sigiriya early in the morning, then visit the Dambulla cave temples in the afternoon. An elephant safari is an optional add-on.", stop: "sigiriya" },
      { day: "Day 3", title: "To Kandy", copy: "Drive to Kandy, stopping at a spice garden. Visit the Temple of the Tooth for the evening ceremony.", stop: "kandy" },
      { day: "Day 4", title: "Tea country", copy: "Wind up into the mountains to Nuwara Eliya, with a tea factory visit and tasting on the way.", stop: "nuwara-eliya" },
      { day: "Day 5", title: "The train to Ella", copy: "Take the scenic hill-country train to Ella while your car carries the luggage. Sunset walk to Little Adam's Peak if time allows.", stop: "ella" },
      { day: "Day 6", title: "Down to the south coast", copy: "See the Nine Arch Bridge in the morning, then drive down past Ravana Falls to a beach hotel on the south coast.", stop: "mirissa" },
      { day: "Day 7", title: "Galle and departure", copy: "Walk the ramparts of Galle Fort, then take the expressway back to the airport for your flight." , stop: "galle" },
    ],
    tips: ["Seven days means a new hotel most nights; if you prefer fewer changes, drop the beach night and stay two nights in Ella.", "Train seats are limited in peak months, so we plan around availability and keep your car as a backup."],
    durationDays: [6, 8],
    faqs: [
      { q: "Is 7 days enough for Sri Lanka?", a: "Yes, for the highlights. A week covers the Cultural Triangle, Kandy, tea country and Ella, with a short finish on the south coast. Add three or four days if you want wildlife and more beach time." },
      { q: "What is the best way to get around in a week?", a: "A private car with a chauffeur is the easiest way. It keeps the route flexible and lets you stop wherever you like." },
      { q: "Can I change this itinerary?", a: "Every day can be changed: more nights in one place, different hotels or other stops. Send us your dates and we will tailor it." },
    ],
  },
  {
    slug: "sri-lanka-10-days",
    name: "Sri Lanka in 10 days",
    metaTitle: "Sri Lanka 10-Day Itinerary | Navigeto Travels",
    metaDescription: "A 10-day Sri Lanka itinerary: culture, tea country, Ella, a Yala safari and beach time, by private car. Day by day, with tours you can book.",
    headline: "Sri Lanka in 10 days: culture, wildlife and beaches.",
    intro: "Ten days lets you add wildlife and real beach time to the classic route: ancient cities, the hill country, a safari in Yala and a few slow days on the south coast.",
    suits: ["Travellers who want the full mix", "Wildlife lovers", "Couples and families"],
    days: [
      { day: "Day 1", title: "Arrive and drive to Sigiriya", copy: "Meet your chauffeur at the airport and drive to the Cultural Triangle.", stop: "sigiriya" },
      { day: "Day 2", title: "Sigiriya and Dambulla", copy: "Climb Sigiriya at sunrise and visit the Dambulla cave temples.", stop: "sigiriya" },
      { day: "Day 3", title: "Polonnaruwa or an elephant safari", copy: "Cycle around the ancient city of Polonnaruwa, or join an afternoon elephant safari nearby.", stop: "sigiriya" },
      { day: "Day 4", title: "To Kandy", copy: "Drive to Kandy via a spice garden and visit the Temple of the Tooth.", stop: "kandy" },
      { day: "Day 5", title: "Tea country", copy: "Into the mountains to Nuwara Eliya, with a tea factory visit.", stop: "nuwara-eliya" },
      { day: "Day 6", title: "The train to Ella", copy: "Ride the scenic train to Ella while your car takes the luggage.", stop: "ella" },
      { day: "Day 7", title: "A day in Ella", copy: "Walk to Little Adam's Peak or Ella Rock and see the Nine Arch Bridge.", stop: "ella" },
      { day: "Day 8", title: "Yala safari", copy: "Drive down to Yala for an afternoon jeep safari in leopard country.", stop: "yala" },
      { day: "Day 9", title: "South coast", copy: "Continue to the south coast for a relaxed beach afternoon, or whale watching in season.", stop: "mirissa" },
      { day: "Day 10", title: "Galle and departure", copy: "Explore Galle Fort, then take the expressway to the airport.", stop: "galle" },
    ],
    tips: ["Parts of Yala usually close for a few weeks around September and October; in those weeks we suggest Udawalawe or Bundala instead.", "Add a second beach night if your flight leaves late at night."],
    durationDays: [9, 11],
    faqs: [
      { q: "Is 10 days a good length for Sri Lanka?", a: "It is the most popular length. It covers the main highlights plus a safari and some beach time without feeling rushed." },
      { q: "Should I end on the beach or start there?", a: "Most guests end on the beach so the last days are relaxing, and the south coast is close to the airport via the expressway." },
      { q: "Can children do this route?", a: "Yes. We adjust the pace, choose family-friendly hotels and keep drives shorter. Tell us the children's ages when you enquire." },
    ],
  },
  {
    slug: "sri-lanka-14-days",
    name: "Sri Lanka in 14 days",
    metaTitle: "Sri Lanka 14-Day Itinerary | Navigeto Travels",
    metaDescription: "A 2-week Sri Lanka itinerary at an easy pace: ancient cities, tea country, Ella, Yala, Galle and the beach, by private car. Day by day.",
    headline: "Sri Lanka in two weeks, at an easy pace.",
    intro: "Two weeks gives you time to slow down: more nights in each place, the ancient capitals of the north, the hill country, a safari, Galle Fort and several days on the beach at the end.",
    suits: ["Travellers who dislike rushing", "Long-haul visitors", "Slow travellers and photographers"],
    days: [
      { day: "Day 1", title: "Arrive in Negombo", copy: "Rest after your flight at a hotel near the airport and the beach.", },
      { day: "Day 2", title: "To Anuradhapura or Sigiriya", copy: "Drive north to the ancient capital of Anuradhapura, or straight to Sigiriya for a quieter start.", stop: "sigiriya" },
      { day: "Day 3", title: "Sigiriya and Pidurangala", copy: "Climb Sigiriya early, then watch the sunset from Pidurangala.", stop: "sigiriya" },
      { day: "Day 4", title: "Polonnaruwa and a safari", copy: "Explore Polonnaruwa in the morning and join an elephant safari in the afternoon.", stop: "sigiriya" },
      { day: "Day 5", title: "Dambulla to Kandy", copy: "Visit the Dambulla cave temples on the way to Kandy.", stop: "kandy" },
      { day: "Day 6", title: "A day in Kandy", copy: "Botanical gardens, the lake and a cultural dance show in the evening.", stop: "kandy" },
      { day: "Day 7", title: "Tea country", copy: "Drive to Nuwara Eliya through tea estates, with a factory visit.", stop: "nuwara-eliya" },
      { day: "Day 8", title: "Horton Plains", copy: "Early walk to World's End on Horton Plains, then a relaxed afternoon.", stop: "nuwara-eliya" },
      { day: "Day 9", title: "The train to Ella", copy: "Ride the scenic train to Ella.", stop: "ella" },
      { day: "Day 10", title: "A day in Ella", copy: "Hikes, viewpoints and the Nine Arch Bridge.", stop: "ella" },
      { day: "Day 11", title: "Yala safari", copy: "Drive to Yala for an afternoon jeep safari.", stop: "yala" },
      { day: "Day 12", title: "South coast", copy: "Morning safari option, then on to the beach.", stop: "mirissa" },
      { day: "Day 13", title: "Beach and Galle", copy: "A free beach day, with an evening walk on the Galle Fort ramparts.", stop: "galle" },
      { day: "Day 14", title: "Departure", copy: "Take the expressway back to the airport." },
    ],
    tips: ["With two weeks you can swap Yala for a few days on the east coast between May and September, when the east has its best weather.", "We can add a night in Colombo for shopping and food before you fly."],
    durationDays: [12, 16],
    faqs: [
      { q: "What can I add with two weeks in Sri Lanka?", a: "More nights in each place, Horton Plains, the ancient cities of the north and several days on the beach. The east coast is another option in the middle of the year." },
      { q: "Is two weeks too long for Sri Lanka?", a: "Not at all. The island is varied, and two weeks lets you travel without long drives every day." },
      { q: "When is the best time for a two-week trip?", a: "From about December to April the west and south coasts are at their best. From May to September the east coast is better. We plan the route around your dates." },
    ],
  },
  {
    slug: "sri-lanka-honeymoon",
    name: "Sri Lanka honeymoon",
    metaTitle: "Sri Lanka Honeymoon Itinerary | Navigeto Travels",
    metaDescription: "A 10-day Sri Lanka honeymoon itinerary: boutique stays, tea country, the Ella train and slow days on the beach, planned privately for two.",
    headline: "A Sri Lanka honeymoon, planned for two.",
    intro: "Sri Lanka suits a honeymoon well: boutique hotels, private drives, cool tea-country evenings and quiet beaches, all within a short flight of many countries.",
    suits: ["Honeymooners", "Anniversaries", "Couples who want boutique stays"],
    days: [
      { day: "Days 1–2", title: "Sigiriya in style", copy: "Settle into a boutique lodge near Sigiriya. Climb the rock early and spend the afternoon by the pool.", stop: "sigiriya" },
      { day: "Day 3", title: "Kandy", copy: "Drive to Kandy and see the Temple of the Tooth at dusk.", stop: "kandy" },
      { day: "Days 4–5", title: "A tea-country bungalow", copy: "Two nights in a colonial tea bungalow, with plantation walks and long dinners.", stop: "nuwara-eliya" },
      { day: "Day 6", title: "The train to Ella", copy: "The scenic train ride to Ella, then a quiet evening in the hills.", stop: "ella" },
      { day: "Days 7–9", title: "Beach time", copy: "Three slow days on the south coast. Add a sunset cruise, a spa day or whale watching in season.", stop: "mirissa" },
      { day: "Day 10", title: "Galle and departure", copy: "A last walk through Galle Fort before the drive to the airport.", stop: "galle" },
    ],
    tips: ["Tell us it is your honeymoon: many hotels add small touches for couples.", "From about May to September, an east-coast beach finish often has better weather than the south."],
    durationDays: [8, 11],
    faqs: [
      { q: "Is Sri Lanka good for a honeymoon?", a: "Yes. It combines culture, mountains, wildlife and beaches in a small area, with excellent boutique hotels and private transport." },
      { q: "How many days do you need for a Sri Lanka honeymoon?", a: "Nine to twelve days is ideal. It leaves time for the highlights and several relaxed days on the beach." },
      { q: "Can you combine Sri Lanka with the Maldives?", a: "Yes. Many couples add a few nights in the Maldives at the end. Our international team can plan both together." },
    ],
  },
  {
    slug: "sri-lanka-family-holiday",
    name: "Sri Lanka family holiday",
    metaTitle: "Sri Lanka Family Holiday Itinerary | Navigeto Travels",
    metaDescription: "A 10-day Sri Lanka family itinerary with shorter drives, elephants, a safari, tea country and the beach. Planned around children's ages.",
    headline: "A Sri Lanka family holiday, at a child-friendly pace.",
    intro: "Sri Lanka is a great family destination: short distances, elephants and safaris, trains, beaches and warm hospitality. This route keeps drives manageable and builds in rest.",
    suits: ["Families with children", "Multi-generation groups", "First trips to Asia"],
    days: [
      { day: "Day 1", title: "Arrive and rest", copy: "A first night near the airport so nobody faces a long drive after the flight." },
      { day: "Days 2–3", title: "Sigiriya and elephants", copy: "Two nights in the Cultural Triangle: a jeep safari to see wild elephants and, for older children, a climb of Sigiriya or Pidurangala.", stop: "sigiriya" },
      { day: "Day 4", title: "Kandy", copy: "Drive to Kandy and visit the Temple of the Tooth and the lake.", stop: "kandy" },
      { day: "Day 5", title: "Tea country", copy: "A tea factory visit on the way to Nuwara Eliya, with boating on Gregory Lake.", stop: "nuwara-eliya" },
      { day: "Day 6", title: "The train to Ella", copy: "A short section of the famous train ride is often enough for younger children.", stop: "ella" },
      { day: "Day 7", title: "Yala safari", copy: "An afternoon jeep safari in Yala, looking for leopards, elephants and birds.", stop: "yala" },
      { day: "Days 8–9", title: "Beach days", copy: "Two easy days on the south coast, with a turtle hatchery visit nearby.", stop: "bentota" },
      { day: "Day 10", title: "Departure", copy: "A short drive back to the airport." },
    ],
    tips: ["We keep drives to around three hours where possible and plan stops along the way.", "Tell us the children's ages: we choose family rooms, child seats and suitable activities."],
    durationDays: [8, 11],
    faqs: [
      { q: "Is Sri Lanka good for a family holiday?", a: "Yes. Distances are short, people are welcoming and children love the elephants, trains and beaches." },
      { q: "Do you provide child seats?", a: "Yes, on request. Let us know the children's ages when you enquire and we will arrange suitable seats in your private car." },
      { q: "What is the best age to take children to Sri Lanka?", a: "Any age works with the right pace. For younger children we plan shorter drives and more pool and beach time." },
    ],
  },
];

export function itineraryBySlug(slug: string) {
  return ITINERARY_GUIDES.find(guide => guide.slug === slug) || null;
}

type TourLength = { slug: string; duration_days?: number; country?: string | null };

/** Published Sri Lanka tours whose length fits the itinerary; closest length first. */
export function toursForItinerary<T extends TourLength>(tours: T[], guide: ItineraryGuide) {
  const [min, max] = guide.durationDays;
  const target = (min + max) / 2;
  return tours
    .filter(tour => /^(sri\s*lanka)?$/i.test((tour.country || "").trim()) && typeof tour.duration_days === "number" && tour.duration_days >= min && tour.duration_days <= max)
    .sort((a, b) => Math.abs(a.duration_days! - target) - Math.abs(b.duration_days! - target));
}

export function itineraryJsonLd(siteUrl: string, guide: ItineraryGuide) {
  const url = `${siteUrl}/itineraries/${guide.slug}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "TouristTrip", "@id": `${url}#trip`, name: guide.name, description: guide.intro, url, touristType: guide.suits, provider: { "@id": `${siteUrl}/#organization` },
        itinerary: { "@type": "ItemList", numberOfItems: guide.days.length, itemListElement: guide.days.map((day, index) => ({ "@type": "ListItem", position: index + 1, name: `${day.day}: ${day.title}` })) } },
      { "@type": "FAQPage", mainEntity: guide.faqs.map(faq => ({ "@type": "Question", name: faq.q, acceptedAnswer: { "@type": "Answer", text: faq.a } })) },
      { "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
        { "@type": "ListItem", position: 2, name: "Sri Lanka itineraries", item: `${siteUrl}/itineraries` },
        { "@type": "ListItem", position: 3, name: guide.name, item: url },
      ] },
    ],
  };
}
