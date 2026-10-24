import type { Metadata } from "next";
import DemoWorkspace from "./DemoWorkspace";
export const metadata: Metadata = {
  title: "Try Navigeto One | Interactive Navigeto Demo",
  description: "Explore a sample travel agency workspace: itineraries, hotels, costing, quotations, reservations, accounts and DMC discovery. No login needed.",
  alternates: { canonical: "/navigeto-one/demo" },
};
export default function Page() { return <DemoWorkspace />; }
