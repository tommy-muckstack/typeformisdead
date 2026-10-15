import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@/lib/session";
import { getForm, saveForm, sanitizeForm, publicForm } from "@/lib/forms/server";
import { delDoc } from "@/lib/store";
export const runtime = "nodejs";
type Ctx = { params: Promise<{ id: string }> };
// Public: a published form's definition (no owner id). The owner also gets drafts.
export async function GET(_: NextRequest, { params }: Ctx) {
  const { id } = await params; const f = await getForm(id); if (!f) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const u = await currentUser(); const owner = u?.id === f.ownerId;
  if (!f.published && !owner) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ form: owner ? f : publicForm(f), owner });
}
export async function PUT(req: NextRequest, { params }: Ctx) {
  const { id } = await params; const u = await currentUser(); const f = await getForm(id);
  if (!f || !u || f.ownerId !== u.id) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const raw = await req.text(); if (raw.length > 200_000) return NextResponse.json({ error: "Form too large" }, { status: 413 });
  const next = sanitizeForm(JSON.parse(raw || "{}"), f); await saveForm(next); return NextResponse.json({ form: next });
}
export async function DELETE(_: NextRequest, { params }: Ctx) {
  const { id } = await params; const u = await currentUser(); const f = await getForm(id);
  if (!f || !u || f.ownerId !== u.id) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await delDoc("forms", id); await delDoc("responses", id); await delDoc("stats", id); return new NextResponse(null, { status: 204 });
}
