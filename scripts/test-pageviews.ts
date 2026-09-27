import { runTest } from "./auth";

/** Page-view counter: visiting pages records rows in `pageviews` (dev DB). */
runTest("Page-view counter", async helper => {
  const { page } = helper;
  const { execSync } = await import("node:child_process");
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Los_Angeles" }).format(new Date());
  const count = () =>
    JSON.parse(
      execSync(
        `bunx convex run analytics:report '${JSON.stringify({ fromDay: today, toDay: today })}'`,
        { encoding: "utf8" },
      ),
    ).views as number;
  const before = count();
  await helper.goto("/");
  await page.waitForSelector('[data-testid="home-h1"]', { timeout: 20000 });
  await helper.goto("/library");
  await page.waitForTimeout(1500);
  const after = count();
  if (after < before + 2) throw new Error(`Expected ≥2 new page views, got ${after - before}`);
  console.log(`page views today: ${before} → ${after}`);
});
