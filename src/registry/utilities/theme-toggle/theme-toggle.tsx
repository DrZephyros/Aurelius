"use client";

import { useEffect, useState, type CSSProperties } from "react";

export type ThemeToggleProps = {
  /** localStorage key. */
  storageKey?: string;
  /** "class" toggles `dark` on <html> (Tailwind); "attribute" sets `data-theme="dark|light"`. */
  mode?: "class" | "attribute";
  size?: number;
  className?: string;
  style?: CSSProperties;
};

/** Put this string in an inline <script> in <head> to set the theme BEFORE first paint (prevents a flash). */
export const themeInitScript = (storageKey = "theme", mode: "class" | "attribute" = "class") =>
  `(function(){try{var t=localStorage.getItem(${JSON.stringify(storageKey)});if(!t)t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";var d=document.documentElement;${mode === "class" ? 'd.classList.toggle("dark",t==="dark")' : 'd.setAttribute("data-theme",t)'};d.style.colorScheme=t}catch(e){}})()`;

const CSS = `.au-th{position:relative;display:grid;place-items:center;border-radius:50%;border:1px solid var(--au-border,rgb(255 255 255/.18));background:rgb(255 255 255/.05);color:inherit;cursor:pointer;overflow:hidden;transition:background .2s,transform .2s}.au-th:hover{background:rgb(255 255 255/.1);transform:rotate(12deg)}
.au-th svg{position:absolute;transition:transform .6s cubic-bezier(.16,1,.3,1),opacity .4s}
.au-th .au-sun{transform:rotate(0) scale(1)}.au-th .au-moon{transform:rotate(-90deg) scale(.3);opacity:0}
.au-th[data-theme=dark] .au-sun{transform:rotate(90deg) scale(.3);opacity:0}.au-th[data-theme=dark] .au-moon{transform:none;opacity:1}`;

/** Sun/moon switch that persists the choice and syncs with the OS preference on first visit. */
export function ThemeToggle({ storageKey = "theme", mode = "class", size = 40, className, style }: ThemeToggleProps) {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  useEffect(() => {
    const d = document.documentElement;
    setTheme(mode === "class" ? (d.classList.contains("dark") ? "dark" : "light") : d.getAttribute("data-theme") === "light" ? "light" : "dark");
  }, [mode]);
  const flip = () => {
    const next = theme === "dark" ? "light" : "dark";
    const d = document.documentElement;
    if (mode === "class") d.classList.toggle("dark", next === "dark"); else d.setAttribute("data-theme", next);
    d.style.colorScheme = next;
    try { localStorage.setItem(storageKey, next); } catch {}
    setTheme(next);
  };
  return (
    <button type="button" className={`au-th ${className ?? ""}`} data-theme={theme} onClick={flip} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`} style={{ width: size, height: size, ...style }}>
      <style>{CSS}</style>
      <svg className="au-sun" width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
      <svg className="au-moon" width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>
    </button>
  );
}
