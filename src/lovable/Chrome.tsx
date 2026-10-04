import { Link, NavLink } from "react-router";
import type { ReactNode } from "react";

const nav = [
  { to: "/about", label: "About" },
  { to: "/agenda", label: "Mission" },
  { to: "/membership", label: "Membership" },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-primary font-display text-lg text-primary-foreground">T</span>
          <span className="font-display text-lg leading-tight">The Trust Industry<br className="sm:hidden" /> AI Association</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          {nav.map((n) => (
            <NavLink key={n.to} to={n.to} className={({ isActive }) => `hidden hover:text-foreground sm:inline ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
              {n.label}
            </NavLink>
          ))}
          <Link to="/membership" className="rounded-sm bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90">
            Join
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="bg-ink text-ink-foreground">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-2">
        <div>
          <p className="font-display text-2xl">The Trust Industry AI Association</p>
          <p className="mt-3 text-sm opacity-70">Not a trust company. An association of trust companies navigating AI together.</p>
        </div>
                <div className="text-sm opacity-80">
          <p className="eyebrow text-brass">Explore</p>
          <ul className="mt-3 space-y-1">
            {nav.map((n) => (
              <li key={n.to}><Link to={n.to} className="hover:text-brass">{n.label}</Link></li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-ink-foreground/10 py-6 text-center text-xs opacity-50">
        © {new Date().getFullYear()} The Trust Industry AI Association. Not a trust company. The association does not provide trust or fiduciary services.
      </div>
    </footer>
  );
}

export function PageHero({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <p className="eyebrow fade-up text-accent">{eyebrow}</p>
        <h1 className="fade-up mt-4 max-w-4xl text-5xl leading-[1.05] md:text-7xl">{title}</h1>
        {children && <div className="fade-up mt-6 max-w-2xl text-lg text-muted-foreground">{children}</div>}
      </div>
    </section>
  );
}
