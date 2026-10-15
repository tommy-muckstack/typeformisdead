// Production-build API regression check. Uses a fresh local directory, never cloud storage.
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { randomInt } from "node:crypto";
import { once } from "node:events";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";

const data = await mkdtemp(path.join(os.tmpdir(), "typeform-api-"));
const port = randomInt(30000, 45000);
const base = `http://127.0.0.1:${port}/typeformisdead`;
const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1", "--port", String(port)], {
  env: { ...process.env, NODE_ENV: "production", DEMO_MODE: "1", FIREBASE_SERVICE_ACCOUNT_JSON: "", ISDEAD_DATA_DIR: data },
  stdio: ["ignore", "pipe", "pipe"],
});
let logs = "";
server.stdout.on("data", chunk => { logs += chunk; });
server.stderr.on("data", chunk => { logs += chunk; });
let cookie = "";
const request = (url, { owner = false, ...options } = {}) => fetch(base + url, {
  ...options, signal: AbortSignal.timeout(10000),
  headers: { "content-type": "application/json", ...(owner ? { cookie } : {}), ...options.headers },
});

try {
  let ready = false;
  for (let attempt = 0; attempt < 100; attempt++) {
    if (server.exitCode !== null) throw new Error(`Local server exited: ${logs}`);
    if (logs.includes("Ready in")) { ready = true; break; }
    await delay(100);
  }
  assert(ready, `Local server did not become ready: ${logs}`);
  const login = await request("/api/session/demo", { method: "POST" });
  assert.equal(login.status, 204);
  cookie = login.headers.getSetCookie().map(value => value.split(";")[0]).join("; ");
  assert(cookie);
  const create = await request("/api/forms", { owner: true, method: "POST", body: JSON.stringify({ template: "blank", title: "Local parity regression" }) });
  assert.equal(create.status, 201);
  const { form } = await create.json();
  const question = { id: "audit_date", type: "date", title: "Choose a date", required: true };
  const save = await request(`/api/forms/${form.id}`, { owner: true, method: "PUT", body: JSON.stringify({ ...form, published: true, questions: [question] }) });
  assert.equal(save.status, 200);
  const invalid = await request(`/api/forms/${form.id}/responses`, { method: "POST", body: JSON.stringify({ answers: { audit_date: "2026-02-30" } }) });
  assert.equal(invalid.status, 422);
  const responses = await Promise.all(Array.from({ length: 100 }, () => request(`/api/forms/${form.id}/responses`, {
    method: "POST", body: JSON.stringify({ answers: { audit_date: "2024-02-29" } }),
  })));
  responses.forEach(response => assert.equal(response.status, 201));
  const stored = await request(`/api/forms/${form.id}/responses`, { owner: true });
  assert.equal(stored.status, 200);
  assert.equal((await stored.json()).responses.length, 100);
  assert.equal((await request(`/api/forms/${form.id}/responses`)).status, 404);
  const views = await Promise.all(Array.from({ length: 100 }, () => request(`/api/forms/${form.id}/view`, { method: "POST" })));
  views.forEach(response => assert.equal(response.status, 204));
  const dashboard = await (await request("/api/forms", { owner: true })).json();
  assert.equal(dashboard.forms.find(item => item.id === form.id).views, 100);
  const csv = await request(`/api/forms/${form.id}/responses?format=csv`, { owner: true });
  assert.equal(csv.status, 200);
  assert.equal((await csv.text()).trim().split("\r\n").length, 101);
  assert.equal((await request(`/api/forms/${form.id}`, { owner: true, method: "DELETE" })).status, 204);
  assert.equal((await request(`/api/forms/${form.id}`)).status, 404);
  console.log("Local API check passed: calendar validation, 100 concurrent responses/views, owner-only results, CSV and deletion.");
} finally {
  const stopped = once(server, "exit");
  server.kill("SIGTERM");
  await Promise.race([stopped, delay(5000)]);
  if (server.exitCode === null && server.signalCode === null) { server.kill("SIGKILL"); await stopped; }
  await rm(data, { recursive: true, force: true });
}
