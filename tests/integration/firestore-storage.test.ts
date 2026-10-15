import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { deleteApp, initializeApp, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { addResponse, bumpViews, deleteResponseData, getResponses, getStats } from "@/lib/forms/server";
import { putDoc } from "@/lib/store";

// Explicit opt-in, localhost only, demo project, and no credentials. This suite
// cannot run against a hosted database, even when the shell has cloud variables.
const host = process.env.FIRESTORE_EMULATOR_HOST;
describe.skipIf(!host)("Firestore emulator response storage", () => {
  const namespace = `parity_${randomUUID().replaceAll("-", "")}`;
  let app: App | undefined;
  let database: Firestore | undefined;

  beforeAll(() => {
    if (!/^127\.0\.0\.1:\d+$/.test(host ?? "")) throw new Error("Only a localhost Firestore emulator is permitted");
    vi.stubEnv("FIREBASE_SERVICE_ACCOUNT_JSON", "{}");
    vi.stubEnv("NEXT_PUBLIC_BASE_PATH", `/${namespace}`);
    app = initializeApp({ projectId: "demo-typeform-parity" }, "isdead");
    database = getFirestore(app);
  });

  afterAll(async () => {
    try {
      if (database) {
        const collections = await database.listCollections();
        await Promise.all(collections.filter(collection => collection.id.startsWith(`${namespace}__`))
          .map(collection => database!.recursiveDelete(collection)));
        await database.terminate();
      }
      if (app) await deleteApp(app);
    } finally { vi.unstubAllEnvs(); }
  });

  it("retains 100 concurrent responses and counts 100 concurrent views", async () => {
    await Promise.all(Array.from({ length: 100 }, (_, i) => Promise.all([
      addResponse({ id: `r${i}`, formId: "concurrent", answers: { answer: i }, submittedAt: i }),
      bumpViews("concurrent"),
    ])));
    const responses = await getResponses("concurrent");
    expect(responses).toHaveLength(100);
    expect(new Set(responses.map(response => response.id)).size).toBe(100);
    expect(await getStats("concurrent")).toEqual({ views: 100 });
  });

  it("reads chunked legacy responses with new records and deletes only the selected form's data", async () => {
    const old = Array.from({ length: 120 }, (_, i) => ({
      id: `old${i}`, formId: "legacy", answers: { answer: "a".repeat(10000) }, submittedAt: i,
    }));
    await putDoc("responses", "legacy", old);
    await putDoc("stats", "legacy", { views: 17 });
    await addResponse({ id: "new", formId: "legacy", answers: {}, submittedAt: 120 });
    await bumpViews("legacy");
    await addResponse({ id: "other", formId: "untouched", answers: {}, submittedAt: 1 });
    await bumpViews("untouched");
    expect(await getResponses("legacy")).toHaveLength(121);
    expect(await getStats("legacy")).toEqual({ views: 18 });

    await deleteResponseData("legacy");
    expect(await getResponses("legacy")).toEqual([]);
    expect(await getStats("legacy")).toEqual({ views: 0 });
    expect((await database!.collection(`${namespace}__responses`).get()).empty).toBe(true);
    expect((await database!.collection(`${namespace}__responses_legacy`).get()).empty).toBe(true);
    expect((await database!.collection(`${namespace}__views_legacy`).get()).empty).toBe(true);
    expect(await getResponses("untouched")).toHaveLength(1);
    expect(await getStats("untouched")).toEqual({ views: 1 });
  });
});
