import { createContext, useContext, useEffect, useState, type AnchorHTMLAttributes, type ReactNode } from "react";

/* Tiny hash router. The whole site is one static html file, so routes live after the "#":
   #/  ·  #/templates/<slug>  ·  #/prompts
   Links may carry an in-page anchor:  "/#gallery"  or  "/templates/atrium#prompts" */

const ctx = createContext("/");
let pendingAnchor: string | null = null;

const current = () => {
  const h = location.hash.replace(/^#/, "");
  return h.startsWith("/") ? h.split("?")[0] : "/";
};

function scrollToAnchor(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function navigate(href: string) {
  const [path, anchor] = href.split("#");
  const target = path || current();
  pendingAnchor = anchor || null;
  if (target === current()) {
    if (anchor) scrollToAnchor(anchor);
    else window.scrollTo({ top: 0, behavior: "smooth" });
    pendingAnchor = null;
    return;
  }
  location.hash = target;
}

export function Router({ children }: { children: ReactNode }) {
  const [path, setPath] = useState(current);
  useEffect(() => {
    const on = () => setPath(current());
    addEventListener("hashchange", on);
    return () => removeEventListener("hashchange", on);
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
  const path = href.split("#")[0] || current();
  return (
    <a
      {...rest}
      href={"#" + path}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        navigate(href);
      }}
    >
      {children}
    </a>
  );
}
