"use client";

import { useRef, type CSSProperties, type ReactNode } from "react";

export type TiltCardProps = {
  children: ReactNode;
  /** Max rotation in degrees. */
  max?: number;
  /** Scale on hover. */
  scale?: number;
  /** Show a moving glare. */
  glare?: boolean;
  className?: string;
  style?: CSSProperties;
};

/** A 3D card that tips toward the pointer, with an optional specular glare. */
export function TiltCard({ children, max = 12, scale = 1.03, glare = true, className, style }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const gl = useRef<HTMLDivElement>(null);
  const move = (e: React.PointerEvent) => {
    if (e.pointerType === "touch") return;
    const el = ref.current!, r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    el.style.transition = "transform .1s linear";
    el.style.transform = `perspective(900px) rotateY(${(x - 0.5) * max * 2}deg) rotateX(${(0.5 - y) * max * 2}deg) scale(${scale})`;
    if (gl.current) { gl.current.style.opacity = "1"; gl.current.style.background = `radial-gradient(circle at ${x * 100}% ${y * 100}%, rgb(255 255 255 / .28), transparent 55%)`; }
  };
  const leave = () => {
    const el = ref.current!;
    el.style.transition = "transform .8s cubic-bezier(.16,1,.3,1)";
    el.style.transform = "perspective(900px) rotateX(0) rotateY(0) scale(1)";
    if (gl.current) gl.current.style.opacity = "0";
  };
  return (
    <div ref={ref} onPointerMove={move} onPointerLeave={leave} className={className} style={{ position: "relative", transformStyle: "preserve-3d", borderRadius: 20, overflow: "hidden", ...style }}>
      {children}
      {glare && <div ref={gl} aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 0, transition: "opacity .4s" }} />}
    </div>
  );
}
