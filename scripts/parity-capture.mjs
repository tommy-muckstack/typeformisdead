// Public home/login baselines only. Never load an authenticated browser profile.
// Usage: node scripts/parity-capture.mjs [clone-base-url] [output-directory]
import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const base = (process.argv[2] || "http://localhost:3000/typeformisdead").replace(/\/$/, "");
const output = path.resolve(process.argv[3] || "test-results/parity");
const screens = [
  { name: "home", original: "https://www.typeform.com/", clone: base },
  { name: "login", original: "https://admin.typeform.com/login", clone: `${base}/login` },
];
const viewports = [{ width: 1440, height: 900 }, { width: 390, height: 844 }];
const manifest = { capturedAt: new Date().toISOString(), state: "unauthenticated, fresh storage per page", results: [] };
const escapeHTML = (text) => String(text).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
await mkdir(output, { recursive: true });
const browser = await chromium.launch().catch(async error => {
  manifest.launch = { status: "failed", error: error.message };
  await writeFile(path.join(output, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
  throw error;
});
manifest.browserVersion = browser.version();

try {
  for (const viewport of viewports) {
    for (const screen of screens) {
      for (const side of ["original", "clone"]) {
        const context = await browser.newContext({
          viewport, deviceScaleFactor: 1, locale: "en-US", timezoneId: "America/New_York",
          colorScheme: "light", reducedMotion: "reduce", serviceWorkers: "block",
        });
        const page = await context.newPage();
        const stem = `${screen.name}-${viewport.width}-${side}`;
        const result = { screen: screen.name, side, viewport, requestedURL: screen[side], stem, warnings: [] };
        try {
          const response = await page.goto(screen[side], { waitUntil: "load", timeout: 45000 });
          result.httpStatus = response?.status() ?? null;
          if (!response?.ok()) result.warnings.push("Navigation did not return a successful HTTP status.");
          await page.locator("h1, h2, input, button").first().waitFor({ state: "visible", timeout: 15000 });
          const fontsReady = await page.evaluate(() => Promise.race([
            document.fonts.ready.then(() => true),
            new Promise(resolve => setTimeout(() => resolve(false), 10000)),
          ]));
          result.fontsReady = fontsReady;
          if (!fontsReady) result.warnings.push("Font readiness timed out; this capture is not a settled visual baseline.");
          result.finalURL = page.url();
          result.title = await page.title();
          // Disable animation only for still captures. Motion parity needs a separate scenario.
          await page.screenshot({ path: path.join(output, `${stem}.png`), animations: "disabled" });
          await page.screenshot({ path: path.join(output, `${stem}-full.png`), fullPage: true, animations: "disabled" });
          const styles = await page.evaluate(() => {
            const properties = ["font-family", "font-size", "font-weight", "line-height", "letter-spacing", "color", "background-color", "padding", "margin", "gap", "border", "border-radius", "box-shadow", "display", "position"];
            return Array.from(document.querySelectorAll("h1,h2,h3,header,nav,footer,button,input,a,[role=dialog]"))
              .filter(el => el.getBoundingClientRect().width && el.getBoundingClientRect().height)
              .map(el => {
                const rect = el.getBoundingClientRect();
                const style = getComputedStyle(el);
                return {
                  tag: el.tagName, id: el.id, className: el.getAttribute("class"),
                  label: el.getAttribute("aria-label") || el.textContent?.trim().slice(0, 160),
                  bounds: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
                  computed: Object.fromEntries(properties.map(p => [p, style.getPropertyValue(p)])),
                };
              });
          });
          await writeFile(path.join(output, `${stem}-styles.json`), JSON.stringify(styles, null, 2) + "\n");
          result.capture = "captured; requires human review, not a parity verdict";
        } catch (error) {
          result.capture = "failed";
          result.error = error.message;
          process.exitCode = 1;
        } finally {
          manifest.results.push(result);
          await context.close();
        }
      }
    }
  }
} finally {
  await browser.close();
  await writeFile(path.join(output, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
  const pairs = viewports.flatMap(viewport => screens.map(screen => {
    const pair = manifest.results.filter(r => r.screen === screen.name && r.viewport.width === viewport.width);
    return `<section><h2>${screen.name} · ${viewport.width}px</h2><div class="pair">${pair.map(r => `<article><h3>${r.side}</h3><p>${escapeHTML(r.capture)}</p>${r.capture?.startsWith("captured") ? `<a href="${r.stem}-full.png"><img src="${r.stem}.png" alt="${r.side} ${screen.name} at ${viewport.width}px"></a><p><a href="${r.stem}-styles.json">Computed styles</a></p>` : `<p>${escapeHTML(r.error || "No capture")}</p>`}</article>`).join("")}</div></section>`;
  }));
  await writeFile(path.join(output, "index.html"), `<!doctype html><html lang="en"><meta charset="utf-8"><title>Typeform parity captures</title><style>body{font:16px system-ui;margin:24px;background:#eee;color:#222}.pair{display:grid;grid-template-columns:1fr 1fr;gap:16px}article{background:white;padding:16px}img{width:100%;height:auto}section{margin-bottom:40px}</style><h1>Public home/login captures</h1><p>Fresh storage; reduced motion; animations disabled for stills. Review cookie overlays and font/content readiness. Capture success does not establish parity. Click a screenshot for its full page.</p>${pairs.join("")}<p><a href="manifest.json">Capture manifest</a></p></html>`);
}
console.log(`Parity artifacts: ${output}`);
