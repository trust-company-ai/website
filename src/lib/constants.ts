/**
 * The site is served at two addresses and carries the matching name at each:
 * trustcompanyai.org shows "TrustCompanyAI.org", every other address shows
 * "TrustOrgs.AI". Decided once at load from the hostname. A `?site=` query
 * value (kept for the tab in sessionStorage) lets the preview copy show either.
 */
export type SiteKey = "trustorgs" | "trustcompanyai";

const SITE_STORE = "tcai.site";

function detectSite(): SiteKey {
  if (typeof window === "undefined") return "trustorgs";
  try {
    const q = new URLSearchParams(window.location.search).get("site");
    if (q === "trustcompanyai" || q === "trustorgs") {
      window.sessionStorage.setItem(SITE_STORE, q);
      return q;
    }
    const saved = window.sessionStorage.getItem(SITE_STORE);
    if (saved === "trustcompanyai" || saved === "trustorgs") return saved;
  } catch {
    /* ignore */
  }
  // trustcompany.org (the association) and trustcompanyai.org both get the association site.
  return window.location.hostname.toLowerCase().includes("trustcompany") ? "trustcompanyai" : "trustorgs";
}

export const SITE: SiteKey = detectSite();

export const APP_NAME = SITE === "trustcompanyai" ? "TrustCompanyAI.org" : "TrustOrgs.AI";

/** Short address shown in the footer. */
export const SITE_DOMAIN =
  SITE === "trustcompanyai"
    ? typeof window !== "undefined" && /(^|\.)trustcompany\.org$/i.test(window.location.hostname)
      ? "trustcompany.org"
      : "trustcompanyai.org"
    : "trustorgs.ai";
