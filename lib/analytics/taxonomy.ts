// Analytics taxonomy for the shared IsDead PostHog project 666931 (contract: yourappisdead/ANALYTICS.md, see docs/ANALYTICS.md).
// Super properties: product (this app's slug), surface ("landing" = logged-out marketing pages, "app" = the working product
// and anything it publishes), platform ("web"). Page views are PostHog's built-in $pageview.
// Events are `app_<object>_<action>` (or `landing_<object>_<action>` for marketing CTAs); the product name lives in
// `product`, never in an event name. Never send user content (titles, URLs, emails, text) as properties: TypeformIsDead
// sends fixed enums, booleans and a bounded question count only (no form/response ids, titles, questions or answers).
export const APP = "typeformisdead" as const;
export type Surface = "landing" | "app";
export const EVENTS = {
  // ---- account ----
  app_auth_started: "app_auth_started",   // method ("password" | "google"), flow ("signin" | "signup" | "password_reset")
  app_auth_failed: "app_auth_failed",     // method, flow (no error text)
  app_signed_up: "app_signed_up",         // method ("password")
  app_signed_in: "app_signed_in",         // method ("password" | "google")
  app_signed_out: "app_signed_out",
  app_password_reset_requested: "app_password_reset_requested",
  // ---- forms ----
  app_form_created: "app_form_created",   // creation_method ("blank" | "template" | "prompt"), question_count (0–100)
  app_form_deleted: "app_form_deleted",
  app_form_publish_changed: "app_form_publish_changed", // published (bool)
  app_form_response_submitted: "app_form_response_submitted", // (respondent on /f/:id)
  // ---- marketing site ----
  landing_cta_clicked: "landing_cta_clicked", // target ("announcement" | "navigation" | "hero" | "example" | "content" | "footer")
} as const;
export type EventName = (typeof EVENTS)[keyof typeof EVENTS];
export const EVENT_PREFIXES = ["app_", "landing_"] as const;
export const CTA_TARGETS = ["announcement", "navigation", "hero", "example", "content", "footer"] as const;
// Allowlist of properties per event and their permitted values. track() rebuilds properties from it, so extra fields never
// leave the browser; a value outside the list drops the whole event.
type Rule = readonly (string | boolean)[] | "count";
const auth = { method: ["password", "google"], flow: ["signin", "signup", "password_reset"] } as const;
const ALLOWED: Record<EventName, Record<string, Rule>> = {
  app_auth_started: auth, app_auth_failed: auth,
  app_signed_up: { method: ["password"] }, app_signed_in: { method: ["password", "google"] },
  app_signed_out: {}, app_password_reset_requested: {},
  app_form_created: { creation_method: ["blank", "template", "prompt"], question_count: "count" },
  app_form_deleted: {}, app_form_publish_changed: { published: [true, false] }, app_form_response_submitted: {},
  landing_cta_clicked: { target: CTA_TARGETS },
};
/** The allowlisted copy of `input` for `event`, or null when a value is missing or outside the list. */
export function safeProps(event: string, input: unknown = {}): Record<string, string | number | boolean> | null {
  if (!Object.hasOwn(ALLOWED, event) || !input || typeof input !== "object") return null;
  const out: Record<string, string | number | boolean> = {};
  for (const [key, rule] of Object.entries(ALLOWED[event as EventName])) {
    const v = (input as Record<string, unknown>)[key];
    const ok = rule === "count" ? Number.isInteger(v) && (v as number) >= 0 && (v as number) <= 100 : rule.includes(v as never);
    if (!ok) return null;
    out[key] = v as string | number | boolean;
  }
  return out;
}
/** Super properties every event carries (yourappisdead/ANALYTICS.md §1). */
export const superProps = (surface: Surface) => ({ product: APP, surface, platform: "web" as const });
/** Super properties older IsDead taxonomies persisted in the shared yourappisdead.com cookie. Unregistered at boot. */
export const LEGACY_PROPS = ["app", "app_family", "base_path", "suite_id", "app_id", "schema_version", "source", "site_id", "environment", "ads_blocked", "account_type"] as const;
