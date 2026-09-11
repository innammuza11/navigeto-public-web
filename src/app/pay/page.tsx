import type { Metadata } from "next";
import { PayOnline } from "@/components/pay-online";
import { SiteShell } from "@/components/site-shell";
import { seoMetadata } from "@/lib/seo";

export const metadata: Metadata = seoMetadata("/pay");

export default function PayOnlinePage() {
  return <SiteShell hideNavi><PayOnline /></SiteShell>;
}
