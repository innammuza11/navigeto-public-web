import { createSeoMetadata } from "@/lib/seo";
export const metadata = createSeoMetadata({
  title: "Booking Terms | Navigeto Travels",
  description: "Important terms for Navigeto hotel, transfer, tour, flight and travel service requests and confirmations.",
  path: "/terms",
});
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
