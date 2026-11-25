"use client";

import dynamic from "next/dynamic";

/* The original app was fully client-side (localStorage, window, WebGL), so these views render in the browser only. */
export const HomeView = dynamic(() => import("./Home"), { ssr: false });
export const LibraryView = dynamic(() => import("./LibraryPage"), { ssr: false });
export const TemplateView = dynamic(() => import("./TemplatePage"), { ssr: false });
export const DemoView = dynamic(() => import("./DemoPage"), { ssr: false });
export const PromptsView = dynamic(() => import("./PromptsPage"), { ssr: false });
export const ToolsView = dynamic(() => import("./ToolsPage"), { ssr: false });
