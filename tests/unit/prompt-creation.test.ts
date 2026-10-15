import { describe, expect, it } from "vitest";
import { formFromPrompt } from "@/lib/forms/from-prompt";
import { pathFor } from "@/lib/forms/logic";

describe("free prompt-based form creation", () => {
  it("creates a lead form with real contact questions instead of renaming a blank form", () => {
    const form = formFromPrompt("Build a lead generation form for our design studio");
    expect(form.questions.length).toBeGreaterThan(3);
    expect(form.questions.some(question => question.type === "email" && question.required)).toBe(true);
    expect(form.title).toBe("lead generation form for our design studio");
  });
  it("retains functional feedback branching with fresh question IDs", () => {
    const form = formFromPrompt("Create a customer feedback survey");
    const path = pathFor(form, { [form.questions[0].id]: 2 });
    expect(path.map(index => form.questions[index].title)).toContain("We're sorry. What went wrong?");
    expect(new Set(form.questions.map(question => question.id)).size).toBe(form.questions.length);
  });
  it("creates an RSVP with a decline ending", () => {
    const form = formFromPrompt("An event RSVP for our meetup");
    expect(pathFor(form, { [form.questions[1].id]: false })).toEqual([0, 1]);
  });
  it("uses explicit questions in order with suitable answer types", () => {
    const form = formFromPrompt("Create a lead form:\n1. What's your name?\n2. What's your email?\n3. How many people are on your team?\n4. Which day works for you?\n5. Can we contact you?\n6. Describe your project?");
    expect(form.questions.map(question => question.type)).toEqual(["short_text", "email", "number", "date", "yes_no", "long_text"]);
    expect(form.questions[0].title).toBe("What's your name?");
    expect(form.questions.every(question => !question.jumps?.length)).toBe(true);
    expect(form.welcome.enabled).toBe(false);
  });
  it("provides editable questions for a goal outside the preset categories", () => {
    const form = formFromPrompt("Community garden ideas");
    expect(form.questions).toHaveLength(3);
    expect(form.questions[1].title).toContain("Community garden ideas");
  });
  it.each(["", "  ", "a".repeat(4001)])("rejects empty or oversized prompts", prompt => {
    expect(() => formFromPrompt(prompt)).toThrow("1–4,000 characters");
  });
});
