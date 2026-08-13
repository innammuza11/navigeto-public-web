import { createSeoMetadata } from "@/lib/seo";
export const metadata = createSeoMetadata({
  title: "Privacy Policy | Navigeto Travels",
  description: "How Navigeto Travels handles website enquiries, customer contact details and travel service information.",
  path: "/privacy",
});
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
