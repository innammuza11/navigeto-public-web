import { ImageResponse } from "next/og";
import palette from "../../../shared/brand/palette.json";

export const alt = "Navigeto One — Your operation. Your journeys. One system. Try free for 14 days.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function SocialImage() {
  return new ImageResponse(<div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "#081323", padding: "54px 74px", fontFamily: "sans-serif", color: "#edf6fc" }}>
    <div style={{ display: "flex", fontSize: 31, fontWeight: 700 }}>Navigeto One</div>
    <div style={{ display: "flex", flexDirection: "column", marginTop: 28, fontSize: 74, letterSpacing: -3, lineHeight: 1.07, fontWeight: 700 }}><span>Your operation.</span><span>Your journeys.</span><span style={{ color: "#92d7f0" }}>One system.</span></div>
    <div style={{ display: "flex", marginTop: 24, fontSize: 23, color: "#bacbda" }}>Costing · Quotations · Itineraries · Reservations</div>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto", fontSize: 21 }}><span>14-day free trial · No card required</span><span style={{ padding: "15px 25px", background: palette.blue, color: "#fff", borderRadius: 8 }}>Start free trial ↗</span></div>
    <div style={{ position: "absolute", bottom: 0, left: 0, width: "78%", height: 7, background: palette.blue }} /><div style={{ position: "absolute", bottom: 0, left: "78%", width: "16%", height: 7, background: palette.green }} /><div style={{ position: "absolute", bottom: 0, right: 0, width: "6%", height: 7, background: palette.red }} />
  </div>, size);
}
