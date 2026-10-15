"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Answers, AnswerValue, Form, Question } from "@/lib/forms/types";
import { isAnswered, nextIndex, pathFor, validateAnswer } from "@/lib/forms/logic";
const L = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
type Step = "welcome" | "end" | number;
export type PlayerProps = { form: Omit<Form, "ownerId"> & { ownerId?: string }; preview?: boolean; focusId?: string; onSubmit?: (a: Answers, ms: number) => Promise<string | null> };
export function Player({ form, preview, focusId, onSubmit }: PlayerProps) {
  const startIdx = focusId ? Math.max(0, form.questions.findIndex(q => q.id === focusId)) : -1;
  const [step, setStep] = useState<Step>(startIdx >= 0 ? startIdx : form.welcome.enabled ? "welcome" : 0);
  const [answers, setAnswers] = useState<Answers>({}); const [err, setErr] = useState(""); const [hist, setHist] = useState<number[]>([]); const [busy, setBusy] = useState(false);
  const t0 = useRef(Date.now()); const q = typeof step === "number" ? form.questions[step] : null;
  const total = useMemo(() => Math.max(1, pathFor(form, answers).length), [form, answers]); const pos = typeof step === "number" ? hist.length : step === "end" ? total : 0;
  const set = (v: AnswerValue | undefined) => { if (!q) return; setErr(""); setAnswers(a => { const n = { ...a }; if (v === undefined || (typeof v === "string" && v === "")) delete n[q.id]; else n[q.id] = v; return n; }); };
  const submit = async (final: Answers) => {
    if (preview || !onSubmit) { setStep("end"); return; }
    setBusy(true); const e = await onSubmit(final, Date.now() - t0.current); setBusy(false); if (e) setErr(e); else setStep("end");
  };
  const advance = async (override?: Answers) => {
    if (!q || typeof step !== "number" || busy) return; const a = override ?? answers; const e = validateAnswer(q, a[q.id]); if (e) { setErr(e); return; }
    const n = nextIndex(form, a, step); if (n < 0) await submit(a); else { setHist(h => [...h, step]); setStep(n); setErr(""); }
  };
  const back = () => { setErr(""); if (hist.length) { setStep(hist[hist.length - 1]); setHist(h => h.slice(0, -1)); } else if (form.welcome.enabled && typeof step === "number") setStep("welcome"); };
  const pick = (v: AnswerValue, auto: boolean) => { set(v); if (auto) setTimeout(() => advance({ ...answers, [q!.id]: v }), 260); };
  const toggleChoice = (qq: Question, c: string) => { if (qq.multiple) { const cur = Array.isArray(answers[qq.id]) ? (answers[qq.id] as string[]) : []; set(cur.includes(c) ? cur.filter(x => x !== c) : [...cur, c]); } else pick(c, true); };
  useEffect(() => { // keyboard: Enter = OK, letter keys pick choices
    const k = (ev: KeyboardEvent) => {
      const t = ev.target as HTMLElement; const typing = /INPUT|TEXTAREA|SELECT/.test(t.tagName);
      if (step === "welcome" && ev.key === "Enter") { setStep(0); return; }
      if (!q) return;
      if (ev.key === "Enter" && !(q.type === "long_text" && ev.shiftKey) && !(t.tagName === "BUTTON" && q.type !== "statement")) { ev.preventDefault(); advance(); return; }
      if (!typing && q.type === "choice" && q.choices && ev.key.length === 1) { const i = L.indexOf(ev.key.toUpperCase()); if (i >= 0 && i < q.choices.length) { ev.preventDefault(); toggleChoice(q, q.choices[i]); } }
      if (!typing && q.type === "yes_no" && /^[yn]$/i.test(ev.key)) pick(ev.key.toLowerCase() === "y", true);
    };
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  });
  const val = q ? answers[q.id] : undefined;
  return <div className="tfp" data-testid="player">
    <div className="tfp__bar"><span style={{ width: `${Math.round((pos / total) * 100)}%` }} /></div>
    <div className="tfp__stage" key={String(step)}>
      {step === "welcome" && <div className="tfp__q"><h1 className="tfp__title">{form.welcome.title || form.title}</h1>{form.welcome.description && <p className="tfp__desc">{form.welcome.description}</p>}<div className="tfp__actions"><button className="ids-btn ids-btn--primary" onClick={() => setStep(0)}>{form.welcome.button || "Start"}</button><span className="tfp__hint">press <b>Enter ↵</b></span></div></div>}
      {q && <div className="tfp__q">
        <div className="tfp__n">{typeof step === "number" ? step + 1 : ""}<span className="tfp__arr"> →</span></div>
        <h1 className="tfp__title">{q.title}{q.required && <span aria-label="required" title="required"> *</span>}</h1>{q.description && <p className="tfp__desc">{q.description}</p>}
        <div className="tfp__a">
          {(q.type === "short_text" || q.type === "email" || q.type === "number" || q.type === "date") && <input autoFocus aria-label={q.title} className="tfp__input" type={q.type === "short_text" ? "text" : q.type} inputMode={q.type === "number" ? "decimal" : undefined} placeholder={q.type === "email" ? "name@example.com" : q.type === "date" ? "" : "Type your answer here…"} value={val === undefined ? "" : String(val)} onChange={e => set(q.type === "number" ? (e.target.value === "" ? undefined : Number(e.target.value)) : e.target.value)} />}
          {q.type === "long_text" && <textarea autoFocus aria-label={q.title} className="tfp__input" rows={3} placeholder="Type your answer here…" value={(val as string) ?? ""} onChange={e => set(e.target.value)} />}
          {q.type === "choice" && <div className="tfp__choices" role={q.multiple ? "group" : "radiogroup"}>{(q.choices ?? []).map((c, i) => { const on = Array.isArray(val) ? val.includes(c) : val === c; return <button key={c} role={q.multiple ? "checkbox" : "radio"} aria-checked={on} className={"tfp__choice" + (on ? " on" : "")} onClick={() => toggleChoice(q, c)}><kbd>{L[i]}</kbd>{c}{on && <span className="tfp__tick">✓</span>}</button>; })}
            {q.other && <input aria-label="Other" className="tfp__other" placeholder="Other…" onChange={e => { const o = e.target.value; const cur = (Array.isArray(val) ? val : val ? [val as string] : []).filter(x => (q.choices ?? []).includes(x)); set(o ? (q.multiple ? [...cur, o] : [o]) : cur.length ? cur : undefined); }} />}</div>}
          {q.type === "yes_no" && <div className="tfp__choices tfp__choices--row">{[true, false].map(b => <button key={String(b)} role="radio" aria-checked={val === b} className={"tfp__choice" + (val === b ? " on" : "")} onClick={() => pick(b, true)}><kbd>{b ? "Y" : "N"}</kbd>{b ? "Yes" : "No"}</button>)}</div>}
          {q.type === "rating" && <div className="tfp__stars" role="radiogroup" aria-label="Rating">{Array.from({ length: q.max ?? 5 }, (_, i) => i + 1).map(n => <button key={n} role="radio" aria-checked={val === n} aria-label={`${n} star${n > 1 ? "s" : ""}`} className={"tfp__star" + (typeof val === "number" && n <= val ? " on" : "")} onClick={() => pick(n, true)}>★</button>)}</div>}
          {q.type === "scale" && <div><div className="tfp__scale" role="radiogroup" aria-label="Scale 0 to 10">{Array.from({ length: 11 }, (_, i) => i).map(n => <button key={n} role="radio" aria-checked={val === n} className={"tfp__sc" + (val === n ? " on" : "")} onClick={() => pick(n, true)}>{n}</button>)}</div><div className="tfp__ends"><span>Not at all likely</span><span>Extremely likely</span></div></div>}
        </div>
        {err && <p role="alert" className="tfp__err">⚠ {err}</p>}
        <div className="tfp__actions">{q.type === "statement" ? <button className="ids-btn ids-btn--primary" onClick={() => advance()}>{q.buttonText || "Continue"}</button> : <button className="ids-btn ids-btn--primary" disabled={busy} onClick={() => advance()}>{nextIndex(form, answers, step as number) < 0 ? (busy ? "Sending…" : "Submit") : "OK ✓"}</button>}
          {q.type !== "statement" && <span className="tfp__hint">press <b>Enter ↵</b>{q.type === "long_text" && " · Shift+Enter for a new line"}</span>}{!q.required && isAnswered(val) === false && q.type !== "statement" && <button className="tfp__skip" onClick={() => advance()}>Skip</button>}</div></div>}
      {step === "end" && <div className="tfp__q" data-testid="ending"><h1 className="tfp__title">{form.ending.title}</h1>{form.ending.description && <p className="tfp__desc">{form.ending.description}</p>}{preview && <div className="tfp__actions"><button className="ids-btn ids-btn--outline" onClick={() => { setAnswers({}); setHist([]); setStep(form.welcome.enabled ? "welcome" : 0); }}>Restart preview</button></div>}</div>}
    </div>
    <div className="tfp__nav"><button aria-label="Previous question" onClick={back} disabled={step === "welcome" || (!hist.length && !form.welcome.enabled) || step === "end"}>↑</button><button aria-label="Next question" onClick={() => advance()} disabled={!q}>↓</button></div>
  </div>;
}
