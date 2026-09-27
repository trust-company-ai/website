import { v } from "convex/values";
import { internal } from "./_generated/api";
import type { Doc } from "./_generated/dataModel";
import {
  internalAction,
  internalMutation,
  internalQuery,
  type MutationCtx,
} from "./_generated/server";
import { gh, REPO, REPO_WEB } from "./tools";

const SKIP_PREFIXES = [".github/"];
const SKIP_FILES = ["LICENSE"];
const MAX_CHUNK = 1400;

type TreeEntry = { path: string; type: string; sha: string };

function titleFrom(md: string, path: string): string {
  const m = md.match(/^#\s+(.+)$/m);
  return (m ? m[1] : (path.split("/").pop() ?? path)).trim();
}

/** Split markdown by headings, then by size. Returns [heading, text] pairs. */
export function chunkMarkdown(md: string): { heading: string; text: string }[] {
  const lines = md.split("\n");
  const sections: { heading: string; body: string[] }[] = [];
  let cur = { heading: "Introduction", body: [] as string[] };
  for (const line of lines) {
    const h = line.match(/^#{1,3}\s+(.+)$/);
    if (h) {
      if (cur.body.join("\n").trim()) sections.push(cur);
      cur = { heading: h[1].trim(), body: [] };
    } else {
      cur.body.push(line);
    }
  }
  if (cur.body.join("\n").trim()) sections.push(cur);

  const out: { heading: string; text: string }[] = [];
  for (const s of sections) {
    const body = s.body.join("\n").trim();
    if (!body) continue;
    if (body.length <= MAX_CHUNK) {
      out.push({ heading: s.heading, text: `${s.heading}\n${body}` });
      continue;
    }
    const paras = body.split(/\n\s*\n/);
    let buf = "";
    for (const p of paras) {
      if ((buf + p).length > MAX_CHUNK && buf) {
        out.push({ heading: s.heading, text: `${s.heading}\n${buf.trim()}` });
        buf = "";
      }
      buf += `${p}\n\n`;
    }
    if (buf.trim())
      out.push({ heading: s.heading, text: `${s.heading}\n${buf.trim()}` });
  }
  return out;
}

export const listDocs = internalQuery({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("documents"),
      path: v.string(),
      sha: v.string(),
      source: v.optional(v.string()),
    }),
  ),
  handler: async ctx => {
    const docs = await ctx.db.query("documents").collect();
    return docs.map((d: Doc<"documents">) => ({
      _id: d._id,
      path: d.path,
      sha: d.sha,
      source: d.source,
    }));
  },
});

export const upsertDoc = internalMutation({
  args: {
    path: v.string(),
    title: v.string(),
    sha: v.string(),
    chunks: v.array(v.object({ heading: v.string(), text: v.string() })),
  },
  returns: v.number(),
  handler: async (ctx, { path, title, sha, chunks }) => {
    const url = REPO_WEB + path;
    const existing = await ctx.db
      .query("documents")
      .withIndex("by_path", q => q.eq("path", path))
      .unique();
    let docId: Doc<"documents">["_id"];
    if (existing) {
      docId = existing._id;
      // Now backed by the repo: clear any "contribution" marker.
      await ctx.db.patch(docId, {
        title,
        url,
        sha,
        updatedAt: Date.now(),
        source: undefined,
      });
      const old = await ctx.db
        .query("chunks")
        .withIndex("by_doc", q => q.eq("docId", docId))
        .collect();
      for (const c of old) await ctx.db.delete(c._id);
    } else {
      docId = await ctx.db.insert("documents", {
        path,
        title,
        url,
        sha,
        updatedAt: Date.now(),
      });
    }
    let i = 0;
    for (const c of chunks) {
      await ctx.db.insert("chunks", {
        docId,
        path,
        title,
        url,
        heading: c.heading,
        text: c.text,
        order: i++,
      });
    }
    return chunks.length;
  },
});

