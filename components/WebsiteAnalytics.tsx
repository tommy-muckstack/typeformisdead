"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { initializeWebsiteAnalytics, trackWebsite } from "@/lib/analytics/client";
import { CTA_LOCATIONS, type WebsiteProperties } from "@/lib/analytics/schema";

export function WebsiteAnalytics() {
  const pathname = usePathname();
  const previousPath = useRef<string | null>(null);
  useEffect(() => {
    if (previousPath.current === pathname) return;
    previousPath.current = pathname;
    trackWebsite("$pageview");
  }, [pathname]);
  useEffect(() => {
    void initializeWebsiteAnalytics();
    const clicked = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;
      const element = event.target.closest("a,button")?.closest("[data-website-cta]");
      const location = element?.getAttribute("data-website-cta");
      if (location && (CTA_LOCATIONS as readonly string[]).includes(location)) trackWebsite("website_cta_clicked", { cta_location: location as WebsiteProperties["cta_location"] });
    };
    document.addEventListener("click", clicked);
    return () => document.removeEventListener("click", clicked);
  }, []);
  return null;
}
