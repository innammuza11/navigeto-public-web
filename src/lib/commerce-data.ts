export const flights = [
  { id:"UL-503", airline:"SriLankan Airlines", logo:"UL", from:"Colombo", to:"London", depart:"12:50", arrive:"20:10", duration:"12h 50m", stops:"1 stop", baggage:"30 kg", price:286500, tag:"Best overall" },
  { id:"EK-649", airline:"Emirates", logo:"EK", from:"Colombo", to:"London", depart:"03:15", arrive:"14:25", duration:"15h 40m", stops:"1 stop · Dubai", baggage:"30 kg", price:312900, tag:"Shortest" },
  { id:"QR-663", airline:"Qatar Airways", logo:"QR", from:"Colombo", to:"London", depart:"10:30", arrive:"21:15", duration:"15h 15m", stops:"1 stop · Doha", baggage:"25 kg", price:294800, tag:"Great value" },
] as const;

export const hotels = [
  { slug:"heritance-kandalama", name:"Heritance Kandalama", place:"Dambulla", rating:4.8, reviews:1248, price:68500, tag:"Architectural icon", image:"center 58%", features:["Lake view","Breakfast included","Free cancellation"] },
  { slug:"cape-weligama", name:"Cape Weligama", place:"Weligama", rating:4.9, reviews:862, price:149000, tag:"Luxury coastal stay", image:"center 78%", features:["Ocean villa","Half board","Private transfer"] },
  { slug:"98-acres", name:"98 Acres Resort & Spa", place:"Ella", rating:4.7, reviews:1040, price:79500, tag:"Hill-country favourite", image:"76% 45%", features:["Mountain view","Breakfast included","Spa credit"] },
] as const;

export const rooms = [
 {name:"Panoramic Room", detail:"1 king bed · 2 adults · 42 m²", board:"Breakfast included", policy:"Free cancellation until 8 Jun", price:68500},
 {name:"Luxury Suite", detail:"1 king bed · 2 adults + 1 child · 67 m²", board:"Half board included", policy:"Free cancellation until 8 Jun", price:94800},
 {name:"Family Villa", detail:"2 bedrooms · 4 adults · 110 m²", board:"Breakfast included", policy:"Pay 30% today", price:132000},
] as const;

export const tours = [
 {slug:"island-soul-10-days", name:"Island Soul", days:"10 days · 9 nights", route:"Negombo · Sigiriya · Kandy · Ella · Yala · Galle", price:485000, tag:"Most loved", pace:"Balanced"},
 {slug:"wild-coast-7-days", name:"Wild Coast Escape", days:"7 days · 6 nights", route:"Colombo · Udawalawe · Yala · Tangalle", price:328000, tag:"Wildlife & beach", pace:"Relaxed"},
 {slug:"tea-trails-6-days", name:"Tea Trails by Rail", days:"6 days · 5 nights", route:"Kandy · Nuwara Eliya · Ella · Colombo", price:276000, tag:"Scenic rail", pace:"Easy"},
] as const;

export const itinerary = [
 ["Day 1","Ayubowan, Sri Lanka","Airport welcome, private transfer and a calm first evening."],
 ["Day 2","Ancient Sigiriya","Climb the rock fortress at the quietest time of day."],
 ["Day 3","Village and wildlife","Local lunch followed by an ethical elephant safari."],
 ["Day 4","Kandy stories","Temple, gardens and a private cultural walk."],
 ["Day 5","The tea train","One of Asia’s great rail journeys into the highlands."],
 ["Day 6–7","Ella at your pace","Waterfalls, viewpoints and time to slow down."],
] as const;

