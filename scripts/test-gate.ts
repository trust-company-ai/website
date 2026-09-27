import { runTest } from "./auth";
import { unlockGate } from "./gate";

const PASSWORD = process.env.SITE_PASSWORD ?? "";

/** Whole site behind one password: wrong one bounces, right one opens and sticks; chat needs it too. */
runTest("Site password gate", async helper => {
  const { page } = helper;
  if (!PASSWORD) throw new Error("SITE_PASSWORD env missing");
  await helper.goto("/");
  await page.evaluate(() => window.localStorage.removeItem("tcai.gate"));
  await helper.goto("/");
  await page.waitForSelector('[data-testid="gate-password"]', {
    timeout: 20000,
  });
  if ((await page.locator('[data-testid="home-h1"]').count()) > 0)
    throw new Error("Home rendered before the password was entered");
  await page.fill('[data-testid="gate-email"]', "test@example.com");
  await page.fill('[data-testid="gate-password"]', "not-the-password");
  await page.click('[data-testid="gate-submit"]');
  await page.waitForFunction(
    () =>
      document
        .querySelector('[data-testid="gate-error"]')
        ?.textContent?.includes("not right"),
    undefined,
    { timeout: 20000 },
  );
  await unlockGate(page, PASSWORD);
  await page.waitForSelector('[data-testid="home-h1"]', { timeout: 20000 });
  const line = await page
    .locator('[data-testid="no-compete-line"]')
    .innerText();
  if (
    !/where everyone wants shared reference points for best practice/.test(line)
  )
    throw new Error(`no-compete line wrong: ${line}`);
  // Sticks across reloads and other pages.
  await helper.goto("/ask");
  await page.waitForSelector('[data-testid="chat-panel"]', { timeout: 20000 });
  if ((await page.locator('[data-testid="gate"]').count()) > 0)
    throw new Error("Gate shown again after unlocking");
  // Chat works with the stored token.
  await page.fill(
    '[data-testid="chat-input"]',
    "What does OCC Bulletin 2026-13 change for trust companies?",
  );
  await page.click('[data-testid="chat-send"]');
  await page.waitForSelector('[data-testid="assistant-msg"]', {
    timeout: 90000,
  });
  const answer = await page
    .locator('[data-testid="assistant-msg"]')
    .first()
    .innerText();
  if (/Something went wrong|error/i.test(answer) && !/2026-13/.test(answer))
    throw new Error(`Chat failed behind gate: ${answer}`);
  // A forged token is bounced back to the gate.
  await page.evaluate(() => window.localStorage.setItem("tcai.gate", "forged"));
  await helper.goto("/");
  await page.waitForSelector('[data-testid="gate-password"]', {
    timeout: 20000,
  });
}).catch(() => process.exit(1));
