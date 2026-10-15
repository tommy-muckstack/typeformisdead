"use client";
import { useEffect } from "react";
import { Player } from "./Player";
import type { Answers, Form } from "@/lib/forms/types";
import { trackWebsite } from "@/lib/analytics/client";
import { BP } from "@/lib/basepath";
export function FillForm({ form }: { form: Omit<Form, "ownerId"> }) {
  useEffect(() => { fetch(`${BP}/api/forms/${form.id}/view`, { method: "POST" }).catch(() => {}); }, [form.id]);
  const onSubmit = async (answers: Answers, durationMs: number) => {
    try { const r = await fetch(`${BP}/api/forms/${form.id}/responses`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ answers, durationMs }) });
      if (r.ok) { trackWebsite("website_response_submitted"); return null; } const j = await r.json().catch(() => ({})); return j?.errors ? Object.values(j.errors)[0] as string : j?.error ?? "Something went wrong. Try again."; } catch { return "No connection. Try again."; }
  };
  return <div className="tf-fill"><Player form={form} onSubmit={onSubmit} /><a className="tf-fill__brand" href={BP + "/"} target="_blank" rel="noreferrer">Made with TypeformIsDead</a></div>;
}
