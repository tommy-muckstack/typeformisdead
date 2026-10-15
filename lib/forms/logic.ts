import type { Answers, AnswerValue, Form, Jump, Question } from "./types";

export const TYPE_LABELS: Record<string, string> = { short_text: "Short text", long_text: "Long text", email: "Email", number: "Number", choice: "Multiple choice", yes_no: "Yes / No", rating: "Rating", scale: "Opinion scale", date: "Date", statement: "Statement" };
export const isAnswered = (v: AnswerValue | undefined) => v !== undefined && v !== null && !(typeof v === "string" && !v.trim()) && !(Array.isArray(v) && !v.length);

/** Strict calendar dates: Date.parse alone silently rolls February 30 into March. */
function isCalendarDate(value: unknown): boolean {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  if (year < 1 || month < 1 || month > 12 || day < 1) return false;
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return day <= days[month - 1];
}

/** Validate one answer. Returns an error message or null. Unanswered optional questions are fine. */
export function validateAnswer(q: Question, v: AnswerValue | undefined): string | null {
  if (q.type === "statement") return null;
  if (!isAnswered(v)) return q.required ? "This question is required" : null;
  switch (q.type) {
    case "short_text": case "long_text": return typeof v === "string" && v.length <= (q.type === "short_text" ? 500 : 5000) ? null : "That answer is too long";
    case "email": return typeof v === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? null : "Hmm, that email doesn't look right";
    case "number": return typeof v === "number" && Number.isFinite(v) ? null : "Enter a number";
    case "yes_no": return typeof v === "boolean" ? null : "Choose yes or no";
    case "rating": return typeof v === "number" && Number.isInteger(v) && v >= 1 && v <= (q.max ?? 5) ? null : "Choose a rating";
    case "scale": return typeof v === "number" && Number.isInteger(v) && v >= 0 && v <= 10 ? null : "Choose a number from 0 to 10";
    case "date": return isCalendarDate(v) ? null : "Enter a valid date";
    case "choice": {
      const list = Array.isArray(v) ? v : typeof v === "string" ? [v] : null; if (!list) return "Choose an option";
      if (!q.multiple && list.length > 1) return "Choose only one";
      const ok = list.every(x => typeof x === "string" && ((q.choices ?? []).includes(x) || (q.other && x.length > 0 && x.length <= 200)));
      return ok ? null : "Choose one of the options";
    }
  }
}

function matches(j: Jump, v: AnswerValue | undefined): boolean {
  if (j.op === "always") return true;
  if (j.op === "answered") return isAnswered(v);
  if (!isAnswered(v)) return false;
  const items = Array.isArray(v) ? v.map(String) : [String(v)];
  const want = String(j.value ?? "");
  switch (j.op) {
    case "is": return items.some(x => x.toLowerCase() === want.toLowerCase());
    case "is_not": return items.every(x => x.toLowerCase() !== want.toLowerCase());
    case "contains": return items.some(x => x.toLowerCase().includes(want.toLowerCase()));
    case "gt": return typeof v === "number" && v > Number(j.value);
    case "lt": return typeof v === "number" && v < Number(j.value);
  }
}
/** Index of the next question after `i` given the answers so far, or -1 for the ending. First matching jump wins. */
export function nextIndex(form: Pick<Form, "questions">, answers: Answers, i: number): number {
  const q = form.questions[i];
  for (const j of q?.jumps ?? []) if (matches(j, answers[q.id])) {
    if (j.goto === "end") return -1;
    const t = form.questions.findIndex(x => x.id === j.goto); if (t > i) return t; // jumps only go forward: no loops
  }
  return i + 1 < form.questions.length ? i + 1 : -1;
}
/** The path of question indexes a respondent with these answers walks through. */
export function pathFor(form: Pick<Form, "questions">, answers: Answers): number[] {
  const out: number[] = []; let i = form.questions.length ? 0 : -1;
  while (i >= 0 && out.length <= form.questions.length) { out.push(i); i = nextIndex(form, answers, i); }
  return out;
}
/** Validate a whole submission against the questions the respondent's path actually reached. Unknown keys are rejected. */
export function validateSubmission(form: Pick<Form, "questions">, answers: Answers): { ok: true; clean: Answers } | { ok: false; errors: Record<string, string> } {
  const errors: Record<string, string> = {}; const clean: Answers = {};
  const known = new Set(form.questions.map(q => q.id));
  for (const k of Object.keys(answers)) if (!known.has(k)) errors[k] = "Unknown question";
  for (const i of pathFor(form, answers)) { const q = form.questions[i]; const e = validateAnswer(q, answers[q.id]); if (e) errors[q.id] = e; else if (isAnswered(answers[q.id]) && q.type !== "statement") clean[q.id] = answers[q.id]; }
  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, clean };
}
export const fmtAnswer = (v: AnswerValue | undefined) => v === undefined ? "" : typeof v === "boolean" ? (v ? "Yes" : "No") : Array.isArray(v) ? v.join("; ") : String(v);
