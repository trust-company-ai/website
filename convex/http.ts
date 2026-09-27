// PHI console redaction (active only on PHI deployments).
import "./phiLogging";
import { httpRouter } from "convex/server";
import { internal } from "./_generated/api";
import { httpAction } from "./_generated/server";
import { auth } from "./auth";
import { reviewKey, webhookSecret } from "./reviewKey";

const http = httpRouter();
// Registers Convex Auth's routes, including the OAuth endpoints used by
// "Sign in with Viktor": /api/auth/signin/viktor and /api/auth/callback/viktor.
auth.addHttpRoutes(http);

/**
 * Maintainer-only ingest used while the source repository is private (the
 * scheduled GitHub sync cannot read it). Authenticated with the per-environment
 * review key. Body: { docs: [{path, sha, markdown}], prune: [path, ...] }.
 */
http.route({
  path: "/maintain/ingest",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    if (req.headers.get("x-review-key") !== reviewKey())
      return new Response("forbidden", { status: 403 });
    const body = (await req.json()) as {
      docs?: { path: string; sha: string; markdown: string }[];
      prune?: string[];
    };
    let chunks = 0;
    for (const d of body.docs ?? [])
      chunks += await ctx.runMutation(internal.sync.ingestMarkdown, d);
    let pruned = 0;
    if (body.prune?.length) {
      const existing = await ctx.runQuery(internal.sync.listDocs, {});
      for (const d of existing)
        if (body.prune.includes(d.path) && d.source !== "contribution") {
          await ctx.runMutation(internal.sync.deleteDoc, { docId: d._id });
          pruned++;
        }
    }
    return Response.json({ docs: (body.docs ?? []).length, chunks, pruned });
  }),
});

/**
 * Maintainer-only: delete stored question rows (review key). Used to remove
 * legitimate questions kept before the probe-only rule. Body: { ids: [...] }.
 */
http.route({
  path: "/maintain/questions/delete",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    if (req.headers.get("x-review-key") !== reviewKey())
      return new Response("forbidden", { status: 403 });
    const body = (await req.json()) as { ids?: string[] };
    const deleted = await ctx.runMutation(internal.kb.deleteQuestions, {
      ids: (body.ids ?? []) as any,
    });
    return Response.json({ deleted });
  }),
});

/**
 * GitHub push webhook: re-index the repository as soon as main changes,
 * instead of waiting for the 6-hourly cron. Verified with X-Hub-Signature-256.
 */
http.route({
  path: "/sync/github",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const raw = await req.text();
    const sig = req.headers.get("x-hub-signature-256") ?? "";
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(webhookSecret()),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
    const mac = new Uint8Array(
      await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(raw)),
    );
    const expected =
      "sha256=" + Array.from(mac, b => b.toString(16).padStart(2, "0")).join("");
    if (sig.length !== expected.length || sig !== expected)
      return new Response("forbidden", { status: 403 });
    const event = req.headers.get("x-github-event");
    if (event === "ping") return Response.json({ ok: true, pong: true });
    if (event !== "push") return Response.json({ ok: true, ignored: event });
    await ctx.scheduler.runAfter(0, internal.sync.syncRepo, {});
    return Response.json({ ok: true, scheduled: true });
  }),
});

export default http;
