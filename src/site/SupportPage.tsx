import { useMutation } from "convex/react";
import { type FormEvent, useState } from "react";
import { getGateUser } from "@/lib/gate";
import { Page } from "@/site/SiteShell";
import { api } from "../../convex/_generated/api";

const FIELD =
  "w-full rounded-2xl bg-[#f3f4f6] px-5 py-4 text-[17px] text-ink outline-none transition-[background,box-shadow] duration-300 placeholder:text-ink/40 focus:bg-[#eceef1] focus:ring-2 focus:ring-navy/60";

/** Support button target: a short note that reaches the site owner. */
export function SupportPage() {
  const send = useMutation(api.messages.support);
  const [email, setEmail] = useState(getGateUser);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy || message.trim().length < 2) return;
    setBusy(true);
    setError("");
    try {
      await send({ email: email.trim() || undefined, message });
      setDone(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      setError(
        msg.replace(/^.*Uncaught Error:\s*/s, "").split("\n")[0] ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <Page title="Support">
      {done ? (
        <p data-testid="support-done" className="text-[17px] text-ink/80">
          Thank you. We have your message.
        </p>
      ) : (
        <form
          onSubmit={submit}
          data-testid="support-form"
          className="space-y-4 max-w-xl"
        >
          <input
            data-testid="support-email"
            type="email"
            autoComplete="email"
            placeholder="Your email"
            aria-label="Your email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className={FIELD}
          />
          <textarea
            data-testid="support-message"
            placeholder="What do you need help with?"
            aria-label="What do you need help with?"
            value={message}
            onChange={e => setMessage(e.target.value)}
            rows={6}
            className={`${FIELD} resize-y`}
          />
          <div>
            <button
              type="submit"
              data-testid="support-submit"
              disabled={busy || message.trim().length < 2}
              className="inline-flex h-12 items-center rounded-full bg-navy px-7 text-[16px] font-medium text-white transition-[transform,opacity] duration-300 hover:-translate-y-0.5 disabled:opacity-40 disabled:hover:translate-y-0"
            >
              Send
            </button>
            <p data-testid="support-error" className="mt-3 min-h-5 text-sm text-ink/60">
              {error}
            </p>
          </div>
        </form>
      )}
    </Page>
  );
}
