import { describe, expect, it } from "vitest";
import { safeEventProperties, sanitizeAnalyticsEvent, websitePage } from "@/lib/analytics/schema";

describe("website analytics privacy and taxonomy", () => {
  it.each([
    ["/typeformisdead", "home"], ["/typeformisdead/", "home"], ["/login?email=private@example.test", "login"],
    ["/typeformisdead/app", "workspace"], ["/app/forms/private-id", "form_builder"], ["/typeformisdead/f/private-id?answer=secret#email", "form_respondent"],
  ])("classifies %s without query data", (path, page) => {
    const actual = websitePage(path);
    expect(actual.page_name).toBe(page);
    expect(JSON.stringify(actual)).not.toMatch(/private-id|private@|secret|email=/);
  });
  it("does not leak unknown path segments", () => {
    expect(websitePage("/typeformisdead/account/private@example.test").route_template).toBe("/typeformisdead/unknown");
  });
  it("only retains bounded, known event properties", () => {
    expect(safeEventProperties({ method: "google", flow: "login", question_count: 4, published: true, password: "secret", email: "private@example.test", prompt: "private", answers: { name: "private" }, cta_location: "private" })).toEqual({ method: "google", flow: "login", question_count: 4, published: true });
    expect(safeEventProperties({ question_count: 101, method: "private", published: "yes" })).toEqual({});
  });
  it("removes SDK URL, title, referrer, profiles and arbitrary text before sending", () => {
    const event = { event: "website_form_created", uuid: "test-event", properties: { token: "public-project-token", distinct_id: "anonymous-test-id", $session_id: "test-session", $current_url: "https://host/f/secret?email=private", $referrer: "https://private.example/?token=secret", $title: "Private form title", $set: { email: "private@example.test" }, $initial_current_url: "private", creation_method: "prompt", question_count: 3, prompt: "Private prompt", answers: "secret", app_id: "spoofed", source: "spoofed", __website_route: "/app/forms/secret" } };
    const sanitized = sanitizeAnalyticsEvent(event, "/typeformisdead/app/forms/private-id", "https://yourappisdead.com", "production")!;
    expect(sanitized.properties).toMatchObject({ source: "website", site_id: "yourappisdead", app_id: "typeformisdead", schema_version: 1, environment: "production", creation_method: "prompt", question_count: 3, route_template: "/typeformisdead/app/forms/:form_id", $process_person_profile: false, $current_url: "https://yourappisdead.com/typeformisdead/app/forms/:form_id", distinct_id: "anonymous-test-id" });
    expect(JSON.stringify(sanitized)).not.toMatch(/Private|private|spoofed|secret|\$set|\$referrer|__website_route/);
  });
  it.each(["$autocapture", "$snapshot", "$identify", "$exception", "unexpected_event"])("drops unapproved %s events", event => {
    expect(sanitizeAnalyticsEvent({ event, properties: {} }, "/", "https://yourappisdead.com", "production")).toBeNull();
  });
});
