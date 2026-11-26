import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* A plain multi-file build: separate JS/CSS assets, each cached on its own.
   (vite-plugin-singlefile inlined everything into one 3.6 MB index.html, which delayed first paint,
   could not be cached per-asset, and meant a single script-tag failure took the whole page down.) */
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  build: {
    target: "es2020",
    cssCodeSplit: false,
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        // Keep the heaviest, least-changing code in its own long-lived chunks.
        manualChunks: {
          three: ["three"],
          react: ["react", "react-dom"],
        },
      },
    },
  },
});
