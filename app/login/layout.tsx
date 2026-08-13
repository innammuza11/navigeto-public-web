import { createSeoMetadata } from "@/lib/seo";
export const metadata = createSeoMetadata({
  title: "Customer Sign In | Navigeto Travels",
  description: "Sign in to your Navigeto customer account.",
  path: "/login",
  noIndex: true,
});
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
