"use client";
import { useEffect, useState } from "react";
import type { Form, FormResponse } from "@/lib/forms/types";
import { fmtAnswer } from "@/lib/forms/logic";
import { completionRate, summarize } from "@/lib/forms/results";
import { BP } from "@/lib/basepath";
export function Results({ form }: { form: Form }) {
  const [rs, setRs] = useState<FormResponse[] | null>(null); const [views, setViews] = useState(0); const [view, setView] = useState<"summary" | "responses">("summary");
  useEffect(() => { (async () => { const r = await fetch(`${BP}/api/forms/${form.id}/responses`); if (r.ok) setRs((await r.json()).responses); const l = await fetch(`${BP}/api/forms`); if (l.ok) setViews(((await l.json()).forms as any[]).find(f => f.id === form.id)?.views ?? 0); })(); }, [form.id]);
  if (!rs) return <p className="ids-muted">Loading results…</p>;
  if (!rs.length) return <div className="ids-card" style={{ padding: 32, textAlign: "center" }}><h2>No responses yet</h2><p className="ids-muted">Share your link from the Share tab, then check back.</p></div>;
  const timed = rs.filter(r => r.durationMs); const avgMs = timed.reduce((a, r) => a + (r.durationMs ?? 0), 0) / Math.max(1, timed.length);
  const qs = form.questions.filter(q => q.type !== "statement"); const sum = summarize(form, rs);
  return <div data-testid="results">
    <div className="tfr__cards"><div className="ids-card"><b data-testid="r-count">{rs.length}</b><span>Responses</span></div><div className="ids-card"><b>{views}</b><span>Views</span></div><div className="ids-card"><b>{completionRate(views, rs.length)}%</b><span>Completion rate</span></div><div className="ids-card"><b>{avgMs ? Math.max(1, Math.round(avgMs / 1000)) + "s" : "–"}</b><span>Average time</span></div></div>
    <div className="tb" style={{ margin: "20px 0" }}><button className={"iconbtn" + (view === "summary" ? " on" : "")} onClick={() => setView("summary")}>Summary</button><button className={"iconbtn" + (view === "responses" ? " on" : "")} onClick={() => setView("responses")}>Responses</button><a className="iconbtn" style={{ marginLeft: "auto", textDecoration: "none", color: "inherit" }} href={`${BP}/api/forms/${form.id}/responses?format=csv`}>Download CSV</a></div>
    {view === "summary" && sum.map((s, i) => <div key={s.q.id} className="ids-card tfr__q"><div className="ids-muted" style={{ fontSize: 13 }}>{i + 1} · {s.answered} answered · {s.skipped} skipped</div><h3>{s.q.title}</h3>
      {s.counts && s.counts.map(c => <div key={c.label} className="tfr__bar"><span className="tfr__lab">{c.label}</span><span className="tfr__track"><span style={{ width: `${c.pct}%` }} /></span><span className="tfr__n">{c.n} · {c.pct}%</span></div>)}
      {s.avg !== undefined && <p><b>Average: {s.avg}</b>{s.nps && <> · <b>NPS {s.nps.score}</b> <span className="ids-muted">({s.nps.promoters} promoters, {s.nps.passives} passives, {s.nps.detractors} detractors)</span></>}</p>}
      {s.texts && <ul className="tfr__texts">{s.texts.map((t, k) => <li key={k}>{t}</li>)}{!s.texts.length && <li className="ids-muted">No answers yet</li>}</ul>}</div>)}
    {view === "responses" && <div className="ids-card" style={{ overflow: "auto" }}><table className="tfr__table"><thead><tr><th>Submitted</th>{qs.map(q => <th key={q.id}>{q.title}</th>)}</tr></thead><tbody>{[...rs].reverse().map(r => <tr key={r.id}><td>{new Date(r.submittedAt).toLocaleString()}</td>{qs.map(q => <td key={q.id}>{fmtAnswer(r.answers[q.id])}</td>)}</tr>)}</tbody></table></div>}
  </div>;
}
