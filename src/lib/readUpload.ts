/** Reads a .docx / .md / .txt file into plain text. Shared by the home-page drop zone and the Contribute form. */

export const ACCEPTED_EXT = ".docx,.md,.txt";
export const UPLOAD_HINT = "Please upload a .docx, .md or .txt file (or paste text).";

/** Very small HTML → text/markdown-ish converter for .docx uploads. */
function htmlToText(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const out: string[] = [];
  const walk = (el: Element) => {
    for (const node of Array.from(el.children)) {
      const tag = node.tagName.toLowerCase();
      const t = (node.textContent ?? "").trim();
      if (/^h[1-6]$/.test(tag)) out.push(`${"#".repeat(Number(tag[1]))} ${t}`);
      else if (tag === "ul" || tag === "ol") {
        Array.from(node.children).forEach((li, i) => {
          out.push(
            `${tag === "ol" ? `${i + 1}.` : "-"} ${(li.textContent ?? "").trim()}`,
          );
        });
      } else if (tag === "table") {
        for (const tr of Array.from(node.querySelectorAll("tr")))
          out.push(
            Array.from(tr.children)
              .map(td => (td.textContent ?? "").trim())
              .join(" | "),
          );
      } else if (t) out.push(t);
    }
  };
  walk(doc.body);
  return out.join("\n\n");
}

export async function readUpload(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  if (name.endsWith(".docx")) {
    const mammoth = await import("mammoth");
    const buf = await file.arrayBuffer();
    const r = await mammoth.convertToHtml({ arrayBuffer: buf });
    return htmlToText(r.value);
  }
  if (name.endsWith(".txt") || name.endsWith(".md")) return await file.text();
  throw new Error(UPLOAD_HINT);
}

/** What the home-page drop zone hands to /submit via router state. */
export type DroppedUpload = { text: string; fileName: string };
