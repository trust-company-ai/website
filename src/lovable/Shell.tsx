import { useEffect } from "react";
import { Outlet, useLocation } from "react-router";
import { SiteFooter, SiteHeader } from "./Chrome";

/** Lovable-built pages for the trustcompanyai.org door, with their own palette scoped under .lv. */
export function LvShell() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1));
      if (el) { el.scrollIntoView(); return; }
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);
  return (
    <div className="lv min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main>
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
}
