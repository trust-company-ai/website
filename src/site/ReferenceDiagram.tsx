/**
 * The community reference pattern, drawn as an architecture diagram in the
 * style of the contributed generic diagrams: labelled groupings, component
 * boxes, arrows for flows, dashed lines for control/logging, amber dashed for
 * the named cross-region exception. Pure SVG, scales with the column.
 */

// Palette matches the site: white page, ink text, navy accent.
const INK = "#0b0f17";
const MUTED = "rgba(11,15,23,0.6)";
const LINE = "rgba(11,15,23,0.5)";
const GROUP = "#1d3f8a";
const GROUP_FILL = "rgba(29,63,138,0.06)";
const AMBER = "#9a6a0f";
const AMBER_FILL = "rgba(154,106,15,0.08)";

function Box({
  x,
  y,
  w,
  h,
  title,
  lines,
  tone = "plain",
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  lines: string[];
  tone?: "plain" | "mid" | "dark" | "amber";
}) {
  const fill =
    tone === "amber"
      ? AMBER_FILL
      : tone === "dark"
        ? "rgba(11,15,23,0.10)"
        : tone === "mid"
          ? "rgba(11,15,23,0.055)"
          : "rgba(11,15,23,0.025)";
  const stroke = tone === "amber" ? AMBER : "rgba(11,15,23,0.25)";
  const cx = x + w / 2;
  const total = 1 + lines.length;
  const lineH = 10;
  const startY = y + h / 2 - ((total - 1) * lineH) / 2 + 3;
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={4}
        fill={fill}
        stroke={stroke}
        strokeWidth={tone === "amber" ? 1.2 : 1}
        strokeDasharray={tone === "amber" ? "4 3" : undefined}
      />
      <text
        x={cx}
        y={startY}
        textAnchor="middle"
        fontSize={9}
        fontWeight={600}
        fill={tone === "amber" ? AMBER : INK}
      >
        {title}
      </text>
      {lines.map((l, i) => (
        <text
          key={i}
          x={cx}
          y={startY + (i + 1) * lineH}
          textAnchor="middle"
          fontSize={7.6}
          fill={tone === "amber" ? AMBER : MUTED}
        >
          {l}
        </text>
      ))}
    </g>
  );
}

function Group({
  x,
  y,
  w,
  h,
  title,
  sub,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  sub?: string;
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={6}
        fill={GROUP_FILL}
        stroke={GROUP}
        strokeWidth={1.2}
      />
      <text
        x={x + w / 2}
        y={y + 13}
        textAnchor="middle"
        fontSize={8.5}
        fontWeight={700}
        fill={GROUP}
        letterSpacing={0.6}
      >
        {title}
      </text>
      {sub && (
        <text
          x={x + w / 2}
          y={y + 23}
          textAnchor="middle"
          fontSize={7.2}
          fill={MUTED}
        >
          {sub}
        </text>
      )}
    </g>
  );
}

function Arrow({
  d,
  dashed,
  amber,
  both,
}: {
  d: string;
  dashed?: boolean;
  amber?: boolean;
  both?: boolean;
}) {
  const color = amber ? AMBER : LINE;
  return (
    <path
      d={d}
      fill="none"
      stroke={color}
      strokeWidth={1.1}
      strokeDasharray={dashed ? "3 3" : undefined}
      markerEnd={amber ? "url(#arrow-amber)" : "url(#arrow)"}
      markerStart={
        both
          ? amber
            ? "url(#arrow-amber-start)"
            : "url(#arrow-start)"
          : undefined
      }
    />
  );
}

function Label({
  x,
  y,
  text,
  anchor = "middle",
}: {
  x: number;
  y: number;
  text: string;
  anchor?: "start" | "middle" | "end";
}) {
  return (
    <text x={x} y={y} textAnchor={anchor} fontSize={6.8} fill={MUTED}>
      {text}
    </text>
  );
}

function Defs() {
  return (
    <defs>
      <marker
        id="arrow"
        viewBox="0 0 8 8"
        refX="7"
        refY="4"
        markerWidth="6"
        markerHeight="6"
        orient="auto-start-reverse"
      >
        <path d="M0,0 L8,4 L0,8 z" fill={LINE} />
      </marker>
      <marker
        id="arrow-start"
        viewBox="0 0 8 8"
        refX="1"
        refY="4"
        markerWidth="6"
        markerHeight="6"
        orient="auto-start-reverse"
      >
        <path d="M8,0 L0,4 L8,8 z" fill={LINE} />
      </marker>
      <marker
        id="arrow-amber"
        viewBox="0 0 8 8"
        refX="7"
        refY="4"
        markerWidth="6"
        markerHeight="6"
        orient="auto-start-reverse"
      >
        <path d="M0,0 L8,4 L0,8 z" fill={AMBER} />
      </marker>
      <marker
        id="arrow-amber-start"
        viewBox="0 0 8 8"
        refX="1"
        refY="4"
        markerWidth="6"
        markerHeight="6"
        orient="auto-start-reverse"
      >
        <path d="M8,0 L0,4 L8,8 z" fill={AMBER} />
      </marker>
    </defs>
  );
}

