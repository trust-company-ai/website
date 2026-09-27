import { runTest } from "./auth";
import { unlockGate } from "./gate";

runTest("Chat answers from knowledge base with sources", async helper => {
  const { page } = helper;
  await helper.goto("/ask");
  if (process.env.SITE_PASSWORD)
    await unlockGate(page, process.env.SITE_PASSWORD);
  await page.waitForSelector('[data-testid="chat-panel"]', { timeout: 20000 });
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
  if (!/2026-13/.test(answer))
    throw new Error(`Answer missing bulletin reference: ${answer}`);
  const links = await page.locator('[data-testid="assistant-msg"] a').count();
  if (links < 1) throw new Error("Expected at least one source link");

  // Embed route renders the compact panel
  await helper.goto("/embed");
  await page.waitForSelector('[data-testid="chat-panel"]', { timeout: 20000 });
}).catch(() => process.exit(1));
