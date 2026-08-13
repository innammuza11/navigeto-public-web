import type { Metadata } from "next";
export const metadata: Metadata = { title: { absolute: "Hotel search | Navigeto Travels" }, alternates: { canonical: "/hotels" }, robots: { index: false, follow: true } };
export default function Layout({children}:{children:React.ReactNode}){return children;}
