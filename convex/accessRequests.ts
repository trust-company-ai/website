import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { normalizeEmail } from "./accounts";
import { assertReviewKey } from "./reviewKey";

export const ROLES = ["executive", "regulator", "vendor", "other"] as const;

/** Store a password request from the splash-page form. A sync job forwards new requests. */
export const submit = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    role: v.string(),
    roleOther: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, a) => {
    const name = a.name.trim().slice(0, 200);
    const email = normalizeEmail(a.email);
    const roleOther = a.roleOther?.trim().slice(0, 200) || undefined;
    if (name.length < 2) throw new Error("Please enter your name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      throw new Error("Please enter a valid email address.");
    if (!(ROLES as readonly string[]).includes(a.role))
      throw new Error("Please choose one of the options.");
    if (a.role === "other" && !roleOther) throw new Error("Please specify.");
    await ctx.db.insert("accessRequests", {
      name,
      email,
      role: a.role,
      roleOther: a.role === "other" ? roleOther : undefined,
      status: "new",
    });
    return null;
  },
});

/** Owner-only list. */
export const list = query({
  args: { key: v.string(), status: v.optional(v.string()) },
  handler: async (ctx, { key, status }) => {
    assertReviewKey(key);
    return status
      ? await ctx.db
          .query("accessRequests")
          .withIndex("by_status", q => q.eq("status", status))
          .order("desc")
          .take(200)
      : await ctx.db.query("accessRequests").order("desc").take(200);
  },
});

/** Owner-only: mark as delivered once it reached the owner. */
export const markDelivered = mutation({
  args: { key: v.string(), ids: v.array(v.id("accessRequests")) },
  returns: v.null(),
  handler: async (ctx, { key, ids }) => {
    assertReviewKey(key);
    for (const id of ids) await ctx.db.patch(id, { status: "delivered" });
    return null;
  },
});
