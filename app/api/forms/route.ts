import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@/lib/session";
import { listForms, saveForm, sanitizeForm, getResponses, getStats } from "@/lib/forms/server";
import { FORM_TEMPLATES, rid } from "@/lib/forms/templates";
export const runtime = "nodejs";
export async function GET() {
  const u = await currentUser(); if (!u) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const forms = await listForms(u.id);
  return NextResponse.json({ forms: await Promise.all(forms.map(async f => ({ ...f, responses: (await getResponses(f.id)).length, views: (await getStats(f.id)).views }))) });
}
export async function POST(req: NextRequest) {
  const u = await currentUser(); if (!u) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const body = await req.json().catch(() => ({})); const tpl = FORM_TEMPLATES.find(t => t.id === body?.template) ?? FORM_TEMPLATES[0];
  const f = sanitizeForm(tpl.build(), { id: rid("f"), ownerId: u.id, createdAt: Date.now() }); await saveForm(f);
  return NextResponse.json({ form: f }, { status: 201 });
}