export const tourItineraries = {
 "island-soul-10-days": [
  {day:"Day 1",title:"Ayubowan, Sri Lanka",copy:"A personal airport welcome, private transfer to Negombo and an easy first evening close to the coast.",location:"Negombo"},
  {day:"Day 2",title:"Into the Cultural Triangle",copy:"Travel inland through changing landscapes, with a considered arrival beneath the ancient rock country.",location:"Sigiriya"},
  {day:"Day 3",title:"Sigiriya at first light",copy:"Climb the rock fortress before the heat, then slow down through village landscapes and local flavours.",location:"Sigiriya"},
  {day:"Day 4",title:"Kandy’s living stories",copy:"Journey into the hills for sacred heritage, botanical beauty and the cultural pulse around Kandy Lake.",location:"Kandy"},
  {day:"Day 5",title:"The tea train south",copy:"Board one of Asia’s great scenic rail journeys as forest, tea estates and mountain villages unfold.",location:"Ella"},
  {day:"Day 6",title:"Ella at your own pace",copy:"Choose waterfalls, viewpoints and gentle trails, keeping enough space to simply enjoy the highland air.",location:"Ella"},
  {day:"Day 7",title:"From mist to wilderness",copy:"Descend from tea country toward the dry-zone landscape and settle near Sri Lanka’s celebrated wildlife country.",location:"Yala"},
  {day:"Day 8",title:"Yala before sunrise",copy:"Enter the park in the cooler hours with responsible local guidance, then return for an unhurried afternoon.",location:"Yala"},
  {day:"Day 9",title:"The road to Galle",copy:"Follow the southern coast toward the ramparts, lanes and ocean-facing history of Galle Fort.",location:"Galle"},
  {day:"Day 10",title:"One last island morning",copy:"A flexible final morning and private onward transfer shaped around your international departure.",location:"Colombo"},
 ],
 "wild-coast-7-days": [
  {day:"Day 1",title:"Colombo arrival",copy:"Meet your private host and ease into Sri Lanka with a flexible first evening in the capital.",location:"Colombo"},
  {day:"Day 2",title:"South to Udawalawe",copy:"Leave the city behind and travel into reservoir country, village landscapes and elephant habitat.",location:"Udawalawe"},
  {day:"Day 3",title:"Elephants and open country",copy:"Explore the published wildlife experience in the cooler hours with responsible local guidance.",location:"Udawalawe"},
  {day:"Day 4",title:"Enter Yala country",copy:"Continue across the deep south, arriving with time to absorb the changing dry-zone landscape.",location:"Yala"},
  {day:"Day 5",title:"Yala at dawn",copy:"Set out early for a considered safari experience, then slow the pace for the rest of the day.",location:"Yala"},
  {day:"Day 6",title:"Wild coast calm",copy:"Move to Tangalle for broad beaches, warm water and an afternoon designed around your own rhythm.",location:"Tangalle"},
  {day:"Day 7",title:"A final ocean morning",copy:"Keep the coast close before your privately arranged onward transfer and next connection.",location:"Tangalle"},
 ],
 "tea-trails-6-days": [
  {day:"Day 1",title:"Kandy’s cultural heart",copy:"Arrive in the hill capital for sacred heritage, garden landscapes and an evening around the lake.",location:"Kandy"},
  {day:"Day 2",title:"Gardens, craft and tea",copy:"Discover the stories around Kandy before climbing toward cooler air and working tea country.",location:"Kandy"},
  {day:"Day 3",title:"Nuwara Eliya in bloom",copy:"Trace colonial-era streets, estate scenery and gardens in Sri Lanka’s highland retreat.",location:"Nuwara Eliya"},
  {day:"Day 4",title:"The legendary tea train",copy:"Ride through cloud forest, viaducts and tea estates on the island’s most cinematic rail passage.",location:"Ella"},
  {day:"Day 5",title:"Ella beyond the viewpoint",copy:"Choose a gentle trail, waterfall or estate visit, with time left open for the mountain light.",location:"Ella"},
  {day:"Day 6",title:"From hills to Colombo",copy:"Descend through changing landscapes on a privately paced transfer toward Colombo and your onward journey.",location:"Colombo"},
 ],
} as const;

export const vehicles = [
 {name:"Comfort Sedan", people:"1–3 travellers", bags:"2 large bags", price:18500, tag:"Best for couples"},
 {name:"Premium SUV", people:"1–4 travellers", bags:"4 large bags", price:26900, tag:"Extra comfort"},
 {name:"Family Van", people:"1–7 travellers", bags:"7 large bags", price:32500, tag:"Best for families"},
] as const;
