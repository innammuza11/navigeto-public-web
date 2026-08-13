import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { CurrencyProvider } from "@/components/currency-context";
import "./globals.css";
import "./tropical-motion.css";

const sans=Manrope({subsets:["latin"],variable:"--font-sans"});
const serif=Cormorant_Garamond({subsets:["latin"],variable:"--font-serif",weight:["400","500","600"]});
export const metadata:Metadata={metadataBase:new URL("https://www.navigeto.com"),title:{default:"Navigeto Travels | Sri Lanka & Worldwide Journeys",template:"%s | Navigeto Travels"},description:"Bespoke Sri Lanka holidays, international flights, hotels, private tours, transfers and visa support—beautifully connected by Navigeto Travels.",openGraph:{title:"Navigeto Travels | Travel, beautifully connected",description:"From Sri Lanka's beaches, hills and wildlife to worldwide journeys.",images:[{url:"/og.png",width:1200,height:630,alt:"Navigeto Travels — travel, beautifully connected"}]},twitter:{card:"summary_large_image",title:"Navigeto Travels | Travel, beautifully connected",description:"Sri Lanka and the world, thoughtfully connected.",images:["/og.png"]}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en" className={`${sans.variable} ${serif.variable}`}><body><CurrencyProvider>{children}</CurrencyProvider></body></html>}
