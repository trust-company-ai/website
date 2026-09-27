import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { assertReviewKey } from "./reviewKey";

export const MAX_MESSAGE_CHARS = 10_000;
export const MAX_FILES = 5;
export const MAX_FILE_BYTES = 15 * 1024 * 1024;

const fileArg = v.object({
  storageId: v.id("_storage"),
  name: v.string(),
  size: v.number(),
});

/** One short-lived upload URL per attachment (Convex file storage). */
export const generateUploadUrl = mutation({
  args: {},
  returns: v.string(),
  handler: async ctx => ctx.storage.generateUploadUrl(),
});

/** Store a message from the public form. Delivered to the owner by the sync job. */
export const send = mutation({
  args: {
    subject: v.optional(v.string()),
    message: v.string(),
    name: v.optional(v.string()),
    organization: v.optional(v.string()),
    email: v.optional(v.string()),
    files: v.array(fileArg),
    acknowledged: v.boolean(),
  },
  returns: v.id("messages"),
  handler: async (ctx, a) => {
    const message = a.message.trim();
    if (!a.acknowledged)
      throw new Error(
        "Please confirm you understand what you submit may become public.",
      );
    if (message.length < 2 && a.files.length === 0)
      throw new Error("Please write a message or attach a file.");
    if (message.length > MAX_MESSAGE_CHARS)
      throw new Error("Message too long.");
    if (a.files.length > MAX_FILES)
      throw new Error(`At most ${MAX_FILES} files.`);
    for (const f of a.files) {
      if (f.size > MAX_FILE_BYTES)
        throw new Error(`${f.name} is larger than 15 MB.`);
      const meta = await ctx.db.system.get(f.storageId);
      if (!meta)
        throw new Error(`Upload of ${f.name} did not finish. Please retry.`);
    }
    const clean = (s?: string) =>
      s?.trim() ? s.trim().slice(0, 200) : undefined;
    return await ctx.db.insert("messages", {
      subject: clean(a.subject),
      message,
      name: clean(a.name),
      organization: clean(a.organization),
      email: clean(a.email),
      files: a.files,
      acknowledged: true,
      status: "new",
    });
  },
});

/** Support button (inside pages): a short note to the site owner. Delivered by the sync job. */
export const support = mutation({
  args: { email: v.optional(v.string()), message: v.string() },
  returns: v.id("messages"),
  handler: async (ctx, a) => {
    const message = a.message.trim();
    if (message.length < 2) throw new Error("Please write what you need help with.");
    if (message.length > MAX_MESSAGE_CHARS) throw new Error("Message too long.");
    const email = a.email?.trim() ? a.email.trim().slice(0, 200) : undefined;
    return await ctx.db.insert("messages", {
      subject: "Support request",
      message,
      email,
      files: [],
      acknowledged: true,
      status: "new",
    });
  },
});

/** Owner-only: messages with signed download links for attachments. */
export const list = query({
  args: { key: v.string(), status: v.optional(v.string()) },
  handler: async (ctx, { key, status }) => {
    assertReviewKey(key);
    const rows = status
      ? await ctx.db
          .query("messages")
          .withIndex("by_status", q => q.eq("status", status))
          .order("desc")
          .take(100)
      : await ctx.db.query("messages").order("desc").take(100);
    return await Promise.all(
      rows.map(async r => ({
        ...r,
        files: await Promise.all(
          r.files.map(async f => ({
            ...f,
            url: await ctx.storage.getUrl(f.storageId),
          })),
        ),
      })),
    );
  },
});

/** Owner-only: mark as delivered once it reached the owner. */
export const markDelivered = mutation({
  args: { key: v.string(), ids: v.array(v.id("messages")) },
  returns: v.null(),
  handler: async (ctx, { key, ids }) => {
    assertReviewKey(key);
    for (const id of ids) await ctx.db.patch(id, { status: "delivered" });
    return null;
  },
});
