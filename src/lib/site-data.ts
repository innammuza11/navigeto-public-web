export const nav = [
  ["Flights", "/flights"], ["Hotels", "/hotels"], ["Tours", "/tours"],
  ["Holidays", "/holidays"], ["Visas", "/visas"], ["Transfers", "/transfers"],
  ["Custom Trip", "/custom-trip"], ["Corporate", "/corporate"],
] as const;

export const pages = {
  flights: {
    eyebrow: "Flights, thoughtfully arranged",
    title: "Search flights and request your best available fare.",
    copy: "Tell us where you want to go. A Navigeto travel consultant checks suitable routes, baggage and fare conditions before you confirm.",
    action: "Request a flight", stats: [["Global routes", "500+"], ["Human fare check", "Included"], ["Response target", "< 2 hrs"]],
    cards: [["Flexible route planning", "Compare practical departure times, stops and baggage—not only the cheapest headline fare."], ["Clear fare conditions", "Understand change, refund and baggage rules before payment."], ["Consultant support", "A real travel specialist handles complex, multi-city and group requests."]],
  },
  hotels: {
    eyebrow: "Approved stays across Sri Lanka", title: "Find the right Sri Lanka hotel.",
    copy: "Search curated city, beach, wildlife and hill-country stays with transparent inclusions and local support.",
    action: "Search hotels", stats: [["Destinations", "25+"], ["Verified stays", "180+"], ["Local support", "24/7"]],
    cards: [["Coastal calm", "Boutique villas and resorts from Negombo to Tangalle."], ["Hill-country air", "Tea estates, heritage bungalows and scenic escapes."], ["Wild Sri Lanka", "Safari lodges close to Yala, Wilpattu and Minneriya."]],
  },
  tours: {
    eyebrow: "Private journeys, made personal", title: "Start with a proven route. Personalise every detail.",
    copy: "Choose a carefully designed Sri Lanka itinerary, then adjust hotels, pace, activities and transport around you.",
    action: "Explore tour ideas", stats: [["Published routes", "12+"], ["Private departures", "Daily"], ["Tailor-made", "Always"]],
    cards: [["Cultural Triangle", "Ancient cities, Sigiriya and meaningful local encounters."], ["Tea country by rail", "Kandy, Nuwara Eliya and Ella at an unhurried pace."], ["Coast and wildlife", "Safari mornings followed by restorative beach days."]],
  },
  holidays: {
    eyebrow: "Beyond Sri Lanka", title: "Tailor-made holidays, without the planning overload.",
    copy: "Flights, hotels, transfers and experiences designed as one seamless trip to the Maldives, Dubai, Thailand and beyond.",
    action: "Plan my holiday", stats: [["Destinations", "30+"], ["One trip plan", "Complete"], ["Dedicated expert", "Included"]],
    cards: [["Maldives escapes", "Island stays matched to your transfer, board basis and travel style."], ["City discoveries", "Dubai, Singapore and Kuala Lumpur with smart stopover planning."], ["Asian journeys", "Thailand, Vietnam, Bali and Japan built around your pace."]],
  },
  visas: {
    eyebrow: "Clear visa assistance", title: "Visa services for Sri Lankan travellers.",
    copy: "Eligibility, document guidance and processing expectations explained clearly by a consultant before you apply.",
    action: "Check requirements", stats: [["Destinations", "40+"], ["Document review", "Human"], ["Status updates", "Included"]],
    cards: [["Eligibility first", "Know the likely route and requirements before spending time gathering documents."], ["Document checklist", "Receive a clear, destination-specific list with practical guidance."], ["Application tracking", "Stay informed from submission through passport collection."]],
  },
  transfers: {
    eyebrow: "Private transport, properly planned", title: "Airport and city transfers from approved route data.",
    copy: "Choose a comfortable vehicle for your group, with clear pickup details, route planning and Sri Lanka-based assistance.",
    action: "Get transfer rate", stats: [["Island-wide", "Coverage"], ["Vehicle classes", "6"], ["Chauffeur support", "24/7"]],
    cards: [["Airport arrivals", "Meet-and-greet coordination with flight-aware pickup planning."], ["City to city", "Reliable private travel between every major Sri Lankan destination."], ["Tour transport", "Multi-day chauffeur services designed around your full itinerary."]],
  },
  "custom-trip": {
    eyebrow: "Your journey, your rhythm", title: "Build a private journey around your dates, pace and budget.",
    copy: "Share the outline. Our Sri Lanka team turns it into a practical route with hotels, transport and experiences that fit.",
    action: "Start my trip", stats: [["Planning fee", "No"], ["Local expertise", "Since 2017"], ["One point of contact", "Yes"]],
    cards: [["Tell us what matters", "Food, wildlife, culture, beaches, wellness or a little of everything."], ["We shape the route", "Travel times, check-ins and experiences balanced into a realistic plan."], ["Refine together", "Adjust the proposal until it feels unmistakably yours."]],
  },
  corporate: {
    eyebrow: "Business travel with local control", title: "Corporate travel, MICE and group programs for Sri Lanka.",
    copy: "One accountable team for flights, hotels, transport, events, groups and consolidated travel coordination.",
    action: "Talk to corporate", stats: [["Account support", "Dedicated"], ["Group movements", "Managed"], ["Reporting", "Consolidated"]],
    cards: [["Corporate travel", "Responsive reservations and clear approval-ready options."], ["MICE programs", "Venues, transport, accommodation and experiences coordinated together."], ["Groups and incentives", "Smooth arrivals, rooming lists, coaches and on-ground support."]],
  },
  about: {
    eyebrow: "About Navigeto Travels", title: "Sri Lanka travel operations with real local control.",
    copy: "We pair experienced people with TravelOS technology so each enquiry moves cleanly from planning to confirmed operations.",
    action: "Meet our approach", stats: [["Founded", "2017"], ["Based in", "Colombo"], ["Support", "Local"]],
    cards: [["Local knowledge", "Routes shaped by people who understand real travel times and seasons."], ["Responsible operations", "Approved partners, protected commercial data and accountable workflows."], ["Human service", "Technology keeps work organised; people make the journey personal."]],
  },
  contact: {
    eyebrow: "We are here to help", title: "Speak with our Sri Lanka travel team.",
    copy: "Whether you have a complete itinerary or only a rough idea, send it through. We will help you find the next useful step.",
    action: "Send an enquiry", stats: [["WhatsApp", "+94 77 420 6166"], ["Email", "info@navigeto.com"], ["Office", "Colombo"]],
    cards: [["Trip planning", "Hotels, routes, transfers and experiences in one conversation."], ["Existing bookings", "Practical help with confirmations, changes and travel documents."], ["Partner enquiries", "Hotels, drivers and travel agents can connect through the partner portal."]],
  },
} as const;

export type PageKey = keyof typeof pages;
