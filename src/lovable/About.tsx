import { useTitle } from "./useTitle";
import { PageHero } from "./Chrome";

const TITLE = "About — The Trust Industry AI Association";

const points = [
  { n: "Born for this moment", d: "We are not an existing association learning to dress in AI clothing. We were formed for one purpose: to help trust companies navigate AI. We are AI-native — and we run on AI ourselves." },
  { n: "The waters are rising", d: "AI is changing everything more quickly than any of us can track or anticipate. The waters grow more treacherous to navigate every month, and decisions made now will set patterns the industry lives with for a generation." },
  { n: "No one should navigate alone", d: "Trust companies compete on service, not on the basic rules of safe AI. On those shared questions — architecture, human oversight, regulatory interpretation — we pool what we learn." },
  { n: "An unbiased forum", d: "Executives, regulators, compliance experts and technologists meet as equals. We share only non-confidential material, and openly, so the whole industry gets it right." },
  { n: "Confidentiality is the keel", d: "A promise not to look at client data is never as strong as infrastructure that makes looking impossible. Every suggestion we make starts there." },
];

export function About() {
  useTitle(TITLE);
  return (
    <>
      <PageHero eyebrow="Not a trust company" title="An association of trust companies, charting their own AI future.">
        Formed for this purpose, in this moment, so the industry sets its own course through AI — rather than having it set by others.
      </PageHero>
      <section className="mx-auto max-w-6xl space-y-16 px-6 py-24">
        {points.map((f, i) => (
          <div key={f.n} className="grid gap-6 md:grid-cols-[120px_1fr_2fr]">
            <p className="font-display text-4xl text-accent">0{i + 1}</p>
            <h2 className="text-3xl">{f.n}</h2>
            <p className="text-lg text-muted-foreground">{f.d}</p>
          </div>
        ))}
      </section>
    </>
  );
}
