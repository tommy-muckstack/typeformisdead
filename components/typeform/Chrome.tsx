"use client";
// Typeform-style builder chrome: Add content modal, Design popover, Share page, Results shell, preview overlay, new-form page.
import React, { useEffect, useState } from "react";
import type { QType } from "@/lib/forms/types";
import "./tfchrome.css";

const S = ({ c, s = 14 }: { c: React.ReactNode; s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{c}</svg>;
export const TI = {
  mic: <S c={<><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M6 11a6 6 0 0012 0M12 17v3" /></>} />,
  send: <S c={<path d="M5 4l15 8-15 8 3-8z" />} />,
  x: <S s={16} c={<path d="M6 6l12 12M18 6L6 18" />} />,
  search: <S c={<><circle cx="11" cy="11" r="6" /><path d="M20 20l-4.5-4.5" /></>} />,
  link: <S c={<path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1" />} />,
  mail: <S c={<><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></>} />,
  code: <S c={<path d="M8 6l-6 6 6 6M16 6l6 6-6 6M14 4l-4 16" />} />,
  target: <S c={<><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="4" /></>} />,
  edit: <S s={12} c={<path d="M4 20l1-4L16 5l3 3L8 19zM14 7l3 3" />} />,
  play: <S s={12} c={<path d="M7 5l12 7-12 7z" />} />,
  gem: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0a7a57" strokeWidth="2" strokeLinejoin="round" aria-hidden="true"><path d="M6 4h12l4 6-10 11L2 10z" /><path d="M2 10h20M9 4l-2 6 5 11 5-11-2-6" /></svg>,
  phone: <S s={14} c={<><rect x="7" y="3" width="10" height="18" rx="2" /><path d="M11 18h2" /></>} />,
  refresh: <S s={14} c={<path d="M20 11a8 8 0 10-2 5.5M20 4v7h-7" />} />,
  drag: <svg width="10" height="12" viewBox="0 0 10 12" fill="#777" aria-hidden="true"><circle cx="2.5" cy="2" r="1.1" /><circle cx="7.5" cy="2" r="1.1" /><circle cx="2.5" cy="6" r="1.1" /><circle cx="7.5" cy="6" r="1.1" /><circle cx="2.5" cy="10" r="1.1" /><circle cx="7.5" cy="10" r="1.1" /></svg>,
  palette: <S c={<><path d="M12 3.5a8.5 8.5 0 100 17c1.8 0 2.2-1.3 1.4-2.4-.8-1.2 0-2.6 1.5-2.6H17a3.5 3.5 0 003.5-3.5C20.5 6.9 16.7 3.5 12 3.5z" /><path d="M8 11h.01M11 7.8h.01M15 8.5h.01" /></>} />,
  plus: <S s={14} c={<path d="M12 5v14M5 12h14" />} />,
  chev: <S s={12} c={<path d="M6 9l6 6 6-6" />} />,
  help: <S s={13} c={<><circle cx="12" cy="12" r="9" /><path d="M9.7 9.6a2.4 2.4 0 114 1.8c-.9.6-1.7 1.1-1.7 2.2M12 17h.01" /></>} />,
  cal: <S s={13} c={<><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M4 10h16M9 3v4M15 3v4" /></>} />,
  device: <S s={13} c={<><rect x="3" y="5" width="18" height="12" rx="2" /><path d="M8 21h8M12 17v4" /></>} />,
  down: <S s={12} c={<path d="M12 5v14M6 13l6 6 6-6" />} />,
  arrowDown: <S s={11} c={<path d="M12 5v14M6 13l6 6 6-6" />} />,
};
const Gem = () => <span className="tfc-gem">{TI.gem}</span>;

type Item = { label: string; type?: QType | "welcome" | "end"; pro?: boolean; tone: string; ic: string };
const GROUPS: { h: string; items: Item[] }[] = [
  { h: "Contact info", items: [{ label: "Contact Info", tone: "pink", ic: "◉" }, { label: "Email", type: "email", tone: "pink", ic: "✉" }, { label: "Phone Number", tone: "pink", ic: "✆" }, { label: "Address", tone: "pink", ic: "⌖" }, { label: "Website", tone: "pink", ic: "⊕" }] },
  { h: "Choice", items: [{ label: "Multiple Choice", type: "choice", tone: "violet", ic: "☰" }, { label: "Dropdown", tone: "violet", ic: "⌄" }, { label: "Picture Choice", tone: "violet", ic: "▣" }, { label: "Yes/No", type: "yes_no", tone: "violet", ic: "⊘" }, { label: "Legal", tone: "violet", ic: "⚖" }, { label: "Checkbox", tone: "violet", ic: "☑" }] },
  { h: "Rating & ranking", items: [{ label: "Net Promoter Score®", type: "scale", tone: "green", ic: "◔" }, { label: "Opinion Scale", type: "scale", tone: "green", ic: "▥" }, { label: "Rating", type: "rating", tone: "green", ic: "☆" }, { label: "Ranking", tone: "green", ic: "≣" }, { label: "Matrix", tone: "green", ic: "▦" }] },
  { h: "Text & Video", items: [{ label: "Long Text", type: "long_text", tone: "blue", ic: "☰" }, { label: "Short Text", type: "short_text", tone: "blue", ic: "▭" }, { label: "Video and Audio", pro: true, tone: "blue", ic: "▶" }, { label: "Clarify with AI", pro: true, tone: "blue", ic: "✦" }, { label: "FAQ with AI", pro: true, tone: "blue", ic: "?" }] },
  { h: "Other", items: [{ label: "Number", type: "number", tone: "yellow", ic: "#" }, { label: "Date", type: "date", tone: "yellow", ic: "▤" }, { label: "Signature", pro: true, tone: "yellow", ic: "✎" }, { label: "Payment", pro: true, tone: "yellow", ic: "▭" }, { label: "File Upload", pro: true, tone: "yellow", ic: "⇪" }, { label: "Scheduler", tone: "yellow", ic: "▥" }] },
  { h: " ", items: [{ label: "Welcome Screen", type: "welcome", tone: "gray", ic: "▯" }, { label: "Partial Submit Point", pro: true, tone: "gray", ic: "⏷" }, { label: "Statement", type: "statement", tone: "gray", ic: "❝" }, { label: "Question Group", tone: "gray", ic: "▤" }, { label: "End Screen", type: "end", tone: "gray", ic: "▢" }, { label: "Redirect to URL", pro: true, tone: "gray", ic: "↪" }] },
];
const REC: Item[] = [{ label: "Video and Audio", pro: true, tone: "blue", ic: "▶" }, { label: "Short Text", type: "short_text", tone: "blue", ic: "▭" }, { label: "Multiple Choice", type: "choice", tone: "violet", ic: "☰" }];

export function AddContentModal({ onClose, onPick }: { onClose: () => void; onPick: (t: QType | "welcome" | "end") => void }) {
  const [q, setQ] = useState(""); const [tab, setTab] = useState("Add form elements"); const [note, setNote] = useState("");
  useEffect(() => { const f = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); }; window.addEventListener("keydown", f); return () => window.removeEventListener("keydown", f); }, [onClose]);
  const pick = (it: Item) => { if (it.type) { onPick(it.type); onClose(); } else setNote(`${it.label} isn't in TypeformIsDead yet. It's open source, so you can add it.`); };
  const f = (it: Item) => it.label.toLowerCase().includes(q.toLowerCase());
  const row = (it: Item, key?: string) => <button key={key ?? it.label} className={"tfc-el" + (it.type ? "" : " na")} onClick={() => pick(it)}><i className={"tfc-ic " + it.tone}>{it.ic}</i><span>{it.label}</span>{it.pro && <Gem />}</button>;
  return <div className="tfc-scrim" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
    <div className="tfc-add" role="dialog" aria-label="Add content" data-testid="add-content">
      <header>{["Add form elements", "Import questions", "Create with AI"].map(t => <button key={t} className={tab === t ? "on" : ""} onClick={() => { setTab(t); if (t !== "Add form elements") setNote(`${t} isn't in TypeformIsDead yet.`); else setNote(""); }}>{t}</button>)}<button className="x" aria-label="Close" onClick={onClose}>{TI.x}</button></header>
      <div className="tfc-add-body">
        <aside>
          <label className="tfc-srch">{TI.search}<input placeholder="Search form elements" value={q} onChange={e => setQ(e.target.value)} aria-label="Search form elements" /></label>
          <h5>Recommended</h5>{REC.filter(f).map(it => row(it, "rec-" + it.label))}
          <h5>Connect to apps</h5>
          <button className="tfc-el na" onClick={() => setNote("Integrations aren't in TypeformIsDead yet.")}><i className="tfc-ic app hub">h</i><span>Hubspot</span></button>
          <button className="tfc-el na" onClick={() => setNote("Integrations aren't in TypeformIsDead yet.")}><i className="tfc-ic app sf">s</i><span>Salesforce</span><Gem /></button>
          <button className="tfc-el na" onClick={() => setNote("Integrations aren't in TypeformIsDead yet.")}><i className="tfc-ic app">⊞</i><span>Browse all apps</span></button>
        </aside>
        <div className="tfc-cols">{GROUPS.map(g => { const items = g.items.filter(f); return <div key={g.h} className="tfc-grp"><h5>{g.h}</h5>{items.map(it => row(it))}</div>; })}</div>
      </div>
      {note && <p className="tfc-note" role="status">{note}</p>}
    </div>
  </div>;
}

export function DesignPopover({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<"My themes" | "Gallery">("My themes");
  return <div className="tfc-design" role="dialog" aria-label="Design" data-testid="design-panel">
    <header><span className="drag">{TI.drag}</span><b>Design</b><button aria-label="Close design" onClick={onClose}>{TI.x}</button></header>
    <div className="tfc-dtabs">{(["My themes", "Gallery"] as const).map(t => <button key={t} className={tab === t ? "on" : ""} onClick={() => setTab(t)}>{t}</button>)}</div>
    {tab === "My themes" ? <>
      <div className="tfc-drow"><span>Brand kit themes <Gem /></span><button className="tfc-mini">Manage</button></div>
      <div className="tfc-drow"><span>My themes</span><button className="tfc-plus" aria-label="New theme">{TI.plus}</button></div>
    </> : <p className="tfc-dnote">Themes from the gallery aren&apos;t in TypeformIsDead yet.</p>}
  </div>;
}

export function PreviewOverlay({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  const [mobile, setMobile] = useState(false); const [k, setK] = useState(0);
  useEffect(() => { const f = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); }; window.addEventListener("keydown", f); return () => window.removeEventListener("keydown", f); }, [onClose]);
  return <div className="tfc-prev" data-testid="preview-overlay">
    <div className="tfc-prev-bar"><button aria-label="Close preview" onClick={onClose}>{TI.x}</button><i /><button aria-label="Toggle mobile view" className={mobile ? "on" : ""} onClick={() => setMobile(m => !m)}>{TI.phone}</button><i /><button aria-label="Restart preview" onClick={() => setK(x => x + 1)}>{TI.refresh}</button></div>
    <div className={"tfc-prev-stage" + (mobile ? " mobile" : "")} key={k}>{children}<span className="tfc-powered">Powered by <b>▮▮ TypeformIsDead</b></span></div>
  </div>;
}

export function SharePage({ link, published, onPublished, onCopy, copied, title, onResults }: { link: string; published: boolean; onPublished: (b: boolean) => void; onCopy: () => void; copied: boolean; title: string; onResults: () => void }) {
  const [sub, setSub] = useState<"link" | "email" | "web" | "target">("link");
  const embed = `<iframe src="${link}" style="width:100%;height:560px;border:0" title="${title.replace(/"/g, "&quot;")}"></iframe>`;
  const [desc, setDesc] = useState("Turn data collection into an experience with TypeformIsDead. Create beautiful online forms, surveys, quizzes, and so much more."); const [ptitle, setPtitle] = useState(title); const [seo, setSeo] = useState(false);
  return <div className="tfc-share">
    <aside className="tfc-sl"><div className="tfc-sl-in">
      {([["link", TI.link, "Share the link"], ["email", TI.mail, "Embed in an email"], ["web", TI.code, "Embed in a web page"]] as const).map(([k, ic, l]) => <button key={k} className={sub === k ? "on" : ""} onClick={() => setSub(k)}>{ic}{l}</button>)}
      <button className="off" disabled>{TI.target}Get targeted respondents</button></div>
      <div className="tfc-ask">{TI.mic}<span>Ask TypeformIsDead AI</span><i>{TI.send}</i></div></aside>
    <div className="tfc-sc">
      <div className="tfc-urlbar"><button className="tfc-copy" onClick={onCopy}>{TI.link} {copied ? "Copied" : "Copy link"}</button><span className="u">{sub === "link" ? link : sub === "email" ? "Paste into your email" : "Paste into your page"}</span><span className="e">{TI.edit} Edit</span><span className="ic">{TI.mail}</span><span className="ic">⌗</span></div>
      <label className="tfc-pub"><input type="checkbox" checked={published} onChange={e => onPublished(e.target.checked)} /> Accepting responses (published)</label>
      {sub === "link" && <div className="tfc-linkprev"><div className="sk a" /><div className="card"><div className="av" /><div className="ln w1" /><div className="ln w2" /><div className="ln w3" /><div className="ln w4" /><div className="og"><div className="th"><b>▮▮ TypeformIsDead</b></div><div><p className="t">{ptitle}</p><p className="d">{desc}</p><p className="h">{link.replace(/^https?:\/\//, "").split("/")[0]}</p></div></div></div><div className="sk b" /></div>}
      {sub !== "link" && <pre className="tfc-code">{sub === "web" ? embed : `<a href="${link}">${title.replace(/</g, "&lt;")}</a>`}</pre>}
      <p className="tfc-resl"><button onClick={onResults} className="tfc-linkbtn">View responses →</button></p>
    </div>
    <aside className="tfc-sr">
      <p className="lab">Share in:</p><div className="soc">{["f", "in", "𝕏", "◈", "✳"].map(s => <span key={s}>{s}</span>)}</div>
      <p className="h">Link preview <Gem /></p>
      <label>Thumbnail {TI.help}</label><button className="up">Upload</button>
      <label>Title</label><input className="fld" value={ptitle} onChange={e => setPtitle(e.target.value)} aria-label="Link preview title" />
      <label>Description {TI.help}</label><textarea className="fld ta" value={desc} onChange={e => setDesc(e.target.value)} aria-label="Link preview description" />
      <div className="sw"><span>Show in search results {TI.help}</span><button role="switch" aria-checked={seo} className={seo ? "on" : ""} onClick={() => setSeo(s => !s)}><i /></button></div>
    </aside>
  </div>;
}

export type ResultsSub = "performance" | "summary" | "responses";
export function ResultsShell({ sub, setSub, stats, children }: { sub: ResultsSub; setSub: (s: ResultsSub) => void; stats: { views: number; starts: number; submissions: number; completion: string; time: string }; children: React.ReactNode }) {
  const [range, setRange] = useState("All time");
  const tabs: [ResultsSub | "smart", string][] = [["smart", "Smart Insights"], ["performance", "Form performance"], ["summary", "Response summary"], ["responses", "Responses"]];
  const [note, setNote] = useState(false);
  return <div className="tfc-res" data-testid="results">
    <nav className="tfc-rtabs">{tabs.map(([k, l]) => <button key={k} className={sub === k ? "on" : ""} onClick={() => k === "smart" ? setNote(n => !n) : (setNote(false), setSub(k))}>{l}{k === "smart" && <Gem />}</button>)}</nav>
    <div className="tfc-rbody">
      {note && <p className="tfc-dnote wide">Smart Insights (AI summaries of your responses) aren&apos;t in TypeformIsDead. Paste the Responses table into your own AI instead.</p>}
      {sub === "performance" ? <div className="tfc-perf">
        <h2>Form performance</h2><p className="sub">Key metrics that show how your form is doing.</p><hr />
        <div className="tfc-filters"><button onClick={() => setRange(r => r === "All time" ? "Last 30 days" : "All time")}>{TI.cal} {range}</button><button className="dev">{TI.device} All devices <span>{TI.chev}</span></button></div>
        <h3>At a glance</h3>
        <div className="tfc-cards">{([["Views", String(stats.views)], ["Starts", String(stats.starts)], ["Submissions", String(stats.submissions)], ["Completion rate", stats.completion], ["Time to complete", stats.time]] as const).map(([l, v]) => <div key={l} data-testid={"stat-" + l.toLowerCase().replace(/ /g, "-")}><span>{l}</span><b data-testid={l === "Submissions" ? "r-count" : undefined}>{v}</b></div>)}</div>
        <div className="tfc-drop"><div className="in"><div className="txt"><h3>See where users drop off</h3><p>Identify the questions where people stop responding so you can optimize your form.</p><div className="row"><button className="learn" onClick={() => setSub("summary")}>Open response summary</button></div><p className="plans">Included free in TypeformIsDead. Per-question drop-off arrives once responses carry step timing.</p></div>
          <div className="art"><div className="c1"><i /> Ready for the event of the year?<small>195 views</small></div><div className="pill">{TI.arrowDown} Drop-off: -1174 (98%)</div><div className="c2"><i className="u" /> What&apos;s your full name?<small>21 views</small></div></div></div></div>
      </div> : <div className="tfc-rcontent">{children}</div>}
    </div>
  </div>;
}

export function NewFormPage({ onScratch, onAi, onTemplate, templates, busy }: { onScratch: () => void; onAi: (goal: string) => void; onTemplate: (id: string) => void; templates: { id: string; name: string; blurb: string }[]; busy: boolean }) {
  const [goal, setGoal] = useState("");
  return <div className="tfc-new">
    <div className="tfc-new-in">
      <p className="ai">Typeform AI</p><h1>What would you like to create?</h1>
      <div className="glow"><div className="ta"><textarea autoFocus placeholder="Explain the goal of your form" value={goal} onChange={e => setGoal(e.target.value)} aria-label="Explain the goal of your form" />
        <div className="tools"><span>{TI.mic}</span><span>{TI.plus}</span><span>···</span><button className={goal.trim() ? "on" : ""} aria-label="Create" disabled={!goal.trim() || busy} onClick={() => onAi(goal.trim())}>{TI.play}</button></div></div></div>
      <hr />
      <div className="alt"><button disabled={busy} onClick={onScratch} data-testid="start-scratch">Start from scratch</button><button className="crm" disabled title="Not in TypeformIsDead yet">Sync to CRM <i className="hub">h</i><i className="sf">s</i></button></div>
      <p className="tpl">Or start from a template</p>
      <div className="tpls">{templates.filter(t => t.id !== "blank").map(t => <button key={t.id} disabled={busy} onClick={() => onTemplate(t.id)}><b>{t.name}</b><span>{t.blurb}</span></button>)}</div>
    </div>
  </div>;
}
