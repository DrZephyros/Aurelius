"use client";

import { useRef, useState, type CSSProperties } from "react";

export type OtpInputProps = {
  length?: number;
  /** Fires on every change with the current string. */
  onChange?: (code: string) => void;
  /** Fires once all boxes are filled. */
  onComplete?: (code: string) => void;
  /** Shakes the boxes and tints them red. */
  error?: boolean;
  autoFocus?: boolean;
  className?: string;
  style?: CSSProperties;
};

const CSS = `.au-otp{display:flex;gap:10px}
.au-otp input{width:52px;height:60px;text-align:center;font-size:24px;font-weight:600;border-radius:14px;border:1px solid var(--au-border,rgb(255 255 255/.18));background:rgb(255 255 255/.04);color:inherit;outline:none;caret-color:var(--au-accent,#5cffc4);transition:border-color .2s,box-shadow .2s,transform .2s}
.au-otp input:focus{border-color:var(--au-accent,#5cffc4);box-shadow:0 0 0 4px color-mix(in srgb,var(--au-accent,#5cffc4) 18%,transparent);transform:translateY(-2px)}
.au-otp.au-bad input{border-color:#ff6b81;animation:au-shake .4s}
@keyframes au-shake{25%{transform:translateX(-5px)}75%{transform:translateX(5px)}}
@media(max-width:420px){.au-otp{gap:6px}.au-otp input{width:42px;height:52px}}`;

/** One-time-code entry: auto-advance, backspace, arrow keys, paste, and iOS/Android SMS autofill. */
export function OtpInput({ length = 6, onChange, onComplete, error, autoFocus, className, style }: OtpInputProps) {
  const [v, setV] = useState<string[]>(() => Array(length).fill(""));
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const commit = (next: string[]) => {
    setV(next);
    const code = next.join("");
    onChange?.(code);
    if (code.length === length) onComplete?.(code);
  };
  const put = (i: number, digits: string) => {
    const next = [...v];
    let k = i;
    for (const d of digits.replace(/\D/g, "").slice(0, length - i)) next[k++] = d;
    commit(next);
    refs.current[Math.min(k, length - 1)]?.focus();
  };

  return (
    <div className={`au-otp ${error ? "au-bad" : ""} ${className ?? ""}`} style={style} role="group" aria-label="One-time code">
      <style>{CSS}</style>
      {v.map((d, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          value={d}
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={length}
          autoFocus={autoFocus && i === 0}
          aria-label={`Digit ${i + 1}`}
          onFocus={(e) => e.target.select()}
          onChange={(e) => (e.target.value ? put(i, e.target.value) : commit(v.map((x, j) => (j === i ? "" : x))))}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && !v[i] && i > 0) { e.preventDefault(); commit(v.map((x, j) => (j === i - 1 ? "" : x))); refs.current[i - 1]?.focus(); }
            if (e.key === "ArrowLeft" && i > 0) refs.current[i - 1]?.focus();
            if (e.key === "ArrowRight" && i < length - 1) refs.current[i + 1]?.focus();
          }}
          onPaste={(e) => { e.preventDefault(); put(i, e.clipboardData.getData("text")); }}
        />
      ))}
    </div>
  );
}
