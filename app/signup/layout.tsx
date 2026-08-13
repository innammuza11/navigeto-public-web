import { createSeoMetadata } from "@/lib/seo";
export const metadata = createSeoMetadata({
  title: "Create a Customer Account | Navigeto Travels",
  description: "Create a Navigeto customer account.",
  path: "/signup",
  noIndex: true,
});
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
