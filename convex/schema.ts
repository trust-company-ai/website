import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const schema = defineSchema({
  ...authTables,
  documents: defineTable({
    path: v.string(),
    title: v.string(),
    url: v.string(),
    sha: v.string(),
    updatedAt: v.number(),
    // "contribution" = approved member submission, not (yet) in the GitHub repo.
    source: v.optional(v.string()),
  }).index("by_path", ["path"]),
  chunks: defineTable({
    docId: v.id("documents"),
    path: v.string(),
    title: v.string(),
    url: v.string(),
    heading: v.string(),
    text: v.string(),
    order: v.number(),
  })
    .index("by_doc", ["docId"])
    .searchIndex("search_text", { searchField: "text" }),
  questions: defineTable({
    question: v.string(),
    answer: v.string(),
    sources: v.array(v.string()),
    ms: v.number(),
    ok: v.boolean(),
    visitor: v.optional(v.string()), // anonymous per-browser id, never personal
    day: v.optional(v.string()), // YYYY-MM-DD in America/Los_Angeles
  }).index("by_day", ["day"]),
  // Daily question counters: one row per (key, day). key = "visitor:<id>" or "all".
  usage: defineTable({
    key: v.string(),
    day: v.string(),
    count: v.number(),
  }).index("by_key_day", ["key", "day"]),
  // Page views: one row per page load. No cookies / IP / user agent.
  pageviews: defineTable({
    path: v.string(),
    visitor: v.string(), // same anonymous per-browser id as the question limit
    day: v.string(), // YYYY-MM-DD in America/Los_Angeles
  }).index("by_day", ["day"]),
  submissions: defineTable({
    title: v.string(),
    kind: v.string(), // lesson | framework | template | other
    markdown: v.string(), // the text exactly as the submitter sent it
    changes: v.optional(v.array(v.string())), // legacy field from the removed anonymize step; unused
    contact: v.optional(v.string()), // reviewer-only, never published
    status: v.string(), // pending | approved | rejected
    note: v.optional(v.string()),
    decidedAt: v.optional(v.number()),
    path: v.optional(v.string()), // knowledge-base path once approved
  }).index("by_status", ["status"]),
  // Free-form messages from the "Send us your thoughts" form (+ attachments).
  messages: defineTable({
    subject: v.optional(v.string()), // "contains confidential information" = keep private
    message: v.string(),
    name: v.optional(v.string()),
    organization: v.optional(v.string()),
    email: v.optional(v.string()), // owner-only, never published
    files: v.array(
      v.object({
        storageId: v.id("_storage"),
        name: v.string(),
        size: v.number(),
      }),
    ),
    acknowledged: v.boolean(), // "may become public on the website" — accepted
    status: v.string(), // new | delivered
  }).index("by_status", ["status"]),
  // "Contact us for a password" form on the splash page. Owner-only, never published.
  accessRequests: defineTable({
    name: v.string(),
    organization: v.optional(v.string()),
    email: v.string(),
    role: v.optional(v.string()), // older rows only
    roleOther: v.optional(v.string()), // older rows only
    password: v.optional(v.string()), // older rows only
    status: v.string(), // new | delivered
  }).index("by_status", ["status"]),
  // Site settings, e.g. the hash of the site password (never the password itself).
  // Wrong front-door passwords per visitor (IP and browser). 10 wrong = locked out.
  gateFails: defineTable({
    client: v.string(),
    fails: v.number(),
    lastAt: v.number(),
    site: v.optional(v.string()),
    ip: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    lockedAt: v.optional(v.number()),
    notified: v.optional(v.boolean()),
  })
    .index("by_client", ["client"])
    .index("by_notified", ["notified"]),
  settings: defineTable({
    key: v.string(),
    value: v.string(),
  }).index("by_key", ["key"]),
  // Earlier form-created logins; no longer used by the gate.
  accounts: defineTable({
    email: v.string(),
    name: v.string(),
    password: v.string(),
    role: v.optional(v.string()),
  }).index("by_email", ["email"]),
  // Sign-ins with the site password (count and time only).
  // Owner-only, never published; not linked to questions (legitimate questions are not stored).
  signins: defineTable({
    name: v.string(),
    day: v.string(), // YYYY-MM-DD in America/Los_Angeles
    at: v.number(),
  }).index("by_at", ["at"]),
  syncRuns: defineTable({
    startedAt: v.number(),
    finishedAt: v.optional(v.number()),
    docs: v.number(),
    chunks: v.number(),
    status: v.string(),
    error: v.optional(v.string()),
  }),
});

export default schema;
