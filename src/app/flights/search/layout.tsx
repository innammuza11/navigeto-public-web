import type { Metadata } from "next";
export const metadata: Metadata = { title: { absolute: "Flight search | Navigeto Travels" }, alternates: { canonical: "/flights" }, robots: { index: false, follow: true } };
export default function Layout({children}:{children:React.ReactNode}){return children;}
