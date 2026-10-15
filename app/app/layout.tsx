import { redirect } from "next/navigation";
import { currentUser, entryRedirect } from "@/lib/session";
export const dynamic = "force-dynamic";
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  if (!user) redirect(entryRedirect("/app"));
  return <div className="app-root">{children}</div>;
}
