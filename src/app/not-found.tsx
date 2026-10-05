import Link from "next/link";
import { SiteShell } from "@/components/site-shell";
import { SketchArt } from "@/components/sketch-art";
export default function NotFound(){return <SiteShell><section className="inner-hero"><div className="shell inner-grid"><div><p className="eyebrow">A small detour · 404</p><h1>A little lost?<br/>Let’s find your way.</h1><p className="lede">This page may have moved. Your next journey is still waiting.</p><div className="hero-actions"><Link className="button button-primary" href="/">Back to home</Link><Link className="button button-soft" href="/tours">Explore journeys</Link></div></div><div className="editorial-intro-art"><SketchArt variant="island"/></div></div></section></SiteShell>}
