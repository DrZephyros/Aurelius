"use client";

import { useEffect, useState, type CSSProperties } from "react";

export type CookieBannerProps = {
  message?: string;
  policyHref?: string;
  /** localStorage key. */
  storageKey?: string;
  /** Called with the saved choice on load (if present) and when the user chooses. */
  onChoice?: (choice: "accepted" | "rejected") => void;
  className?: string;
  style?: CSSProperties;
};

/** Read the stored choice anywhere (e.g. before loading analytics). */
export function getConsent(storageKey = "au-cookie-consent"): "accepted" | "rejected" | null {
  try { return (localStorage.getItem(storageKey) as "accepted" | "rejected" | null) ?? null; } catch { return null; }
}

const CSS = `.au-ck{position:fixed;left:50%;bottom:20px;z-index:1500;width:min(640px,calc(100vw - 32px));display:flex;gap:18px;align-items:center;flex-wrap:wrap;padding:16px 18px 16px 22px;border-radius:22px;background:rgb(12 17 29/.92);color:#e9f1f5;border:1px solid rgb(255 255 255/.14);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);box-shadow:0 30px 80px -20px rgb(0 0 0/.7);transform:translate(-50%,0);animation:au-ck .7s cubic-bezier(.16,1,.3,1)}
.au-ck p{flex:1 1 260px;margin:0;font-size:14px;line-height:1.5;opacity:.8}.au-ck a{color:var(--au-accent,#5cffc4)}
.au-ck button{height:40px;padding:0 18px;border-radius:999px;font-size:14px;font-weight:600;cursor:pointer;color:inherit;border:1px solid rgb(255 255 255/.22)}.au-ck button:first-of-type{background:var(--au-accent,#5cffc4);color:var(--au-bg,#021510);border-color:transparent}
@keyframes au-ck{from{opacity:0;transform:translate(-50%,24px)}}@media (prefers-reduced-motion:reduce){.au-ck{animation:none}}`;

/** GDPR-style consent bar. Remembers the choice; call `getConsent()` before loading trackers. */
export function CookieBanner({ message = "We use cookies to understand how the site is used and to improve it.", policyHref = "/privacy", storageKey = "au-cookie-consent", onChoice, className, style }: CookieBannerProps) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const c = getConsent(storageKey);
    if (c) onChoice?.(c); else setShow(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);
  if (!show) return null;
  const pick = (c: "accepted" | "rejected") => { try { localStorage.setItem(storageKey, c); } catch {} setShow(false); onChoice?.(c); };
  return (
    <div className={`au-ck ${className ?? ""}`} style={style} role="dialog" aria-label="Cookie consent">
      <style>{CSS}</style>
      <p>{message} <a href={policyHref}>Learn more</a></p>
      <button onClick={() => pick("accepted")}>Accept</button>
      <button onClick={() => pick("rejected")}>Reject</button>
    </div>
  );
}
