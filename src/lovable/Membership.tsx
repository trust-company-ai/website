import { useTitle } from "./useTitle";
import { Link } from "react-router";
import { useState, type FormEvent } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { PageHero } from "./Chrome";

const TITLE = "Membership — The Trust Industry AI Association";

const tiers = [
  { n: "Member", d: "Open to every chartered US trust company, on identical, objective terms. No approval by competitors. $1,000 a year.", f: ["Upload non-confidential material to the shared library. Each upload is checked first for exam findings, prices, client details and vendor terms.", "Ask the knowledge base — AI chat across the library", "Join the discussions and shape the suggestions", "See suggested reference architectures, with the reasoning and dissenting views"] },
  { n: "Affiliate", d: "Open to other US-regulated firms on identical terms. $1,000 a year. No governance role.", f: ["Ask the knowledge base — AI chat across the library", "Join the discussions", "See suggested reference architectures, with the reasoning and dissenting views"] },
  { n: "Friend of the Association", d: "Open to trust companies chartered outside the US. No charge and no participation.", f: ["Read-only access to the library", "Ask the knowledge base — usage billed to a card on file", "See suggested reference architectures, with the reasoning and dissenting views", "No membership fee, no participation"] },
];

export function Membership() {
  useTitle(TITLE);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const send = useMutation(api.messages.send);
  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    const f = new FormData(e.currentTarget);
    const val = (k: string) => String(f.get(k) ?? "").trim();
    setBusy(true);
    try {
      await send({
        subject: "Membership interest",
        message: `Interested in: ${val("interest")}`,
        name: val("Name"),
        organization: val("Trust company"),
        email: val("Email"),
        files: [],
        acknowledged: true,
      });
      setSent(true);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <PageHero eyebrow="Membership" title="Members, Affiliates and Friends.">
        Any chartered US trust company may join. Other US-regulated firms may join as Affiliates. Trust companies elsewhere are welcome as Friends of the Association.
      </PageHero>
      <section className="mx-auto grid max-w-6xl gap-6 px-6 py-20 md:grid-cols-3">
        {tiers.map((t) => (
          <div key={t.n} id={(t.n.split(" ")[0] ?? "").toLowerCase()} className="scroll-mt-24 rounded-sm border border-border bg-card p-8">
            <h2 className="text-2xl">{t.n}</h2>
            <p className="mt-2 text-muted-foreground">{t.d}</p>
            <ul className="mt-6 space-y-2 text-sm">
              {t.f.map((x) => <li key={x} className="border-t border-border pt-2">{x}</li>)}
            </ul>
          </div>
        ))}
        <p className="text-sm text-muted-foreground md:col-span-3">
          Membership never depends on following any suggestion. <Link to="/agenda#open-access" className="text-accent underline">How we keep access open →</Link>
        </p>
      </section>
      <section className="bg-ink text-ink-foreground">
        <div className="mx-auto max-w-2xl px-6 py-20">
          <h2 className="text-4xl">Express interest</h2>
          {sent ? (
            <p className="mt-6 text-lg text-brass">Thank you — we will be in touch.</p>
          ) : (
            <form className="mt-8 grid gap-4" onSubmit={onSubmit}>
              {["Name", "Trust company", "Email"].map((l) => (
                <input key={l} name={l} required type={l === "Email" ? "email" : "text"} placeholder={l}
                  className="rounded-sm border border-ink-foreground/20 bg-transparent px-4 py-3 placeholder:text-ink-foreground/50 focus:border-brass focus:outline-none" />
              ))}
              <select name="interest" required defaultValue="" className="rounded-sm border border-ink-foreground/20 bg-ink px-4 py-3 focus:border-brass focus:outline-none">
                <option value="" disabled>Interested in</option>
                <option>Membership (chartered US trust company)</option>
                <option>Affiliate (other US-regulated firm)</option>
                <option>Friend of the Association (non-US trust company)</option>
              </select>
              <button disabled={busy} className="mt-2 rounded-sm bg-brass px-6 py-3 font-medium text-ink hover:opacity-90">Submit</button>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
