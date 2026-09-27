import { execSync } from "node:child_process";
import { runTest } from "./auth";

const SAMPLE = `# Keeping client data out of model training

At the trust company our CTO led a project with a managed LLM service.
We learned three things:
- Turn off model training on all vendor contracts before the first pilot.
- Keep the core trust accounting system read-only for the AI layer.
- Have compliance sign off on each new data source.`;

function reviewKey(): string {
  const out = execSync("bunx convex run submissions:_reviewKey '{}'", {
    env: { ...process.env, CONVEX_TMPDIR: "./tmp" },
    encoding: "utf8",
  });
  return out.trim().replace(/^"|"$/g, "");
}

runTest("Submit → review → approve → searchable", async helper => {
  const { page } = helper;
  const key = reviewKey();
  const stamp = `E2E ${Date.now()}`;

  // 1. Submit page via nav link
  await helper.goto("/submit");
  await page.waitForSelector('[data-testid="submit-form"]', { timeout: 20000 });
  await page.fill("#title", stamp);
  await page.fill('[data-testid="text-input"]', SAMPLE);
  await page.click('[data-testid="permission"]');
  // 2. Send as written — no rewrite step; the text goes straight to the queue
  await page.click('[data-testid="submit-btn"]');
  await page.waitForSelector('[data-testid="submit-done"]', { timeout: 20000 });

  // 3. Review page without key is blocked
  await helper.goto("/review");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForSelector("text=needs the review link", { timeout: 20000 });

  // 4. Review with key: our item is pending → approve
  await helper.goto(`/review?key=${key}`);
  const sel = `[data-testid="review-item"][data-title*="${stamp}"]`;
  const item = page.locator(sel).first();
  await item.waitFor({ timeout: 20000 });
  await item.locator('[data-testid="approve-btn"]').click();
  await item.waitFor({ state: "detached", timeout: 20000 });
  await page.click('[data-testid="tab-approved"]');
  await page.locator(sel).first().waitFor({ timeout: 20000 });
  const pathText = await page.locator(sel).first().innerText();
  if (!/contributions\/\d{4}-\d{2}-\d{2}-e2e/.test(pathText))
    throw new Error(`No KB path shown: ${pathText}`);

  // 5. Wrong key is rejected by the backend
  await helper.goto("/review?key=wrong");
  await page.waitForTimeout(1500);
  const items = await page.locator('[data-testid="review-item"]').count();
  if (items !== 0) throw new Error("Wrong key still listed submissions");
  console.log("OK — approved path:", pathText.match(/contributions\/\S+/)?.[0]);
}).catch(() => process.exit(1));
