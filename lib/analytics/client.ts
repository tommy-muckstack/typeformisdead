"use client";
import type { PostHog } from "posthog-js";
import { sanitizeAnalyticsEvent, safeEventProperties, websitePage, type WebsiteEvent, type WebsiteProperties } from "./schema";

let client: Promise<PostHog | null> | undefined;
let active: PostHog | null = null;
export function analyticsEnabled() {
  return typeof window !== "undefined" && process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === "true" && !!process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
}
export function initializeWebsiteAnalytics(): Promise<PostHog | null> {
  if (!analyticsEnabled()) return Promise.resolve(null);
  if (!client) client = import("posthog-js").then(({ default: posthog }) => {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN!, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
      ui_host: "https://us.posthog.com",
      persistence: "localStorage", persistence_name: "yourappisdead_website_v1",
      person_profiles: "never", autocapture: false, rageclick: false,
      capture_pageview: false, capture_pageleave: false, capture_exceptions: false, capture_performance: false,
      disable_session_recording: true, enable_recording_console_log: false,
      disable_surveys: true, advanced_disable_flags: true, disable_external_dependency_loading: true,
      respect_dnt: true, ip: false, request_batching: false,
      before_send: event => sanitizeAnalyticsEvent(event, typeof event?.properties.__website_route === "string" ? event.properties.__website_route : window.location.pathname, window.location.origin, process.env.NEXT_PUBLIC_ANALYTICS_ENVIRONMENT || "production"),
    });
    active = posthog;
    return posthog;
  }).catch(() => null);
  return client;
}
/** Best effort, never delays or rejects the user's action. Accepts no free text. */
export function trackWebsite(event: WebsiteEvent, properties: WebsiteProperties = {}) {
  if (!analyticsEnabled()) return;
  const safe = { ...safeEventProperties(properties), __website_route: websitePage(window.location.pathname).route_template };
  if (active) {
    try { active.capture(event, safe); } catch { /* Analytics must never break the product. */ }
    return;
  }
  void initializeWebsiteAnalytics().then(posthog => {
    posthog?.capture(event, safe);
  }).catch(() => {});
}
