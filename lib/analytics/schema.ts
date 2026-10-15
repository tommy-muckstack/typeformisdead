import { BP } from "@/lib/basepath";

/** Shared website taxonomy. Keep event names stable when adding another IsDead app. */
export const WEBSITE_CONTEXT = { source: "website", site_id: "yourappisdead", app_id: "typeformisdead", schema_version: 1 } as const;
export const WEBSITE_EVENTS = ["$pageview", "website_cta_clicked", "website_auth_started", "website_auth_completed", "website_auth_failed", "website_form_created", "website_form_deleted", "website_form_publish_changed", "website_response_submitted", "website_analytics_verified"] as const;
export type WebsiteEvent = typeof WEBSITE_EVENTS[number];
export const CTA_LOCATIONS = ["announcement", "navigation", "hero", "example", "content", "footer"] as const;
export type WebsiteProperties = {
  cta_location?: typeof CTA_LOCATIONS[number];
  method?: "email" | "google";
  flow?: "login" | "signup" | "password_reset";
  creation_method?: "blank" | "template" | "prompt";
  question_count?: number;
  published?: boolean;
};
export function websitePage(pathname: string) {
  const path = pathname.split(/[?#]/)[0].replace(/\/+$/, "") || "/";
  const relative = path === BP ? "/" : BP && path.startsWith(`${BP}/`) ? path.slice(BP.length) : path;
  if (relative === "/") return { route_template: BP || "/", surface: "marketing", page_name: "home" };
  if (relative === "/login") return { route_template: `${BP}/login`, surface: "auth", page_name: "login" };
  if (relative === "/app") return { route_template: `${BP}/app`, surface: "workspace", page_name: "workspace" };
  if (/^\/app\/forms\/[^/]+$/.test(relative)) return { route_template: `${BP}/app/forms/:form_id`, surface: "builder", page_name: "form_builder" };
  if (/^\/f\/[^/]+$/.test(relative)) return { route_template: `${BP}/f/:form_id`, surface: "respondent", page_name: "form_respondent" };
  return { route_template: `${BP}/unknown`, surface: "other", page_name: "unknown" };
}
const enumValues: Record<string, readonly string[]> = {
  cta_location: CTA_LOCATIONS,
  method: ["email", "google"], flow: ["login", "signup", "password_reset"], creation_method: ["blank", "template", "prompt"],
};
export function safeEventProperties(properties: Record<string, unknown>): WebsiteProperties {
  const safe: Record<string, unknown> = {};
  for (const [key, values] of Object.entries(enumValues)) if (typeof properties[key] === "string" && values.includes(properties[key] as string)) safe[key] = properties[key];
  if (typeof properties.published === "boolean") safe.published = properties.published;
  if (typeof properties.question_count === "number" && Number.isInteger(properties.question_count) && properties.question_count >= 0 && properties.question_count <= 100) safe.question_count = properties.question_count;
  return safe;
}
// Keep only SDK delivery/anonymous-session fields. Never forward automatic URL,
// referrer, title, element text, profile, console, or arbitrary custom properties.
const SDK_PROPERTIES = ["token", "distinct_id", "$device_id", "$session_id", "$window_id", "$lib", "$lib_version", "$insert_id", "$time", "$browser", "$browser_version", "$os", "$device_type", "$screen_height", "$screen_width", "$viewport_height", "$viewport_width"];
export function sanitizeAnalyticsEvent<T extends { event: string; properties: Record<string, unknown> }>(event: T | null, pathname: string, origin: string, environment: string): T | null {
  if (!event || !(WEBSITE_EVENTS as readonly string[]).includes(event.event)) return null;
  const properties: Record<string, unknown> = {};
  for (const key of SDK_PROPERTIES) {
    const value = event.properties[key];
    if (typeof value === "string" || typeof value === "number") properties[key] = value;
  }
  const page = websitePage(pathname);
  Object.assign(properties, safeEventProperties(event.properties), WEBSITE_CONTEXT, page, {
    environment: environment === "production" ? "production" : "verification",
    $current_url: `${new URL(origin).origin}${page.route_template}`,
    $pathname: page.route_template,
    $host: new URL(origin).hostname,
    $process_person_profile: false,
    $is_identified: false,
  });
  return { ...event, properties };
}
