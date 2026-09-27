/**
 * Token proving this page entered the site password (see convex/gate.ts).
 * Kept in memory only — never in localStorage/sessionStorage — so every visit
 * (and every reload) starts on the splash page and asks for the password again.
 */
let token: string | undefined;

export function getGateToken(): string | undefined {
  return token;
}

export function setGateToken(t: string): void {
  token = t;
}

const USER_KEY = "tcai.user";

/** Email the visitor signed in with (empty for the master password). Used to prefill the support form. */
export function getGateUser(): string {
  try {
    return window.localStorage.getItem(USER_KEY) ?? "";
  } catch {
    return "";
  }
}

export function setGateUser(email: string): void {
  try {
    if (email) window.localStorage.setItem(USER_KEY, email);
    else window.localStorage.removeItem(USER_KEY);
  } catch {
    /* ignore */
  }
}
