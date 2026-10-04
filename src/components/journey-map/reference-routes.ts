// User-supplied distance/time table (attachment 7), dated 28.02.2014.
// Historical planning estimates. Preserve route variants; do not present as live traffic.
export type RoutePreference = 'shortest' | 'highway' | 'scenic';
export type ReferenceRoute = { km: number; minutes: number; via?: string };
export const REFERENCE_DATE = '28 February 2014';
const routes: Record<string, ReferenceRoute[]> = {};
function add(from: string, to: string, km: number, minutes: number, via?: string) {
 (routes[`${from}:${to}`] ??= []).push({ km, minutes, ...(via ? { via } : {}) });
}
const rows: [string,string,number,number,string?][] = [
 ['airport','colombo',35,40],['airport','negombo',10,20],['airport','kalpitiya',135,150],['airport','anuradhapura',180,270],['airport','habarana',160,240],['airport','dambulla',140,210],['airport','sigiriya',156,240],['airport','kandy',110,180],['airport','galle',140,150],['airport','bentota',100,150],['airport','nuwara-eliya',165,300,'Peradeniya'],
 ['colombo','airport',35,40],['colombo','negombo',40,60],['colombo','kalpitiya',170,210],['colombo','anuradhapura',215,300,'Puttalam'],['colombo','habarana',171,270],['colombo','dambulla',150,240],['colombo','sigiriya',166,270],['colombo','kandy',116,180],['colombo','hatton',130,240],['colombo','galle',116,120],['colombo','bentota',65,120],['colombo','nuwara-eliya',180,330,'Peradeniya'],['colombo','nuwara-eliya',171,300,'Avissawella'],
 ['anuradhapura','colombo',215,280,'Puttalam'],['anuradhapura','kalpitiya',120,180],['anuradhapura','wilpattu',32,60],['anuradhapura','jaffna',182,240],['anuradhapura','habarana',55,90],['anuradhapura','dambulla',65,90],['anuradhapura','sigiriya',81,120],['anuradhapura','polonnaruwa',100,210],['anuradhapura','minneriya',62,100],['anuradhapura','pasikudah',170,240],['anuradhapura','trincomalee',102,150],
 ['habarana','airport',160,240],['habarana','colombo',171,270],['habarana','wilpattu',87,150,'Anuradhapura'],['habarana','anuradhapura',55,90],['habarana','minneriya',8,20],['habarana','polonnaruwa',45,60],['habarana','trincomalee',88,150],['habarana','pasikudah',115,150],['habarana','sigiriya',22,40],['habarana','dambulla',22,30],['habarana','kandy',95,180],['habarana','nuwara-eliya',174,360],['habarana','hatton',174,300,'Nawalapitiya'],
 ['sigiriya','airport',156,240],['sigiriya','colombo',166,270],['sigiriya','wilpattu',113,180],['sigiriya','anuradhapura',81,120],['sigiriya','minneriya',30,40],['sigiriya','polonnaruwa',67,90],['sigiriya','trincomalee',108,160],['sigiriya','pasikudah',138,195],['sigiriya','dambulla',16,30],['sigiriya','kandy',90,180],['sigiriya','nuwara-eliya',168,360],['sigiriya','hatton',168,360],
 ['dambulla','airport',140,210],['dambulla','colombo',150,240],['dambulla','wilpattu',98,150],['dambulla','anuradhapura',65,90],['dambulla','minneriya',30,40],['dambulla','polonnaruwa',67,90],['dambulla','trincomalee',108,160],['dambulla','pasikudah',138,195],['dambulla','sigiriya',16,30],['dambulla','kandy',73,150],['dambulla','nuwara-eliya',152,330],['dambulla','hatton',152,330],
 ['kandy','airport',110,180],['kandy','colombo',116,180],['kandy','pinnawala',45,90],['kandy','peradeniya',8,30],['kandy','pasikudah',180,330],['kandy','dambulla',73,150],['kandy','sigiriya',90,180],['kandy','habarana',95,180],['kandy','anuradhapura',140,210],['kandy','nuwara-eliya',79,180],['kandy','hatton',80,180],['kandy','ratnapura',125,180],
 ['galle','airport',140,150],['galle','colombo',116,120],['galle','bentota',50,90,'Galle Road'],['galle','hikkaduwa',20,40],['galle','mirissa',32,40],['galle','matara',42,60],['galle','tangalle',80,120],['galle','tissamaharama',150,210],['galle','kataragama',170,240],['galle','yala',170,240],['galle','ratnapura',75,180,'Highway'],['galle','sinharaja',78,150],['galle','udawalawe',150,210,'Nonagama'],
 ['nuwara-eliya','airport',165,300,'Peradeniya'],['nuwara-eliya','colombo',180,300],['nuwara-eliya','kandy',79,180],['nuwara-eliya','ella',60,120],['nuwara-eliya','ratnapura',160,240],['nuwara-eliya','ratnapura',160,240,'Bandarawela'],['nuwara-eliya','hatton',45,90],['nuwara-eliya','horton-plains',27,60],['nuwara-eliya','yala',180,270],['nuwara-eliya','kataragama',150,210,'Buttala'],['nuwara-eliya','galle',302,420,'Hambantota'],['nuwara-eliya','galle',255,300,'Highway'],['nuwara-eliya','polonnaruwa',140,210,'Mahiyangana'],
 ['yala','airport',295,330,'Highway'],['yala','colombo',260,270,'Highway'],['yala','galle',170,240],['yala','matara',130,180],['yala','tangalle',95,150],['yala','kataragama',40,60],['yala','tissamaharama',20,30],['yala','arugam-bay',160,240],['yala','nuwara-eliya',180,270],['yala','udawalawe',78,120],['yala','sinharaja',140,240,'Kudawa entrance'],['yala','sinharaja',190,300,'Deniyaya entrance'],
];
for (const row of rows) add(...row);
export function referenceRouteOptions(from: string, to: string): ReferenceRoute[] {
 const direct = routes[`${from}:${to}`];
 return direct ?? routes[`${to}:${from}`] ?? [];
}
export function referenceRoute(from: string, to: string, preference: RoutePreference = 'shortest'): ReferenceRoute | null {
 const options = referenceRouteOptions(from,to);
 const preferred = preference === 'highway' ? options.filter(r => /highway/i.test(r.via || '')) : preference === 'scenic' ? options.filter(r => !/highway/i.test(r.via || '')) : options;
 return [...(preferred.length ? preferred : options)].sort((a,b) => a.km-b.km)[0] ?? null;
}
