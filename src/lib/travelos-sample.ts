/** Illustrative browser-only costing. Never used to charge or confirm a trip. */
export function sampleCost(pax: number, nights: number, hotel: number, transport: number, guide: number, markup: number) {
  const rooms = Math.ceil(pax / 2);
  const net = hotel * nights * rooms + transport + guide;
  const total = net * (1 + markup / 100);
  return { rooms, net, total, perAdult: total / pax, profit: total - net };
}
