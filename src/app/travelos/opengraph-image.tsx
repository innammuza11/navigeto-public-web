import { ImageResponse } from "next/og";
import palette from "../../../shared/brand/palette.json";

export const alt = "TravelOS by Navigeto — Less admin. More journeys. Agency pilot demos.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function SocialImage() {
  return new ImageResponse(<div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "#f7f9fc", padding: "66px 74px", fontFamily: "sans-serif", color: palette.navy }}>
    <div style={{ display: "flex", fontSize: 31, fontWeight: 700 }}>TravelOS <span style={{ fontSize: 23, fontWeight: 400, marginLeft: 12, marginTop: 7 }}>by Navigeto</span></div>
    <div style={{ display: "flex", flexDirection: "column", marginTop: 54, fontSize: 87, letterSpacing: -5, lineHeight: 1.07, fontWeight: 700 }}><span>Less admin.</span><span style={{ color: palette.blue }}>More journeys.</span></div>
    <div style={{ display: "flex", marginTop: 28, fontSize: 25, color: "#5b6374" }}>Costing · Quotations · Itineraries · Reservations</div>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto", fontSize: 21 }}><span>Explore the agency pilot</span><span style={{ padding: "15px 25px", background: palette.navy, color: "#fff", borderRadius: 8 }}>Book a demo ↗</span></div>
    <div style={{ position: "absolute", bottom: 0, left: 0, width: "78%", height: 7, background: palette.blue }} /><div style={{ position: "absolute", bottom: 0, left: "78%", width: "16%", height: 7, background: palette.green }} /><div style={{ position: "absolute", bottom: 0, right: 0, width: "6%", height: 7, background: palette.red }} />
  </div>, size);
}
