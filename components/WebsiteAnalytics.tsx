"use client";
// Marketing CTA clicks: any link/button inside an element marked data-website-cta="<target>" sends landing_cta_clicked.
// Page views come from <Analytics /> (lib/analytics).
import { useEffect } from "react";
import { track, EVENTS } from "@/lib/analytics";
import { CTA_TARGETS } from "@/lib/analytics/taxonomy";

export function WebsiteAnalytics() {
  useEffect(() => {
    const clicked = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;
      const element = event.target.closest("a,button")?.closest("[data-website-cta]");
      const location = element?.getAttribute("data-website-cta");
      if (location && (CTA_TARGETS as readonly string[]).includes(location)) track(EVENTS.landing_cta_clicked, { target: location });
    };
    document.addEventListener("click", clicked);
    return () => document.removeEventListener("click", clicked);
  }, []);
  return null;
}
