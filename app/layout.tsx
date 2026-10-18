import "@/vendor/isdead-design/css/typeform.css";
import "@/vendor/isdead-design/css/components.css";
import "./globals.css";
import { WebsiteAnalytics } from "@/components/WebsiteAnalytics";
import { Analytics } from "@/lib/analytics/posthog";
import { site } from "@/site.config";
export const metadata = { title: `${site.name}: free, open-source ${site.replaces} alternative`, description: site.hero.subtitle };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en" data-ids-theme="typeform"><body className="ids-root">{children}<WebsiteAnalytics /><Analytics /></body></html>;
}
