import type { Faq } from "@/lib/answer-engine";
import { faqJsonLd } from "@/lib/answer-engine";

/** Server-rendered question-and-answer block with matching FAQPage structured data. */
export function AnswerFaq({ heading, faqs, eyebrow = "Questions" }: { heading: string; faqs: Faq[]; eyebrow?: string }) {
  return <section className="section shell destination-faq answer-faq">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(faqs)).replace(/</g, "\\u003c") }}/>
    <div className="section-title"><p className="eyebrow">{eyebrow}</p><h2>{heading}</h2></div>
    {faqs.map(faq => <details key={faq.q}><summary>{faq.q}</summary><p>{faq.a}</p></details>)}
  </section>;
}
