import type { Form, FormResponse, Question } from "./types";
import { fmtAnswer, isAnswered } from "./logic";

const csvCell = (s: string) => { const guard = /^[=+\-@\t\r]/.test(s) ? "'" + s : s; return /[",\n\r]/.test(guard) ? `"${guard.replace(/"/g, '""')}"` : guard; };
/** RFC-4180 CSV with spreadsheet-formula neutralisation. */
export function toCSV(form: Pick<Form, "questions">, rs: FormResponse[]): string {
  const qs = form.questions.filter(q => q.type !== "statement");
  const rows = [["Submitted at", ...qs.map(q => q.title)], ...rs.map(r => [new Date(r.submittedAt).toISOString(), ...qs.map(q => fmtAnswer(r.answers[q.id]))])];
  return rows.map(r => r.map(csvCell).join(",")).join("\r\n") + "\r\n";
}
export type QSummary = { q: Question; answered: number; skipped: number; counts?: { label: string; n: number; pct: number }[]; avg?: number; nps?: { score: number; promoters: number; passives: number; detractors: number }; texts?: string[] };
export function summarize(form: Pick<Form, "questions">, rs: FormResponse[]): QSummary[] {
  return form.questions.filter(q => q.type !== "statement").map(q => {
    const vals = rs.map(r => r.answers[q.id]).filter(isAnswered); const s: QSummary = { q, answered: vals.length, skipped: rs.length - vals.length };
    const tally = (labels: string[], get: (v: any) => string[]) => { const m = new Map(labels.map(l => [l, 0])); for (const v of vals) for (const k of get(v)) m.set(k, (m.get(k) ?? 0) + 1); return [...m].map(([label, n]) => ({ label, n, pct: vals.length ? Math.round((n / vals.length) * 100) : 0 })); };
    if (q.type === "choice") s.counts = tally(q.choices ?? [], v => (Array.isArray(v) ? v : [v]));
    else if (q.type === "yes_no") s.counts = tally(["Yes", "No"], v => [v ? "Yes" : "No"]);
    else if (q.type === "rating") { const max = q.max ?? 5; s.counts = tally(Array.from({ length: max }, (_, i) => String(i + 1)), v => [String(v)]); s.avg = vals.length ? Math.round((vals.reduce((a: number, v) => a + Number(v), 0) / vals.length) * 100) / 100 : undefined; }
    else if (q.type === "scale") { s.counts = tally(Array.from({ length: 11 }, (_, i) => String(i)), v => [String(v)]); const n = vals.map(Number); s.avg = n.length ? Math.round((n.reduce((a, b) => a + b, 0) / n.length) * 100) / 100 : undefined;
      if (n.length) { const p = n.filter(x => x >= 9).length, d = n.filter(x => x <= 6).length; s.nps = { score: Math.round(((p - d) / n.length) * 100), promoters: p, passives: n.length - p - d, detractors: d }; } }
    else if (q.type === "number") { const n = vals.map(Number); s.avg = n.length ? Math.round((n.reduce((a, b) => a + b, 0) / n.length) * 100) / 100 : undefined; }
    else s.texts = vals.map(fmtAnswer).slice(-50).reverse();
    return s;
  });
}
export function completionRate(views: number, submissions: number) { return views > 0 ? Math.min(100, Math.round((submissions / views) * 100)) : 0; }
