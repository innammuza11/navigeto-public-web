/** Profile links require the published slug supplied by the hotel service. */
export function hotelProfileHref(publicSlug: unknown, params?: URLSearchParams): string | null {
  if (typeof publicSlug !== "string" || !/^[a-z0-9][a-z0-9_-]*$/i.test(publicSlug)) return null;
  const query = params?.toString();
  return `/hotels/${encodeURIComponent(publicSlug)}${query ? `?${query}` : ""}`;
}
