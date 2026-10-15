import { describe, expect, it } from "vitest";
import { validateAnswer, validateSubmission } from "@/lib/forms/logic";
import type { Question } from "@/lib/forms/types";

const date: Question = { id: "date", type: "date", title: "When?", required: true };

describe("calendar date validation", () => {
  it.each(["2026-02-29", "2026-02-30", "2026-04-31", "1900-02-29", "2100-02-29", "0000-01-01", "2026-00-01", "2026-01-00", "2026-13-01", "2026-1-1", "2026-10-14T00:00:00Z"])("rejects %s without rolling it into another date", value => {
    expect(validateAnswer(date, value)).toBe("Enter a valid date");
    expect(validateSubmission({ questions: [date] }, { date: value })).toEqual({ ok: false, errors: { date: "Enter a valid date" } });
  });

  it.each(["2000-02-29", "2024-02-29", "2026-02-28", "2026-04-30", "2026-12-31", "0001-01-01", "0099-12-31", "9999-12-31"])("preserves valid date %s", value => {
    expect(validateAnswer(date, value)).toBeNull();
    expect(validateSubmission({ questions: [date] }, { date: value })).toEqual({ ok: true, clean: { date: value } });
  });

  it("allows an unanswered optional date but still rejects an invalid supplied date", () => {
    expect(validateAnswer({ ...date, required: false }, "")).toBeNull();
    expect(validateAnswer({ ...date, required: false }, "2026-02-30")).toBe("Enter a valid date");
    expect(validateAnswer(date, "")).toBe("This question is required");
  });
});
