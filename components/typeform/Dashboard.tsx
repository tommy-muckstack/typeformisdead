"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Form } from "@/lib/forms/types";
import { FORM_TEMPLATES } from "@/lib/forms/templates";
import { BP } from "@/lib/basepath";
type Row = Form & { responses: number; views: number };
export function Dashboard() {
  const [forms, setForms] = useState<Row[] | null>(null); const [picker, setPicker] = useState(false); const router = useRouter(); const [busy, setBusy] = useState(false);
  const load = useCallback(async () => { const r = await fetch(`${BP}/api/forms`); if (r.ok) setForms((await r.json()).forms); else setForms([]); }, []);
  useEffect(() => { load(); }, [load]);
  const create = async (template: string) => { setBusy(true); const r = await fetch(`${BP}/api/forms`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ template }) }); setBusy(false); if (r.ok) router.push(`/app/forms/${(await r.json()).form.id}`); };
  const del = async (f: Row) => { if (!confirm(`Delete “${f.title}” and its ${f.responses} responses?`)) return; await fetch(`${BP}/api/forms/${f.id}`, { method: "DELETE" }); load(); };
  const [banner, setBanner] = useState(true); const [sug, setSug] = useState([true, true]);
  return <div className="tfw"><header className="tfw__hd"><span className="tfw__logo"><i /><b>T</b></span><span className="tfw__acct">thomas.m.keeley <small>⌄</small></span><span className="tfw__sp" />
      <span className="tfw__lk">⊞ Integrations</span><span className="tfw__lk">▣ Brand kit</span><span className="tfw__help">?</span><form method="post" action={`${BP}/api/session/logout`}><button className="tfw__av" title="Sign out" aria-label="Sign out">T</button></form></header>
    {banner && <div className="tfw__ban"><span>◈</span><span>You can collect <b>10 form responses</b> this month for free.</span><button>Get more responses</button><button className="x" aria-label="Dismiss" onClick={() => setBanner(false)}>✕</button></div>}
    <nav className="tfw__tabs">{["Forms", "Contacts", "Automations", "Insights", "Pages", "Research Flow"].map((t, i) => <a key={t} className={i === 0 ? "on" : ""}>{t}{t === "Pages" && <em>Beta</em>}</a>)}</nav>
    <div className="tfw__body"><aside className="tfw__side"><button className="tfw__create" onClick={() => setPicker(true)}>+ Create form</button><div className="tfw__srch">⌕ Search</div>
        <div className="tfw__ws">▦ Workspaces <i>+</i></div><div className="tfw__priv">Private <span>⌃</span></div><div className="tfw__mine"><span>My workspace</span><em>{forms?.length ?? 0}</em></div>
        <div className="tfw__rc"><span>Responses collected</span><i><u /></i><small><b>0</b> / 10</small><button>Increase response limit</button></div><div className="tfw__ai">🎙 Ask Typeform AI <span>▷</span></div></aside>
      <main className="tfw__main" data-testid="dash"><div className="tfw__mh"><h1>My workspace <span>···</span> <span className="inv">⚇ Invite</span></h1><span className="tfw__sort">▣ Date created ⌄</span><span className="tfw__vw"><b>☰ List</b><u>⊞ Grid</u></span></div>
        <div className="tfw__sug">{[["Identify product strengths and weaknesses through detailed user feedback for targeted enhancements.", "quiz"], ["Collect attendees' opinions and suggestions to enhance future event planning and execution.", "event"]].map(([t, k], i) => sug[i] && <div key={i}><span>✦</span><p>{t}</p><button onClick={() => setPicker(true)}>Create form</button><i onClick={() => setSug(x => x.map((v, j) => (j === i ? false : v)))}>✕</i></div>)}</div>
        <div className="tfw__th"><span>Responses</span><span>Completed</span><span>Updated</span><span>Integrations</span></div>
        {forms === null && <p className="ids-muted">Loading…</p>}
        {forms?.length === 0 && <div className="tfw__empty"><h2>Make your first form</h2><p>One question at a time feels like a conversation, and people finish it.</p><button className="ids-btn ids-btn--primary" onClick={() => setPicker(true)}>Create a form</button></div>}
        <div data-testid="forms">{forms?.map(f => <div key={f.id} className="tfw__row"><Link href={`/app/forms/${f.id}`} className="tfw__nm"><i style={{ background: "linear-gradient(135deg,#c2652a,#e8a24c)" }} />{f.title}</Link><span>{f.responses || "-"}</span><span>{f.responses ? "100%" : "-"}</span><span>{new Date((f as any).updatedAt ?? Date.now()).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span><span className="ig">⊞</span><span className="acts"><a href={`${BP}/f/${f.id}`} target="_blank" rel="noreferrer">View</a><button onClick={() => del(f)} aria-label={`Delete ${f.title}`}>···</button></span></div>)}</div>
      </main></div>
    {picker && <div className="tfd__modal" role="dialog" aria-label="Choose a template" onClick={e => { if (e.target === e.currentTarget) setPicker(false); }}><div className="ids-card tfd__sheet"><h2 style={{ marginTop: 0 }}>Start with…</h2><div className="tfd__tpls">{FORM_TEMPLATES.map(t => <button key={t.id} disabled={busy} className="tfd__tpl" onClick={() => create(t.id)}><b>{t.name}</b><span className="ids-muted">{t.blurb}</span></button>)}</div><button className="iconbtn" onClick={() => setPicker(false)}>Cancel</button></div></div>}
  </div>;
}
