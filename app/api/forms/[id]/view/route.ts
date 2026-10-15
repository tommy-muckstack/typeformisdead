import { NextRequest, NextResponse } from "next/server";
import { getForm, bumpViews } from "@/lib/forms/server";
export const runtime = "nodejs";
export async function POST(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const f = await getForm(id); if (!f) return new NextResponse(null, { status: 404 });
  await bumpViews(id); return new NextResponse(null, { status: 204 });
}
