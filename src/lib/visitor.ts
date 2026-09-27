/** Anonymous per-browser id (random, stored locally). Used for the daily question limit and the page-view count. Never personal. */
export function getVisitorId(): string {
  try {
    const k = "tcai.visitor";
    let id = window.localStorage.getItem(k);
    if (!id) {
      id = Array.from(crypto.getRandomValues(new Uint8Array(12)), b =>
        b.toString(16).padStart(2, "0"),
      ).join("");
      window.localStorage.setItem(k, id);
    }
    return id;
  } catch {
    return "nostorage";
  }
}
