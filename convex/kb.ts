import { v } from "convex/values";
import { internalMutation, internalQuery, query } from "./_generated/server";

const TOP_K = 8;

export type Hit = {
  path: string;
  title: string;
  url: string;
  heading: string;
  text: string;
};

export const searchChunks = internalQuery({
  args: { q: v.string() },
  returns: v.array(
    v.object({
      path: v.string(),
      title: v.string(),
      url: v.string(),
      heading: v.string(),
      text: v.string(),
    }),
  ),
  handler: async (ctx, { q }) => {
    const hits = await ctx.db
      .query("chunks")
      .withSearchIndex("search_text", s => s.search("text", q))
      .take(TOP_K);
    return hits.map(h => ({
      path: h.path,
      title: h.title,
      url: h.url,
      heading: h.heading,
      text: h.text,
    }));
  },
});

export const logQuestion = internalMutation({
  args: {
    question: v.string(),
    answer: v.string(),
    sources: v.array(v.string()),
    ms: v.number(),
    ok: v.boolean(),
    visitor: v.optional(v.string()),
    day: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.insert("questions", args);
    return null;
  },
});

/** Owner-only (deploy key): delete stored question rows by id — used once to remove
 *  legitimate questions kept before the probe-only rule. */
export const deleteQuestions = internalMutation({
  args: { ids: v.array(v.id("questions")) },
  returns: v.number(),
  handler: async (ctx, { ids }) => {
    let n = 0;
    for (const id of ids) {
      if (await ctx.db.get(id)) {
        await ctx.db.delete(id);
        n++;
      }
    }
    return n;
  },
});

/** Public knowledge-base stats shown in the UI. */
export const stats = query({
  args: {},
  returns: v.object({
    docs: v.number(),
    lastSync: v.union(v.number(), v.null()),
  }),
  handler: async ctx => {
    const docs = await ctx.db.query("documents").collect();
    const last = await ctx.db.query("syncRuns").order("desc").first();
    return { docs: docs.length, lastSync: last?.finishedAt ?? null };
  },
});

export const countDocs = internalQuery({
  args: {},
  returns: v.number(),
  handler: async ctx => (await ctx.db.query("documents").collect()).length,
});
