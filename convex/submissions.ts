import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import {
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { assertReviewKey, reviewKey, webhookSecret } from "./reviewKey";
import { indexMarkdown } from "./sync";

export const MAX_CHARS = 40_000;
const KINDS = ["lesson", "framework", "template", "other"] as const;
const KIND_LABEL: Record<string, string> = {
  lesson: "Lesson learned",
  framework: "Framework",
  template: "Template",
  other: "Other",
};

const assertKey = assertReviewKey;

function slugify(s: string): string {
  return (
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "contribution"
  );
}

/** The submitter sends their text as written → queued for approval. */
export const submit = mutation({
  args: {
    title: v.string(),
    kind: v.string(),
    markdown: v.string(),
    contact: v.optional(v.string()),
  },
  returns: v.id("submissions"),
  handler: async (ctx, args) => {
    const title = args.title.trim().slice(0, 120);
    const markdown = args.markdown.trim().slice(0, MAX_CHARS);
    if (title.length < 3) throw new Error("Please add a title.");
    if (markdown.length < 40) throw new Error("Please add a bit more text.");
    const kind = (KINDS as readonly string[]).includes(args.kind)
      ? args.kind
      : "other";
    // Light abuse guard: at most 20 pending items at a time.
    const pending = await ctx.db
      .query("submissions")
      .withIndex("by_status", q => q.eq("status", "pending"))
      .take(21);
    if (pending.length > 20)
      throw new Error(
        "The review queue is full right now — please try again later.",
      );
    return await ctx.db.insert("submissions", {
      title,
      kind,
      markdown,
      contact: args.contact?.trim().slice(0, 200) || undefined,
      status: "pending",
    });
  },
});

const submissionValidator = v.object({
  _id: v.id("submissions"),
  _creationTime: v.number(),
  title: v.string(),
  kind: v.string(),
  kindLabel: v.string(),
  markdown: v.string(),
  contact: v.optional(v.string()),
  status: v.string(),
  note: v.optional(v.string()),
  decidedAt: v.optional(v.number()),
  path: v.optional(v.string()),
});

function shape(d: Doc<"submissions">) {
  return {
    _id: d._id,
    _creationTime: d._creationTime,
    title: d.title,
    kind: d.kind,
    kindLabel: KIND_LABEL[d.kind] ?? "Other",
    markdown: d.markdown,
    contact: d.contact,
    status: d.status,
    note: d.note,
    decidedAt: d.decidedAt,
    path: d.path,
  };
}

/** Reviewer view: needs the review key. */
export const list = query({
  args: { key: v.string(), status: v.optional(v.string()) },
  returns: v.array(submissionValidator),
  handler: async (ctx, { key, status }) => {
    assertKey(key);
    const rows = await ctx.db
      .query("submissions")
      .withIndex("by_status", q => q.eq("status", status ?? "pending"))
      .order("desc")
      .take(100);
    return rows.map(shape);
  },
});

/** Public: how many items are waiting (shown nowhere sensitive). */
export const pendingCount = query({
  args: { key: v.string() },
  returns: v.number(),
  handler: async (ctx, { key }) => {
    assertKey(key);
    const rows = await ctx.db
      .query("submissions")
      .withIndex("by_status", q => q.eq("status", "pending"))
      .take(100);
    return rows.length;
  },
});

/** Reviewer decision. Approve = publish into the knowledge base immediately. */
export const decide = mutation({
  args: {
    key: v.string(),
    id: v.id("submissions"),
    approve: v.boolean(),
    markdown: v.optional(v.string()), // reviewer edits
    title: v.optional(v.string()),
    note: v.optional(v.string()),
  },
  returns: v.object({ status: v.string(), path: v.optional(v.string()) }),
  handler: async (ctx, { key, id, approve, markdown, title, note }) => {
    assertKey(key);
    const sub = await ctx.db.get(id);
    if (!sub) throw new Error("Submission not found");
    if (sub.status !== "pending") throw new Error("Already decided");
    const finalTitle = (title ?? sub.title).trim().slice(0, 120);
    const finalMd = (markdown ?? sub.markdown).trim();
    if (!approve) {
      await ctx.db.patch(id, {
        status: "rejected",
        note,
        decidedAt: Date.now(),
        title: finalTitle,
        markdown: finalMd,
      });
      return { status: "rejected", path: undefined };
    }
    const date = new Date().toISOString().slice(0, 10);
    const path = `contributions/${date}-${slugify(finalTitle)}.md`;
    const doc = renderContribution(finalTitle, sub.kind, finalMd, date);
    await indexMarkdown(ctx, path, `contribution-${id}`, doc, "contribution");
    await ctx.db.patch(id, {
      status: "approved",
      note,
      decidedAt: Date.now(),
      title: finalTitle,
      markdown: finalMd,
      path,
    });
    return { status: "approved", path };
  },
});

/** The markdown file exactly as it will be committed to the repo. */
export function renderContribution(
  title: string,
  kind: string,
  markdown: string,
  date: string,
): string {
  const body = markdown.replace(/^#\s+.+\n+/, ""); // drop duplicate H1
  return `# ${title}

*${KIND_LABEL[kind] ?? "Contribution"} · contributed by a member trust company · added ${date}*

${body.trim()}
`;
}

/** Used by the operator script: approved items with the file to commit. */
export const approvedForExport = query({
  args: { key: v.string() },
  returns: v.array(
    v.object({
      _id: v.id("submissions"),
      path: v.string(),
      title: v.string(),
      file: v.string(),
      decidedAt: v.number(),
    }),
  ),
  handler: async (ctx, { key }) => {
    assertKey(key);
    const rows = await ctx.db
      .query("submissions")
      .withIndex("by_status", q => q.eq("status", "approved"))
      .order("desc")
      .take(200);
    return rows
      .filter(r => r.path)
      .map(r => ({
        _id: r._id,
        path: r.path as string,
        title: r.title,
        file: renderContribution(
          r.title,
          r.kind,
          r.markdown,
          new Date(r.decidedAt ?? r._creationTime).toISOString().slice(0, 10),
        ),
        decidedAt: r.decidedAt ?? r._creationTime,
      }));
  },
});

/** Operator-only (deploy key): the current review key for this deployment. */
export const _reviewKey = internalQuery({
  args: {},
  returns: v.string(),
  handler: async () => reviewKey(),
});

/** Operator-only (deploy key): the GitHub webhook secret for this deployment. */
export const _webhookSecret = internalQuery({
  args: {},
  returns: v.string(),
  handler: async () => webhookSecret(),
});

// Test helpers (internal only)
export const _seed = internalMutation({
  args: {},
  returns: v.id("submissions"),
  handler: async ctx =>
    ctx.db.insert("submissions", {
      title: "Test submission",
      kind: "lesson",
      markdown: "Introduction\n\nA test lesson learned about access controls.",
      status: "pending",
    }),
});
export const _get = internalQuery({
  args: { id: v.id("submissions") },
  returns: v.union(v.null(), submissionValidator),
  handler: async (ctx, { id }) => {
    const d = await ctx.db.get(id);
    return d ? shape(d) : null;
  },
});
