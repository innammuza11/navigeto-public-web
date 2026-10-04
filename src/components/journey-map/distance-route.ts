import { places } from './places';
import { chartDistance, CHART_SOURCE } from './chart-distances';
import { referenceRoute } from './reference-routes';

// Finite, fixed landmark pairs; no arbitrary geocoding or client-supplied coordinates.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const a = places.find(p => p.id === url.searchParams.get('from'));
  const b = places.find(p => p.id === url.searchParams.get('to'));
  if (!a || !b || a.id === b.id) return Response.json({ error: 'Choose two different destinations.' }, { status: 400 });
  const choice = url.searchParams.get('route');
  const ref = referenceRoute(a.id, b.id, choice === 'scenic' || choice === 'highway' ? choice : 'shortest');
  if (ref) return Response.json({ available: true, ...ref, source: 'reference_table', referenceDate: '2014-02-28' }, { headers: { 'Cache-Control': 'public, max-age=86400' } });
  const chartKm = chartDistance(a.id, b.id);
  if (chartKm !== null) return Response.json({ available: true, km: chartKm, source: 'published_chart', sourceUrl: CHART_SOURCE }, { headers: { 'Cache-Control': 'public, max-age=86400' } });
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) return Response.json({ available: false });
  try {
    const response = await fetch('https://routes.googleapis.com/directions/v2:computeRoutes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': key, 'X-Goog-FieldMask': 'routes.distanceMeters,routes.duration' },
      body: JSON.stringify({ origin: { location: { latLng: { latitude: a.lat, longitude: a.lon } } }, destination: { location: { latLng: { latitude: b.lat, longitude: b.lon } } }, travelMode: 'DRIVE', units: 'METRIC' }),
      signal: AbortSignal.timeout(8000),
      next: { revalidate: 86400 },
    });
    if (!response.ok) return Response.json({ available: false });
    const data = await response.json();
    const route = data.routes?.[0];
    if (!Number.isFinite(route?.distanceMeters) || route.distanceMeters <= 0) return Response.json({ available: false });
    return Response.json({ available: true, source: 'google_routes', km: Math.round(route.distanceMeters / 100) / 10, minutes: Math.round(parseFloat(route.duration || '0s') / 60) }, { headers: { 'Cache-Control': 'public, max-age=86400' } });
  } catch {
    return Response.json({ available: false });
  }
}
