"use client";
import NextLink from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, type AnchorHTMLAttributes } from "react";

/* Thin adapter over the Next.js App Router so the rest of the code keeps one tiny API:
   <Link href="/templates/atrium#prompts">, usePath(), useNavigate(). */

export const usePath = () => usePathname() || "/";

function scrollToAnchor(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

/** Imperative navigation that understands "#anchor" suffixes. */
export function useNavigate() {
  const router = useRouter();
  return useCallback(
    (href: string) => {
      const [p, anchor] = href.split("#");
      const here = location.pathname.replace(/\/$/, "") || "/";
      const target = p ? p.replace(/\/$/, "") || "/" : here;
      if (target === here) {
        if (anchor) scrollToAnchor(anchor);
        else window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      router.push(p || "/");
      if (anchor) setTimeout(() => scrollToAnchor(anchor), 450);
    },
    [router]
  );
}

export function Link({ href, children, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  return (
    <NextLink href={href} {...rest}>
      {children}
    </NextLink>
  );
}
