import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@/lib/session";
import { listForms, saveForm, sanitizeForm, getResponses, getStats } from "@/lib/forms/server";
import { FORM_TEMPLATES, rid } from "@/lib/forms/templates";
import { formFromPrompt } from "@/lib/forms/from-prompt";
export const runtime = "nodejs";
export async function GET() {
  const u = await currentUser(); if (!u) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const forms = await listForms(u.id);
  return NextResponse.json({ forms: await Promise.all(forms.map(async f => ({ ...f, responses: (await getResponses(f.id)).length, views: (await getStats(f.id)).views }))) });
}
export async function POST(req: NextRequest) {
  const u = await currentUser(); if (!u) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const body = await req.json().catch(() => ({})); const tpl = FORM_TEMPLATES.find(t => t.id === body?.template) ?? FORM_TEMPLATES[0];
  if (body?.prompt !== undefined && (typeof body.prompt !== "string" || !body.prompt.trim() || body.prompt.length > 4000)) return NextResponse.json({ error: "Describe your form in 1–4,000 characters." }, { status: 400 });
  const built = body?.prompt ? formFromPrompt(body.prompt) : tpl.build(); if (typeof body?.title === "string" && body.title.trim()) built.title = body.title.trim().slice(0, 80);
  const f = sanitizeForm(built, { id: rid("f"), ownerId: u.id, createdAt: Date.now() }); await saveForm(f);
  return NextResponse.json({ form: f }, { status: 201 });
}
