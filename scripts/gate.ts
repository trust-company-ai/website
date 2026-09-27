import type { Page } from "playwright";

/** Enter the site password on the gate screen (see src/site/Gate.tsx). */
export async function unlockGate(
  page: Page,
  password: string,
  email = process.env.SITE_EMAIL ?? "test@example.com",
): Promise<void> {
  await page.waitForSelector('[data-testid="gate-password"]', {
    timeout: 20000,
  });
  await page.fill('[data-testid="gate-email"]', email);
  await page.fill('[data-testid="gate-password"]', password);
  await page.click('[data-testid="gate-submit"]');
  await page.waitForSelector('[data-testid="gate"]', {
    state: "detached",
    timeout: 20000,
  });
}
