export type QType = "short_text" | "long_text" | "email" | "number" | "choice" | "yes_no" | "rating" | "scale" | "date" | "statement";
export type Op = "always" | "is" | "is_not" | "contains" | "gt" | "lt" | "answered";
export type Jump = { op: Op; value?: string | number; goto: string }; // goto: question id or "end"
export type Question = {
  id: string; type: QType; title: string; description?: string; required: boolean;
  choices?: string[]; multiple?: boolean; other?: boolean; // choice
  max?: number; // rating (3-10) stars; scale is always 0-10
  jumps?: Jump[]; buttonText?: string; // statement
};
export type Form = {
  id: string; ownerId: string; title: string; questions: Question[];
  welcome: { enabled: boolean; title: string; description: string; button: string };
  ending: { title: string; description: string };
  createdAt: number; updatedAt: number; published: boolean;
};
export type AnswerValue = string | number | boolean | string[];
export type Answers = Record<string, AnswerValue>;
export type FormResponse = { id: string; formId: string; answers: Answers; submittedAt: number; durationMs?: number };
export type FormStats = { views: number };
