import { ChatPanel } from "@/components/chat/ChatPanel";
import { DocList } from "./Library";
import { Page, Section } from "./SiteShell";

/**
 * Functional pages only. No editorial copy lives here — the approved
 * wording is on HomePage. Headings below are folder names from the repository.
 */

const FOLDERS: { heading: string; blurb: string; prefix: string; id: string }[] = [
  {
    heading: "Frameworks",
    blurb: "Structured guidance for a specific topic. Each is a living document.",
    prefix: "frameworks/",
    id: "frameworks",
  },
  {
    heading: "Architecture",
    blurb: "Architecture diagrams and technical design notes, plus worked examples contributed by firms.",
    prefix: "architecture/",
    id: "architecture",
  },
  {
    heading: "Lessons learned",
    blurb: "Short, candid write-ups from firms that have built or bought something: what worked, what didn't, what they'd do differently.",
    prefix: "lessons-learned/",
    id: "lessons",
  },
  {
    heading: "Contributions",
    blurb: "Material shared by member trust companies through the upload page.",
    prefix: "contributions/",
    id: "contributions",
  },
  {
    heading: "Templates",
    blurb: "Reusable documents that firms can copy and adapt.",
    prefix: "templates/",
    id: "templates",
  },
];

export function LibraryPage() {
  return (
    <Page title="Library" wide>
      {FOLDERS.map(f => (
        <Section key={f.id} heading={f.heading} id={f.id}>
          <p
            className="text-muted-foreground -mt-2"
            data-testid={`folder-blurb-${f.id}`}
          >
            {f.blurb}
          </p>
          <DocList
            prefix={f.prefix}
            empty="Nothing here yet."
            badge={s => (s === "contribution" ? "Contribution" : null)}
          />
        </Section>
      ))}
    </Page>
  );
}

export function AskPage() {
  return (
    <div className="flex-1 px-4 sm:px-6 py-10 sm:py-14">
      <div className="max-w-3xl mx-auto space-y-6">
        <ChatPanel />
      </div>
    </div>
  );
}
