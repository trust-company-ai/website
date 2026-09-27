import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";
import { todayLA } from "./limits";

/** Called by gate:unlock on every successful sign-in; `name` = which password opened the site. */
export const record = internalMutation({
  args: { name: v.string() },
  returns: v.null(),
  handler: async (ctx, { name }) => {
    const at = Date.now();
    await ctx.db.insert("signins", {
      name: name.slice(0, 160),
      day: todayLA(at),
      at,
    });
    return null;
  },
});

/** Owner read-out for the usage digest: sign-ins after `since` (ms), oldest first. */
export const report = internalQuery({
  args: { since: v.number() },
  returns: v.array(
    v.object({ name: v.string(), at: v.number(), day: v.string() }),
  ),
  handler: async (ctx, { since }) => {
    const rows = await ctx.db
      .query("signins")
      .withIndex("by_at", q => q.gt("at", since))
      .order("asc")
      .take(1000);
    return rows.map(r => ({ name: r.name, at: r.at, day: r.day }));
  },
});
