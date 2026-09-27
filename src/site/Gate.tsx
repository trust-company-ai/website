import { useAction, useQuery } from "convex/react";
import { motion } from "framer-motion";
import {
  type FormEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { getGateToken, setGateToken, setGateUser } from "@/lib/gate";
import { Mark } from "@/site/Mark";
import { Slab3D } from "@/site/Slab3D";
import { api } from "../../convex/_generated/api";

/** Whole-site password gate. Nothing renders until the password is entered; asked on every visit. */
export function Gate({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | undefined>(getGateToken);
  const valid = useQuery(api.gate.check, { token });
  if (valid === undefined) return null;
  if (valid) return <>{children}</>;
  return (
    <GateScreen
      onUnlocked={t => {
        setGateToken(t);
        setToken(t);
      }}
    />
  );
}

const GATE_FIELD =
  "h-16 w-full rounded-full bg-white/[.07] px-7 text-xl text-white outline-none ring-1 transition-[box-shadow,background] duration-300 placeholder:text-white/40 focus:bg-white/[.09] focus:ring-2 focus:ring-sky/70";

function GateScreen({ onUnlocked }: { onUnlocked: (t: string) => void }) {
  const unlock = useAction(api.gate.unlock);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [wrong, setWrong] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    // Start at the top; never pull the page down to the password field on load.
    window.scrollTo({ top: 0 });
  }, []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!password.trim() || busy) return;
    setBusy(true);
    setWrong(false);
    try {
      const t = await unlock({ password });
      if (t) {
        setGateUser("");
        onUnlocked(t);
      } else setWrong(true);
    } catch {
      setWrong(true);
    } finally {
      setBusy(false);
    }
  }

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
      data-testid="gate"
      className="gate-dark min-h-screen bg-ink text-[#f5f6f7] antialiased selection:bg-sky/30"
    >
      {/* Top bar – sticks and frosts once you scroll */}
      <motion.header
        className="sticky top-0 z-20 border-b border-white/[.06] bg-ink/70 backdrop-blur-md"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease }}
      >
        <div className="mx-auto flex max-w-7xl items-center px-6 py-3 sm:min-h-[4.5rem] sm:py-0 sm:px-8">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-[10px] bg-white/[.08] ring-1 ring-white/10">
              <Mark className="size-6 !text-white" />
            </span>
            <span className="text-[1.15rem] font-semibold tracking-tight">
              Trust Company AI
            </span>
          </div>
        </div>
      </motion.header>

      <div data-testid="gate-teaser">
        {/* Hero: headline left, floating slab right; kept short so the next section shows without scrolling */}
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
            className="mb-6 font-mono text-[12.5px] tracking-[0.2em] uppercase text-white/50"
          >
            Three layers of AI
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

          <motion.div
            {...reveal()}
            className="mt-20 max-w-[52rem] space-y-6 text-[1.15rem] sm:text-[1.3rem] leading-[1.45] tracking-[-0.01em] text-white/75"
          >
            <p>
              TrustCompanyAI.org is a non-profit project that helps
              independent trust companies compare notes on the foundational AI
              questions where no one competes &mdash; for instance, where should
              there be a &ldquo;human in the loop&rdquo;? Trust companies and
              their regulators need a place to share insights and lessons
              learned openly.
            </p>
            <p>
              Here you can 1) upload documents, 2) ask the growing knowledge
              base, and 3) follow the consensus diagrams and analyses as they
              update automatically. Tech professionals will find schematics and
              open source code on GitHub.
            </p>
          </motion.div>

        </section>

        {/* Password – the only way in, at the very bottom after all the content */}
        <section
          data-testid="gate-enter"
          className="mt-24 border-t border-white/[.08] bg-white/[.03] sm:mt-32"
        >
          <form
            onSubmit={submit}
            className="mx-auto max-w-7xl px-6 py-24 sm:px-8 sm:py-32"
            aria-label="Sign in"
          >
            <label
              htmlFor="gate-password"
              className="block text-[2rem] font-semibold tracking-tight sm:text-[2.6rem]"
            >
              Password
            </label>
            <div className="mt-8 flex max-w-3xl flex-col gap-4 sm:flex-row sm:items-center">
              <input
                id="gate-password"
                placeholder="Password"
                aria-label="Password"
                data-testid="gate-password"
                type="password"
                autoComplete="current-password"
                ref={inputRef}
                value={password}
                onChange={e => {
                  setPassword(e.target.value);
                  setWrong(false);
                }}
                aria-invalid={wrong || undefined}
                className={`${GATE_FIELD} ${wrong ? "ring-red-400/70" : "ring-white/10"}`}
              />
              <button
                type="submit"
                data-testid="gate-submit"
                disabled={busy || !password.trim()}
                className="inline-flex h-16 shrink-0 items-center justify-center rounded-full bg-[#f5f6f7] px-10 text-xl font-medium text-ink transition-[background,opacity] duration-300 hover:bg-white disabled:opacity-40"
              >
                Enter
              </button>
            </div>
            <p
              data-testid="gate-error"
              className="mt-4 min-h-6 text-base text-red-300/90"
            >
              {wrong ? "That password is not right." : ""}
            </p>
          </form>
        </section>
      </div>
    </div>
  );
}
