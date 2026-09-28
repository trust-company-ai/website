import { motion } from "framer-motion";
import { Mark } from "@/site/Mark";
import { Slab3D } from "@/site/Slab3D";

/**
 * Dark introduction block at the top of the home page: site name, welcome letter,
 * the three layers. Shown only after the password. All copy is approved
 * wording — do not edit or add text here without word-for-word approval.
 */
export function SplashIntro() {
  // Layout: lead word in caps, then the rest of the line.
  const layers: { lead: string; rest: string }[] = [
    {
      lead: "FOUNDATIONAL",
      rest: "industry-wide practices and regulatory decisions, on which no one competes",
    },
    { lead: "FIRM-BY-FIRM", rest: "hardware and cloud choices" },
    { lead: "CUSTOMIZATIONS", rest: "of confidential workflows" },
  ];

  const ease = [0.16, 1, 0.3, 1] as const;
  const rise = (delay = 0) => ({
    initial: { opacity: 0, y: 28 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.9, ease, delay },
  });
  const reveal = (delay = 0) => ({
    initial: { opacity: 0, y: 32 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-10% 0px" },
    transition: { duration: 0.8, ease, delay },
  });

  return (
    <div
      data-testid="splash-intro"
      className="gate-dark bg-ink pb-24 text-[#f5f6f7] antialiased selection:bg-sky/30 sm:pb-32"
    >
      {/* Site name and tagline: approved wording, verbatim. Mark and name as one
          lockup on the left, the slab on the right — the old splash hero. */}
      <section data-testid="splash-name" className="relative overflow-hidden">
        <div className="tcai-grid pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute -right-40 top-10 size-[42rem] rounded-full bg-[#1d3f8a]/12 blur-[140px]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-6 pt-14 pb-6 sm:px-8 sm:pt-20 lg:grid-cols-12 lg:gap-6 lg:py-16">
          <motion.div {...rise(0)} className="lg:col-span-7">
            <div className="flex items-center gap-5 sm:gap-6">
              <span className="flex size-[3.6rem] shrink-0 items-center justify-center rounded-[16px] bg-white/[.08] ring-1 ring-white/10 sm:size-[4.6rem] sm:rounded-[20px] lg:size-[5.2rem] lg:rounded-[22px]">
                <Mark className="size-[2.5rem] !text-white sm:size-[3.2rem] lg:size-[3.6rem]" />
              </span>
              <p className="text-[3rem] font-semibold leading-[1] tracking-[-0.04em] text-white sm:text-[4rem] lg:text-[4.6rem]">
                TrustOrgs.AI
              </p>
            </div>
            <p className="mt-7 max-w-[34rem] text-[1.35rem] leading-[1.35] tracking-[-0.01em] text-white/80 sm:text-[1.6rem]">
              A platform for the trust company industry to chart its own AI future
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, ease }}
            className="flex justify-center lg:col-span-5 lg:justify-end"
          >
            <Slab3D className="w-[16rem] sm:w-[20rem] lg:w-[24rem] xl:w-[26rem] lg:mr-2" />
          </motion.div>
        </div>
      </section>

      {/* Welcome letter: approved wording, verbatim */}
      <section
        data-testid="splash-welcome"
        className="relative mx-auto max-w-7xl px-6 pt-8 sm:px-8 sm:pt-10"
      >
        <motion.div
          {...rise(0.1)}
          className="max-w-[52rem] space-y-6 text-[1.15rem] sm:text-[1.3rem] leading-[1.45] tracking-[-0.01em] text-white/75"
        >
          <p className="text-[1.6rem] font-semibold text-white sm:text-[1.9rem]">
            Welcome.
          </p>
          <p>
            If you are here, you must have been provided a password by the head
            of the Association of Trust Organizations. Look around, explore,
            and think about whether or not this site has the potential to be
            helpful to the ATO.
          </p>
          <p>
            What you will find: a chatbot that answers from documents
            contributed by people in trust-company leadership, a library of
            those documents, a place to add your own, and tools like an
            evolving &ldquo;consensus&rdquo; architecture based on what&rsquo;s
            been uploaded to date. The site is designed strictly to manage
            non-confidential material. Appropriate individuals are welcome to
            contribute on topics about which trust companies do not compete,
            and about which everyone is aligned in wanting to see the industry
            get it right.
          </p>
          <p>
            The platform was created as part of the residency program of a
            non-profit group named Legal Quants (
            <a
              href="https://www.legalquants.com/"
              target="_blank"
              rel="noreferrer"
              className="text-white underline decoration-white/40 underline-offset-4 hover:decoration-white"
            >
              LegalQuants.com
            </a>
            ) - a global community of lawyers determined to understand and
            work with AI. Our philosophy is that whether we like it or not,
            change is coming quickly.
          </p>
          <p>
            The technology is confusing. And industry-wide practices, like the
            decision of where a &ldquo;human in the loop&rdquo; should appear
            in the architecture, are standards that may take root now and last
            for years to come. It seemed to us to be important for there to be
            an unbiased forum for those topics - of course itself run with AI.
          </p>
          <p>
            Technology professionals will appreciate the open-source GitHub
            repository and the Apache 2.0 license. Communication via Slack
            will make their participation easy.
          </p>
          <p>
            In the event the ATO wishes to accept it, this platform is a gift,
            and we&rsquo;re happy to maintain it going forward without charge.
            If, on the other hand, it is not a fit, we will understand.
          </p>
          <p>Either way, we wish the community and its leadership all our best,</p>
          <p>Spencer E. Adler, Esq. and the Legal Quants team</p>
        </motion.div>
      </section>

      {/* The three layers */}
      <section className="mx-auto max-w-7xl px-6 sm:px-8 pt-16 sm:pt-20">
        {/* Stacked like a building: 1 = full-width foundation at the bottom,
            3 = smallest on top, all flush right so the left edges step 1 → 2 → 3. */}
        <motion.p
          {...reveal()}
          className="mb-6 font-mono text-lg sm:text-xl lg:text-2xl tracking-[0.18em] uppercase text-white/85"
        >
          There are three layers
        </motion.p>
        <ol
          className="flex flex-col gap-4 sm:flex-col-reverse sm:items-end sm:gap-5"
          aria-label="The three layers"
        >
          {layers.map(({ lead, rest }, i) => (
            <motion.li
              key={lead}
              {...reveal(i * 0.12)}
              whileHover={{ y: -6 }}
              className={`group relative rounded-[1.75rem] bg-white/[.05] p-8 ring-1 ring-white/[.07] transition-[background] duration-500 hover:bg-white/[.08] ${
                ["w-full", "w-full sm:w-[76%]", "w-full sm:w-[52%]"][i]
              }`}
            >
              <span className="flex items-center gap-3 font-mono text-[12.5px] tracking-[0.2em] text-sky">
                {i + 1}
                <span className="h-px flex-1 bg-gradient-to-r from-sky/50 to-transparent" />
              </span>
              <span className="mt-8 block text-[1.35rem] sm:text-[1.45rem] leading-[1.35] tracking-[-0.01em] text-white/90">
                <span className="font-semibold tracking-[0.04em] text-white">
                  {lead}
                </span>{" "}
                {rest}
              </span>
            </motion.li>
          ))}
        </ol>

      </section>
    </div>
  );
}
