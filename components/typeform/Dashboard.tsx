"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Form } from "@/lib/forms/types";
import { FORM_TEMPLATES } from "@/lib/forms/templates";
import { BP } from "@/lib/basepath";
import { NewFormPage } from "./Chrome";
import { MaterialIcon as Icon, type MaterialIconName } from "./MaterialIcon";
import "./dashboard.css";

type Row = Form & { responses: number; views: number };
const tabs: [string, MaterialIconName][] = [["Forms", "dynamic_form"], ["Contacts", "group"], ["Automations", "account_tree"], ["Insights", "query_stats"], ["Pages", "web"], ["Research Flow", "travel_explore"]];
const suggestions = ["Identify product strengths and weaknesses through detailed user feedback for targeted enhancements.", "Collect attendees' opinions and suggestions to enhance future event planning and execution."];

export function Dashboard({ displayName = "My account" }: { displayName?: string }) {
  const [forms, setForms] = useState<Row[] | null>(null);
  const [picker, setPicker] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sug, setSug] = useState([true, true]);
  const router = useRouter();
  const load = useCallback(async () => { const r = await fetch(`${BP}/api/forms`); if (r.ok) setForms((await r.json()).forms); else setForms([]); }, []);
  useEffect(() => { load(); }, [load]);
  const create = async (template: string, title?: string, prompt?: string) => { setBusy(true); const r = await fetch(`${BP}/api/forms`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ template, ...(prompt ? { prompt } : {}), ...(title ? { title: title.slice(0, 80) } : {}) }) }); setBusy(false); if (r.ok) router.push(`/app/forms/${(await r.json()).form.id}`); };
  const del = async (f: Row) => { if (!confirm(`Delete “${f.title}” and its ${f.responses} responses?`)) return; await fetch(`${BP}/api/forms/${f.id}`, { method: "DELETE" }); load(); };
  const initial = displayName.trim().charAt(0).toUpperCase() || "T";
  return <div className="tfw">
    <header className="tfw__hd">
      <span className="tfw__logo" aria-label="TypeformIsDead"><i /><b>{initial}</b></span>
      <span className="tfw__acct">{displayName}<Icon name="keyboard_arrow_down" size={16} /></span><span className="tfw__sp" />
      <span className="tfw__lk"><Icon name="apps" />Integrations</span><span className="tfw__lk"><Icon name="palette" />Brand kit</span><span className="tfw__help" aria-label="Help"><Icon name="help" size={20} /></span>
      <form method="post" action={`${BP}/api/session/logout`}><button className="tfw__av" title="Sign out" aria-label="Sign out">{initial}</button></form>
    </header>
    <nav className="tfw__tabs" aria-label="Workspace navigation">{tabs.map(([label, icon], index) => <span key={label} className={index === 0 ? "on" : ""} aria-current={index === 0 ? "page" : undefined}><Icon name={icon} />{label}{label === "Pages" && <em>Beta</em>}</span>)}</nav>
    <div className="tfw__body">
      <aside className="tfw__side">
        <button className="tfw__create" onClick={() => setPicker(true)}><Icon name="add" />Create form</button>
        <div className="tfw__srch"><Icon name="search" />Search</div>
        <div className="tfw__ws"><span><Icon name="workspaces" />Workspaces</span><i><Icon name="add" size={16} /></i></div>
        <div className="tfw__priv">Private<Icon name="keyboard_arrow_up" size={16} /></div>
        <div className="tfw__mine"><span>My workspace</span><em>{forms?.length ?? 0}</em></div>
        <div className="tfw__rc"><span>Responses collected</span><strong>{forms === null ? "—" : forms.reduce((total, form) => total + form.responses, 0).toLocaleString()}</strong></div>
        <button className="tfw__ai" onClick={() => setPicker(true)}><Icon name="mic" />Create from a prompt<Icon name="play_arrow" /></button>
      </aside>
      <main className="tfw__main" data-testid="dash">
        <div className="tfw__mh"><h1>My workspace</h1><span className="tfw__more"><Icon name="more_horiz" /></span><span className="tfw__invite"><Icon name="person_add" />Invite</span><span className="tfw__sp" />
          <span className="tfw__sort"><Icon name="calendar_today" size={16} />Date created<Icon name="keyboard_arrow_down" size={16} /></span>
          <span className="tfw__vw"><b><Icon name="view_list" size={16} />List</b><span><Icon name="grid_view" size={16} />Grid</span></span>
        </div>
        <div className="tfw__sug">{suggestions.map((text, index) => sug[index] && <div key={text}><span className="tfw__spark"><Icon name="auto_awesome" size={18} /></span><p>{text}</p><button onClick={() => setPicker(true)}>Create form</button><button className="tfw__dismiss" aria-label={`Dismiss suggestion ${index + 1}`} onClick={() => setSug(current => current.map((shown, at) => at === index ? false : shown))}><Icon name="close" size={16} /></button></div>)}</div>
        <div className="tfw__th"><span aria-hidden="true" /><span>Responses</span><span>Completed</span><span>Updated</span><span>Integrations</span><span aria-hidden="true" /></div>
        {forms === null && <p className="ids-muted">Loading…</p>}
        {forms?.length === 0 && <div className="tfw__empty"><h2>Make your first form</h2><p>One question at a time feels like a conversation, and people finish it.</p><button className="ids-btn ids-btn--primary" onClick={() => setPicker(true)}>Create a form</button></div>}
        <div data-testid="forms">{forms?.map(form => <div key={form.id} className="tfw__row"><Link href={`/app/forms/${form.id}`} className="tfw__nm"><i />{form.title}</Link><span>{form.responses || "—"}</span><span>{form.responses ? "100%" : "—"}</span><span>{new Date(form.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span><span className="ig"><Icon name="apps" /></span><span className="acts"><a href={`${BP}/f/${form.id}`} target="_blank" rel="noreferrer" aria-label={`View ${form.title}`} title="View form"><Icon name="open_in_new" size={16} /></a><button onClick={() => del(form)} aria-label={`Delete ${form.title}`}><Icon name="more_horiz" /></button></span></div>)}</div>
      </main>
    </div>
    {picker && <div className="tfc-newov" role="dialog" aria-label="New form" data-testid="new-form"><div className="tfc-newtop"><button className="crumb" onClick={() => setPicker(false)}><Icon name="dynamic_form" />Forms</button><span className="sp">›</span><b>New form</b><span className="grow" /><span className="tfb__help"><Icon name="help" /></span><span className="tfb__av">{initial}</span></div>
      <NewFormPage busy={busy} templates={FORM_TEMPLATES} onScratch={() => create("blank")} onTemplate={id => create(id)} onAi={goal => create("blank", undefined, goal)} /></div>}
  </div>;
}