/** Architecture: the five layers as components, groupings and flows. */
export function LayersDiagram() {
  return (
    <svg
      viewBox="0 0 640 400"
      width="100%"
      role="img"
      aria-label="Reference architecture: staff and identity provider on the left, the firm's own tenant in the centre with web app, gateway, orchestration, model, secrets, audit trail and scheduler, human review and a named cross-region exception on the right, read-only systems of record below."
      style={{ fontFamily: "inherit" }}
    >
      <Defs />

      {/* Left: people and identity (layer 1) */}
      <Box
        x={8}
        y={44}
        w={118}
        h={54}
        title="Trust company staff"
        lines={[
          "Browser only; nothing installed",
          "Existing corporate identity",
        ]}
      />
      <Box
        x={8}
        y={132}
        w={118}
        h={48}
        title="Company identity provider"
        lines={["Single sign-on, MFA enforced", "No separate AI logins"]}
      />
      <Arrow d="M67,98 L67,132" both />
      <Label x={72} y={118} text="sign-in" anchor="start" />

      {/* Centre: the firm's own tenant (layer 2) */}
      <Group
        x={140}
        y={14}
        w={330}
        h={296}
        title="THE FIRM'S OWN TENANT AND REGION"
        sub="Client data stays here. Retrieval, not training. Nothing leaves without approval."
      />

      <Box
        x={156}
        y={48}
        w={140}
        h={44}
        title="Web app"
        lines={["Chat interface for staff", "Source-cited answers"]}
      />
      <Box
        x={156}
        y={112}
        w={140}
        h={40}
        title="API gateway"
        lines={["Authenticated calls only"]}
      />
      <Box
        x={156}
        y={170}
        w={140}
        h={56}
        title="Orchestration"
        lines={[
          "Reads source systems, read-only",
          "Assembles the answer or draft",
          "Every output cites its source",
        ]}
      />
      <Box
        x={156}
        y={246}
        w={140}
        h={44}
        title="Scheduler"
        lines={[
          "Scheduled jobs: report drafts,",
          "screening exports (no model)",
        ]}
        tone="mid"
      />

      <Box
        x={316}
        y={48}
        w={140}
        h={44}
        title="Secrets store"
        lines={["Keys and credentials", "Least privilege"]}
      />
      <Box
        x={316}
        y={112}
        w={140}
        h={40}
        title="Audit trail (immutable)"
        lines={["Who asked what, when; outputs kept"]}
      />
      <Box
        x={316}
        y={170}
        w={140}
        h={56}
        title="Model"
        lines={[
          "Users never call it directly",
          "Model choice is a setting",
          "No training on the firm's data",
        ]}
      />

      {/* Flows inside the tenant */}
      <Arrow d="M126,71 L156,71" />
      <Label x={141} y={64} text="https" />
      <Arrow d="M126,156 L156,90" dashed />
      <Arrow d="M226,92 L226,112" />
      <Arrow d="M226,152 L226,170" />
      <Arrow d="M296,132 L316,132" dashed />
      <Label x={306} y={128} text="logs" />
      <Arrow d="M296,186 L316,186" />
      <Arrow d="M316,212 L296,212" />
      <Arrow d="M226,246 L226,226" />
      <Arrow d="M386,152 L386,170" dashed />

      {/* Right: human review (layer 4) */}
      <Box
        x={490}
        y={150}
        w={140}
        h={70}
        title="Human review"
        lines={[
          "Where AI output meets a decision,",
          "a named person decides.",
          "Nothing reaches a client unreviewed.",
        ]}
        tone="mid"
      />
      <Arrow d="M456,186 L490,186" />

      {/* Right: named exception, amber */}
      <Box
        x={490}
        y={240}
        w={140}
        h={60}
        title="Cross-region inference"
        lines={[
          "Named exception: documented,",
          "risk-accepted, drawn in amber",
          "Encrypted in transit; nothing stored",
        ]}
        tone="amber"
      />
      <Arrow d="M456,214 L490,262" dashed amber />

      {/* Bottom: systems of record, read-only */}
      <Arrow d="M226,290 L226,334" />
      <Label x={231} y={322} text="read-only" anchor="start" />
      <Group
        x={140}
        y={334}
        w={490}
        h={58}
        title="SYSTEMS OF RECORD  ·  read-only; nothing written back"
      />
      <Box
        x={150}
        y={354}
        w={112}
        h={30}
        title="Client and matter records"
        lines={[]}
      />
      <Box
        x={272}
        y={354}
        w={112}
        h={30}
        title="Document management"
        lines={[]}
      />
      <Box x={394} y={354} w={112} h={30} title="Trust accounting" lines={[]} />
      <Box
        x={516}
        y={354}
        w={106}
        h={30}
        title="Estate administration"
        lines={[]}
      />

      {/* Legend */}
      <g>
        <path
          d="M8,262 L36,262"
          stroke={LINE}
          strokeWidth={1.1}
          fill="none"
          markerEnd="url(#arrow)"
        />
        <Label x={40} y={264} text="data flow" anchor="start" />
        <path
          d="M8,278 L36,278"
          stroke={LINE}
          strokeWidth={1.1}
          strokeDasharray="3 3"
          fill="none"
          markerEnd="url(#arrow)"
        />
        <Label x={40} y={280} text="sign-in / logging" anchor="start" />
        <path
          d="M8,294 L36,294"
          stroke={AMBER}
          strokeWidth={1.1}
          strokeDasharray="3 3"
          fill="none"
          markerEnd="url(#arrow-amber)"
        />
        <Label x={40} y={296} text="named exception" anchor="start" />
      </g>
    </svg>
  );
}

