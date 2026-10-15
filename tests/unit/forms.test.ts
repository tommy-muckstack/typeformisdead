import { describe, it, expect, beforeAll } from "vitest";
import os from "node:os"; import path from "node:path"; import fs from "node:fs";
import { validateAnswer, nextIndex, pathFor, validateSubmission, fmtAnswer } from "@/lib/forms/logic";
import { toCSV, summarize, completionRate } from "@/lib/forms/results";
import { FORM_TEMPLATES, newQuestion } from "@/lib/forms/templates";
import { sanitizeForm } from "@/lib/forms/server";
import type { Form, Question } from "@/lib/forms/types";
const Q = (o: Partial<Question>): Question => ({ ...newQuestion("short_text"), ...o });
describe("validation", () => {
  it("requires required questions", () => { expect(validateAnswer(Q({ required: true }), "")).toMatch(/required/); expect(validateAnswer(Q({}), "")).toBeNull(); });
  it("checks emails, numbers, dates", () => { const e = Q({ type: "email" }); expect(validateAnswer(e, "a@b.co")).toBeNull(); expect(validateAnswer(e, "nope")).toBeTruthy(); expect(validateAnswer(Q({ type: "number" }), "5" as any)).toBeTruthy(); expect(validateAnswer(Q({ type: "number" }), 5)).toBeNull(); expect(validateAnswer(Q({ type: "date" }), "2026-13-45")).toBeTruthy(); expect(validateAnswer(Q({ type: "date" }), "2026-10-14")).toBeNull(); });
  it("checks choices incl. other and multiple", () => { const c = Q({ type: "choice", choices: ["A", "B"] }); expect(validateAnswer(c, "A")).toBeNull(); expect(validateAnswer(c, "Z")).toBeTruthy(); expect(validateAnswer(c, ["A", "B"])).toBeTruthy(); expect(validateAnswer({ ...c, multiple: true }, ["A", "B"])).toBeNull(); expect(validateAnswer({ ...c, other: true }, "Z")).toBeNull(); });
  it("checks ranges", () => { expect(validateAnswer(Q({ type: "rating", max: 5 }), 6)).toBeTruthy(); expect(validateAnswer(Q({ type: "rating", max: 5 }), 5)).toBeNull(); expect(validateAnswer(Q({ type: "scale" }), 0)).toBeNull(); expect(validateAnswer(Q({ type: "scale" }), 11)).toBeTruthy(); expect(validateAnswer(Q({ type: "yes_no" }), false)).toBeNull(); });
});
describe("logic jumps", () => {
  const fb = FORM_TEMPLATES.find(t => t.id === "feedback")!.build(); const [nps, , sorry] = fb.questions;
  it("detractors see the apology branch", () => { expect(nextIndex(fb, { [nps.id]: 3 }, 0)).toBe(2); expect(pathFor(fb, { [nps.id]: 3, [sorry.id]: "slow" })).toEqual([0, 2, 3]); });
  it("promoters skip it", () => { expect(pathFor(fb, { [nps.id]: 10 })).toEqual([0, 1, 3]); });
  it("jumps never go backwards", () => { const f = { questions: [Q({ id: "a", jumps: [{ op: "answered", goto: "a" }] }), Q({ id: "b" })] }; expect(nextIndex(f, { a: "x" }, 0)).toBe(1); });
  it("'end' finishes the form", () => { const f = { questions: [Q({ id: "a", type: "yes_no", jumps: [{ op: "is", value: "false", goto: "end" }] }), Q({ id: "b" })] }; expect(nextIndex(f, { a: false }, 0)).toBe(-1); expect(nextIndex(f, { a: true }, 0)).toBe(1); });
  it("validates only the path walked and rejects unknown keys", () => {
    const f = { questions: [Q({ id: "a", type: "yes_no", required: true, jumps: [{ op: "is", value: "false", goto: "end" }] }), Q({ id: "b", required: true })] };
    expect(validateSubmission(f, { a: false }).ok).toBe(true); expect(validateSubmission(f, { a: true }).ok).toBe(false);
    expect(validateSubmission(f, { a: false, zzz: "x" }).ok).toBe(false);
    const ok = validateSubmission(f, { a: true, b: "hi" }); expect(ok.ok && ok.clean).toEqual({ a: true, b: "hi" });
  });
});
describe("results", () => {
  const form = { questions: [Q({ id: "n", type: "scale", title: "NPS" }), Q({ id: "c", type: "choice", choices: ["Red", "Blue"], title: "Color, \"fav\"" }), Q({ id: "t", title: "Why" })] };
  const rs = [{ n: 10, c: "Red", t: "=cmd|' /C calc'!A0" }, { n: 9, c: "Red" }, { n: 3, c: "Blue", t: "meh" }, { n: 8 }].map((answers, i) => ({ id: "r" + i, formId: "f", answers: answers as any, submittedAt: 1760000000000 + i }));
  it("summarises choices and NPS", () => { const s = summarize(form, rs); expect(s[1].counts).toEqual([{ label: "Red", n: 2, pct: 67 }, { label: "Blue", n: 1, pct: 33 }]); expect(s[0].nps).toEqual({ score: 25, promoters: 2, passives: 1, detractors: 1 }); expect(s[0].avg).toBe(7.5); expect(s[2].skipped).toBe(2); });
  it("exports CSV with quoting and formula guard", () => { const csv = toCSV(form, rs); expect(csv.split("\r\n")[0]).toBe('Submitted at,NPS,"Color, ""fav""",Why'); expect(csv).toContain("'=cmd|"); expect(csv.endsWith("\r\n")).toBe(true); });
  it("completion rate", () => { expect(completionRate(10, 4)).toBe(40); expect(completionRate(0, 0)).toBe(0); });
  it("formats answers", () => { expect(fmtAnswer(true)).toBe("Yes"); expect(fmtAnswer(["a", "b"])).toBe("a; b"); });
});
describe("sanitize + store", () => {
  it("clamps client input and drops dangling jumps", () => {
    const f = sanitizeForm({ title: "x".repeat(500), questions: [{ id: "a b", type: "bogus", title: "", jumps: [{ op: "is", value: 1, goto: "ghost" }, { op: "answered", goto: "end" }] }, { id: "good_1", type: "choice", choices: [] }] }, { id: "f1", ownerId: "u", createdAt: 1 });
    expect(f.title.length).toBe(120); expect(f.questions[0].type).toBe("short_text"); expect(f.questions[0].id).not.toBe("a b"); expect(f.questions[0].jumps).toEqual([{ op: "answered", value: "", goto: "end" }]); expect(f.questions[1].choices).toEqual(["Option A"]);
  });
  beforeAll(() => { process.env.ISDEAD_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), "tf-")); });
  it("round-trips forms, responses and views", async () => {
    const s = await import("@/lib/forms/server"); const f: Form = sanitizeForm(FORM_TEMPLATES[1].build(), { id: "fx", ownerId: "me", createdAt: 1 }); await s.saveForm(f);
    expect((await s.getForm("fx"))?.title).toBe("Customer feedback"); expect((await s.listForms("me")).map(x => x.id)).toContain("fx"); expect(await s.listForms("other")).toEqual([]);
    await s.addResponse({ id: "r1", formId: "fx", answers: { a: 1 }, submittedAt: 1 }); expect(await s.getResponses("fx")).toHaveLength(1); await s.bumpViews("fx"); await s.bumpViews("fx"); expect((await s.getStats("fx")).views).toBe(2);
    expect(s.publicForm(f)).not.toHaveProperty("ownerId");
  });
});
