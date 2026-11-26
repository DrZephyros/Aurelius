"use client";

import { createContext, useContext, useEffect, useState, type AnchorHTMLAttributes, type MouseEvent, type ReactNode } from "react";

/* Real-URL router (History API). Every page has a proper path — /skill, /templates/folio — so the back button,
   refresh, deep links and "open in new tab" all behave. Links may carry an in-page anchor: "/skill#pricing".
   The Next.js catch-all route renders this client app for every path. */

const ctx = createContext("/");
let pendingAnchor: string | null = null;

const clean = (p: string) => (p.replace(/\/+$/, "") || "/");
const current = () => clean(location.pathname);

function scrollToAnchor(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function navigate(href: string) {
  const [rawPath, anchor] = href.split("#");
  const target = clean((rawPath || current()).split("?")[0]);
  pendingAnchor = anchor || null;
  if (target === current()) {
    if (anchor) scrollToAnchor(anchor);
    else window.scrollTo({ top: 0, behavior: "smooth" });
    pendingAnchor = null;
    return;
  }
  history.pushState({}, "", target);
  window.dispatchEvent(new Event("aurelius:nav"));
}

export function Router({ children }: { children: ReactNode }) {
  const [path, setPath] = useState(() => {
    // legacy "#/route" links still work: upgrade them to real paths
    if (location.hash.startsWith("#/")) {
      const p = clean(location.hash.slice(1).split("?")[0]);
      history.replaceState({}, "", p);
      return p;
    }
    return current();
  });
  useEffect(() => {
    const on = () => setPath(current());
    addEventListener("popstate", on);
    addEventListener("aurelius:nav", on);
    return () => {
      removeEventListener("popstate", on);
      removeEventListener("aurelius:nav", on);
    };
  }, []);
  useEffect(() => {
    const a = pendingAnchor;
    pendingAnchor = null;
    if (a) requestAnimationFrame(() => setTimeout(() => scrollToAnchor(a), 60));
    else window.scrollTo(0, 0);
  }, [path]);
  return <ctx.Provider value={path}>{children}</ctx.Provider>;
}

export const usePath = () => useContext(ctx);

export function Link({ href, onClick, children, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  const path = href.split("#")[0];
  return (
    <a
      {...rest}
      href={path ? href : href}
      onClick={(e: MouseEvent<HTMLAnchorElement>) => {
        onClick?.(e);
        if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0 || rest.target === "_blank") return;
        e.preventDefault();
        navigate(href);
      }}
    >
      {children}
    </a>
  );
}

/** Imperative navigation that understands "#anchor" suffixes. */
export const useNavigate = () => navigate;
