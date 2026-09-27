import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { internalMutation, internalQuery, query } from "./_generated/server";

/** Daily limits (reset at midnight America/Los_Angeles). */
export const VISITOR_DAILY_LIMIT = 100; // questions per person per day (keyed by the sign-in email; browser id when no email)
export const USER_DAILY_LIMIT = 100; // questions per signed-in account per day
export const GLOBAL_DAILY_LIMIT = 1000; // questions per day across everyone — chat stops for the day at this number

/** Today's date as YYYY-MM-DD in Los Angeles time. */
export function todayLA(now = Date.now()): string {
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Los_Angeles",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date(now));
  } catch {
    // Fallback: fixed UTC-7
    return new Date(now - 7 * 3600 * 1000).toISOString().slice(0, 10);
  }
}

async function bump(
  ctx: { db: any },
  key: string,
  day: string,
  limit: number,
): Promise<{ allowed: boolean; count: number }> {
  const row = await ctx.db
    .query("usage")
    .withIndex("by_key_day", (q: any) => q.eq("key", key).eq("day", day))
    .unique();
  const count = row ? row.count : 0;
  if (count >= limit) return { allowed: false, count };
  if (row) await ctx.db.patch(row._id, { count: count + 1 });
  else await ctx.db.insert("usage", { key, day, count: count + 1 });
  return { allowed: true, count: count + 1 };
}

/** Normalised sign-in email (see Gate.tsx / lib/gate.ts) or "" when unknown. */
export function cleanEmail(email: string | undefined): string {
  const e = (email ?? "").trim().toLowerCase().slice(0, 120);
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) ? e : "";
}

/** Usage-counter key for one person: account id, else sign-in email, else browser id. */
export function personKey(visitor: string, user: string | undefined, email: string | undefined): string {
  if (user) return `user:${user}`;
  const e = cleanEmail(email);
  return e ? `email:${e}` : `visitor:${visitor}`;
}

/**
 * Check-and-count one question. Atomic (single mutation), so parallel
 * requests cannot slip past the limit.
 */
export const take = internalMutation({
  args: { visitor: v.string(), user: v.optional(v.string()), email: v.optional(v.string()) },
  returns: v.object({
    allowed: v.boolean(),
    reason: v.union(v.literal("ok"), v.literal("visitor"), v.literal("global")),
    visitorCount: v.number(),
    globalCount: v.number(),
    day: v.string(),
  }),
  handler: async (ctx, { visitor, user, email }) => {
    const day = todayLA();
    const g = await ctx.db
      .query("usage")
      .withIndex("by_key_day", q => q.eq("key", "all").eq("day", day))
      .unique();
    const globalCount = g ? g.count : 0;
    if (globalCount >= GLOBAL_DAILY_LIMIT) {
      return { allowed: false, reason: "global" as const, visitorCount: 0, globalCount, day };
    }
    const person = personKey(visitor, user, email);
    const vis = await bump(ctx, person, day, user ? USER_DAILY_LIMIT : VISITOR_DAILY_LIMIT);
    if (!vis.allowed) {
      return { allowed: false, reason: "visitor" as const, visitorCount: vis.count, globalCount, day };
    }
    const all = await bump(ctx, "all", day, Number.MAX_SAFE_INTEGER);
    return { allowed: true, reason: "ok" as const, visitorCount: vis.count, globalCount: all.count, day };
  },
});

/** How many questions this browser has left today (shown in the chat UI). */
export const remaining = query({
  args: { visitor: v.string(), email: v.optional(v.string()) },
  returns: v.object({
    left: v.number(),
    limit: v.number(),
    signedIn: v.boolean(),
  }),
  handler: async (ctx, { visitor, email }) => {
    const day = todayLA();
    const userId = await getAuthUserId(ctx);
    const key = personKey(visitor, userId ?? undefined, email);
    const limit = userId ? USER_DAILY_LIMIT : VISITOR_DAILY_LIMIT;
    const row = await ctx.db
      .query("usage")
      .withIndex("by_key_day", q => q.eq("key", key).eq("day", day))
      .unique();
    const used = row ? row.count : 0;
    return { left: Math.max(0, limit - used), limit, signedIn: Boolean(userId) };
  },
});

/**
 * Operator report (deploy key only, via query_app_database): questions asked
 * since a timestamp, plus today's counters. Used for the owner's usage digest.
 */
export const usageReport = internalQuery({
  args: { since: v.number() },
  returns: v.object({
    day: v.string(),
    todayTotal: v.number(),
    visitorLimit: v.number(),
    userLimit: v.number(),
    globalLimit: v.number(),
    questions: v.array(
      v.object({
        id: v.string(),
        at: v.number(),
        visitor: v.string(),
        question: v.string(),
        answer: v.string(),
        ok: v.boolean(),
        sources: v.number(),
        sourceList: v.array(v.string()),
        ms: v.number(),
      }),
    ),
  }),
  handler: async (ctx, { since }) => {
    const day = todayLA();
    const g = await ctx.db
      .query("usage")
      .withIndex("by_key_day", q => q.eq("key", "all").eq("day", day))
      .unique();
    const rows = await ctx.db
      .query("questions")
      .order("desc")
      .filter(q => q.gt(q.field("_creationTime"), since))
      .take(200);
    return {
      day,
      todayTotal: g ? g.count : 0,
      visitorLimit: VISITOR_DAILY_LIMIT,
      userLimit: USER_DAILY_LIMIT,
      globalLimit: GLOBAL_DAILY_LIMIT,
      questions: rows.map(r => ({
        id: r._id,
        at: r._creationTime,
        visitor: r.visitor ?? "unknown",
        question: r.question,
        answer: r.answer,
        ok: r.ok,
        sources: r.sources.length,
        sourceList: r.sources,
        ms: r.ms,
      })),
    };
  },
});
