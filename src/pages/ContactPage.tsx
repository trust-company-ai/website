import { useMutation } from "convex/react";
import { ArrowLeft, CheckCircle2, Loader2, Paperclip, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { APP_NAME } from "@/lib/constants";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "../../convex/_generated/api";

const MAX_CHARS = 10_000;
const MAX_FILES = 5;
const MAX_FILE_BYTES = 15 * 1024 * 1024;

/**
 * "Send us your thoughts" form. Replaces the mail-client button: nothing to
 * set up at a mail provider, and the message (plus attachments) is stored in
 * the Space and delivered to the community team.
 */
export function ContactPage() {
  useEffect(() => {
    document.title = `Send — ${APP_NAME}`;
    return () => {
      document.title = APP_NAME;
    };
  }, []);
  const generateUploadUrl = useMutation(api.messages.generateUploadUrl);
  const send = useMutation(api.messages.send);

  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [organization, setOrganization] = useState("");
  const [email, setEmail] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [acknowledged, setAcknowledged] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function addFiles(list: FileList | null) {
    if (!list) return;
    setError(null);
    const next = [...files];
    for (const f of Array.from(list)) {
      if (f.size > MAX_FILE_BYTES) {
        setError(`${f.name} is larger than 15 MB.`);
        continue;
      }
      if (next.length >= MAX_FILES) {
        setError(`At most ${MAX_FILES} files.`);
        break;
      }
      if (!next.some(x => x.name === f.name && x.size === f.size)) next.push(f);
    }
    setFiles(next);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function onSend() {
    setError(null);
    if (!acknowledged) {
      setError("Please tick the box first.");
      return;
    }
    if (message.trim().length < 2 && files.length === 0) {
      setError("Please write a message or attach a file.");
      return;
    }
    setBusy(true);
    try {
      const uploaded = [];
      for (const f of files) {
        const url = await generateUploadUrl();
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": f.type || "application/octet-stream" },
          body: f,
        });
        if (!res.ok) throw new Error(`Upload of ${f.name} failed.`);
        const { storageId } = (await res.json()) as { storageId: string };
        uploaded.push({
          storageId: storageId as never,
          name: f.name,
          size: f.size,
        });
      }
      await send({
        subject: subject || undefined,
        message,
        name: name || undefined,
        organization: organization || undefined,
        email: email || undefined,
        files: uploaded,
        acknowledged,
      });
      setDone(true);
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
    <div className="flex-1">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-12 space-y-8">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Home
        </Link>

        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            Send us your thoughts
          </h1>
          <p
            className="text-[15px] text-muted-foreground"
            data-testid="contact-warning"
          >
            Anything you submit may become public on the website.
          </p>
        </div>

        {done ? (
          <div
            className="rounded-2xl bg-secondary p-6 flex items-start gap-3"
            data-testid="contact-done"
          >
            <CheckCircle2 className="size-6 text-primary shrink-0" />
            <div className="space-y-1">
              <p className="font-medium">Received. Thank you.</p>
              <p className="text-sm text-muted-foreground">
                Anything you submit may become public on the website.
              </p>
            </div>
          </div>
        ) : (
          <form
            className="space-y-6"
            data-testid="contact-form"
            onSubmit={e => {
              e.preventDefault();
              void onSend();
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="subject">Subject line</Label>
              <Input
                id="subject"
                data-testid="contact-subject"
                value={subject}
                onChange={e => setSubject(e.target.value.slice(0, 200))}
              />
              <p
                className="text-sm text-muted-foreground"
                data-testid="contact-confidential-note"
              >
                If you would like something to remain confidential, write
                &ldquo;contains confidential information&rdquo; in the subject
                line.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Your thoughts</Label>
              <Textarea
                id="message"
                data-testid="contact-message"
                value={message}
                onChange={e => setMessage(e.target.value.slice(0, MAX_CHARS))}
                rows={8}
                className="text-[15px]"
              />
            </div>

            <div className="space-y-2">
              <Label>Attachments (optional, non-confidential)</Label>
              <input
                ref={fileRef}
                type="file"
                multiple
                className="hidden"
                data-testid="contact-file"
                onChange={e => addFiles(e.target.files)}
              />
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileRef.current?.click()}
                >
                  <Paperclip className="size-4" /> Attach files
                </Button>
                {files.map(f => (
                  <span
                    key={`${f.name}-${f.size}`}
                    className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-sm"
                    data-testid="contact-file-chip"
                  >
                    {f.name}
                    <button
                      type="button"
                      aria-label={`Remove ${f.name}`}
                      onClick={() => setFiles(files.filter(x => x !== f))}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="size-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 sm:items-end">
              <div className="space-y-2">
                <Label htmlFor="name">Name (optional)</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="organization">Organization (optional)</Label>
                <Input
                  id="organization"
                  value={organization}
                  onChange={e => setOrganization(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email (optional, not published)</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>

            <label className="flex items-start gap-3 text-[15px]" htmlFor="ack">
              <Checkbox
                id="ack"
                data-testid="contact-ack"
                checked={acknowledged}
                onCheckedChange={v => setAcknowledged(v === true)}
                className="mt-0.5"
              />
              <span>
                I understand that anything I submit may become public on the
                website.
              </span>
            </label>

            {error && (
              <p
                className="text-sm text-destructive"
                data-testid="contact-error"
              >
                {error}
              </p>
            )}

            <Button
              type="submit"
              size="lg"
              disabled={busy}
              data-testid="contact-send"
            >
              {busy && <Loader2 className="size-4 animate-spin" />}
              Send
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
