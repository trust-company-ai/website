import { v } from "convex/values";
import { query } from "./_generated/server";

/**
 * Public, read-only view of the knowledge base for the website's
 * Frameworks / Lessons learned / Templates pages. Documents are
 * reconstructed from their indexed sections, so the site can show the
 * material even while the source repository is not public.
 */

const docSummary = v.object({
  path: v.string(),
  title: v.string(),
  updatedAt: v.number(),
  source: v.union(v.string(), v.null()),
  summary: v.string(),
});

function firstParagraph(text: string): string {
  // chunk text = "<heading>\n<body>"
  const body = text.split("\n").slice(1).join("\n").trim();
  const para = body
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .find(
      p =>
        p && !p.startsWith("#") && !p.startsWith("|") && !p.startsWith("```"),
    );
  const clean = (para ?? "")
    .replace(/[*_`>#]/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/\s+/g, " ");
  return clean.length > 220 ? `${clean.slice(0, 217).trimEnd()}…` : clean;
}

/** Documents under a folder prefix, e.g. "frameworks/" or "contributions/". */
export const listByPrefix = query({
  args: { prefix: v.string() },
  returns: v.array(docSummary),
  handler: async (ctx, { prefix }) => {
    const docs = await ctx.db.query("documents").collect();
    const out = [];
    for (const d of docs.filter(d => d.path.startsWith(prefix))) {
      const rel = d.path.slice(prefix.length);
      const name = rel.split("/").pop() ?? "";
      if (name.startsWith("_")) continue; // scaffolds
      // Folder indexes (README at the first two levels) are navigation, not content;
      // a README deeper down is the document of its own example folder.
      if (name === "README.md" && rel.split("/").length <= 2) continue;
      const first = await ctx.db
        .query("chunks")
        .withIndex("by_doc", q => q.eq("docId", d._id))
        .order("asc")
        .first();
      out.push({
        path: d.path,
        title: d.title,
        updatedAt: d.updatedAt,
        source: d.source ?? null,
        summary: first ? firstParagraph(first.text) : "",
      });
    }
    return out.sort((a, b) => a.path.localeCompare(b.path));
  },
});

/** A full document, rebuilt from its sections in order. */
export const getDoc = query({
  args: { path: v.string() },
  returns: v.union(
    v.null(),
    v.object({
      path: v.string(),
      title: v.string(),
      updatedAt: v.number(),
      source: v.union(v.string(), v.null()),
      sections: v.array(v.object({ heading: v.string(), body: v.string() })),
    }),
  ),
  handler: async (ctx, { path }) => {
    const doc = await ctx.db
      .query("documents")
      .withIndex("by_path", q => q.eq("path", path))
      .unique();
    if (!doc) return null;
    const chunks = await ctx.db
      .query("chunks")
      .withIndex("by_doc", q => q.eq("docId", doc._id))
      .collect();
    chunks.sort((a, b) => a.order - b.order);
    // Merge consecutive chunks that were split from one long section.
    const sections: { heading: string; body: string }[] = [];
    for (const c of chunks) {
      const body = c.text.split("\n").slice(1).join("\n").trim();
      const last = sections[sections.length - 1];
      if (last && last.heading === c.heading) last.body += `\n\n${body}`;
      else sections.push({ heading: c.heading, body });
    }
    return {
      path: doc.path,
      title: doc.title,
      updatedAt: doc.updatedAt,
      source: doc.source ?? null,
      sections,
    };
  },
});
