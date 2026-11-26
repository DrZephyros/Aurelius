"use client";

import { createContext, useContext, useEffect, useLayoutEffect, useState, useTransition, type AnchorHTMLAttributes, type MouseEvent, type ReactNode } from "react";

/* Real-URL router (History API). Every page has a proper path — /skill, /templates/folio — so the back button,
   refresh, deep links and "open in new tab" all behave. Links may carry an in-page anchor: "/skill#pricing".
   The Next.js catch-all route renders this client app for every path. */

const ctx = createContext("/");
const pendingCtx = createContext(false);
let pendingAnchor: string | null = null;
/** Only used when the History API is unavailable (sandboxed / file:// / srcdoc frames): navigation keeps working in memory. */
let memoryPath: string | null = null;

const clean = (p: string) => (p.replace(/\/+$/, "") || "/");
const current = () => memoryPath ?? clean(location.pathname);

/** Jump (never glide) — html has scroll-behavior:smooth, which made every page change crawl back to the top. */
const jumpTop = () => {
  const root = document.documentElement;
  const prev = root.style.scrollBehavior;
  root.style.scrollBehavior = "auto";
  window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
  root.scrollTop = 0;
  document.body.scrollTop = 0;
  root.style.scrollBehavior = prev;
};

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
  try {
    history.pushState({}, "", target);
    memoryPath = null;
  } catch {
    memoryPath = target;
  }
  window.dispatchEvent(new Event("aurelius:nav"));
}

export function Router({ children }: { children: ReactNode }) {
  const [path, setPath] = useState(() => {
    // legacy "#/route" links still work: upgrade them to real paths
    if (location.hash.startsWith("#/")) {
      const p = clean(location.hash.slice(1).split("?")[0]);
      try { history.replaceState({}, "", p); } catch { memoryPath = p; }
      return p;
    }
    return current();
  });
  const [pending, startNav] = useTransition();
  useEffect(() => {
    // the old page stays interactive while the next one renders, so a heavy page never freezes the nav
    const on = () => startNav(() => setPath(current()));
    const onPop = () => { memoryPath = null; on(); };
    addEventListener("popstate", onPop);
    addEventListener("aurelius:nav", on);
    return () => {
      removeEventListener("popstate", onPop);
      removeEventListener("aurelius:nav", on);
    };
  }, []);
  useLayoutEffect(() => {
    const a = pendingAnchor;
    pendingAnchor = null;
    jumpTop();
    if (a) requestAnimationFrame(() => setTimeout(() => scrollToAnchor(a), 60));
  }, [path]);
  return (
    <ctx.Provider value={path}>
      <pendingCtx.Provider value={pending}>{children}</pendingCtx.Provider>
    </ctx.Provider>
  );
}

export const usePath = () => useContext(ctx);
/** true while the next page is being prepared */
export const useNavPending = () => useContext(pendingCtx);

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
