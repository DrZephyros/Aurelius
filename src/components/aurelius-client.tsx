"use client";

import dynamic from "next/dynamic";

/* Aurelius is a client-side app (hash router, WebGL, iframes) — render it only in the browser. */
const App = dynamic(() => import("@/App"), {
  ssr: false,
  loading: () => <div style={{ minHeight: "100vh", background: "#03050b" }} />,
});

export default function AureliusClient() {
  return <App />;
}
