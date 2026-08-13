import ToursExplorer from "./ToursExplorer";
import { getCachedTours } from "@/lib/server-public-data";
import type { PublicPackage } from "@/lib/types";

export default async function ToursPage() {
  let initialTours: PublicPackage[] = [];
  let initialError: string | undefined;
  try {
    initialTours = await getCachedTours();
  } catch {
    initialError = "We couldn't load the tour catalogue right now. Please try again shortly or send us your dates directly.";
  }
  return <ToursExplorer initialTours={initialTours} initialError={initialError} />;
}
