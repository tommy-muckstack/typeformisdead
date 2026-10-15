import { notFound } from "next/navigation";
import { getForm, publicForm } from "@/lib/forms/server";
import { FillForm } from "@/components/typeform/FillForm";
export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) { const f = await getForm((await params).id); return { title: f?.title ?? "Form" }; }
export default async function Public({ params }: { params: Promise<{ id: string }> }) {
  const f = await getForm((await params).id); if (!f || !f.published) notFound();
  return <FillForm form={publicForm(f)} />;
}
