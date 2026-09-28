import { motion } from "framer-motion";
import { Slab3D } from "@/site/Slab3D";

/**
 * Dark introduction block at the top of the home page: welcome letter,
 * headline, the three layers. Shown only after the password. All copy is approved
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
      {/* Welcome letter: approved wording, verbatim */}
      <section
        data-testid="splash-welcome"
        className="relative mx-auto max-w-7xl px-6 pt-12 sm:px-8 sm:pt-16"
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
            of the Association of Trusts Organizations. Look around, explore,
            and think about whether or not this site has the potential to be a
            helpful platform for the members of the ATO.
          </p>
          <p>
            It was created as part of the non-profit residency of a program
            called Legal Quants (
            <a
              href="https://www.legalquants.com/"
              target="_blank"
              rel="noreferrer"
              className="text-white underline decoration-white/40 underline-offset-4 hover:decoration-white"
            >
              LegalQuants.com
            </a>
            ), which is a global non-profit community of lawyers who are
            determined to understand and work with AI. Our philosophy is that
            whether we like it, or not, it is coming quickly.
          </p>
          <p>
            In keeping with this philosophy, this platform was built to
            facilitate the education and decision making process of the
            independent trust company industry. The technology is confusing,
            and decisions like where a &ldquo;human in the loop&rdquo; should
            appear are decisions and standards that may take root now, and last
            for many years to come. It seemed to us to be important to provide
            a forum for communication that was not focused on vendors vying for
            contracts.
          </p>
          <p>
            Technology professionals will appreciate the open source GitHub
            repository and Apache 2.0 license. The rest of us will appreciate
            the automatic AI updates of a plain English companion website.
          </p>
          <p>
            Industry leaders and technologists are welcome to contribute
            insights and documents pertaining to the foundational architecture
            about which trust companies do not compete, and about which
            everyone is aligned in wanting to see the industry get it right.
          </p>
          <p>
            It almost goes without saying that the industry giants, like JP
            Morgan, are already well advanced in setting standards at their
            level of the industry.
          </p>
          <p>
            In the event the ATO wishes to accept it, this platform is a gift
            to the industry, and we&rsquo;re happy to maintain it going forward
            without charge. And in the event it is not a fit, for whatever
            reason, we will understand.
          </p>
          <p>
            And if other industry leaders with technology experience would like
            to participate on Slack and GitHub in improving this platform over
            time, we&rsquo;ll be delighted to have the company.
          </p>
          <p>Either way, we wish you all our best,</p>
          <p>Spencer E. Adler, Esq. and the Legal Quants team</p>
        </motion.div>
      </section>

      {/* Hero: headline left, floating slab right */}
      <section className="relative overflow-hidden">
        <div className="tcai-grid pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute -right-40 top-10 size-[42rem] rounded-full bg-[#1d3f8a]/12 blur-[140px]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-6 pt-10 pb-6 sm:px-8 sm:pt-12 lg:grid-cols-12 lg:gap-6 lg:py-10">
          <motion.p
            {...rise(0.1)}
            className="lg:col-span-7 text-[2.6rem] sm:text-[3.5rem] lg:text-[4rem] xl:text-[4.4rem] font-semibold leading-[1.02] tracking-[-0.04em]"
          >
            AI is coming to independent trust companies. Choice of{" "}
            <span className="inline-block whitespace-nowrap border-b-[4px] border-sky/80 leading-[0.9]">
              standards
            </span>{" "}
            will affect the whole industry.
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, ease }}
            className="lg:col-span-5 flex justify-center lg:justify-end"
          >
            <Slab3D className="w-[16rem] sm:w-[20rem] lg:w-[24rem] xl:w-[26rem] lg:mr-2" />
          </motion.div>
        </div>
      </section>

      {/* The three layers */}
      <section className="mx-auto max-w-7xl px-6 sm:px-8 pt-8 lg:pt-4">
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
