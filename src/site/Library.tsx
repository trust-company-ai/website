import { useQuery } from "convex/react";
import { ArrowLeft, FileText } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Link, useParams } from "react-router";
import remarkGfm from "remark-gfm";
import { Mermaid } from "./Mermaid";
import { SITE_STATS } from "./siteStats";

/** Resolve a repo-relative URL (as written in the markdown) against the doc's path. */
function resolveRepoUrl(url: string, docPath: string): string {
  if (/^([a-z]+:)?\/\//i.test(url) || url.startsWith("#") || url.startsWith("/"))
    return url;
  const base = new URL(docPath, "https://x/");
  return new URL(url, base).pathname.replace(/^\//, "");
}

/** Raw-file URL on GitHub for images referenced from a repo document. */
export function rawRepoUrl(url: string, docPath: string): string {
  const resolved = resolveRepoUrl(url, docPath);
  if (resolved === url) return url;
  const repo = SITE_STATS.githubUrl.replace("https://github.com/", "");
  return `https://raw.githubusercontent.com/${repo}/main/${resolved}`;
}

import { api } from "../../convex/_generated/api";
import { Page } from "./SiteShell";

export function readLink(path: string) {
  return `/read/${path}`;
}

function fmtDate(ms: number) {
  return new Date(ms).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** List of documents under a folder — used on Frameworks / Lessons / Templates. */
export function DocList({
  prefix,
  empty,
  badge,
}: {
  prefix: string;
  empty: string;
  badge?: (source: string | null) => string | null;
}) {
  const docs = useQuery(api.library.listByPrefix, { prefix });
  if (docs === undefined)
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (docs.length === 0)
    return <p className="text-muted-foreground italic">{empty}</p>;
  return (
    <ul
      className="grid gap-4 sm:grid-cols-2"
      data-testid={`doclist-${prefix.replace(/\W/g, "")}`}
    >
      {docs.map(d => {
        const b = badge?.(d.source);
        return (
          <li key={d.path}>
            <Link
              to={readLink(d.path)}
              className="group block h-full rounded-2xl bg-secondary p-6 hover:bg-accent transition"
            >
              <div className="flex items-start gap-3">
                <FileText className="size-5 mt-0.5 text-muted-foreground shrink-0" />
                <div className="space-y-1.5 min-w-0">
                  <h3 className="font-medium leading-snug group-hover:underline">
                    {d.title}
                  </h3>
                  {d.summary && (
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {d.summary}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground pt-1">
                    Updated {fmtDate(d.updatedAt)}
                    {b ? ` · ${b}` : ""}
                  </p>
                </div>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

const mdComponents: React.ComponentProps<typeof ReactMarkdown>["components"] = {
  h1: p => (
    <h2 className="text-2xl font-semibold tracking-tight mt-8 mb-3" {...p} />
  ),
  h2: p => (
    <h3 className="text-xl font-semibold tracking-tight mt-8 mb-3" {...p} />
  ),
  h3: p => <h4 className="font-semibold mt-6 mb-2" {...p} />,
  p: p => <p className="my-3 leading-relaxed" {...p} />,
  ul: p => <ul className="my-3 pl-5 list-disc space-y-1.5" {...p} />,
  ol: p => <ol className="my-3 pl-5 list-decimal space-y-1.5" {...p} />,
  a: p => (
    <a
      className="underline underline-offset-2 hover:text-primary"
      target="_blank"
      rel="noreferrer"
      {...p}
    />
  ),
  blockquote: p => (
    <blockquote
      className="my-4 border-l-2 pl-4 text-muted-foreground italic"
      {...p}
    />
  ),
  table: p => (
    <div className="my-4 overflow-x-auto">
      <table className="w-full text-sm border-collapse" {...p} />
    </div>
  ),
  th: p => <th className="border-b text-left py-2 pr-4 font-semibold" {...p} />,
  td: p => <td className="border-b py-2 pr-4 align-top" {...p} />,
  code: ({ className, children, ...rest }) => {
    if (/language-mermaid/.test(className ?? ""))
      return <Mermaid code={String(children)} />;
    const block =
      /language-/.test(className ?? "") || String(children).includes("\n");
    if (block)
      return (
        <pre className="my-4 overflow-x-auto rounded-xl bg-muted p-4 text-[13px] leading-relaxed">
          <code {...rest}>{children}</code>
        </pre>
      );
    return (
      <code className="rounded bg-muted px-1.5 py-0.5 text-[0.9em]" {...rest}>
        {children}
      </code>
    );
  },
};

/** /read/<path> — a single document rendered on the site. */
export function ReadPage() {
  const params = useParams();
  const path = params["*"] ?? "";
  const doc = useQuery(api.library.getDoc, { path });

  const back = { to: "/library", label: "Library" };

  if (doc === undefined)
    return (
      <Page title="Loading…">
        <p className="text-muted-foreground">…</p>
      </Page>
    );
  if (doc === null)
    return (
      <Page title="Not found">
        <Link to={back.to} className="underline">
          Back to {back.label}
        </Link>
      </Page>
    );

  return (
    <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 py-10 sm:py-14">
      <Link
        to={back.to}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> {back.label}
      </Link>
      <header className="mt-6 mb-8 space-y-2 border-b pb-6">
        <h1
          className="text-3xl sm:text-4xl font-semibold tracking-tight"
          data-testid="doc-title"
        >
          {doc.title}
        </h1>
        <p className="text-sm text-muted-foreground">
          Updated {fmtDate(doc.updatedAt)}
          {doc.source === "contribution" ? " · Contribution" : ""}
          {" · Apache 2.0"}
        </p>
      </header>
      <article className="text-[17px]">
        {doc.sections.map((s, i) => (
          <section key={i}>
            {!(
              i === 0 &&
              (s.heading === "Introduction" || s.heading === doc.title)
            ) && (
              <h2 className="text-2xl font-semibold mt-10 mb-3 tracking-tight">
                {s.heading}
              </h2>
            )}
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                ...mdComponents,
                img: ({ src, alt }) => (
                  <img
                    src={rawRepoUrl(String(src ?? ""), path)}
                    alt={alt ?? ""}
                    className="my-6 mx-auto max-w-full h-auto"
                    loading="lazy"
                  />
                ),
              }}
            >
              {s.body}
            </ReactMarkdown>
          </section>
        ))}
      </article>
    </div>
  );
}
