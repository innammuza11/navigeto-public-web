export type BufferMode = 'fixed' | 'per-day' | 'percent' | 'none';
export const DEFAULT_JOURNEY_BUFFER_KM = 50;
export function bounded(value: number, maximum = 10000) {
  return Number.isFinite(value) ? Math.min(maximum, Math.max(0, value)) : 0;
}
export function journeyMileage(input: { routeKm: number; days: number; localKmPerDay: number; extraKm: number; bufferMode: BufferMode; bufferValue: number; hasJourney: boolean }) {
  const round = (n: number) => Math.round(n * 10) / 10;
  if (!input.hasJourney) return { routeKm: 0, sightseeingKm: 0, extraKm: 0, bufferKm: 0, totalKm: 0 };
  const routeKm = round(bounded(input.routeKm));
  const sightseeingKm = round(bounded(input.localKmPerDay, 500) * Math.max(1, Math.min(60, Math.round(input.days) || 1)));
  const extraKm = round(bounded(input.extraKm));
  const subtotal = routeKm + sightseeingKm + extraKm;
  const value = bounded(input.bufferValue, input.bufferMode === 'percent' ? 100 : 500);
  const bufferKm = round(input.bufferMode === 'fixed' ? value : input.bufferMode === 'per-day' ? value * Math.max(1, Math.min(60, Math.round(input.days) || 1)) : input.bufferMode === 'percent' ? subtotal * value / 100 : 0);
  return { routeKm, sightseeingKm, extraKm, bufferKm, totalKm: round(subtotal + bufferKm) };
}
export const tourIdeas = [
 { name: 'Heritage & tea country', days: 7, stops: ['airport', 'sigiriya', 'kandy', 'nuwara-eliya', 'ella', 'colombo'], description: 'Rock fortress · temple city · tea hills · railway country' },
 { name: 'Wildlife & south coast', days: 6, stops: ['colombo', 'ella', 'yala', 'mirissa', 'galle', 'colombo'], description: 'Hill views · safari gateway · beaches · Galle Fort' },
 { name: 'Ancient cities & east coast', days: 8, stops: ['airport', 'anuradhapura', 'sigiriya', 'polonnaruwa', 'trincomalee', 'kandy', 'colombo'], description: 'Ancient kingdoms · cultural triangle · east-coast beaches' },
];
export const attractions = [
 { destination: 'sigiriya', name: 'Sigiriya Lion Rock', category: 'Ancient heritage', asset: '/illustrations/sri-lanka-landmarks.png', sheetWidth: 6, sheetHeight: 6, cellWidth: 2, cellHeight: 3, col: 0, row: 0, x: 285, y: 238 },
 { destination: 'kandy', name: 'Temple of the Tooth', category: 'Sacred architecture', asset: '/illustrations/sri-lanka-landmarks.png', sheetWidth: 6, sheetHeight: 6, cellWidth: 2, cellHeight: 3, col: 1, row: 0, x: 230, y: 315 },
 { destination: 'ella', name: 'Nine Arch Bridge', category: 'Hill-country railway', asset: '/illustrations/sri-lanka-landmarks.png', sheetWidth: 6, sheetHeight: 6, cellWidth: 2, cellHeight: 3, col: 2, row: 0, x: 365, y: 355 },
 { destination: 'galle', name: 'Galle Fort & lighthouse', category: 'Coastal heritage', asset: '/illustrations/sri-lanka-landmarks.png', sheetWidth: 6, sheetHeight: 6, cellWidth: 2, cellHeight: 3, col: 0, row: 1, x: 150, y: 505 },
 { destination: 'yala', name: 'Yala wildlife', category: 'Safari country', asset: '/illustrations/sri-lanka-landmarks.png', sheetWidth: 6, sheetHeight: 6, cellWidth: 2, cellHeight: 3, col: 1, row: 1, x: 390, y: 455 },
 { destination: 'nuwara-eliya', name: 'Tea-country landscapes', category: 'Plantations & hills', asset: '/illustrations/sri-lanka-landmarks.png', sheetWidth: 6, sheetHeight: 6, cellWidth: 2, cellHeight: 3, col: 2, row: 1, x: 280, y: 395 },
 { destination: 'jaffna', name: 'Nallur Temple', category: 'Northern heritage', asset: '/illustrations/sri-lanka-landmarks-expanded.png', sheetWidth: 4, sheetHeight: 3, cellWidth: 1, cellHeight: 1, col: 0, row: 0, x: 165, y: 65 },
 { destination: 'anuradhapura', name: 'Ruwanwelisaya', category: 'Sacred city', asset: '/illustrations/sri-lanka-landmarks-expanded.png', sheetWidth: 4, sheetHeight: 3, cellWidth: 1, cellHeight: 1, col: 1, row: 0, x: 190, y: 225 },
 { destination: 'polonnaruwa', name: 'Gal Vihara', category: 'Ancient sculpture', asset: '/illustrations/sri-lanka-landmarks-expanded.png', sheetWidth: 4, sheetHeight: 3, cellWidth: 1, cellHeight: 1, col: 2, row: 0, x: 355, y: 265 },
 { destination: 'dambulla', name: 'Dambulla Cave Temple', category: 'Cave temples', asset: '/illustrations/sri-lanka-landmarks-expanded.png', sheetWidth: 4, sheetHeight: 3, cellWidth: 1, cellHeight: 1, col: 3, row: 0, x: 220, y: 305 },
 { destination: 'trincomalee', name: 'Koneswaram Temple', category: 'East-coast heritage', asset: '/illustrations/sri-lanka-landmarks-expanded.png', sheetWidth: 4, sheetHeight: 3, cellWidth: 1, cellHeight: 1, col: 0, row: 1, x: 420, y: 200 },
 { destination: 'pinnawala', name: 'Elephants by the river', category: 'Elephant attraction', asset: '/illustrations/sri-lanka-landmarks-expanded.png', sheetWidth: 4, sheetHeight: 3, cellWidth: 1, cellHeight: 1, col: 1, row: 1, x: 165, y: 365 },
 { destination: 'sinharaja', name: 'Sinharaja Rainforest', category: 'Forest & nature', asset: '/illustrations/sri-lanka-landmarks-expanded.png', sheetWidth: 4, sheetHeight: 3, cellWidth: 1, cellHeight: 1, col: 2, row: 1, x: 270, y: 515 },
 { destination: 'mirissa', name: 'Mirissa whale coast', category: 'Ocean wildlife', asset: '/illustrations/sri-lanka-landmarks-expanded.png', sheetWidth: 4, sheetHeight: 3, cellWidth: 1, cellHeight: 1, col: 3, row: 1, x: 310, y: 553 },
 { destination: 'bentota', name: 'Bentota river', category: 'Lagoon & coast', asset: '/illustrations/sri-lanka-landmarks-expanded.png', sheetWidth: 4, sheetHeight: 3, cellWidth: 1, cellHeight: 1, col: 0, row: 2, x: 105, y: 480 },
 { destination: 'arugam-bay', name: 'Arugam Bay surf', category: 'Surf coast', asset: '/illustrations/sri-lanka-landmarks-expanded.png', sheetWidth: 4, sheetHeight: 3, cellWidth: 1, cellHeight: 1, col: 1, row: 2, x: 490, y: 415 },
 { destination: 'horton-plains', name: 'World’s End', category: 'Highland landscape', asset: '/illustrations/sri-lanka-landmarks-expanded.png', sheetWidth: 4, sheetHeight: 3, cellWidth: 1, cellHeight: 1, col: 2, row: 2, x: 320, y: 490 },
 { destination: 'colombo', name: 'Colombo waterfront', category: 'City & culture', asset: '/illustrations/sri-lanka-landmarks-expanded.png', sheetWidth: 4, sheetHeight: 3, cellWidth: 1, cellHeight: 1, col: 3, row: 2, x: 100, y: 395 },
];
