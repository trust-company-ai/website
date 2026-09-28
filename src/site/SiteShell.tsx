import { useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { getVisitorId } from "@/lib/visitor";
import { Link, Outlet, useLocation } from "react-router";
import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Mark } from "./Mark";

export const NAV = [{ to: "/library", label: "Library" }];
export const GITHUB_URL = "https://github.com/trust-company-ai/community";

function GitHubMark() {
  return (
    <svg
      viewBox="0 0 16 16"
      width={20}
      height={20}
      aria-hidden="true"
      className="size-5 shrink-0 fill-current"
    >
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}

/** Same bar as the splash page: sticky, frosted once you scroll. */
export function SiteHeader({ dark: _dark = false }: { dark?: boolean }) {
  return (
    <header className="sticky top-0 z-50 border-b border-black/[.06] bg-white/80 backdrop-blur-md text-foreground">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex h-16 sm:h-[4.5rem] items-center">
          <Link
            to="/"
            className="flex items-center gap-3 font-sans font-semibold text-[17px] sm:text-lg tracking-tight hover:opacity-80"
          >
            <span className="flex size-9 items-center justify-center rounded-[10px] bg-navy">
              <Mark className="size-6 !text-white" />
            </span>
            <span>{APP_NAME}</span>
          </Link>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            data-testid="header-github"
            className="ml-auto flex items-center gap-2 rounded-full bg-[#f3f4f6] px-4 py-2 text-[15px] font-medium text-ink/85 transition-colors hover:bg-[#eceef1] hover:text-ink"
          >
            <GitHubMark />
            <span>GitHub version</span>
          </a>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-20 sm:mt-28 border-t border-black/10 text-foreground">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-14 flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between text-sm">
        <div className="space-y-3">
          <div className="flex items-center gap-3 font-sans font-semibold text-lg tracking-tight">
            <span className="flex size-9 items-center justify-center rounded-[10px] bg-navy">
              <Mark className="size-6 !text-white" />
            </span>
            {APP_NAME}
          </div>
          <p className="font-mono text-[12.5px] tracking-[0.2em] text-ink/50">trustorgs.ai</p>
        </div>
        <nav className="flex flex-wrap gap-x-10 sm:gap-x-14 gap-y-2 text-[15px] text-ink/70">
          {[...NAV, { to: "/submit", label: "Contribute" }].map(n => (
            <Link
              key={n.to}
              to={n.to}
              className="hover:text-ink"
            >
              {n.label}
            </Link>
          ))}
          <span>Apache-2.0</span>
        </nav>
      </div>
    </footer>
  );
}

export function SiteShell() {
  const { pathname } = useLocation();
  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll to top on every navigation
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);
  const hit = useMutation(api.analytics.hit);
  // Page-view count: path + anonymous browser id only.
  // biome-ignore lint/correctness/useExhaustiveDependencies: one hit per navigation
  useEffect(() => {
    hit({ path: pathname, visitor: getVisitorId() }).catch(() => {});
  }, [pathname]);
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader dark={pathname === "/"} />
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
}

/* ---------- shared building blocks ---------- */

export function Page({
  title,
  lede,
  children,
  wide,
}: {
  title: string;
  lede?: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    document.title = `${title} — ${APP_NAME}`;
    return () => {
      document.title = APP_NAME;
    };
  }, [title]);
  return (
    <div
      className={cn(
        "mx-auto w-full px-4 sm:px-6 py-12 sm:py-16",
        wide ? "max-w-6xl" : "max-w-3xl",
      )}
    >
      <header className="mb-10 space-y-3">
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight">
          {title}
        </h1>
        {lede && (
          <p className="text-lg text-muted-foreground leading-relaxed">
            {lede}
          </p>
        )}
      </header>
      <div className="space-y-12">{children}</div>
    </div>
  );
}

export function Section({
  heading,
  children,
  id,
}: {
  heading?: string;
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <section id={id} className="space-y-4">
      {heading && (
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
          {heading}
        </h2>
      )}
      <div className="space-y-4 text-[17px] leading-relaxed text-foreground/90">
        {children}
      </div>
    </section>
  );
}

export function Cta({
  to,
  children,
  variant = "primary",
  external,
}: {
  to: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  external?: boolean;
}) {
  const cls = cn(
    "inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-colors",
    variant === "primary"
      ? "bg-primary text-primary-foreground hover:opacity-90"
      : "bg-[#f3f4f6] hover:bg-[#eceef1]",
  );
  if (external)
    return (
      <a href={to} className={cls} target="_blank" rel="noreferrer">
        {children}
      </a>
    );
  return (
    <Link to={to} className={cls}>
      {children}
    </Link>
  );
}

export function Bullets({ items }: { items: (string | React.ReactNode)[] }) {
  return (
    <ul className="space-y-2.5 pl-5 list-disc marker:text-muted-foreground">
      {items.map((it, i) => (
        <li key={i}>{it}</li>
      ))}
    </ul>
  );
}
