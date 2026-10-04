import { useTitle } from "./useTitle";
import { PageHero } from "./Chrome";
import { tests } from "./tests";

const TITLE = "Our Chartered Mission — The Trust Industry AI Association";

const principles = [
  { t: "Client data stays home.", d: "In the firm's own tenant and region. Retrieval, not training. Nothing leaves without approval." },
  { t: "Every answer cites its source.", d: "Outputs are traceable, and an immutable audit trail records who asked what, and when." },
  { t: "A named person decides.", d: "Where AI output meets a decision, a human is accountable. Nothing reaches a client unreviewed." },
  { t: "Judgment rises with consequence.", d: "Route work by stakes, not capability. Autonomous approvals and unattended client contact stay off-limits — for now." },
];

export function Agenda() {
  useTitle(TITLE);
  return (
    <>
      <PageHero eyebrow="Our chartered mission" title="The tests we hold ourselves to.">
        Trust companies may work together on the shared ground of safety and compliance only if they do it the right way. Here is how we do.
      </PageHero>
      <section className="mx-auto max-w-4xl px-6 py-20">
        <ol className="divide-y divide-border">
          {tests.map((it, i) => (
            <li key={it.id} id={it.id} className="grid scroll-mt-24 gap-4 py-10 md:grid-cols-[80px_1fr]">
              <span className="font-display text-3xl text-accent">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h2 className="text-2xl md:text-3xl">{it.t}</h2>
                {it.detail.map((p) => <p key={p} className="mt-3 text-lg text-muted-foreground">{p}</p>)}
              </div>
            </li>
          ))}
        </ol>
      </section>
      <section id="reference-principles" className="scroll-mt-24 bg-secondary">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <p className="eyebrow text-accent">Reference principles for AI deployments</p>
          <div className="mt-10 grid gap-10 md:grid-cols-2">
            {principles.map((s) => (
              <div key={s.t} className="border-l-2 border-accent pl-6">
                <p className="font-display text-3xl">{s.t}</p>
                <p className="mt-2 text-muted-foreground">{s.d}</p>
              </div>
            ))}
          </div>
          <p className="mt-10 text-sm text-muted-foreground">Offered as voluntary guidance. Each member decides independently whether and how to adopt it.</p>
        </div>
      </section>
    </>
  );
}
