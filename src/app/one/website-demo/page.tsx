import type { Metadata } from "next";
import { Suspense } from "react";
import WebsiteDemo from "./WebsiteDemo";

export const metadata: Metadata = {
  title: { absolute: "Customer Website Demo | Navigeto One" },
  description: "Preview a travel agency customer website in four theme models. Type your agency name and switch themes. Sample content only.",
  alternates: { canonical: "/one/website-demo" },
};

export default function Page() {
  return <Suspense fallback={null}><WebsiteDemo /></Suspense>;
}
