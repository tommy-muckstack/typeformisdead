import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@/lib/session";
import { getForm, addResponse, getResponses } from "@/lib/forms/server";
import { validateSubmission } from "@/lib/forms/logic";
import { toCSV } from "@/lib/forms/results";
import { rid } from "@/lib/forms/templates";
export const runtime = "nodejs";
type Ctx = { params: Promise<{ id: string }> };
// Public: submit answers. Validated against the form on the server (required, types, only the path actually walked).
export async function POST(req: NextRequest, { params }: Ctx) {
  const { id } = await params; const f = await getForm(id); if (!f || !f.published) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const raw = await req.text(); if (raw.length > 100_000) return NextResponse.json({ error: "Too large" }, { status: 413 });
  let body: any; try { body = JSON.parse(raw); } catch { return NextResponse.json({ error: "Bad JSON" }, { status: 400 }); }
  if (!body || typeof body.answers !== "object" || body.answers === null || Array.isArray(body.answers)) return NextResponse.json({ error: "answers required" }, { status: 400 });
  const v = validateSubmission(f, body.answers); if (!v.ok) return NextResponse.json({ error: "Invalid answers", errors: v.errors }, { status: 422 });
  try { await addResponse({ id: rid("r"), formId: id, answers: v.clean, submittedAt: Date.now(), durationMs: typeof body.durationMs === "number" ? Math.max(0, Math.min(3.6e6, body.durationMs)) : undefined }); } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 429 }); }
  return new NextResponse(null, { status: 201 });
}
// Owner only: JSON, or CSV with ?format=csv
export async function GET(req: NextRequest, { params }: Ctx) {
  const { id } = await params; const u = await currentUser(); const f = await getForm(id);
  if (!f || !u || f.ownerId !== u.id) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const rs = await getResponses(id);
  if (new URL(req.url).searchParams.get("format") === "csv") return new NextResponse(toCSV(f, rs), { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": `attachment; filename="${f.title.replace(/[^\w-]+/g, "-")}-responses.csv"` } });
  return NextResponse.json({ responses: rs });
}
