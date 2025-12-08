import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler"]],
      },
    }),
    tailwindcss(),
  ],
  worker: {
    format: "es",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      input: {
        "background/worker": "./src/background/worker.ts",
        "content/ui": "./src/content/ui.tsx",
        "content/hook": "./src/content/hook.ts",
        "content/hook-listener": "./src/content/hook-listener.ts",
      },
      output: {
        manualChunks: undefined,
        entryFileNames: (chunk) => `${chunk.name}.js`,
        assetFileNames: (asset) => `assets/${asset.name ?? "[name].[ext]"}`,
      },
    },
  },
});
