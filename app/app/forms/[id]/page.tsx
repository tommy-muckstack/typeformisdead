import { notFound } from "next/navigation";
import { currentUser } from "@/lib/session";
import { getForm } from "@/lib/forms/server";
import { Builder } from "@/components/typeform/Builder";
export default async function FormPage({ params }: { params: Promise<{ id: string }> }) {
  const u = (await currentUser())!; const f = await getForm((await params).id);
  if (!f || f.ownerId !== u.id) notFound();
  return <Builder initial={f} />;
}
