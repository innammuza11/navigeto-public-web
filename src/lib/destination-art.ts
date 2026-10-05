import {productArtwork, countryArtwork} from './product-artwork.ts';
export type Motif = 'palm'|'train'|'rock'|'elephant'|'stupa'|'lighthouse'|'towers'|'marina'|'pagoda'|'sail'|'burj'|'torii'|'eiffel'|'clock'|'colosseum'|'opera'|'taj'|'pyramid'|'island'|'globe'|'mountain'|'cn'|'liberty'|'mosque'|'wall'|'skyline';
export type CoverInput = { identity: string; country: string; title?: string; places?: readonly string[] };
const countryScenes: Array<[RegExp, Motif[]]> = [
  [/canada|toronto|^ca$/i,['cn','mountain','sail']],
  [/new zealand|^nz$/i,['mountain','sail','globe']],
  [/united states|usa|new york|^us$/i,['liberty','skyline','globe']],
  [/china|beijing|^cn$/i,['wall','pagoda','mountain']],
  [/hong kong|^hk$/i,['skyline','sail','mountain']],
  [/saudi|oman|qatar|turkey|turkiye|istanbul|^sa$|^om$|^qa$|^tr$/i,['mosque','sail','globe']],
  [/malaysia|kuala lumpur|^my$/i,['towers','palm','pagoda']],
  [/singapore|^sg$/i,['marina','palm','sail']],
  [/thailand|bangkok|^th$/i,['pagoda','sail','palm']],
  [/vietnam|hanoi|ha long|^vn$/i,['sail','pagoda','palm']],
  [/united arab emirates|dubai|abu dhabi|^uae$|^ae$/i,['burj','sail','palm']],
  [/japan|tokyo|kyoto|^jp$/i,['torii','pagoda','sail']],
  [/france|paris|^fr$/i,['eiffel','sail','globe']],
  [/united kingdom|england|london|^uk$|^gb$/i,['clock','sail','globe']],
  [/italy|rome|^it$/i,['colosseum','sail','globe']],
  [/australia|sydney|^au$/i,['opera','sail','globe']],
  [/india|delhi|agra|^in$/i,['taj','palm','train']],
  [/egypt|cairo|^eg$/i,['pyramid','sail','palm']],
  [/maldives|^mv$/i,['island','sail','palm']],
  [/indonesia|bali|^id$/i,['pagoda','palm','island']],
  [/nepal|bhutan|^np$|^bt$/i,['stupa','pagoda','globe']],
];
export function destinationArtPlan(input: CoverInput) {
  // Stable per product identity: sorting/filtering never changes its artwork.
  let seed = 2166136261;
  for (const char of input.identity) seed = Math.imul(seed ^ char.charCodeAt(0), 16777619) >>> 0;
  const country = input.country.trim();
  let motifs: Motif[];
  if (/sri\s*lanka|^lk$/i.test(country)) {
    const route = [...(input.places || []), input.title || ''].join(' ').toLowerCase();
    const routeMotifs: Motif[] = [];
    if (/ella|nuwara|tea|hill|rail|train/.test(route)) routeMotifs.push('train');
    if (/sigiriya|dambulla|triangle/.test(route)) routeMotifs.push('rock');
    if (/yala|wilpattu|safari|wild|elephant|minneriya/.test(route)) routeMotifs.push('elephant');
    if (/kandy|anuradhapura|polonnaruwa|heritage|temple/.test(route)) routeMotifs.push('stupa');
    if (/galle|fort/.test(route)) routeMotifs.push('lighthouse');
    if (/bentota|mirissa|beach|coast|negombo|tangalle|trinco/.test(route)) routeMotifs.push('palm');
    motifs = [...new Set([...routeMotifs, 'palm' as Motif, 'rock' as Motif, 'stupa' as Motif])].slice(0,3);
  } else {
    // Unknown countries receive neutral travel art, never an unrelated landmark.
    motifs = countryScenes.find(([pattern])=>pattern.test(country))?.[1] || ['globe','sail','palm'];
  }
  return {seed,motifs,palette:seed%6,edition:seed.toString(36).toUpperCase().padStart(7,'0')};
}

/** Choose a painted scene from the destination and actual route, never an unrelated country. */
export function destinationArtwork(input: CoverInput): string {
  if (Object.hasOwn(productArtwork, input.identity)) return productArtwork[input.identity];
  const country = input.country.trim();
  const text = [input.identity, input.title || '', ...(input.places || [])].join(' ').toLowerCase();
  if (/sri\s*lanka|^lk$/i.test(country)) {
    if (/yala|wilpattu|udawalawe|safari|wildlife/.test(text)) return 'sri-lanka-wildlife';
    if (/ella|nuwara|tea|hill|rail|train/.test(text)) return 'sri-lanka';
    if (/galle|mirissa|beach|coast|bentota|tangalle|trinco/.test(text)) return 'sri-lanka-coast';
    return 'sri-lanka-heritage';
  }
  if (/singapore|^sg$/i.test(country)) {
    if (/05-nights|slow-days|garden/.test(text)) return 'singapore-gardens';
    if (/03-nights|essentials|sentosa/.test(text) && !/04-nights/.test(text)) return 'singapore-sentosa';
    return 'singapore';
  }
  if (/malaysia|^my$/i.test(country)) {
    if (/04-nights|unhurried/.test(text)) return 'malaysia-gardens';
    if (/02-nights|city-leisure/.test(text)) return 'malaysia-heritage';
    return 'malaysia';
  }
  if (countryArtwork[country.toLowerCase()]) return countryArtwork[country.toLowerCase()];
  if (/japan|^jp$/i.test(country)) return 'japan-visa';
  if (/thailand|^th$/i.test(country)) return 'thailand';
  if (/united arab|dubai|^ae$|^uae$/i.test(country)) return 'dubai';
  if (/india|^in$/i.test(country)) return 'india';
  if (/united kingdom|london|^gb$|^uk$/i.test(country)) return 'london';
  if (/france|paris|schengen|^fr$/i.test(country)) return 'paris';
  return 'world-journey';
}
