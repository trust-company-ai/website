import { useAuthActions } from "@convex-dev/auth/react";
import { useAction, useQuery } from "convex/react";
import {
  ArrowUp,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Loader2,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { getGateToken, getGateUser } from "@/lib/gate";
import { cn } from "@/lib/utils";
import { getVisitorId } from "@/lib/visitor";
import { api } from "../../../convex/_generated/api";

type Source = { title: string; heading: string; url: string; path: string };
type Alternative = { text: string; sources: Source[] };
type Msg = {
  role: "user" | "assistant";
  text: string;
  sources?: Source[];
  alternatives?: Alternative[];
  confident?: boolean;
};

const SUGGESTIONS = [
  "What is the reference architecture?",
  "What does OCC Bulletin 2026-13 mean for us?",
  "How do we keep client data out of model training?",
];

/** Tiny markdown: paragraphs, bullets, **bold**. Keeps the bundle small. */
function Rich({ text }: { text: string }) {
  const blocks = text
    .replace(/\\n/g, "\n")
    .trim()
    .split(/\n{2,}/);
  return (
    <div className="space-y-2.5">
      {blocks.map((b, i) => {
        const lines = b.split("\n");
        const isList = lines.every(l => /^\s*([-*•]|\d+\.)\s+/.test(l));
        if (isList) {
          return (
            <ul key={i} className="list-disc pl-5 space-y-1">
              {lines.map((l, j) => (
                <li key={j}>
                  <Inline text={l.replace(/^\s*([-*•]|\d+\.)\s+/, "")} />
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i}>
            <Inline text={lines.join(" ")} />
          </p>
        );
      })}
    </div>
  );
}

function Inline({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("**") && p.endsWith("**") ? (
          <strong key={i} className="font-semibold">
            {p.slice(2, -2)}
          </strong>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
}

function SourceList({ sources }: { sources: Source[] }) {
  return (
    <ul className="mt-1.5 space-y-1">
      {sources.map(s => (
        <li key={s.path}>
          <a
            href={`/read/${s.path}`}
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2 hover:text-foreground"
          >
            {s.title}
          </a>
          {s.heading && s.heading !== "Introduction" ? (
            <span> · {s.heading}</span>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

/**
 * Differing views from the shared material. Hidden behind a click so the
 * main answer stays the consensus; never blended into it.
 */
function Alternatives({ items }: { items: Alternative[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-3 pt-3 border-t border-foreground/10 text-sm">
      <button
        type="button"
        data-testid="alternatives-toggle"
        onClick={() => setOpen(o => !o)}
        className="inline-flex items-center gap-1 font-medium text-primary hover:underline underline-offset-2"
      >
        {open ? (
          <ChevronDown className="size-4" />
        ) : (
          <ChevronRight className="size-4" />
        )}
        {items.length === 1
          ? "1 source differs from this view"
          : `${items.length} sources differ from this view`}
        {open ? "" : " — show"}
      </button>
      {open && (
        <ul data-testid="alternatives" className="mt-2.5 space-y-3">
          {items.map((a, i) => (
            <li key={i} className="rounded-xl bg-secondary px-3.5 py-3">
              <Rich text={a.text} />
              {a.sources.length > 0 && (
                <div className="mt-2 text-xs text-muted-foreground">
                  <span className="uppercase tracking-wide font-medium">
                    Source{a.sources.length > 1 ? "s" : ""}
                  </span>
                  <SourceList sources={a.sources} />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function ChatPanel({
  compact = false,
  hero = false,
}: {
  compact?: boolean;
  /** Homepage: show only the question field until the first question is asked. */
  hero?: boolean;
}) {
  const ask = useAction(api.ask.ask);
  const stats = useQuery(api.kb.stats);
  const visitor = useMemo(getVisitorId, []);
  const email = useMemo(getGateUser, []);
  const quota = useQuery(api.limits.remaining, { visitor, email });
  const { signOut } = useAuthActions();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [expanded, setExpanded] = useState(false);
  useEffect(() => {
    if (!expanded) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setExpanded(false);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [expanded]);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const lastKey = `${msgs.length}-${busy}`;
  useEffect(() => {
    if (lastKey)
      endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [lastKey]);

  async function send(q: string) {
    const question = q.trim();
    if (!question || busy) return;
    setInput("");
    const history = msgs.map(m => ({ role: m.role, text: m.text }));
    setMsgs(m => [...m, { role: "user", text: question }]);
    setBusy(true);
    try {
      const r = await ask({
        question,
        history,
        visitor,
        email,
        gate: getGateToken(),
      });
      setMsgs(m => [
        ...m,
        {
          role: "assistant",
          text: r.answer,
          sources: r.sources,
          alternatives: r.alternatives ?? [],
          confident: r.confident,
        },
      ]);
    } catch {
      setMsgs(m => [
        ...m,
        {
          role: "assistant",
          text: "Sorry — something went wrong. Please try again.",
          sources: [],
          confident: false,
        },
      ]);
    } finally {
      setBusy(false);
      inputRef.current?.focus();
    }
  }

  const heroEmpty = hero && msgs.length === 0;
  const form = (
    <form
      className={cn(
        heroEmpty ? "contents" : "p-3 sm:p-4",
        expanded && "mx-auto w-full max-w-3xl",
      )}
      onSubmit={e => {
        e.preventDefault();
        send(input);
      }}
    >
      <div
        className={cn(
          heroEmpty
            ? "mt-6 flex min-h-[13rem] flex-col rounded-2xl border-2 border-navy/25 bg-white px-6 pt-5 pb-5 transition-colors hover:border-navy/60 focus-within:border-navy focus-within:ring-2 focus-within:ring-primary/30"
            : "flex items-end gap-2 rounded-full bg-background px-4 py-2 focus-within:ring-2 focus-within:ring-ring/40",
        )}
      >
        <textarea
          ref={inputRef}
          id={hero ? "hero-chat-input" : undefined}
          data-testid="chat-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send(input);
            }
          }}
          rows={heroEmpty ? 3 : 1}
          maxLength={600}
          placeholder="Ask the knowledge base"
          className={cn(
            "flex-1 resize-none bg-transparent outline-none leading-6 max-h-32 placeholder:text-muted-foreground",
            heroEmpty ? "text-[17px] leading-7 min-h-[4.5rem] text-ink" : "text-[15px]",
          )}
        />
        <div className={heroEmpty ? "mt-auto flex justify-end" : "contents"}>
          <button
            type="submit"
            data-testid="chat-send"
            disabled={busy || !input.trim()}
            aria-label="Send"
            className={cn(
              "rounded-full bg-primary text-primary-foreground flex items-center justify-center transition-opacity",
              heroEmpty
                ? "size-14 shadow-[0_8px_20px_-8px_rgba(29,63,138,.6)] disabled:opacity-100 disabled:shadow-none"
                : "size-8 disabled:opacity-40",
            )}
          >
            <ArrowUp className={heroEmpty ? "size-6" : "size-4"} />
          </button>
        </div>
      </div>
      <p
        className={cn(
          heroEmpty
            ? "mt-5 text-[15.5px] leading-[1.6] text-muted-foreground"
            : "mt-3 text-center text-[11px] text-muted-foreground",
        )}
      >
        Answers reflect shared community material and are not legal, tax or
        other advice.
        {!compact && !hero && stats && stats.docs > 0
          ? ` · ${stats.docs} files indexed`
          : ""}
        {quota?.signedIn ? (
          <>
            {" · "}
            <button
              type="button"
              onClick={() => void signOut()}
              className="underline hover:text-foreground"
            >
              Sign out
            </button>
          </>
        ) : null}
      </p>
    </form>
  );

  if (hero && msgs.length === 0) {
    return (
      <div data-testid="chat-panel" className="contents">
        <label
          htmlFor="hero-chat-input"
          className="block text-[1.5rem] sm:text-[1.7rem] font-semibold leading-[1.15] tracking-[-0.02em]"
        >
          Ask the knowledge base
        </label>
        {form}
      </div>
    );
  }

  return (
    <div
      data-testid="chat-panel"
      data-expanded={expanded ? "true" : undefined}
      className={cn(
        "flex flex-col bg-secondary text-card-foreground",
        expanded
          ? "fixed inset-0 z-[100] h-[100dvh] w-full rounded-none"
          : cn(
              "rounded-[1.5rem] overflow-hidden",
              compact
                ? "h-full"
                : hero
                  ? "h-[520px]"
                  : "h-[70vh] min-h-[480px]",
            ),
      )}
    >
      {(compact || hero) && (
        <div className="flex shrink-0 justify-end px-3 pt-2">
          <button
            type="button"
            data-testid="chat-fullscreen"
            aria-label={expanded ? "Exit full screen" : "Full screen"}
            title={expanded ? "Exit full screen" : "Full screen"}
            onClick={() => setExpanded(e => !e)}
            className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-background transition-colors"
          >
            {expanded ? (
              <>
                <Minimize2 className="size-3.5" /> Exit full screen
              </>
            ) : (
              <>
                <Maximize2 className="size-3.5" /> Full screen
              </>
            )}
          </button>
        </div>
      )}
      <div
        className={cn(
          "flex-1 overflow-y-auto px-4 py-5 sm:px-6",
          expanded && "[&>*]:mx-auto [&>*]:w-full [&>*]:max-w-3xl",
        )}
      >
        {msgs.length === 0 ? (
          <div
            className={cn(
              "h-full flex flex-col items-center text-center gap-6",
              compact ? "justify-start pt-6" : "justify-center",
            )}
          >
            <div className="size-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
              <BookOpen className="size-7" />
            </div>
            <div className="space-y-1.5 max-w-md">
              <p className="text-xl sm:text-2xl font-semibold leading-snug">
                Ask the community knowledge base
              </p>
              <p className="text-sm text-muted-foreground">
                Every answer links to its source. Every source comes from
                someone in trust-industry leadership.
              </p>
            </div>
            {!compact && (
              <div className="flex flex-wrap justify-center gap-2 max-w-lg">
                {SUGGESTIONS.map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => send(s)}
                    className="text-sm px-3.5 py-1.5 rounded-full bg-background hover:bg-accent transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-5">
            {msgs.map((m, i) => (
              <div
                key={i}
                className={cn(
                  "flex",
                  m.role === "user" ? "justify-end" : "justify-start",
                )}
              >
                <div
                  data-testid={
                    m.role === "assistant" ? "assistant-msg" : "user-msg"
                  }
                  className={cn(
                    "max-w-[88%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed",
                    m.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-background rounded-bl-md",
                  )}
                >
                  {m.role === "user" ? m.text : <Rich text={m.text} />}
                  {m.role === "assistant" &&
                    m.sources &&
                    m.sources.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-foreground/10 text-xs text-muted-foreground">
                        <span className="uppercase tracking-wide font-medium">
                          Sources
                        </span>
                        <SourceList sources={m.sources} />
                        {m.confident &&
                          (!m.alternatives || m.alternatives.length === 0) && (
                            <p
                              data-testid="no-differing"
                              className="mt-2 italic"
                            >
                              No differing view in the shared material.
                            </p>
                          )}
                      </div>
                    )}
                  {m.role === "assistant" &&
                    m.alternatives &&
                    m.alternatives.length > 0 && (
                      <Alternatives items={m.alternatives} />
                    )}
                </div>
              </div>
            ))}
            {busy && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-md bg-background px-4 py-3 text-sm text-muted-foreground flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" /> Reading the
                  community material…
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>
        )}
      </div>

      {form}
    </div>
  );
}
