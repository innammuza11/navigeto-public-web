import "server-only";

import { cache } from "react";
import { getHotel, getTour, listHotelPages, listTours } from "./travelos";

export const getCachedTour = cache((slug: string) => getTour(slug));
export const getCachedHotel = cache((slug: string) => getHotel(slug));
export const getCachedTours = cache(() => listTours());
export const getCachedCountryTours = cache((country: string) => listTours({ country }));
export const getCachedInternationalTours = cache(() => listTours({ exclude_country: "Sri Lanka" }));
export const getCachedHotelPages = cache(() => listHotelPages());
