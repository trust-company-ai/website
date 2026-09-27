import { runTest } from "./auth";

/** Website: approved home copy renders, library lists real documents, reader works. */
runTest("Website pages and library", async helper => {
  const { page } = helper;

  await helper.goto("/");
  await page.waitForSelector('[data-testid="home-h1"]', { timeout: 20000 });
  const h1 = await page.locator('[data-testid="home-h1"]').innerText();
  if (!/How independent trust companies share lessons learned about AI/i.test(h1))
    throw new Error(`Unexpected home headline: ${h1}`);
  const body = await page.locator("body").innerText();
  // Approved copy present …
  for (const must of [
    "A not-for-profit project built on GitHub, Slack, and Claude Code as part of the global LegalQuants residency program",
    "route work by consequence, not by capability.",
    "Named exception",
    "Apache-2.0, no permission required.",
    "Statutes and regulatory guidance public as of September 21, 2026.",
    "Please submit anonymized documents or documents you are comfortable sharing.",
    "in live, Board-governed use",
  ])
    if (!body.includes(must)) throw new Error(`Missing approved copy: ${must}`);
  // … and the agreed deletions absent.
  for (const gone of [
    "GitHub is the assumption",
    "closed-SaaS",
    "mirrored in plain English at TrustCompanyAI.org",
    "California and Massachusetts",
    "built the way trust companies need it",
  ])
    if (body.includes(gone))
      throw new Error(`Deleted text still present: ${gone}`);
  await page.waitForSelector('[data-testid="chat-panel"]', { timeout: 20000 });
  // Chat sits above the counters and the one-pager; counters show fixed numbers.
  const chatY =
    (await page.locator('[data-testid="chat-panel"]').boundingBox())?.y ?? 0;
  const statsY =
    (await page.locator('[data-testid="stats"]').boundingBox())?.y ?? 0;
  const refY =
    (await page.locator('[data-testid="reference-pattern"]').boundingBox())
      ?.y ?? 0;
  if (!(chatY < statsY && statsY < refY))
    throw new Error(
      `Home order wrong: chat=${chatY} stats=${statsY} pattern=${refY}`,
    );
  await page.waitForTimeout(1500); // count-up settles
  const stats = await page.locator('[data-testid="stats"]').innerText();
  if (!/1\s*trust company participating so far/.test(stats))
    throw new Error(`Participants counter wrong: ${stats}`);
  if (!/3\s*documents in the knowledge base/.test(stats))
    throw new Error(`Documents counter wrong: ${stats}`);
  // Documents counter links to the Library.
  const docsHref = await page
    .locator('[data-testid="stat-documents"]')
    .getAttribute("href");
  if (docsHref !== "/library")
    throw new Error(
      `Documents counter should link to /library, got ${docsHref}`,
    );
  // Always black on white, regardless of OS dark mode.
  const isDark = await page.evaluate(() =>
    document.documentElement.classList.contains("dark"),
  );
  if (isDark) throw new Error("Site rendered in dark mode");
  await page.screenshot({ path: "tmp/site-home.png", fullPage: true });

  // Old prose routes are gone (redirect home).
  for (const old of ["/why", "/about", "/get-involved"]) {
    await helper.goto(old);
    await page.waitForSelector('[data-testid="home-h1"]', { timeout: 15000 });
  }

  // Library lists the framework and the worked example; reader opens.
  await helper.goto("/library");
  await page.waitForSelector('h1:has-text("Library")', { timeout: 15000 });
  await page.waitForSelector('[data-testid="doclist-frameworks"] a', {
    timeout: 20000,
  });
  const arch = await page
    .locator('[data-testid="doclist-architecture"] a')
    .allInnerTexts();
  if (!arch.some(t => /in production/i.test(t)))
    throw new Error(
      `Worked example (in production) not listed: ${arch.join(" | ")}`,
    );
  await page.screenshot({ path: "tmp/site-library.png", fullPage: true });
  await page.locator('[data-testid="doclist-frameworks"] a').first().click();
  await page.waitForSelector('[data-testid="doc-title"]', { timeout: 20000 });
  const docTitle = await page.locator('[data-testid="doc-title"]').innerText();
  if (!/reference architecture/i.test(docTitle))
    throw new Error(`Unexpected doc title: ${docTitle}`);

  // Header has no nav words; Share box reachable; full-screen chat link present.
  await helper.goto("/");
  // Drop zone: choosing a .md file opens /submit with the text prefilled.
  await page.waitForSelector('[data-testid="drop-zone"]', { timeout: 20000 });
  await page.setInputFiles('[data-testid="hero-file-input"]', {
    name: "lesson.md",
    mimeType: "text/markdown",
    buffer: Buffer.from("# Test lesson\n\nA few sentences about vendor review."),
  });
  await page.waitForURL(/\/submit$/, { timeout: 10000 });
  const prefilled = await page.inputValue('[data-testid="text-input"]');
  if (!prefilled.includes("vendor review")) throw new Error("drop zone did not prefill /submit");
  await helper.goto("/");
  await page.waitForSelector('[data-testid="chat-fullscreen"]', { timeout: 20000 });
  await helper.goto("/ask");
  await page.waitForSelector('[data-testid="chat-panel"]', { timeout: 20000 });

  // Mobile.
  await page.setViewportSize({ width: 390, height: 844 });
  await helper.goto("/");
  await page.waitForSelector('[data-testid="home-h1"]', { timeout: 20000 });
  await page.screenshot({ path: "tmp/site-home-mobile.png", fullPage: false });
}).catch(() => process.exit(1));
