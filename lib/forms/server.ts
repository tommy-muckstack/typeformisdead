import { getDoc, putDoc, listDocs } from "@/lib/store";
import type { Form, FormResponse, FormStats, Question } from "./types";
import { rid } from "./templates";
const QTYPES = new Set(["short_text", "long_text", "email", "number", "choice", "yes_no", "rating", "scale", "date", "statement"]);
const OPS = new Set(["always", "is", "is_not", "contains", "gt", "lt", "answered"]);
const str = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : "");
/** Clamp and sanitise client-supplied form JSON. Never trusts ids/owner/timestamps from the client. */
export function sanitizeForm(input: any, base: Pick<Form, "id" | "ownerId" | "createdAt">): Form {
  const qs: Question[] = (Array.isArray(input?.questions) ? input.questions : []).slice(0, 100).map((q: any): Question => {
    const type = QTYPES.has(q?.type) ? q.type : "short_text";
    const o: Question = { id: /^[A-Za-z0-9_-]{3,40}$/.test(q?.id ?? "") ? q.id : rid(), type, title: str(q?.title, 300) || "Untitled question", required: type === "statement" ? false : !!q?.required };
    if (q?.description) o.description = str(q.description, 600);
    if (type === "choice") { o.choices = (Array.isArray(q?.choices) ? q.choices : []).map((c: unknown) => str(c, 120)).filter(Boolean).slice(0, 30); if (!o.choices!.length) o.choices = ["Option A"]; o.multiple = !!q?.multiple; o.other = !!q?.other; }
    if (type === "rating") o.max = Math.min(10, Math.max(3, Math.round(Number(q?.max) || 5)));
    if (type === "statement") o.buttonText = str(q?.buttonText, 40) || "Continue";
    if (Array.isArray(q?.jumps)) o.jumps = q.jumps.slice(0, 10).filter((j: any) => OPS.has(j?.op) && typeof j?.goto === "string").map((j: any) => ({ op: j.op, value: typeof j.value === "number" ? j.value : str(j.value, 120), goto: str(j.goto, 40) }));
    return o;
  });
  const ids = new Set(qs.map(q => q.id)); for (const q of qs) if (q.jumps) q.jumps = q.jumps.filter(j => j.goto === "end" || ids.has(j.goto));
  return { ...base, title: str(input?.title, 120) || "Untitled form", questions: qs.length ? qs : [{ id: rid(), type: "short_text", title: "Your question here", required: false }],
    welcome: { enabled: !!input?.welcome?.enabled, title: str(input?.welcome?.title, 160), description: str(input?.welcome?.description, 400), button: str(input?.welcome?.button, 40) || "Start" },
    ending: { title: str(input?.ending?.title, 160) || "Thanks!", description: str(input?.ending?.description, 400) }, createdAt: base.createdAt, updatedAt: Date.now(), published: input?.published !== false };
}
export const getForm = (id: string) => getDoc<Form>("forms", id);
export const saveForm = (f: Form) => putDoc("forms", f.id, f);
export async function listForms(ownerId: string) { return (await listDocs<Form>("forms")).filter(f => f.ownerId === ownerId).sort((a, b) => b.updatedAt - a.updatedAt); }
export const getResponses = async (formId: string) => (await getDoc<FormResponse[]>("responses", formId)) ?? [];
export async function addResponse(r: FormResponse) { const all = await getResponses(r.formId); if (all.length >= 5000) throw new Error("Response limit reached"); all.push(r); await putDoc("responses", r.formId, all); }
export const getStats = async (formId: string) => (await getDoc<FormStats>("stats", formId)) ?? { views: 0 };
export async function bumpViews(formId: string) { const s = await getStats(formId); s.views++; await putDoc("stats", formId, s); }
export const publicForm = ({ ownerId: _o, ...rest }: Form) => rest;
