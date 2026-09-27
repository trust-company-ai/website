import { execSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { runTest } from "./auth";

function reviewKey(): string {
  const out = execSync("bunx convex run submissions:_reviewKey '{}'", {
    env: { ...process.env, CONVEX_TMPDIR: "./tmp" },
    encoding: "utf8",
  });
  return out.trim().replace(/^"|"$/g, "");
}

runTest(
  "Contact form: message + attachment stored, listed for owner",
  async helper => {
    const { page } = helper;
    const key = reviewKey();
    const stamp = `E2E contact ${Date.now()}`;
    const tmpFile = `./tmp/${Date.now()}-note.txt`;
    writeFileSync(tmpFile, "hello from e2e");

    await helper.goto("/");
    await page.click('[data-testid="email-button"]');
    await page.waitForSelector('[data-testid="contact-form"]', {
      timeout: 20000,
    });
    const warn = await page
      .locator('[data-testid="contact-warning"]')
      .innerText();
    if (!/may become public/.test(warn)) throw new Error("warning missing");

    // Send without ticking the box → error
    await page.fill(
      '[data-testid="contact-subject"]',
      "contains confidential information",
    );
    await page.fill('[data-testid="contact-message"]', stamp);
    await page.click('[data-testid="contact-send"]');
    await page.waitForSelector('[data-testid="contact-error"]', {
      timeout: 5000,
    });

    await page.setInputFiles('[data-testid="contact-file"]', tmpFile);
    await page.waitForSelector('[data-testid="contact-file-chip"]');
    await page.click('[data-testid="contact-ack"]');
    await page.click('[data-testid="contact-send"]');
    await page.waitForSelector('[data-testid="contact-done"]', {
      timeout: 30000,
    });

    const out = execSync(
      `bunx convex run messages:list '${JSON.stringify({ key, status: "new" })}'`,
      { env: { ...process.env, CONVEX_TMPDIR: "./tmp" }, encoding: "utf8" },
    );
    const rows = JSON.parse(out) as {
      subject?: string;
      message: string;
      files: { name: string; url: string | null }[];
    }[];
    const mine = rows.find(r => r.message === stamp);
    if (!mine) throw new Error("message not stored");
    if (mine.subject !== "contains confidential information")
      throw new Error("subject not stored");
    if (mine.files.length !== 1 || !mine.files[0].url)
      throw new Error("attachment missing");
    const res = await fetch(mine.files[0].url);
    if ((await res.text()) !== "hello from e2e")
      throw new Error("attachment content mismatch");
    console.log("OK message + attachment stored", mine.files[0].name);
  },
).catch(() => process.exit(1));
