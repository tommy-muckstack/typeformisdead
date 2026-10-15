import type { Site } from "@/lib/site-types";
const GH = "https://github.com/tommy-muckstack/typeformisdead";
export const site: Site = {
  slug: "typeformisdead", name: "TypeformIsDead", replaces: "Typeform", theme: "typeform",
  glyph: "M7 8 H17 M7 12 H14 M7 16 H11",
  nav: [{ label: "Product", id: "product" }, { label: "Solutions", id: "solutions" }, { label: "Resources", id: "resources" }, { label: "Pricing", id: "pricing" }],
  cta: "Get started, it's free",
  hero: { variant: "split", eyebrow: "Free · Open source · Unlimited responses", title: ["Forms people", "actually finish."], subtitle: "One question at a time, with logic that follows the answer, results you can read at a glance, and a share link in two clicks. No response caps, no plan gates, no bill.",
    primary: { label: "Create your first form", href: "/login" }, secondary: { label: "See pricing", href: "/#pricing" }, shot: "player.png", shotAlt: "A TypeformIsDead form showing one question, 'How likely are you to recommend us?', with a zero-to-ten scale" },
  audience: "Used for feedback surveys, lead capture, event RSVPs, applications, quizzes and anything where you'd rather ask one question at a time",
  stepsTitle: "Ask better, get more answers",
  steps: [{ t: "Build", d: "Add questions of ten types, reorder them, and see exactly what respondents see as you type." }, { t: "Branch", d: "Logic jumps send people down different paths based on what they answered." }, { t: "Share", d: "Send a link or paste an embed. Responses are validated on the server before they count." }, { t: "Learn", d: "Completion rate, average time, per-question charts, NPS and a CSV export." }],
  rows: [
    { id: "product", k: "Conversational forms", h: "One question at a time feels like a conversation", p: "Big type, keyboard shortcuts (A, B, C for choices; Enter to continue), a progress bar, a welcome screen and an ending of your own. People finish what feels easy.", img: "player.png", alt: "A respondent view with a large question and lettered choices", cta: "Try the form player" },
    { id: "logic", k: "Logic", h: "Send each person down the right path", p: "Jump to a different question, or straight to the ending, based on an answer: is, is not, contains, greater than, less than. Detractors get a follow-up; promoters skip it.", img: "builder.png", alt: "The form builder with a logic jump configured on an opinion-scale question", cta: "Build with logic" },
    { id: "results", k: "Results", h: "Understand the answers without exporting a thing", p: "See responses, views and completion rate at a glance, a chart for every choice question, NPS for opinion scales and every text answer in one place. Export CSV any time.", img: "results.png", alt: "The results tab with response count, completion rate and per-question bar charts", cta: "See the results view" },
    { id: "share", k: "Share", h: "A link, an embed, and nothing to configure", p: "Every form gets a public link and an iframe snippet. Turn responses off with one switch. The server checks every submission against your questions, so bad data never gets in.", img: "share.png", alt: "The share tab with a form link and an embed code", cta: "Share a form" },
  ],
  statsTitle: "Real numbers, no fine print",
  stats: [{ b: "$0", s: "for every plan we replace" }, { b: "10 types", s: "text, choice, rating, scale, date, email and more" }, { b: "No caps", s: "unlimited forms, questions and responses" }, { b: "Apache-2.0", s: "self-host it, fork it, change it" }],
  integrations: { title: "Plays well with the rest of your stack", text: "Export responses as CSV for any spreadsheet or CRM, embed forms with an iframe, and link out from email, chat or QR codes. Webhooks are next." },
  pricing: { title: "What you'd pay for a form builder", vendor: "Typeform", asOf: "October 2026", plans: [{ name: "Basic", perSeatMonth: 28, flat: true, note: "100 responses a month, 1 user" }, { name: "Plus", perSeatMonth: 56, flat: true, note: "1,000 responses a month, 3 users" }, { name: "Business", perSeatMonth: 91, flat: true, note: "10,000 responses a month, 5 users" }], seats: 1,
    footnote: "Typeform prices are per account and billed yearly (monthly billing is $39, $79 and $129). Higher response tiers cost more. Self-hosting has your own hosting costs; a small instance fits in free tiers.", featuresTitle: "Every feature, no plan gates",
    features: [{ name: "Unlimited forms and questions", plan: "Basic" }, { name: "Conditional logic and jumps", plan: "Basic" }, { name: "Thousands of responses a month", plan: "Plus / Business" }, { name: "No branding on the form", plan: "Plus" }, { name: "Drop-off and completion rate", plan: "Business" }, { name: "CSV export", plan: "Basic" }] },
  finalCta: { title: "Your next form takes two minutes.", sub: "Make it, share it, and read the answers. No card, no limits." },
  footer: [
    { title: "Product", links: [{ label: "Form player", href: "/#product" }, { label: "Logic", href: "/#logic" }, { label: "Results", href: "/#results" }, { label: "Pricing", href: "/#pricing" }] },
    { title: "Get started", links: [{ label: "Log in", href: "/login" }, { label: "Try the demo account", href: "/login" }, { label: "Price comparison", href: "/#pricing" }] },
    { title: "Open source", links: [{ label: "GitHub", href: GH }, { label: "Apache-2.0 license", href: GH + "/blob/main/LICENSE" }] },
    { title: "More IsDead apps", links: [{ label: "CalendlyIsDead", href: "/calendlyisdead" }, { label: "CanvaIsDead", href: "/canvaisdead" }, { label: "DocuSignIsDead", href: "/docusignisdead" }, { label: "GrammarlyIsDead", href: "/grammarlyisdead" }] },
  ],
  trademark: "TypeformIsDead is an independent open-source project. It is not affiliated with, endorsed by or sponsored by Typeform SL. Typeform is a trademark of its owner.",
  repo: GH,
};