/** Use-case tiers as a flow: more human judgment as consequence rises. */
export function TiersDiagram() {
  const y = 34;
  const h = 66;
  const w = 112;
  const gap = 12;
  const x0 = 18;
  const xs = [0, 1, 2, 3, 4].map(i => x0 + i * (w + gap));
  return (
    <svg
      viewBox="0 0 640 170"
      width="100%"
      role="img"
      aria-label="Use-case tiers by consequence, from internal work with no client data through drafting, decision-adjacent, regulatory with no model, to prohibited; a named exception is drawn in amber."
      style={{ fontFamily: "inherit" }}
    >
      <Defs />
      <Group
        x={6}
        y={6}
        w={628}
        h={114}
        title="MORE HUMAN JUDGMENT AS CONSEQUENCE RISES"
        sub="Route work by consequence, not by capability. The higher the stakes, the more human judgment stays in the loop."
      />
      <Box
        x={xs[0]}
        y={y}
        w={w}
        h={h}
        title="Tier 0 · Internal"
        lines={["No client data", "Policies, public guidance,", "helpdesk"]}
      />
      <Box
        x={xs[1]}
        y={y}
        w={w}
        h={h}
        title="Tier 1 · Drafting only"
        lines={[
          "Client data; output labelled",
          "as a draft, edited by",
          "a professional",
        ]}
      />
      <Box
        x={xs[2]}
        y={y}
        w={w}
        h={h}
        title="Tier 2 · Decision-adjacent"
        lines={[
          "One input; a named",
          "decision-maker records",
          "the reasoning",
        ]}
        tone="mid"
      />
      <Box
        x={xs[3]}
        y={y}
        w={w}
        h={h}
        title="Regulatory · No model"
        lines={["Deterministic rules;", "automatic suspension", "on variance"]}
        tone="dark"
      />
      <Box
        x={xs[4]}
        y={y}
        w={w}
        h={h}
        title="Prohibited, for now"
        lines={[
          "Autonomous approvals,",
          "unattended client contact,",
          "execution",
        ]}
        tone="dark"
      />
      {xs.slice(0, 4).map((x, i) => (
        <Arrow
          key={i}
          d={`M${x + w},${y + h / 2} L${x + w + gap},${y + h / 2}`}
        />
      ))}
      <Label x={x0} y={y + h + 14} text="← less consequence" anchor="start" />
      <Label
        x={xs[4] + w}
        y={y + h + 14}
        text="more consequence, more human judgment →"
        anchor="end"
      />
      <Box
        x={264}
        y={130}
        w={112}
        h={36}
        title="Named exception"
        lines={["Documented, risk-accepted,", "drawn in amber"]}
        tone="amber"
      />
      <Arrow
        d={`M${xs[2] + w / 2},${y + h} L${xs[2] + w / 2},130`}
        dashed
        amber
      />
    </svg>
  );
}
