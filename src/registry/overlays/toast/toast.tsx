"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";

export type ToastInput = { title: string; description?: string; type?: "info" | "success" | "error"; /** ms; 0 = sticky */ duration?: number };
type T = Required<Pick<ToastInput, "title" | "type" | "duration">> & { id: number; description?: string };

const Ctx = createContext<(t: ToastInput) => void>(() => {});

/** `const toast = useToast(); toast({ title: "Saved", type: "success" })` */
export const useToast = () => useContext(Ctx);

const CSS = `.au-ts{position:fixed;right:18px;bottom:18px;z-index:2000;display:flex;flex-direction:column;gap:10px;width:min(360px,calc(100vw - 36px));pointer-events:none}
.au-ts-i{pointer-events:auto;position:relative;overflow:hidden;display:flex;gap:12px;padding:14px 16px;border-radius:16px;background:rgb(12 17 29/.92);color:#e9f1f5;border:1px solid rgb(255 255 255/.12);backdrop-filter:blur(14px);box-shadow:0 20px 50px -15px rgb(0 0 0/.6);animation:au-ts-in .5s cubic-bezier(.16,1,.3,1)}
.au-ts-i.au-out{animation:au-ts-out .3s forwards}
.au-ts-d{width:8px;height:8px;border-radius:50%;margin-top:6px;flex-shrink:0;background:var(--au-c)}
.au-ts-b{position:absolute;left:0;bottom:0;height:2px;width:100%;background:var(--au-c);transform-origin:0 50%;animation:au-ts-bar var(--au-dur) linear forwards}
.au-ts-i:hover .au-ts-b{animation-play-state:paused}
@keyframes au-ts-in{from{opacity:0;transform:translateY(16px) scale(.96)}}@keyframes au-ts-out{to{opacity:0;transform:translateX(30px)}}@keyframes au-ts-bar{to{transform:scaleX(0)}}
@media (prefers-reduced-motion:reduce){.au-ts-i{animation:none}}`;
const COLORS = { info: "#3de7ff", success: "#5cffc4", error: "#ff6b81" } as const;

/** Wrap your app once (e.g. in app/layout.tsx) then call `useToast()` anywhere below it. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [list, setList] = useState<(T & { out?: boolean })[]>([]);
  const n = useRef(0);
  const dismiss = useCallback((id: number) => {
    setList((l) => l.map((t) => (t.id === id ? { ...t, out: true } : t)));
    setTimeout(() => setList((l) => l.filter((t) => t.id !== id)), 300);
  }, []);
  const push = useCallback((t: ToastInput) => {
    const id = ++n.current;
    const toast = { id, title: t.title, description: t.description, type: t.type ?? "info", duration: t.duration ?? 4000 } as T;
    setList((l) => [...l.slice(-3), toast]);
    if (toast.duration) setTimeout(() => dismiss(id), toast.duration);
  }, [dismiss]);

  return (
    <Ctx.Provider value={push}>
      {children}
      <style>{CSS}</style>
      <div className="au-ts" role="region" aria-label="Notifications" aria-live="polite">
        {list.map((t) => (
          <div key={t.id} className={`au-ts-i ${t.out ? "au-out" : ""}`} style={{ ["--au-c" as string]: COLORS[t.type], ["--au-dur" as string]: `${t.duration}ms` }} role={t.type === "error" ? "alert" : "status"}>
            <span className="au-ts-d" />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{t.title}</div>
              {t.description && <div style={{ fontSize: 13, opacity: 0.65, marginTop: 2 }}>{t.description}</div>}
            </div>
            <button onClick={() => dismiss(t.id)} aria-label="Dismiss" style={{ opacity: 0.5, cursor: "pointer", color: "inherit" }}>✕</button>
            {t.duration > 0 && <span className="au-ts-b" />}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
