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
  return <main className="tfd"><div className="tfd__head"><h1 className="ids-h1" style={{ fontSize: "var(--ids-type-3xl)" }}>Your forms</h1><button className="ids-btn ids-btn--primary" onClick={() => setPicker(true)}>+ Create form</button></div>
    {forms === null && <p className="ids-muted">Loading…</p>}
    {forms?.length === 0 && <div className="ids-card" style={{ padding: 40, textAlign: "center" }}><h2>Make your first form</h2><p className="ids-muted">One question at a time feels like a conversation, and people finish it.</p><button className="ids-btn ids-btn--primary" onClick={() => setPicker(true)}>Create a form</button></div>}
    <div className="tfd__grid" data-testid="forms">{forms?.map(f => <div key={f.id} className="ids-card tfd__card"><Link href={`/app/forms/${f.id}`} className="tfd__link"><h3>{f.title}</h3><span className="ids-muted">{f.questions.length} questions · {f.responses} responses · {f.views} views</span></Link><div className="tb"><a className="iconbtn" style={{ textDecoration: "none", color: "inherit" }} href={`${BP}/f/${f.id}`} target="_blank" rel="noreferrer">Open</a><button className="iconbtn" onClick={() => del(f)} aria-label={`Delete ${f.title}`}>Delete</button></div></div>)}</div>
    {picker && <div className="tfd__modal" role="dialog" aria-label="Choose a template" onClick={e => { if (e.target === e.currentTarget) setPicker(false); }}><div className="ids-card tfd__sheet"><h2 style={{ marginTop: 0 }}>Start with…</h2><div className="tfd__tpls">{FORM_TEMPLATES.map(t => <button key={t.id} disabled={busy} className="tfd__tpl" onClick={() => create(t.id)}><b>{t.name}</b><span className="ids-muted">{t.blurb}</span></button>)}</div><button className="iconbtn" onClick={() => setPicker(false)}>Cancel</button></div></div>}
  </main>;
}
