"use client";

import { useId, type CSSProperties, type InputHTMLAttributes } from "react";

export type FloatingLabelInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "placeholder" | "style"> & {
  label: string;
  /** Error message (turns the field red and sets aria-invalid). */
  error?: string;
  /** Helper text shown when there's no error. */
  hint?: string;
  style?: CSSProperties;
};

const CSS = `.au-fl{position:relative}
.au-fl input{width:100%;height:56px;padding:22px 16px 6px;border-radius:14px;border:1px solid var(--au-border,rgb(255 255 255/.16));background:rgb(255 255 255/.04);color:inherit;font:inherit;outline:none;transition:border-color .2s,box-shadow .2s,background .2s}
.au-fl input:focus{border-color:var(--au-accent,#5cffc4);box-shadow:0 0 0 4px color-mix(in srgb,var(--au-accent,#5cffc4) 18%,transparent);background:rgb(255 255 255/.06)}
.au-fl label{position:absolute;left:17px;top:18px;pointer-events:none;opacity:.55;transform-origin:0 0;transition:transform .2s cubic-bezier(.2,.8,.2,1),opacity .2s,color .2s}
.au-fl input:focus+label,.au-fl input:not(:placeholder-shown)+label{transform:translateY(-11px) scale(.76);opacity:.8}
.au-fl input:focus+label{color:var(--au-accent,#5cffc4);opacity:1}
.au-fl.au-err input{border-color:#ff6b81;box-shadow:0 0 0 4px rgb(255 107 129/.15)}
.au-fl.au-err input:focus+label,.au-fl.au-err label{color:#ff6b81}
.au-fl-m{margin:6px 4px 0;font-size:12.5px;opacity:.65}.au-fl.au-err .au-fl-m{color:#ff6b81;opacity:1}`;

/** Text input whose label floats up on focus / when filled. Accepts every normal <input> prop (type, value, onChange, required…). */
export function FloatingLabelInput({ label, error, hint, className, style, id, ...rest }: FloatingLabelInputProps) {
  const auto = useId();
  const fid = id ?? auto;
  const msg = error || hint;
  return (
    <div className={`au-fl ${error ? "au-err" : ""} ${className ?? ""}`} style={style}>
      <style>{CSS}</style>
      <input id={fid} placeholder=" " aria-invalid={!!error} aria-describedby={msg ? `${fid}-m` : undefined} {...rest} />
      <label htmlFor={fid}>{label}</label>
      {msg && <div id={`${fid}-m`} className="au-fl-m" role={error ? "alert" : undefined}>{msg}</div>}
    </div>
  );
}
