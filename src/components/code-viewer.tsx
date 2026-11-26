"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "./copy-button";

type F = { name: string; code: string };
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const JS_KW = "const|let|var|function|return|if|else|for|while|import|from|export|new|class|await|async|of|in|true|false|null|undefined|this|break|continue|switch|case|default";
const RES: Record<string, { re: RegExp; cls: (string | null)[] }> = {
  js: {
    re: new RegExp(`(\\/\\*[\\s\\S]*?\\*\\/|\\/\\/[^\\n]*)|(\`(?:\\\\.|[^\`\\\\])*\`|'(?:\\\\.|[^'\\\\\\n])*'|"(?:\\\\.|[^"\\\\\\n])*")|\\b(${JS_KW})\\b|(\\b\\d[\\d._]*(?:e-?\\d+)?\\b|\\b0x[0-9a-f]+\\b)`, "g"),
    cls: ["tok-c", "tok-s", "tok-k", "tok-n"],
  },
  html: {
    re: /(<!--[\s\S]*?-->)|("[^"\n]*")|(<\/?[a-zA-Z][\w-]*|\/?>)/g,
    cls: ["tok-c", "tok-s", "tok-t"],
  },
  css: {
    re: /(\/\*[\s\S]*?\*\/)|("[^"\n]*"|'[^'\n]*')|(--[\w-]+)|(#[0-9a-fA-F]{3,8}\b|\b\d[\d.]*(?:px|rem|vh|vw|%|s|ms|em)?\b)/g,
    cls: ["tok-c", "tok-s", "tok-k", "tok-n"],
  },
};

function highlight(code: string, lang: string): string {
  const spec = RES[lang];
  if (!spec) return esc(code);
  let out = "";
  let last = 0;
  spec.re.lastIndex = 0;
  for (let m = spec.re.exec(code); m; m = spec.re.exec(code)) {
    out += esc(code.slice(last, m.index));
    const g = m.slice(1).findIndex((x) => x !== undefined);
    out += `<span class="${spec.cls[g]}">${esc(m[0])}</span>`;
    last = m.index + m[0].length;
    if (m[0].length === 0) spec.re.lastIndex++;
  }
  return out + esc(code.slice(last));
}

export function CodeViewer({ files }: { files: F[] }) {
  const [i, setI] = useState(0);
  const f = files[i];
  const lang = /\.(js|tsx?|jsx)$/.test(f.name) ? "js" : f.name.endsWith(".css") ? "css" : "html";
  const html = useMemo(() => highlight(f.code, lang), [f.code, lang]);
  const lines = f.code.split("\n").length;

  return (
    <div className="panel overflow-hidden !rounded-2xl !bg-[#090b0f]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-3 py-2.5">
        <div className="flex gap-1">
          {files.map((x, k) => (
            <button
              key={x.name}
              onClick={() => setI(k)}
              className={`rounded-lg px-3 py-1.5 font-mono text-xs transition ${k === i ? "bg-white/10 text-fg" : "text-dim hover:text-fg"}`}
            >
              {x.name}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden font-mono text-[11px] text-dim sm:inline">{lines} lines</span>
          <CopyButton text={f.code} label="Copy file" />
        </div>
      </div>
      <div className="code flex max-h-[560px] overflow-auto">
        <pre aria-hidden className="sticky left-0 select-none border-r border-line bg-[#090b0f] px-3 py-4 text-right text-white/25">
          {Array.from({ length: lines }, (_, n) => n + 1).join("\n")}
        </pre>
        <pre className="px-4 py-4 text-[#cdd3df]">
          <code dangerouslySetInnerHTML={{ __html: html }} />
        </pre>
      </div>
    </div>
  );
}
