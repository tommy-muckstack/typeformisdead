import Link from "next/link";
import { Band, Foot, Gh } from "@/components/Pk";
import "./tfhome.css";
import localFont from "next/font/local";
import { HomeHero } from "./HomeHero";

const serif = localFont({ src: "../public/fonts/InstrumentSerif-Regular.ttf", weight: "400", display: "swap", variable: "--tf-hero-serif" });

const Logo = ({ c = "#fff" }: { c?: string }) => <span className="tfh-logo" style={{ color: c }}><svg width="22" height="14" viewBox="0 0 22 14"><rect width="22" height="14" rx="3" fill="currentColor" /><rect x="4" y="4" width="5" height="6" rx="1" fill="#2a222b" /></svg>TypeformIsDead</span>;
const FOOT: [string, string[]][] = [["Product", ["Pricing", "Enterprise"]], ["Templates", ["Popular templates", "Survey templates", "Quiz templates", "Recent categories"]], ["Integrations", ["Popular integrations", "Marketing apps", "Popular app categories", "More apps categories"]], ["Resources", ["Blog", "Help Center", "Community", "Podcast", "Typeform Academy", "Technical program", "Education", "Status"]], ["Company", ["About us", "Press", "Careers", "Contact sales", "Legal", "Accessibility"]]];
export function TfHome() {
  return <div className={`tfh pk ${serif.variable}`}>
    <HomeHero />
    <Band h={732} className="tfh-light"><div className="tfh-two"><div><small className="pur">INTELLIGENT FORMS</small><h2>Build forms at the drop of a prompt</h2><p>With over 48 million responses collected monthly, TypeformIsDead AI builds best-in-class forms in seconds. Start with a sentence, finish with a form your respondents like.</p><Link className="tfh-dark" href="/login">Explore forms</Link></div><div className="art"><span /></div></div>
      <div className="tfh-three">{[["High Response Rate", "Questions one at a time keep completion high."], ["Deeper Insights", "Ask follow-ups that adapt to every answer."], ["Advanced Analytics", "Charts, NPS and exports for every form."]].map(([t, d]) => <div key={t}><i /><b>{t}</b><span>{d}</span></div>)}</div></Band>
    <Band h={2075} className="tfh-dark2"><h2>When the form ends,<br />the flow begins…</h2>
      <div className="tfh-flow"><div><small className="pur">GROWTH FLOW</small><h3>Be proactive with customer data</h3><p>Set up automations that convert and keep customers: segment responses, send follow-ups and route leads, all from one form.</p><Link className="tfh-white" href="/login">Explore Growth Flow</Link><div className="two"><div><b>Instant Lead Capture</b><span>One-click setup for lead capture and routing.</span></div><div><b>Data Enrichment</b><span>Fill in company details automatically.</span></div><div><b>Customer Engagement</b><span>Follow up with the right message at the right time.</span></div></div></div><div className="art a1" /></div>
      <div className="tfh-flow rev"><div className="art a2" /><div><small className="pur">RESEARCH FLOW</small><h3>Run fast research, moderated by AI</h3><p>Make data-backed decisions with Research Flow: from study design to moderated interviews to a report you can share.</p><Link className="tfh-white" href="/login">Explore Research Flow</Link><div className="two"><div><b>Fast Insights</b><span>Quick synthesis of every answer.</span></div><div><b>Qualitative &amp; Quantitative</b><span>Mix open and closed questions.</span></div><div><b>Verified Panel Recruitment</b><span>Bring in the right participants.</span></div></div></div></div></Band>
    <Band className="tfh-join"><h2>Join 150,000+ businesses driving revenue with TypeformIsDead</h2><div className="logos"><b>Webflow</b><b>_zapier</b><b>SHOPIFY</b></div>
      <div className="cards"><div><b>SmartBug Media increased sales leads by 40% with one form</b></div><div><b>Double: Destiny Marketing drove $3.67 million in sales</b></div><div><b>Viva scaled customer engagement</b></div></div><div className="dots">•••••••••</div><Link className="tfh-ghost2" href="/login">Read all customer stories</Link>
    </Band>
    <Band h={487} className="tfh-cta"><h2>AI forms and automation.<br />All in TypeformIsDead.</h2><Link className="tfh-white" href="/login">Get started—it&apos;s free</Link></Band>
    <Foot linkHref="/login" cols={FOOT} bg="#2a222b" color="#fff" minH={783} top={<div className="tfh-ftop"><Logo /></div>} legal={<><span>Contact sales</span><span>Check our commitment to data privacy</span><span>Legal</span><span>© 2026</span></>} note={`TypeformIsDead is an independent open-source project, not affiliated with or endorsed by Typeform S.L. Typeform is a trademark of its owner. Source: ${Gh("typeformisdead")} (Apache-2.0)`} />
  </div>;
}
