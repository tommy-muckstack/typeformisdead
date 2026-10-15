import { FORM_TEMPLATES, newQuestion, type FormTemplate } from "./templates";
import type { QType } from "./types";

function questionType(title: string): QType {
  if (/\be-?mail\b/i.test(title)) return "email";
  if (/\b(date|which day|what day|when)\b/i.test(title)) return "date";
  if (/\b(how many|how much|age|quantity|budget)\b/i.test(title)) return "number";
  if (/^(do|does|did|are|is|can|will|would|have|has|should)\b/i.test(title)) return "yes_no";
  return /\b(why|describe|tell us|feedback|suggestions|comments)\b/i.test(title) ? "long_text" : "short_text";
}

/** Free deterministic starter generator, not a hosted language model. */
export function formFromPrompt(prompt: string): ReturnType<FormTemplate["build"]> {
  const text = prompt.trim();
  if (!text || text.length > 4000) throw new Error("Describe your form in 1–4,000 characters.");
  const explicit = text.split(/\n+/).map(line => line.replace(/^\s*(?:[-*]|\d+[.)])\s*/, "").trim())
    .filter(line => line.endsWith("?"));
  const template = /\b(lead|leads|contact|sales|demo|enquiry|inquiry)\b/i.test(text) ? "lead"
    : /\b(rsvp|event|party|registration)\b/i.test(text) ? "event"
    : /\b(feedback|satisfaction|nps|survey|review)\b/i.test(text) ? "feedback" : "blank";
  const form = FORM_TEMPLATES.find(item => item.id === template)!.build();
  if (explicit.length) {
    form.questions = explicit.slice(0, 100).map(title => ({ ...newQuestion(questionType(title)), title: title.slice(0, 300), required: false }));
    // Template logic and descriptions refer to a different set of questions.
    form.welcome = { enabled: false, title: "", description: "", button: "Start" };
  } else if (template === "blank") {
    form.questions = [
      { ...newQuestion("short_text"), title: "What's your name?", required: false },
      { ...newQuestion("long_text"), title: `What would you like to share about ${text.replace(/[.!?]+$/, "").slice(0, 180)}?`, required: true },
      { ...newQuestion("email"), title: "Can we follow up? Leave your email (optional).", required: false },
    ];
  }
  form.title = text.split(/[\n?]/)[0].replace(/^(?:please\s+)?(?:build|create|make)\s+(?:me\s+)?(?:a|an)\s+/i, "").trim().slice(0, 120) || "Your form";
  form.ending = { title: "Thank you!", description: "Your response has been recorded." };
  return form;
}
