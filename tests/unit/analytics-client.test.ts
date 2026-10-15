import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const sdk = vi.hoisted(() => ({ init: vi.fn(), capture: vi.fn() }));
vi.mock("posthog-js", () => ({ default: sdk }));

beforeEach(() => {
  vi.resetModules(); vi.clearAllMocks();
  vi.stubGlobal("window", { location: { pathname: "/typeformisdead/login", origin: "https://yourappisdead.com" } });
  vi.stubEnv("NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN", "public-test-key");
  vi.stubEnv("NEXT_PUBLIC_ANALYTICS_ENABLED", "true");
});
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe("website analytics client", () => {
  it("stays disabled unless explicitly enabled", async () => {
    vi.stubEnv("NEXT_PUBLIC_ANALYTICS_ENABLED", "false");
    const client = await import("@/lib/analytics/client");
    client.trackWebsite("website_auth_started", { method: "email" });
    expect(await client.initializeWebsiteAnalytics()).toBeNull();
    expect(sdk.init).not.toHaveBeenCalled();
    expect(sdk.capture).not.toHaveBeenCalled();
  });
  it("initializes once with automatic sensitive capture disabled", async () => {
    const client = await import("@/lib/analytics/client");
    await Promise.all([client.initializeWebsiteAnalytics(), client.initializeWebsiteAnalytics()]);
    expect(sdk.init).toHaveBeenCalledTimes(1);
    expect(sdk.init).toHaveBeenCalledWith("public-test-key", expect.objectContaining({ api_host: "https://us.i.posthog.com", autocapture: false, capture_pageview: false, capture_exceptions: false, disable_session_recording: true, disable_surveys: true, person_profiles: "never", respect_dnt: true, ip: false, before_send: expect.any(Function) }));
  });
  it("preserves the event's route across asynchronous SDK loading", async () => {
    const client = await import("@/lib/analytics/client");
    client.trackWebsite("website_auth_started", { method: "email", flow: "login" });
    window.location.pathname = "/typeformisdead/app";
    await client.initializeWebsiteAnalytics();
    await Promise.resolve();
    expect(sdk.capture).toHaveBeenCalledWith("website_auth_started", { method: "email", flow: "login", __website_route: "/typeformisdead/login" });
    const config = sdk.init.mock.calls[0][1];
    expect(config.before_send({ event: "website_auth_started", properties: sdk.capture.mock.calls[0][1] }).properties.page_name).toBe("login");
  });
  it("captures immediately once initialized, before navigation can unload the page", async () => {
    const client = await import("@/lib/analytics/client");
    await client.initializeWebsiteAnalytics();
    client.trackWebsite("website_auth_completed", { method: "google", flow: "login" });
    expect(sdk.capture).toHaveBeenCalledWith("website_auth_completed", expect.objectContaining({ method: "google", flow: "login" }));
  });
  it("contains SDK failures so product actions can continue", async () => {
    sdk.init.mockImplementationOnce(() => { throw new Error("blocked"); });
    const client = await import("@/lib/analytics/client");
    expect(() => client.trackWebsite("website_response_submitted")).not.toThrow();
    expect(await client.initializeWebsiteAnalytics()).toBeNull();
  });
});
