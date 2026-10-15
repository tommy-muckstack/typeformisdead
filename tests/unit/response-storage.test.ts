import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { addResponse, bumpViews, getResponses, getStats, deleteResponseData } from "@/lib/forms/server";
import { putDoc } from "@/lib/store";

let directory: string;
beforeEach(async () => {
  directory = await fs.mkdtemp(path.join(os.tmpdir(), "typeform-storage-"));
  vi.stubEnv("ISDEAD_DATA_DIR", directory);
  vi.stubEnv("FIREBASE_SERVICE_ACCOUNT_JSON", "");
});
afterEach(async () => { await fs.rm(directory, { recursive: true, force: true }); vi.unstubAllEnvs(); });

describe("concurrent form traffic", () => {
  it("retains every response when submissions arrive together", async () => {
    await Promise.all(Array.from({ length: 100 }, (_, i) => addResponse({
      id: `r${i}`, formId: "form-one", answers: { answer: i }, submittedAt: i,
    })));
    const responses = await getResponses("form-one");
    expect(responses).toHaveLength(100);
    expect(new Set(responses.map(response => response.id)).size).toBe(100);
  });

  it("counts all concurrent page views", async () => {
    await Promise.all(Array.from({ length: 100 }, () => bumpViews("form-one")));
    expect((await getStats("form-one")).views).toBe(100);
  });

  it("preserves legacy responses and views alongside new records", async () => {
    const old = { id: "old", formId: "form-one", answers: { answer: "legacy" }, submittedAt: 1 };
    await putDoc("responses", "form-one", [old]);
    await putDoc("stats", "form-one", { views: 27 });
    await addResponse({ id: "new", formId: "form-one", answers: { answer: "new" }, submittedAt: 2 });
    await bumpViews("form-one");
    expect((await getResponses("form-one")).map(r => r.id)).toEqual(["old", "new"]);
    expect((await getStats("form-one")).views).toBe(28);
  });

  it("removes the old 5,000 response quota", async () => {
    await putDoc("responses", "form-one", Array.from({ length: 5000 }, (_, i) => ({ id: `old${i}`, formId: "form-one", answers: {}, submittedAt: i })));
    await addResponse({ id: "new", formId: "form-one", answers: {}, submittedAt: 5000 });
    expect(await getResponses("form-one")).toHaveLength(5001);
  });

  it("deduplicates the same record ID across legacy and new storage", async () => {
    const response = { id: "same", formId: "form-one", answers: {}, submittedAt: 1 };
    await putDoc("responses", "form-one", [response]);
    await Promise.all([addResponse(response), addResponse(response)]);
    expect(await getResponses("form-one")).toEqual([response]);
  });

  it("deletes all generations of one form's data without touching another form", async () => {
    await putDoc("responses", "form-one", [{ id: "old", formId: "form-one", answers: {}, submittedAt: 0 }]);
    await putDoc("stats", "form-one", { views: 20 });
    for (const formId of ["form-one", "form-two"]) {
      await addResponse({ id: "new", formId, answers: {}, submittedAt: 1 });
      await bumpViews(formId);
    }
    await deleteResponseData("form-one");
    expect(await getResponses("form-one")).toEqual([]);
    expect((await getStats("form-one")).views).toBe(0);
    expect(await getResponses("form-two")).toHaveLength(1);
    expect((await getStats("form-two")).views).toBe(1);
  });
});