/** Index a markdown document (replaces any previous version at the same path). */
export async function indexMarkdown(
  ctx: MutationCtx,
  path: string,
  sha: string,
  markdown: string,
  source?: string,
): Promise<number> {
  const chunks = chunkMarkdown(markdown);
  const title = titleFrom(markdown, path);
  const url = REPO_WEB + path;
  const existing = await ctx.db
    .query("documents")
    .withIndex("by_path", q => q.eq("path", path))
    .unique();
  let docId: Doc<"documents">["_id"];
  if (existing) {
    docId = existing._id;
    await ctx.db.patch(docId, {
      title,
      url,
      sha,
      updatedAt: Date.now(),
      source,
    });
    const old = await ctx.db
      .query("chunks")
      .withIndex("by_doc", q => q.eq("docId", docId))
      .collect();
    for (const c of old) await ctx.db.delete(c._id);
  } else {
    docId = await ctx.db.insert("documents", {
      path,
      title,
      url,
      sha,
      updatedAt: Date.now(),
      source,
    });
  }
  let i = 0;
  for (const c of chunks) {
    await ctx.db.insert("chunks", {
      docId,
      path,
      title,
      url,
      heading: c.heading,
      text: c.text,
      order: i++,
    });
  }
  return chunks.length;
}

/** Push a file's markdown from outside (used while the repo is private). */
export const ingestMarkdown = internalMutation({
  args: { path: v.string(), sha: v.string(), markdown: v.string() },
  returns: v.number(),
  handler: async (ctx, { path, sha, markdown }): Promise<number> =>
    indexMarkdown(ctx, path, sha, markdown),
});

export const deleteDoc = internalMutation({
  args: { docId: v.id("documents") },
  returns: v.null(),
  handler: async (ctx, { docId }) => {
    const old = await ctx.db
      .query("chunks")
      .withIndex("by_doc", q => q.eq("docId", docId))
      .collect();
    for (const c of old) await ctx.db.delete(c._id);
    await ctx.db.delete(docId);
    return null;
  },
});

export const recordRun = internalMutation({
  args: {
    runId: v.optional(v.id("syncRuns")),
    docs: v.number(),
    chunks: v.number(),
    status: v.string(),
    error: v.optional(v.string()),
  },
  returns: v.id("syncRuns"),
  handler: async (ctx, { runId, docs, chunks, status, error }) => {
    if (runId) {
      await ctx.db.patch(runId, {
        docs,
        chunks,
        status,
        error,
        finishedAt: Date.now(),
      });
      return runId;
    }
    return await ctx.db.insert("syncRuns", {
      startedAt: Date.now(),
      docs,
      chunks,
      status,
      error,
    });
  },
});

/** Pull every markdown file from the GitHub repo and re-index changed ones. */
export const syncRepo = internalAction({
  args: {},
  returns: v.object({
    docs: v.number(),
    chunks: v.number(),
    changed: v.number(),
  }),
  handler: async ctx => {
    const runId = await ctx.runMutation(internal.sync.recordRun, {
      docs: 0,
      chunks: 0,
      status: "running",
    });
    try {
      const treeJson = await gh(`repos/${REPO}/git/trees/HEAD?recursive=1`);
      const tree = JSON.parse(treeJson).tree as TreeEntry[];
      const files = tree.filter(
        e =>
          e.type === "blob" &&
          e.path.toLowerCase().endsWith(".md") &&
          !SKIP_PREFIXES.some(p => e.path.startsWith(p)) &&
          !SKIP_FILES.includes(e.path),
      );
      const existing = await ctx.runQuery(internal.sync.listDocs, {});
      const bySha = new Map(existing.map(d => [d.path, d]));
      let changed = 0;
      let chunkTotal = 0;
      for (const f of files) {
        const prev = bySha.get(f.path);
        if (prev && prev.sha === f.sha) {
          continue;
        }
        const md = await gh(`repos/${REPO}/contents/${f.path}`, true);
        const chunks = chunkMarkdown(md);
        chunkTotal += await ctx.runMutation(internal.sync.upsertDoc, {
          path: f.path,
          title: titleFrom(md, f.path),
          sha: f.sha,
          chunks,
        });
        changed++;
      }
      // Remove docs deleted from the repo (approved contributions stay until
      // they are committed to the repo, then become ordinary repo docs).
      const livePaths = new Set(files.map(f => f.path));
      for (const d of existing) {
        if (!livePaths.has(d.path) && d.source !== "contribution")
          await ctx.runMutation(internal.sync.deleteDoc, { docId: d._id });
      }
      await ctx.runMutation(internal.sync.recordRun, {
        runId,
        docs: files.length,
        chunks: chunkTotal,
        status: "ok",
      });
      return { docs: files.length, chunks: chunkTotal, changed };
    } catch (e) {
      await ctx.runMutation(internal.sync.recordRun, {
        runId,
        docs: 0,
        chunks: 0,
        status: "error",
        error: String(e),
      });
      throw e;
    }
  },
});
