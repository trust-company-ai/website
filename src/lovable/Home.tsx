import { useTitle } from "./useTitle";
import { Link } from "react-router";
import { tests } from "./tests";
import waves from "./assets/waves.jpg";
import { useEffect } from "react";
import { PlatformPreview } from "./PlatformPreview";

const TITLE = "The Trust Industry AI Association — Navigating AI Together";

const layers = [
  { n: "01", t: "Foundational", d: "Industry-wide safety, compliance and regulatory questions. The only layer we take on together — never prices, products, clients or vendors." },
  { n: "02", t: "Firm by firm", d: "Each company's own hardware, cloud and vendor choices — decided independently." },
  { n: "03", t: "Confidential", d: "Each firm's customized workflows and client data. Never shared, never pooled, always the firm's own." },
];

export function Index() {
  useTitle(TITLE);
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); } }),
      { threshold: 0.15 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return (
    <>
      <section className="relative overflow-hidden bg-ink text-ink-foreground">
        <video
          className="hero-media absolute inset-0 h-full w-full object-cover opacity-70"
          src="/lv/waves-right.mp4"
          poster={waves}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-label="Heavy ocean swells under an overcast sky with mountains on the shoreline"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-ink/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/75 to-transparent" />
        <div className="relative mx-auto max-w-6xl px-6 py-28 md:py-40">
          <p className="fade-up font-display text-2xl font-semibold tracking-tight text-brass md:text-3xl">Not a trust company.</p>
          <h1 className="fade-up mt-4 max-w-3xl text-5xl leading-[1.02] md:text-7xl">
            An association of them, navigating the <em className="text-brass">treacherous waters</em> of AI together.
          </h1>
          <p className="fade-up mt-6 max-w-xl text-lg opacity-85">
            Built for this purpose. AI is changing everything faster than anyone can track, and the seas grow rougher by the month. Each firm charts its own course. Together, we map only the shared hazards.
          </p>
          <div className="fade-up mt-10 grid max-w-3xl gap-3 sm:grid-cols-3">
            {[
              { who: "US trust companies", cta: "Become a member", hash: "member", primary: true },
              { who: "Other US-regulated firms", cta: "Become an affiliate", hash: "affiliate", primary: false },
              { who: "Trust companies abroad", cta: "Become a friend", hash: "friend", primary: false },
            ].map((b) => (
              <Link
                key={b.hash}
                to={`/membership#${b.hash}`}
                className={b.primary ? "rounded-sm bg-brass px-5 py-3 text-ink hover:opacity-90" : "rounded-sm border border-ink-foreground/30 px-5 py-3 hover:bg-ink-foreground/10"}
              >
                <span className="block text-xs opacity-70">{b.who}</span>
                <span className="block font-medium">{b.cta}</span>
              </Link>
            ))}
          </div>
          <Link to="/agenda" className="fade-up mt-5 inline-block border-b border-ink-foreground/40 pb-0.5 text-sm hover:border-ink-foreground">Read our mission →</Link>
          <p className="fade-up mt-8 max-w-xl text-sm opacity-70">
            We are a trade association, not a trust company. We do no trust business, never serve as trustee or fiduciary, and have no clients.
          </p>
        </div>
      </section>

      <section className="reveal mx-auto max-w-6xl px-6 py-24">
        <p className="eyebrow text-accent">Where we work together</p>
        <h2 className="mt-4 max-w-3xl text-4xl leading-tight md:text-5xl">
          Three layers. We work together on only the first: safety and compliance.
        </h2>
        <div className="mt-16 grid gap-px overflow-hidden rounded-sm border border-border bg-border md:grid-cols-3">
          {layers.map((p, i) => (
            <div key={p.n} className={i === 0 ? "bg-primary p-8 text-primary-foreground" : "bg-card p-8"}>
              <p className={i === 0 ? "font-display text-3xl text-brass" : "font-display text-3xl text-accent"}>{p.n}</p>
              <h3 className="mt-6 text-2xl">{p.t}</h3>
              <p className={i === 0 ? "mt-3 opacity-80" : "mt-3 text-muted-foreground"}>{p.d}</p>
            </div>
          ))}
        </div>
      </section>

      <PlatformPreview />

      <section className="bg-secondary">
        <div className="reveal mx-auto max-w-6xl px-6 py-24">
          <p className="eyebrow text-accent">The tests we hold ourselves to</p>
          <h2 className="mt-4 max-w-3xl text-4xl leading-tight md:text-5xl">Working together, within the law.</h2>
          <div className="mt-12 grid gap-x-10 gap-y-10 md:grid-cols-3">
            {tests.map((s) => (
              <Link key={s.id} to={`/agenda#${s.id}`} className="group border-l-2 border-accent pl-6">
                <p className="font-display text-2xl group-hover:text-accent">{s.t}</p>
                <p className="mt-2 text-muted-foreground">{s.hint}</p>
                <p className="mt-3 text-sm font-medium text-accent">How we meet it →</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-28">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-4">
            <div className="md:sticky md:top-28">
              <p className="eyebrow text-accent">Questions on the table</p>
              <h2 className="mt-4 text-4xl leading-tight md:text-5xl">What the industry needs to work out.</h2>
              <p className="mt-6 max-w-xs text-muted-foreground">Open questions, not answers. Members bring them; the discussion shapes suggestions.</p>
            </div>
          </div>
          <div className="space-y-16 md:col-span-8">
            {[
              { area: "Human oversight", qs: ["Where should the industry insist on a human in the loop?", "Which decisions should never be delegated to AI?"] },
              { area: "Security & assurance", qs: ["Are SOC 2 and ISO standards strong enough in an era of AI?", "What should we ask of vendors running AI on our behalf?"] },
              { area: "Future risk", qs: ["Do we need a backup plan with quantum computing on the horizon?", "How do we keep records readable and secure for decades?"] },
              { area: "Fiduciary duty", qs: ["How does the duty of prudence apply to AI tools?", "What should clients be told when AI is used?"] },
              { area: "Data & privacy", qs: ["How do we keep client data out of model training?", "How long should AI conversations be kept?"] },
              { area: "Regulation", qs: ["What are examiners likely to ask about AI?", "How do state and federal rules fit together?"] },
            ].map((g) => (
              <div key={g.area} className="reveal">
                <p className="text-xs font-medium uppercase tracking-[0.25em] text-accent">{g.area}</p>
                <p className="mt-4 font-display text-3xl font-medium leading-[1.15] tracking-tight md:text-[2.6rem]">
                  {g.qs.map((q, j) => (
                    <span key={q} className={j === 0 ? "text-foreground" : "text-muted-foreground/60"}>
                      {q}{j < g.qs.length - 1 ? " " : ""}
                    </span>
                  ))}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="reveal mx-auto max-w-6xl px-6 pt-24">
        <p className="eyebrow text-center text-accent">Who can join</p>
        <div className="mt-10 grid gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-3">
          {[
            { hash: "member", tier: "Full member", who: "Chartered US trust companies", price: "$1,000 a year", note: "Full participation and governance." },
            { hash: "affiliate", tier: "Affiliate", who: "Other US-regulated firms", price: "$1,000 a year", note: "No governance role." },
            { hash: "friend", tier: "Friend", who: "Trust companies abroad", price: "No charge", note: "Read-only access." },
          ].map((t) => (
            <Link key={t.hash} to={`/membership#${t.hash}`} className="group flex flex-col bg-background p-8 transition-colors hover:bg-secondary/40">
              <span className="text-sm font-medium uppercase tracking-widest text-accent">{t.tier}</span>
              <span className="mt-3 text-xl font-semibold">{t.who}</span>
              <span className="mt-6 text-3xl font-semibold tracking-tight">{t.price}</span>
              <span className="mt-3 text-muted-foreground">{t.note}</span>
              <span className="mt-auto pt-8 text-sm font-medium text-accent group-hover:underline">Details →</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="reveal mx-auto max-w-4xl px-6 py-24 text-center">
        <p className="eyebrow text-accent">The duty doesn't change</p>
        <p className="mt-6 font-display text-3xl leading-snug md:text-4xl">
          Delegating work to an AI tool, or to a vendor running one, does not end a trustee's duties. No firm should have to work out what that means alone.
        </p>
        <Link to="/about" className="mt-10 inline-block border-b border-accent pb-1 font-medium">Why we exist →</Link>
      </section>
    </>
  );
}
