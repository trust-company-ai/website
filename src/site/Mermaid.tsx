import { useEffect, useId, useState } from "react";

/** Renders a ```mermaid fenced block as an SVG diagram (client-side). */
export function Mermaid({ code }: { code: string }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "strict",
          theme: "base",
          themeVariables: {
            background: "#ffffff",
            primaryColor: "#f3f4f6",
            primaryTextColor: "#0b0f17",
            primaryBorderColor: "rgba(11,15,23,0.25)",
            lineColor: "rgba(11,15,23,0.6)",
            secondaryColor: "#eceef1",
            tertiaryColor: "#f7f8fa",
          },
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter Variable", "Helvetica Neue", Helvetica, Arial, sans-serif',
          flowchart: { htmlLabels: false, useMaxWidth: true },
        });
        const { svg } = await mermaid.render(`mmd-${id}`, code.trim());
        if (!cancelled) setSvg(svg);
      } catch (e) {
        if (!cancelled) setError(String(e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [code, id]);

  if (error)
    return (
      <pre className="my-4 overflow-x-auto rounded-xl bg-muted p-4 text-[13px] leading-relaxed">
        <code>{code}</code>
      </pre>
    );
  if (!svg)
    return (
      <div
        className="my-4 h-24 rounded-xl bg-muted animate-pulse"
        data-testid="mermaid-loading"
      />
    );
  return (
    <div
      className="my-6 overflow-x-auto [&>svg]:mx-auto [&>svg]:h-auto [&>svg]:max-w-full"
      data-testid="mermaid"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
