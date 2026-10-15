// Drives the real app (production build, demo account) to capture product shots AND smoke-test create → share → respond → results.
import fs from "node:fs"; import assert from "node:assert/strict";
import { withApp, demoPage, out } from "./shotlib.mjs";
const dir = out("typeformisdead"); const pub = new URL("../public/home/", import.meta.url).pathname; fs.mkdirSync(pub, { recursive: true });
const save = async (page, name) => { await page.screenshot({ path: `${dir}/${name}.png` }); fs.copyFileSync(`${dir}/${name}.png`, `${pub}${name}.png`); };
await withApp("typeformisdead", async ({ base, browser }) => {
  const { ctx, page } = await demoPage(browser, base, { w: 1440, h: 900 });
  await page.getByText("Make your first form").waitFor(); await page.screenshot({ path: `${dir}/dashboard-empty.png` });
  await page.getByRole("button", { name: "Create a form" }).click(); await page.getByRole("button", { name: /Customer feedback/ }).click(); await page.waitForURL(/\/app\/forms\//);
  const formId = page.url().split("/").pop(); await page.getByRole("tab", { name: "Create" }).waitFor();
  // edit title + add a question + save
  await page.getByLabel("Form title").fill("Customer feedback"); await page.getByRole("button", { name: /^4 Can we follow up/ }).click(); await page.getByLabel("Add question").selectOption("rating"); await page.getByLabel("Question title").fill("How was onboarding?");
  await page.getByText("Saved", { exact: true }).waitFor(); await page.waitForTimeout(700);
  await page.getByRole("button", { name: /^1 How likely/ }).click(); await page.waitForTimeout(500); await save(page, "builder");
  // share tab
  await page.getByRole("tab", { name: "Share" }).click(); const link = await page.getByLabel("Form link").inputValue(); assert.match(link, /\/typeformisdead\/f\//); await save(page, "share");
  // respondents (anonymous browser): promoter path
  const anon = await browser.newContext({ viewport: { width: 1440, height: 900 } }); const p = await anon.newPage();
  const publicUrl = base + "/f/" + formId; assert.equal(link, publicUrl.replace(/^http:\/\/localhost:\d+/, link.match(/^https?:\/\/[^/]+/)[0]));
  await p.goto(publicUrl); await p.getByRole("button", { name: "Let's go" }).click();
  await p.getByRole("radio", { name: "9" }).waitFor(); await p.waitForTimeout(600); await save(p, "player"); await p.getByRole("radio", { name: "9" }).click(); await p.getByText("What's the main reason").waitFor();
  await p.getByLabel("What's the main reason for your score?").fill("Setup took five minutes."); await p.keyboard.press("Enter");
  assert.equal(await p.getByText("We're sorry").count(), 0, "promoters skip the apology question");
  await p.getByLabel(/Can we follow up/).fill("not-an-email"); await p.keyboard.press("Enter"); await p.locator(".tfp__err").waitFor();
  await p.getByLabel(/Can we follow up/).fill("ana@example.com"); await p.keyboard.press("Enter");
  await p.getByLabel("How was onboarding?", { exact: false }).first().waitFor().catch(() => {});
  await p.getByRole("radio", { name: "5 stars" }).click(); await p.getByTestId("ending").waitFor(); await p.screenshot({ path: `${dir}/player-ending.png` });
  // detractor path
  const p2 = await (await browser.newContext()).newPage(); await p2.goto(publicUrl); await p2.getByRole("button", { name: "Let's go" }).click(); await p2.getByRole("radio", { name: "3" }).click();
  await p2.getByText("We're sorry. What went wrong?").waitFor(); await p2.locator(".tfp__err").waitFor({ timeout: 500 }).catch(() => {});
  await p2.keyboard.press("Enter"); await p2.locator(".tfp__err").waitFor(); // required
  await p2.getByLabel("We're sorry. What went wrong?").fill("Too slow."); await p2.keyboard.press("Enter"); await p2.keyboard.press("Enter"); // skip optional email
  await p2.getByRole("radio", { name: "2 stars" }).click(); await p2.getByTestId("ending").waitFor();
  // server-side validation rejects junk and unknown keys
  const bad = await fetch(`${base}/api/forms/${formId}/responses`, { method: "POST", body: JSON.stringify({ answers: { nope: 1 } }) }); assert.equal(bad.status, 422);
  const noAuth = await fetch(`${base}/api/forms/${formId}/responses`); assert.equal(noAuth.status, 404, "responses are owner-only");
  // a few more scores for the charts
  const form = (await (await fetch(`${base}/api/forms/${formId}`)).json()).form; const [nps, reason, sorry, email, rating] = form.questions;
  for (const s of [10, 9, 8, 10, 6, 9, 10]) { const a = { [nps.id]: s, [rating.id]: Math.min(5, Math.max(1, Math.round(s / 2))) }; if (s < 7) a[sorry.id] = "Support was slow"; else a[reason.id] = "Easy to use"; const r = await fetch(`${base}/api/forms/${formId}/responses`, { method: "POST", body: JSON.stringify({ answers: a, durationMs: 21000 + s * 900 }) }); assert.equal(r.status, 201); }
  // results
  await page.getByRole("tab", { name: "Results" }).click(); await page.getByTestId("results").waitFor(); assert.equal(await page.getByTestId("r-count").innerText(), "9"); await page.waitForTimeout(300); await save(page, "results");
  await page.getByRole("button", { name: "Responses" }).click(); await page.screenshot({ path: `${dir}/results-table.png` });
  const csvRes = await page.request.get(`${base}/api/forms/${formId}/responses?format=csv`); const csv = await csvRes.text(); assert.match(csv, /^Submitted at,How likely/); assert.equal(csv.trim().split("\r\n").length, 10);
  // dashboard now lists the form with counts
  await page.goto(base + "/app"); await page.getByText(/9 responses/).waitFor(); await page.screenshot({ path: `${dir}/dashboard.png` });
  // marketing + login + mobile
  const c2 = await browser.newContext({ viewport: { width: 1440, height: 900 } }); const m = await c2.newPage();
  await m.goto(base); await m.waitForTimeout(500); await m.screenshot({ path: `${dir}/home-top.png` }); await m.screenshot({ path: `${dir}/home-full.png`, fullPage: true });
  await m.goto(base + "/#pricing"); await m.waitForTimeout(300); await m.screenshot({ path: `${dir}/home-pricing.png` });
  await m.goto(base + "/login"); await m.waitForTimeout(300); await m.screenshot({ path: `${dir}/login.png` });
  const mob = await (await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })).newPage(); await mob.goto(publicUrl); await mob.getByRole("button", { name: "Let's go" }).click(); await mob.screenshot({ path: `${dir}/player-mobile.png` });
  console.log("typeformisdead shots + smoke OK");
}, {});
