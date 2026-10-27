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
    <Band h={732} className="tfh-light"><div className="tfh-two"><div><small className="pur">INTELLIGENT FORMS</small><h2>Build forms at the drop of a prompt</h2><p>Describe the form you need and TypeformIsDead drafts the questions, picking a type for each one. Start with a sentence, finish with a form your respondents like.</p><Link data-website-cta="content" className="tfh-dark" href="/login">Explore forms</Link></div><div className="art"><span /></div></div>
      <div className="tfh-three">{[["High Response Rate", "Questions one at a time keep completion high."], ["Deeper Insights", "Ask follow-ups that adapt to every answer."], ["Advanced Analytics", "Charts, NPS and exports for every form."]].map(([t, d]) => <div key={t}><i /><b>{t}</b><span>{d}</span></div>)}</div></Band>
    <Band h={2075} className="tfh-dark2"><h2>When the form ends,<br />the answers begin…</h2>
      <div className="tfh-flow"><div><small className="pur">LOGIC</small><h3>Send each person down the right path</h3><p>Logic jumps send people to a different question, or straight to the ending, based on what they answered.</p><Link data-website-cta="content" className="tfh-white" href="/login">Build with logic</Link><div className="two"><div><b>Jump on any answer</b><span>Is, is not, contains, greater or less than.</span></div><div><b>Skip to the end</b><span>Finish early when the rest does not apply.</span></div><div><b>Follow up with detractors</b><span>Ask unhappy customers one more question.</span></div></div></div><div className="art a1" /></div>
      <div className="tfh-flow rev"><div className="art a2" /><div><small className="pur">RESULTS</small><h3>Read the answers at a glance</h3><p>Completion rate, average time, a chart for every choice question, NPS for opinion scales and a CSV export.</p><Link data-website-cta="content" className="tfh-white" href="/login">See the results view</Link><div className="two"><div><b>Completion rate</b><span>Views and submissions side by side.</span></div><div><b>NPS</b><span>Promoters, passives and detractors.</span></div><div><b>CSV export</b><span>Every answer in a spreadsheet.</span></div></div></div></div></Band>
    <Band className="tfh-join"><h2>Built in the open</h2><div className="logos"><b>Free</b><b>Open source</b><b>Apache-2.0</b></div>
      <div className="cards"><div><b>Every feature free, with no plan gates</b></div><div><b>10 question types, logic jumps and NPS</b></div><div><b>Apache-2.0 on GitHub: read it or fork it</b></div></div><div className="dots">•••••••••</div><a data-website-cta="content" className="tfh-ghost2" href="https://github.com/tommy-muckstack/typeformisdead">Read the code</a>
    </Band>
    <Band h={487} className="tfh-cta"><h2>Forms, logic and results.<br />All in TypeformIsDead.</h2><Link data-website-cta="content" className="tfh-white" href="/login">Get started—it&apos;s free</Link></Band>
    <Foot linkHref="/login" cols={FOOT} bg="#2a222b" color="#fff" minH={783} top={<div className="tfh-ftop"><Logo /></div>} legal={<><span>Contact sales</span><span>Check our commitment to data privacy</span><span>Legal</span><span>© 2026</span></>} note={`TypeformIsDead is an independent open-source project, not affiliated with or endorsed by Typeform S.L. Typeform is a trademark of its owner. Source: ${Gh("typeformisdead")} (Apache-2.0)`} />
  </div>;
}
