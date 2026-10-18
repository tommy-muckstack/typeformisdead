import { Dashboard } from "@/components/typeform/Dashboard";
import { currentUser } from "@/lib/session";
export default async function AppHome() {
  const user = await currentUser();
  return <Dashboard displayName={user?.name || "My account"} uid={user?.id} accountType={user ? (user.guest ? "guest" : user.demo ? "demo" : "firebase") : undefined} />;
}
