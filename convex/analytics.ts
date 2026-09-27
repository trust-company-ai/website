import { v } from "convex/values";
import { internalQuery, mutation } from "./_generated/server";
import { todayLA } from "./limits";

/**
 * Plain page-view counter. No cookies, no IP, no user agent — one row per
 * page load with the path, the day (Los Angeles) and the same random
 * per-browser id the question limit uses. Numbers are read only by the owner
 * through the internal `report` query.
 */
const MAX_PATH = 200;

export const hit = mutation({
  args: { path: v.string(), visitor: v.string() },
  returns: v.null(),
  handler: async (ctx, { path, visitor }) => {
    if (!path.startsWith("/") || path.length > MAX_PATH) return null;
    if (visitor.length > 64) return null;
    await ctx.db.insert("pageviews", { path, visitor, day: todayLA() });
    return null;
  },
});

/** Views + distinct visitors per day and per page for an inclusive day range (YYYY-MM-DD). */
export const report = internalQuery({
  args: { fromDay: v.string(), toDay: v.string() },
  returns: v.object({
    views: v.number(),
    visitors: v.number(),
    days: v.array(v.object({ day: v.string(), views: v.number(), visitors: v.number() })),
    pages: v.array(v.object({ path: v.string(), views: v.number() })),
  }),
  handler: async (ctx, { fromDay, toDay }) => {
    const rows = await ctx.db
      .query("pageviews")
      .withIndex("by_day", q => q.gte("day", fromDay).lte("day", toDay))
      .collect();
    const all = new Set<string>();
    const byDay = new Map<string, { views: number; v: Set<string> }>();
    const byPath = new Map<string, number>();
    for (const r of rows) {
      all.add(r.visitor);
      const d = byDay.get(r.day) ?? { views: 0, v: new Set<string>() };
      d.views += 1;
      d.v.add(r.visitor);
      byDay.set(r.day, d);
      byPath.set(r.path, (byPath.get(r.path) ?? 0) + 1);
    }
    return {
      views: rows.length,
      visitors: all.size,
      days: [...byDay.entries()]
        .sort(([a], [b]) => (a < b ? -1 : 1))
        .map(([day, d]) => ({ day, views: d.views, visitors: d.v.size })),
      pages: [...byPath.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20)
        .map(([path, views]) => ({ path, views })),
    };
  },
});
