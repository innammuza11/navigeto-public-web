/** Decorative chapter art selected from each day's actual destination/programme. */
export function itinerarySketch(day: {title:string;copy:string;location?:string;activities?:string[]}):string {
 const destination=day.location?.split(/\s*(?:→|\/|–| - )\s*/).filter(Boolean).at(-1);
 const heading=(destination || day.title).toLowerCase();
 const text=`${heading} ${day.copy} ${(day.activities || []).join(' ')}`.toLowerCase();
 if (/arrival|departure|airport|fly home|welcome/.test(day.title.toLowerCase())) return 'sri-lanka-arrival';
 if (/madu|mangrove|river safari|boat safari/.test(text)) return 'sri-lanka-river';
 if (/yala|wilpattu|udawalawe|minneriya|safari|elephant/.test(heading)) return 'sri-lanka-wildlife';
 if (/sigiriya|dambulla|anuradhapura|polonnaruwa/.test(heading)) return 'sri-lanka-heritage';
 if (/kandy|temple of the tooth|peradeniya/.test(heading)) return 'sri-lanka-kandy';
 if (/nuwara|tea estate|tea factory|tea country/.test(heading)) return 'sri-lanka-tea';
 if (/ella|rail|train|nine arch|haputale/.test(heading)) return 'sri-lanka';
 if (/colombo/.test(heading)) return 'sri-lanka-colombo';
 if (/galle|mirissa|beach|coast|bentota|negombo|tangalle|trinco|weligama|pasikud|arugam/.test(heading)) return 'sri-lanka-coast';
 if (/safari|elephant|wildlife/.test(text)) return 'sri-lanka-wildlife';
 if (/tea|train|hill/.test(text)) return 'sri-lanka-tea';
 return 'transfer-journey';
}
