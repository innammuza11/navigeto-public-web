// Transcribed and checked against the displayed Explore Vacations chart on 2026-10-05.
// Undated published road-distance estimates, not live navigation distances.
// Anuradhapura–Galle omitted: conflicting 320 / 37 entries in the source matrix.
export const CHART_SOURCE = 'https://www.explorevacations.lk/distance-chart.htm';
export const CHART_NAME = 'Explore Vacations distance chart';
const chart: Record<string, Record<string, number>> = {
 airport: { anuradhapura:179, bentota:101, colombo:40, galle:152, kandy:112, negombo:10, 'nuwara-eliya':186, polonnaruwa:192, sigiriya:152, trincomalee:240, yala:328 },
 anuradhapura: { bentota:272, colombo:208, kandy:138, negombo:168, 'nuwara-eliya':214, polonnaruwa:101, sigiriya:80, trincomalee:106, yala:499 },
 bentota: { colombo:64, galle:51, kandy:179, negombo:104, 'nuwara-eliya':240, polonnaruwa:278, sigiriya:229, trincomalee:320, yala:227 },
 colombo: { galle:115, kandy:115, negombo:40, 'nuwara-eliya':189, polonnaruwa:214, sigiriya:165, trincomalee:256, yala:291 },
 galle: { kandy:230, negombo:155, 'nuwara-eliya':288, polonnaruwa:330, sigiriya:280, trincomalee:371, yala:176 },
 kandy: { negombo:104, 'nuwara-eliya':77, polonnaruwa:139, sigiriya:90, trincomalee:181, yala:291 },
 negombo: { 'nuwara-eliya':181, polonnaruwa:210, sigiriya:152, trincomalee:246, yala:331 },
 'nuwara-eliya': { polonnaruwa:216, sigiriya:166, trincomalee:258, yala:192 },
 polonnaruwa: { sigiriya:67, trincomalee:128, yala:376 },
 sigiriya: { trincomalee:109, yala:445 },
 trincomalee: { yala:477 },
};
export function chartDistance(from: string, to: string): number | null {
 if (from === to) return 0;
 return chart[from]?.[to] ?? chart[to]?.[from] ?? null;
}
