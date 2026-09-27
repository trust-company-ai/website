import { useMutation } from "convex/react";
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  Loader2,
  Upload,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { APP_NAME } from "@/lib/constants";
import { type DroppedUpload, readUpload } from "@/lib/readUpload";
import { api } from "../../convex/_generated/api";

const MAX_CHARS = 40_000;
const KINDS = [
  { value: "lesson", label: "Lesson learned" },
  { value: "framework", label: "Framework or approach" },
  { value: "template", label: "Template or checklist" },
  { value: "other", label: "Other" },
];

type Step = "write" | "done";

export function SubmitPage() {
  useEffect(() => {
    document.title = `Contribute — ${APP_NAME}`;
    return () => {
      document.title = APP_NAME;
    };
  }, []);
  const submit = useMutation(api.submissions.submit);

  // A file dropped on the home page arrives here already read.
  const dropped = (useLocation().state as { upload?: DroppedUpload } | null)
    ?.upload;
  const [step, setStep] = useState<Step>("write");
  const [title, setTitle] = useState(
    dropped ? dropped.fileName.replace(/\.(docx|md|txt)$/i, "") : "",
  );
  const [kind, setKind] = useState("lesson");
  const [text, setText] = useState(dropped?.text.slice(0, MAX_CHARS) ?? "");
  const [fileName, setFileName] = useState<string | null>(
    dropped?.fileName ?? null,
  );
  const [contact, setContact] = useState("");
  const [permission, setPermission] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);

  async function onFile(f: File | undefined) {
    if (!f) return;
    setError(null);
    try {
      const t = await readUpload(f);
      setText(t.slice(0, MAX_CHARS));
      setFileName(f.name);
      if (!title) setTitle(f.name.replace(/\.(docx|md|txt)$/i, ""));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  /** Title fallback when the field is left empty: first heading or line. */
  function fallbackTitle(): string {
    const first = text
      .split("\n")
      .map(l => l.replace(/^#+\s*/, "").trim())
      .find(l => l.length > 0);
    return (first ?? "Untitled contribution").slice(0, 120);
  }

  async function onSubmit() {
    setError(null);
    if (text.trim().length < 40) {
      setError("Please add a bit more text (a few sentences at least).");
      return;
    }
    if (!permission) {
      setError("Please confirm you have permission to share this material.");
      return;
    }
    setBusy(true);
    try {
      await submit({
        title: title.trim() || fallbackTitle(),
        kind,
        markdown: text,
        contact: contact.trim() || undefined,
      });
      setStep("done");
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message.replace(/^.*Uncaught Error: /, "").split("\n")[0]
          : "Something went wrong. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex-1 px-4 py-8 sm:py-12">
      <div className="max-w-3xl mx-auto space-y-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Back to the chat
        </Link>

        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            Contribute
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Paste or upload a lesson learned, a framework or a template. Please
            submit anonymized documents or documents you are comfortable
            sharing. Anything you submit may become public on the website.
          </p>
        </div>

        {step === "write" && (
          <div
            data-testid="submit-form"
            className="bg-secondary text-card-foreground rounded-[1.5rem] p-5 sm:p-7 space-y-5"
          >
            <div className="grid sm:grid-cols-[1fr_220px] gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title (optional)</Label>
                <Input
                  id="title"
                  placeholder="e.g. Keeping client data out of model training"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  maxLength={120}
                />
              </div>
              <div className="space-y-2">
                <Label>What is it?</Label>
                <Select value={kind} onValueChange={setKind}>
                  <SelectTrigger data-testid="kind-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {KINDS.map(k => (
                      <SelectItem key={k.value} value={k.value}>
                        {k.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor="text">Your material</Label>
                <div className="flex items-center gap-2">
                  {fileName && (
                    <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                      <FileText className="size-3.5" /> {fileName}
                    </span>
                  )}
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".docx,.md,.txt"
                    className="hidden"
                    data-testid="file-input"
                    onChange={e => onFile(e.target.files?.[0])}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileRef.current?.click()}
                  >
                    <Upload className="size-4" /> Upload .docx / .md / .txt
                  </Button>
                </div>
              </div>
              <Textarea
                id="text"
                data-testid="text-input"
                placeholder="Paste your text here. Headings and bullet points are kept."
                className="min-h-[280px] text-[15px] leading-relaxed"
                value={text}
                onChange={e => setText(e.target.value.slice(0, MAX_CHARS))}
              />
              <p className="text-xs text-muted-foreground text-right">
                {text.length.toLocaleString()} / {MAX_CHARS.toLocaleString()}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact">
                Contact for follow-up questions (optional, never published)
              </Label>
              <Input
                id="contact"
                placeholder="name@firm.com"
                value={contact}
                onChange={e => setContact(e.target.value)}
                maxLength={200}
              />
            </div>

            <div className="flex items-start gap-3 text-sm">
              <Checkbox
                id="permission"
                data-testid="permission"
                checked={permission}
                onCheckedChange={v => setPermission(v === true)}
                className="mt-0.5"
              />
              <Label htmlFor="permission" className="font-normal leading-snug">
                I have permission to share this material, and I understand it
                will be published under the community's open license.
              </Label>
            </div>

            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}

            <div className="flex items-center justify-end gap-3 flex-wrap">
              <Button
                data-testid="submit-btn"
                onClick={onSubmit}
                disabled={busy}
              >
                {busy ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Sending…
                  </>
                ) : (
                  "Send"
                )}
              </Button>
            </div>
          </div>
        )}

        {step === "done" && (
          <div
            data-testid="submit-done"
            className="bg-secondary text-card-foreground rounded-[1.5rem] p-8 text-center space-y-4"
          >
            <div className="size-12 mx-auto rounded-full bg-primary text-primary-foreground flex items-center justify-center">
              <CheckCircle2 className="size-6" />
            </div>
            <h2 className="text-2xl font-semibold tracking-tight">Thank you</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Anything you submit may become public on the website.
            </p>
            <div className="flex justify-center gap-2 pt-2">
              <Button variant="outline" asChild>
                <Link to="/">Back to the chat</Link>
              </Button>
              <Button
                onClick={() => {
                  setStep("write");
                  setText("");
                  setTitle("");
                  setFileName(null);
                  setPermission(false);
                }}
              >
                Share another
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
