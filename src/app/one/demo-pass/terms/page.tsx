import Link from "next/link";
import terms from "@/lib/demo-pass-terms.json";
import s from "../pass.module.css";
export const metadata={title:"Navigeto One Demonstration Agreement | Navigeto"};
export default function Page(){return <main className={s.page}><nav><Link href="/one/demo-pass">← Navigeto One demonstration</Link></nav><section className={s.hero}><p className={s.eyebrow}>VERSION {terms.version}</p><h1>Demonstration<br/>agreement.</h1><p>Navigeto Travels (Pvt) Ltd. · USD 10 · 48 hours of individual access.</p></section><div className={s.terms}>{terms.sections.map(([title,text])=><section key={title}><h2>{title}</h2><p>{text}</p></section>)}</div></main>}
