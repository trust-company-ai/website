import { useMutation, useQuery } from "convex/react";
import { Check, Inbox, Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

const KEY_STORAGE = "trust-ai-review-key";

type Tab = "pending" | "approved" | "rejected";

function useReviewKey(): string {
  const [params] = useSearchParams();
  const fromUrl = params.get("key");
  const [key, setKey] = useState(
    () => fromUrl ?? localStorage.getItem(KEY_STORAGE) ?? "",
  );
  useEffect(() => {
    if (fromUrl) {
      localStorage.setItem(KEY_STORAGE, fromUrl);
      setKey(fromUrl);
    }
  }, [fromUrl]);
  return key;
}

function Item({
  sub,
  reviewKey,
  readOnly,
}: {
  sub: {
    _id: Id<"submissions">;
    _creationTime: number;
    title: string;
    kindLabel: string;
    markdown: string;
    contact?: string;
    status: string;
    note?: string;
    path?: string;
  };
  reviewKey: string;
  readOnly: boolean;
}) {
  const decide = useMutation(api.submissions.decide);
  const [title, setTitle] = useState(sub.title);
  const [md, setMd] = useState(sub.markdown);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState<"approve" | "reject" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function act(approve: boolean) {
    setError(null);
    setBusy(approve ? "approve" : "reject");
    try {
      await decide({
        key: reviewKey,
        id: sub._id,
        approve,
        title,
        markdown: md,
        note: note || undefined,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  }

  return (
    <article
      data-testid="review-item"
      data-title={sub.title}
      className="bg-card text-card-foreground border rounded-2xl shadow-sm p-5 sm:p-6 space-y-4"
    >
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="space-y-1 min-w-0">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            {sub.kindLabel} · received{" "}
            {new Date(sub._creationTime).toLocaleString()}
            {sub.contact ? ` · contact: ${sub.contact}` : " · no contact given"}
          </p>
          {readOnly ? (
            <h2 className="text-xl font-semibold">{sub.title}</h2>
          ) : (
            <Input
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="text-lg font-semibold h-10"
              maxLength={120}
            />
          )}
        </div>
        {sub.path && (
          <span className="text-xs text-muted-foreground font-mono">
            {sub.path}
          </span>
        )}
      </div>

      {readOnly ? (
        <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-muted-foreground max-h-72 overflow-y-auto">
          {sub.markdown}
        </pre>
      ) : (
        <Textarea
          value={md}
          onChange={e => setMd(e.target.value)}
          className="min-h-[280px] font-mono text-sm leading-relaxed"
        />
      )}

      {!readOnly && (
        <>
          <div className="space-y-1.5">
            <Label htmlFor={`note-${sub._id}`}>Internal note (optional)</Label>
            <Input
              id={`note-${sub._id}`}
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Why approved / rejected"
            />
          </div>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              data-testid="reject-btn"
              onClick={() => act(false)}
              disabled={busy !== null}
            >
              {busy === "reject" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <X className="size-4" />
              )}
              Reject
            </Button>
            <Button
              data-testid="approve-btn"
              onClick={() => act(true)}
              disabled={busy !== null}
            >
              {busy === "approve" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Check className="size-4" />
              )}
              Approve & publish
            </Button>
          </div>
        </>
      )}
      {readOnly && sub.note && (
        <p className="text-xs text-muted-foreground">Note: {sub.note}</p>
      )}
    </article>
  );
}

export function ReviewPage() {
  const key = useReviewKey();
  const [tab, setTab] = useState<Tab>("pending");
  const rows = useQuery(
    api.submissions.list,
    key ? { key, status: tab } : "skip",
  );

  if (!key) {
    return (
      <div className="flex-1 px-4 py-16 text-center text-muted-foreground">
        This page needs the review link you were given.
      </div>
    );
  }

  return (
    <div className="flex-1 px-4 py-8 sm:py-12">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">
            Review submissions
          </h1>
          <p className="text-muted-foreground">
            Approving publishes to the knowledge base right away; the file is
            added to the GitHub repository shortly after.
          </p>
        </div>

        <div className="flex gap-1 border-b">
          {(["pending", "approved", "rejected"] as Tab[]).map(t => (
            <button
              key={t}
              type="button"
              data-testid={`tab-${t}`}
              onClick={() => setTab(t)}
              className={`px-3 py-2 text-sm capitalize border-b-2 -mb-px ${
                tab === t
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {rows === undefined ? (
          <div className="py-16 flex justify-center">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : rows.length === 0 ? (
          <div
            data-testid="review-empty"
            className="py-16 text-center text-muted-foreground space-y-2"
          >
            <Inbox className="size-6 mx-auto" />
            <p>Nothing {tab} right now.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {rows.map(s => (
              <Item
                key={s._id}
                sub={s}
                reviewKey={key}
                readOnly={tab !== "pending"}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
