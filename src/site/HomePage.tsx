import { motion } from "framer-motion";
import { Loader2, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { APP_NAME } from "@/lib/constants";
import { ACCEPTED_EXT, readUpload } from "@/lib/readUpload";
import { cn } from "@/lib/utils";
import { LayersDiagram, TiersDiagram } from "./ReferenceDiagram";
import { SplashIntro } from "./SplashIntro";
import { SITE_STATS } from "./siteStats";

/**
 * Home page. All copy on this page is approved wording — do not edit or add text
 * here without word-for-word approval.
 */

/** Counts up from 0 once, then settles. Tabular numerals keep the width stable. */
function CountUp({ to, duration = 1100 }: { to: number; duration?: number }) {
  const [n, setN] = useState(0);
  const raf = useRef<number | null>(null);
  useEffect(() => {
    const start = performance.now();
    const step = (t: number) => {
      const k = Math.min(1, (t - start) / duration);
      const eased = 1 - (1 - k) ** 3;
      setN(Math.round(to * eased));
      if (k < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [to, duration]);
  return <span className="tabular-nums">{n}</span>;
}

function Stat({
  value,
  label,
  sub,
  note,
  to,
  testId,
}: {
  value: number;
  label: string;
  sub?: string;
  note?: string;
  to?: string;
  testId: string;
}) {
  const inner = (
    <>
      <div className="flex items-baseline justify-center gap-4">
        <p className="text-6xl sm:text-7xl font-semibold leading-none tracking-tight">
          <CountUp to={value} />
        </p>
        <p className="text-[17px] sm:text-lg leading-snug text-muted-foreground">
          {label}
        </p>
      </div>
      {sub && (
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {sub}
        </p>
      )}
      {note && (
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {note}
        </p>
      )}
    </>
  );
  if (to) {
    return (
      <Link
        to={to}
        data-testid={testId}
        className="block rounded-md text-center transition hover:opacity-80"
      >
        {inner}
      </Link>
    );
  }
  return (
    <div data-testid={testId} className="text-center">
      {inner}
    </div>
  );
}

const ADVISORS: {
  name: string;
  role: string;
  city: string;
  bio: string;
  photo: string;
}[] = [
  {
    name: "Spencer E. Adler, Esq.",
    role: "Former trusts and estates lawyer",
    city: "Washington DC",
    bio: "Host of the LISI tax law publishing webinar interview series “AI and Attorney Confidentiality.” Resident of the global LegalQuants program.",
    photo: "/advisors/spencer-adler.jpg",
  },
  {
    name: "Erin L. Fraser, Esq.",
    role: "Trusts and estates lawyer",
    city: "San Francisco",
    bio: "Advises family offices and ultra-high-net-worth individuals on wealth transfer and preservation, including the establishment and management of private trust companies.",
    photo: "/advisors/erin-fraser.jpg",
  },
  {
    name: "Nicole L. Garton, LL.B., TEP",
    role: "President & General Counsel, Heritage Trust Company",
    city: "Vancouver, British Columbia",
    bio: "Co-founded Heritage Trust in 2018, an independent trust company regulated by the BC Financial Services Authority. Trusts and estates lawyer, called to the Bar of British Columbia in 2001. Led the governance and regulatory work for Heritage Trust’s Board-governed AI platform, now in live use for estate-file review, quarterly trust reporting and parts of AML compliance.",
    photo: "/advisors/nicole-garton.jpg",
  },
  {
    name: "John Paul",
    role: "Banking sector digital security specialist",
    city: "San Antonio, Texas",
    bio: "First a systems architect, then an incident response leader overseeing a 50-person team responding to incidents at financial institutions, including at major US banks.",
    photo: "/advisors/john-paul.jpg",
  },
  {
    name: "Dustin Bolander",
    role: "Head of Clear Guidance Partners",
    city: "Austin, Texas",
    bio: "Heads Clear Guidance, a cybersecurity team of nearly 40 recommended by the Texas and Georgia bars for law firms, and Beltex, a cybersecurity liability insurance firm active across the US.",
    photo: "/advisors/dustin-bolander.jpg",
  },
  {
    name: "Matthew Blattmachr, CFP®, CFIRS",
    role: "President & CEO, Peak Trust Company",
    city: "Anchorage, Alaska",
    bio: "With Peak Trust Company since 2008, an independent trust company with offices in Alaska, Nevada and Delaware. Active since 2008 in the passage of trust and estate legislation in Alaska.",
    photo: "/advisors/matthew-blattmachr.jpg",
  },
];

const WHY_NOW: { n: string; title: string; body: string; source: string }[] = [
  {
    n: "01",
    title: "Delegation does not end the trustee’s duties.",
    body: "When a trustee relies on an AI tool, or on a vendor operating one, to carry out part of the trustee’s work, the rules on delegation are the closest existing law. Under Section 9 of the Uniform Prudent Investor Act (1994), enacted in some form in most states, a trustee may delegate investment and management functions that a prudent trustee of comparable skills could properly delegate. The trustee must exercise reasonable care, skill and caution in selecting the agent, establishing the scope and terms of the delegation, and periodically reviewing the agent’s actions. A trustee who complies with those requirements “is not liable to the beneficiaries or to the trust for the decisions or actions of the agent.” Section 807 of the Uniform Trust Code contains a parallel provision for delegation of trustee duties and powers generally. Whether, and how, these provisions reach a particular AI tool is a question for each trust company and its counsel under the law governing the trust.",
    source:
      "Uniform Prudent Investor Act §9(a), (c) · Uniform Trust Code §807. Enacted text varies by state.",
  },
  {
    n: "02",
    title:
      "Federal banking regulators do not treat outsourcing as a transfer of responsibility.",
    body: "The 2023 Interagency Guidance on Third-Party Relationships states that a banking organization’s use of third parties “does not diminish its responsibility to meet these requirements to the same extent as if its activities were performed by the banking organization in-house.” The guidance is addressed to banking organizations supervised by the OCC, Federal Reserve and FDIC. Its application to a state-chartered, non-depository trust company depends on that company’s charter and regulator. On September 11, 2026 the OCC, Federal Reserve, FDIC and National Credit Union Administration issued proposed guidance “revising and replacing existing guidance on third-party risk management.” The proposal was published in the Federal Register on September 15, 2026. Comments must be received on or before November 16, 2026. The proposal states that it “will not set forth enforceable standards or prescriptive requirements” and that non-compliance “will not result in supervisory action.” The 2023 guidance remains in effect until the proposal is finalized.",
    source:
      "OCC Bulletin 2023-17 · Fed SR 23-4 · 88 Fed. Reg. 37920 (published June 9, 2023; final June 6, 2023) · Proposed revision: OCC Bulletin 2026-46, September 11, 2026 · 91 Fed. Reg. 58536 (September 15, 2026).",
  },
  {
    n: "03",
    title:
      "The federal model risk guidance was revised in April 2026; generative and agentic AI are outside its scope.",
    body: "On April 17, 2026 the OCC, Federal Reserve and FDIC issued revised Supervisory Guidance on Model Risk Management. The OCC rescinded Bulletin 2011-12 and the Federal Reserve superseded SR 11-7. The revised guidance states that generative AI and agentic AI models “are not within the scope of this guidance,” while adding that a banking organization’s “risk management and governance practices should guide the determination of appropriate governance and controls for any tools, processes, or systems not covered in this document.” It states that it is expected to be most relevant to banking organizations with over $30 billion in total assets. The OCC’s release states that the guidance “does not set forth enforceable standards or prescriptive requirements.” The agencies stated that they plan to issue a request for information on model risk management and banks’ use of AI. In remarks published May 1, 2026, Fed Vice Chair for Supervision Bowman said the revised guidance “now applies narrowly to traditional models and basic AI applications.”",
    source:
      "OCC Bulletin 2026-13 and News Release 2026-29 · Fed SR 26-2 · FDIC FIL-15-2026, all April 17, 2026 · Bowman, “Artificial Intelligence in the Financial System,” published May 1, 2026.",
  },
  {
    n: "04",
    title:
      "The Financial Stability Board has proposed sound practices for AI adoption; the text is not final.",
    body: "On June 10, 2026 the Financial Stability Board published “Sound Practices for Responsible Adoption of Artificial Intelligence” as a consultation report. Comments were accepted until July 22, 2026. Vice Chair Bowman, who chairs the FSB standing committee responsible for the work, said the final report is to be delivered to the U.S. G20 presidency later in 2026. The report is a consultation draft, not a rule.",
    source:
      "FSB consultation report, June 10, 2026 · Bowman opening remarks, July 7, 2026.",
  },
  {
    n: "05",
    title:
      "State authorities have begun issuing AI guidance and statutes on different timelines.",
    body: "The New York Department of Financial Services issued an advisory on cybersecurity risks associated with frontier AI models on May 21, 2026; the advisory states that it imposes no new requirements. Michigan’s Department of Insurance and Financial Services issued Bulletin 2026-03 on January 14, 2026, setting out expectations for AI systems used in decisions that may affect consumers. Colorado repealed and replaced its 2024 AI statute on May 14, 2026, effective January 1, 2027. The Texas Responsible Artificial Intelligence Governance Act took effect January 1, 2026. On September 16, 2026 the Conference of State Bank Supervisors released an Artificial Intelligence Supervisory Framework for state examiners, covering governance and oversight, AI inventory and use cases, generative AI, and third-party review. CSBS states that it is a discretionary tool and that “each state agency will determine the extent to which this framework is incorporated into their supervisory programs.” CSBS is the nationwide organization of state financial regulators, not a regulator itself. None of these is specific to trust companies; which of them apply to a given company depends on where it is chartered and does business.",
    source:
      "NY DFS Industry Letter, May 21, 2026 · Michigan DIFS Bulletin 2026-03-BT/CF/CU · Colorado SB 26-189 · Texas HB 149 (89th Leg.) · CSBS Artificial Intelligence Supervisory Framework, Core Examiner Guide v1.0, released September 16, 2026.",
  },
];

const WHY_NOW_CLOSE =
  "This section describes statutes and regulatory guidance that were public as of September 28, 2026. It is not legal advice, does not create an attorney-client relationship, and may not reflect later developments. None of the documents described requires a trust company to use AI. Trust companies should consult their own counsel regarding their charter, regulator, and states of operation.";

// Same scroll-reveal as the splash page.
const EASE = [0.16, 1, 0.3, 1] as const;
const reveal = (delay = 0) => ({
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-10% 0px" },
  transition: { duration: 0.8, ease: EASE, delay },
});
const rise = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.9, ease: EASE, delay },
});

/**
 * Drop zone in the hero — mirrors the chat box on the right. A dropped or
 * chosen file is read in the browser and opens the Contribute form with the
 * text already in place (the form still asks for permission before anything
 * is sent).
 */
function HeroDropZone() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function take(file: File | undefined) {
    if (!file || busy) return;
    setError(null);
    setBusy(true);
    try {
      const text = await readUpload(file);
      navigate("/submit", { state: { upload: { text, fileName: file.name } } });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setBusy(false);
    }
  }

  return (
    <div data-testid="upload-panel" className="contents">
      <p className="font-mono text-[12.5px] tracking-[0.2em] text-navy tabular-nums">
        02
      </p>
      <label
        htmlFor="hero-file-input"
        className="mt-4 block cursor-pointer text-[1.5rem] sm:text-[1.7rem] font-semibold leading-[1.15] tracking-[-0.02em]"
      >
        Upload non-confidential documents here
      </label>
      <div className="mt-6 flex">
        <div
          data-testid="drop-zone"
          role="button"
          tabIndex={0}
          aria-label="Drop a file here or click to choose one"
          onClick={() => inputRef.current?.click()}
          onKeyDown={e => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          onDragOver={e => {
            e.preventDefault();
            setOver(true);
          }}
          onDragLeave={() => setOver(false)}
          onDrop={e => {
            e.preventDefault();
            setOver(false);
            void take(e.dataTransfer.files?.[0]);
          }}
          className={cn(
            "flex w-full min-h-[13rem] cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed px-6 py-8 text-center outline-none transition-colors",
            over
              ? "border-navy bg-navy/[.06]"
              : "border-navy/25 bg-navy/[.03] hover:border-navy/60 hover:bg-navy/[.05]",
            "focus-visible:border-navy focus-visible:ring-2 focus-visible:ring-primary/30",
          )}
        >
          <input
            ref={inputRef}
            id="hero-file-input"
            type="file"
            accept={ACCEPTED_EXT}
            className="sr-only"
            data-testid="hero-file-input"
            onChange={e => {
              void take(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
          <span
            aria-hidden="true"
            className="flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_8px_20px_-8px_rgba(29,63,138,.6)]"
          >
            {busy ? (
              <Loader2 className="size-6 animate-spin" />
            ) : (
              <Upload className="size-6" />
            )}
          </span>
          <p className="text-[17px] leading-7 text-ink">
            {busy
              ? "Reading your file…"
              : over
                ? "Let go to add it"
                : "Drop a file here, or click to choose one"}
          </p>
        </div>
      </div>
      <div>
        <p
          className="mt-5 text-[15.5px] leading-[1.6] text-muted-foreground"
          data-testid="sample-docs-line"
        >
          Sample documents: diagrams, third-party due diligence, privacy and
          security assessments, board ratification, etc
        </p>
        {error && (
          <p role="alert" className="mt-2 text-sm text-destructive">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

export function HomePage() {
  useEffect(() => {
    document.title = APP_NAME;
  }, []);

  return (
    <div className="flex-1">
      {/* Introduction (formerly the page before the password) */}
      <SplashIntro />

      {/* Hero: audience line, then chat (left) and upload (right) side by side. */}
      <section className="relative overflow-hidden text-ink" data-testid="hero">
        <div className="tcai-grid pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute -right-40 top-10 size-[42rem] rounded-full bg-[#1d3f8a]/8 blur-[140px]" />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 pt-12 pb-16 sm:pt-16 sm:pb-20 lg:pt-20 lg:pb-20">
          <motion.p
            {...rise(0.05)}
            data-testid="audience-line"
            className="flex items-center gap-3 font-mono text-[12.5px] tracking-[0.2em] uppercase text-navy"
          >
            <span className="h-px w-8 shrink-0 bg-navy/60" aria-hidden="true" />
            <span>
              For executives, regulators, compliance experts, and technologists
            </span>
          </motion.p>
          {/* Chat left, upload right — equal size */}
          <div className="mt-14 sm:mt-16 grid gap-12 lg:grid-cols-2 lg:grid-rows-[auto_auto_1fr_auto] lg:gap-x-16 lg:gap-y-0">
            <motion.div
              {...rise(0.2)}
              className="flex flex-col lg:grid lg:row-span-4 lg:grid-rows-subgrid"
            >
              <div className="contents" data-testid="chat-card">
                <ChatPanel hero />
              </div>
            </motion.div>

            <motion.div
              {...rise(0.25)}
              className="flex flex-col lg:grid lg:row-span-4 lg:grid-rows-subgrid"
            >
              <div className="contents" data-testid="upload-card">
                <HeroDropZone />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Counters — shown once the numbers are worth showing */}
      {(SITE_STATS.participants >= 3 || SITE_STATS.documents >= 10) && (
        <section className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="pt-20 grid gap-10 sm:grid-cols-2" data-testid="stats">
            <Stat
              value={SITE_STATS.participants}
              label={`trust ${SITE_STATS.participants === 1 ? "company" : "companies"} participating so far`}
              testId="stat-participants"
            />
            <Stat
              value={SITE_STATS.documents}
              label={`${SITE_STATS.documents === 1 ? "document" : "documents"} in the knowledge base`}
              to="/library"
              testId="stat-documents"
            />
          </div>
        </section>
      )}

      {/* Reference pattern */}
      <motion.section
        {...reveal()}
        className="mx-auto max-w-6xl px-4 sm:px-6 pt-10 sm:pt-14"
      >
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-20 items-end">
          <div>
            <p className="mb-4 font-mono text-[12.5px] tracking-[0.2em] text-navy tabular-nums">
              03
            </p>
            <h2 className="text-[2rem] sm:text-[2.5rem] font-medium leading-[1.08] tracking-[-0.025em]">
              The community reference pattern
            </h2>
          </div>
          <p className="text-[17px] sm:text-xl leading-relaxed text-muted-foreground">
            This reflects a consensus schematic, and indicates where
            alternatives exist. It will evolve automatically as the library
            grows.
          </p>
        </div>

        <div
          className="mt-10 space-y-8 sm:space-y-10"
          data-testid="reference-pattern"
        >
          <div className="rounded-[1.75rem] bg-[#f3f4f6] px-5 py-8 sm:px-14 sm:pt-11 sm:pb-10">
            <p className="mb-6 sm:mb-7 font-mono text-[12.5px] uppercase tracking-[0.2em] text-navy">
              Five layers, every deployment
            </p>
            <LayersDiagram />
          </div>
          <div className="rounded-[1.75rem] bg-[#f3f4f6] px-5 py-8 sm:px-14 sm:pt-11 sm:pb-10">
            <p className="mb-6 sm:mb-7 font-mono text-[12.5px] uppercase tracking-[0.2em] text-navy">
              Use-case tiers, by consequence
            </p>
            <TiersDiagram />
          </div>
        </div>
        <p className="mt-6 text-sm text-muted-foreground">
          From Framework 01, Reference Architecture, Draft v0.2 in the community
          repository, as of September 8, 2026.
        </p>
      </motion.section>

      {/* License statement */}
      <motion.section
        {...reveal()}
        className="mx-auto max-w-6xl px-4 sm:px-6 pt-20 sm:pt-28"
      >
        <div
          className="rounded-[1.75rem] bg-[#f3f4f6] px-8 py-10 sm:px-14 sm:py-14 grid gap-8 lg:grid-cols-2 lg:gap-20 items-center"
          data-testid="license"
        >
          <h2 className="text-[2rem] sm:text-[2.5rem] font-medium leading-[1.08] tracking-[-0.025em]">
            Apache 2.0 license
          </h2>
          <p className="text-[17px] sm:text-[19px] leading-relaxed text-muted-foreground">
            Anyone may use, copy, change, and share it, commercially or
            otherwise, at no cost. The license notice stays with the material.
            It is provided as is, without warranty.
          </p>
        </div>
      </motion.section>

      {/* Advisory Board */}
      <motion.section
        {...reveal()}
        className="mx-auto max-w-6xl px-4 sm:px-6 pt-20 sm:pt-28"
        data-testid="advisory-board"
      >
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-20 items-end">
          <h2 className="text-[2rem] sm:text-[2.5rem] font-medium leading-[1.08] tracking-[-0.025em]">
            Advisory Board
          </h2>
          <p
            className="text-sm leading-relaxed text-muted-foreground max-w-[35rem]"
            data-testid="advisory-disclaimer"
          >
            Advisors serve in a personal capacity. Inclusion does not represent
            employment or endorsement by any firm named. Advisors are not
            responsible for this project’s actions, errors, or omissions.
          </p>
        </div>
        <ul className="mt-12 sm:mt-16 grid gap-8 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {ADVISORS.map(a => (
            <li key={a.name}>
              <img
                src={a.photo}
                alt={a.name}
                width={480}
                height={480}
                loading="lazy"
                className="aspect-square w-full rounded-[1.25rem] object-cover object-top ring-1 ring-black/[.06]"
              />
              <p className="mt-5 text-[17px] font-semibold leading-snug tracking-[-0.01em]">
                {a.name}
              </p>
              <p className="mt-1.5 text-[15px] font-medium leading-[1.45] text-navy">
                {a.role}
                <br />
                {a.city}
              </p>
              <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
                {a.bio}
              </p>
            </li>
          ))}
        </ul>
      </motion.section>

      {/* Why now */}
      <motion.section
        {...reveal()}
        className="mx-auto max-w-6xl px-4 sm:px-6 pt-20 sm:pt-28 pb-8"
        data-testid="why-now"
      >
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-20 items-end">
          <div>
            <p className="mb-5 font-mono text-[12.5px] uppercase tracking-[0.2em] text-navy">
              Why now
            </p>
            <h2 className="text-[2rem] sm:text-[2.5rem] font-medium leading-[1.08] tracking-[-0.025em]">
              The Shifting Landscape of AI and Trust Company Industry Regulation
            </h2>
          </div>
          <p className="text-[17px] sm:text-lg leading-relaxed text-muted-foreground">
            Statutes and regulatory guidance public as of September 28, 2026.
            <br />
            <span data-testid="why-now-scan-line">
              Updated weekly from an automated scan of regulator, legislative
              and court sources.
            </span>
          </p>
        </div>

        <ol className="mt-12 sm:mt-16">
          {WHY_NOW.map(item => (
            <li
              key={item.n}
              className="border-t py-10 sm:py-14 grid gap-4 sm:grid-cols-[7rem_1fr] sm:gap-10"
            >
              <span className="font-mono text-[2rem] sm:text-[2.75rem] font-medium leading-none tracking-[-0.02em] text-navy tabular-nums">
                {item.n}
              </span>
              <div className="max-w-[52rem]">
                <h3 className="text-xl sm:text-2xl font-semibold leading-snug tracking-[-0.015em]">
                  {item.title}
                </h3>
                <p className="mt-5 text-[17px] leading-[1.7] text-foreground/85">
                  {item.body}
                </p>
                <p className="mt-4 text-[13.5px] leading-normal text-muted-foreground">
                  {item.source}
                </p>
              </div>
            </li>
          ))}
        </ol>
        <p className="border-t pt-10 text-[15px] leading-[1.7] text-muted-foreground max-w-[56rem]">
          {WHY_NOW_CLOSE}
        </p>
      </motion.section>
    </div>
  );
}
